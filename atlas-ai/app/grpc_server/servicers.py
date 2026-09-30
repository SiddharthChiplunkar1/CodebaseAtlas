"""Production gRPC adapters for parsing, embeddings, search and LLM queries."""

import grpc
import logging
from typing import Iterable

from sqlalchemy.orm import Session

from proto import atlas_pb2, atlas_pb2_grpc
from app.ai.embedding import EmbeddingService
from app.ai.llm import LlmService
from app.config.settings import settings
from app.db.database import SessionLocal
from app.db.models import CodeNode
from app.parser.core import AstParser

logger = logging.getLogger(__name__)


def _node_proto(node: dict) -> atlas_pb2.CodeNode:
    return atlas_pb2.CodeNode(
        id=node["id"],
        name=node["name"],
        type=node["type"].lower(),
        file_path=node["file_path"],
        start_line=node["start_line"],
        end_line=node["end_line"],
        language=node["language"],
        signature=node["signature"],
    )


def _edge_proto(edge: dict) -> atlas_pb2.CodeEdge:
    return atlas_pb2.CodeEdge(
        from_id=edge["from_id"],
        to_id=edge["to_id"],
        edge_type=edge["edge_type"],
    )


class AstParserServicer(atlas_pb2_grpc.AstParserServiceServicer):
    def __init__(self) -> None:
        self.parser = AstParser()

    def ParseFile(self, request, context):
        try:
            nodes, edges = self.parser.parse_file_graph(
                request.repo_id, request.file_path, request.file_content, request.language
            )
            return atlas_pb2.FileParseResponse(
                nodes=[_node_proto(node) for node in nodes],
                edges=[_edge_proto(edge) for edge in edges],
            )
        except Exception as exc:
            logger.exception("Failed to parse %s", request.file_path)
            context.abort(grpc.StatusCode.INTERNAL, str(exc))

    def ParseRepository(self, request, context):
        try:
            nodes, edges, total_files = self.parser.parse_repository(
                request.repo_id,
                request.repo_path,
                settings.skip_directories,
            )
            return atlas_pb2.ParseResponse(
                repo_id=request.repo_id,
                nodes=[_node_proto(node) for node in nodes],
                edges=[_edge_proto(edge) for edge in edges],
                total_files=total_files,
                total_nodes=len(nodes),
                total_edges=len(edges),
            )
        except Exception as exc:
            logger.exception("Failed to parse repository %s", request.repo_path)
            context.abort(grpc.StatusCode.INTERNAL, str(exc))


class EmbeddingServicer(atlas_pb2_grpc.EmbeddingServiceServicer):
    def __init__(self) -> None:
        self.embedding_service = EmbeddingService()

    def EmbedNodes(self, request, context):
        db: Session = SessionLocal()
        try:
            items = list(request.items)
            if not items:
                return atlas_pb2.EmbedResponse(success=True, embedded_count=0)

            embeddings = self.embedding_service.generate_embeddings([item.text for item in items])
            updated = 0
            for item, embedding in zip(items, embeddings):
                updated += db.query(CodeNode).filter(
                    CodeNode.id == item.node_id,
                    CodeNode.repo_id == request.repo_id,
                ).update({CodeNode.embedding: embedding}, synchronize_session=False)
            db.commit()
            if updated != len(items):
                raise ValueError(f"Embedded {updated} of {len(items)} requested nodes")
            return atlas_pb2.EmbedResponse(success=True, embedded_count=updated)
        except Exception as exc:
            db.rollback()
            logger.exception("Embedding failed for repo %s", request.repo_id)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(exc))
            return atlas_pb2.EmbedResponse(success=False, error_message=str(exc))
        finally:
            db.close()

    def SearchSimilar(self, request, context):
        db: Session = SessionLocal()
        try:
            query_embedding = self.embedding_service.generate_embeddings([request.query])[0]
            distance = CodeNode.embedding.cosine_distance(query_embedding).label("distance")
            rows = db.query(CodeNode, distance).filter(
                CodeNode.repo_id == request.repo_id,
                CodeNode.embedding.is_not(None),
            ).order_by(distance).limit(request.top_k or 20).all()
            return atlas_pb2.SearchResponse(results=[atlas_pb2.SearchResult(
                node_id=str(node.id),
                node_name=node.name or "",
                node_type=node.type or "",
                file_path=node.file_path or "",
                score=max(0.0, min(1.0, 1.0 - float(node_distance))),
            ) for node, node_distance in rows])
        except Exception as exc:
            logger.exception("Similarity search failed for repo %s", request.repo_id)
            context.abort(grpc.StatusCode.INTERNAL, str(exc))
        finally:
            db.close()


class LlmQueryServicer(atlas_pb2_grpc.LlmQueryServiceServicer):
    def __init__(self) -> None:
        self.service = LlmService()

    def QueryWithContext(self, request, context):
        db: Session = SessionLocal()
        try:
            nodes = db.query(CodeNode).filter(
                CodeNode.repo_id == request.repo_id,
                CodeNode.id.in_(list(request.context_node_ids)),
            ).all()
            for token in self.service.stream_answer(request.question, nodes):
                yield atlas_pb2.LlmChunk(token=token, is_final=False)
            yield atlas_pb2.LlmChunk(token="", is_final=True)
        except Exception as exc:
            logger.exception("LLM query failed for repo %s", request.repo_id)
            context.abort(grpc.StatusCode.INTERNAL, str(exc))
        finally:
            db.close()

    def FindFeaturePath(self, request, context):
        db: Session = SessionLocal()
        try:
            candidates = self.service.search_codebase(db, request.repo_id, request.description, limit=20)
            return atlas_pb2.FeaturePathResponse(
                node_ids=[str(node.id) for node in candidates],
                node_names=[node.name or "" for node in candidates],
                explanation=(
                    f"Ordered {len(candidates)} code nodes by semantic relevance to "
                    f"'{request.description}'."
                ),
            )
        except Exception as exc:
            logger.exception("Feature path search failed for repo %s", request.repo_id)
            context.abort(grpc.StatusCode.INTERNAL, str(exc))
        finally:
            db.close()
