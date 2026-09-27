import grpc
import logging
from proto import atlas_pb2
from proto import atlas_pb2_grpc
from app.parser.core import AstParser
from app.ai.embedding import EmbeddingService
from app.ai.llm import LlmService
from app.db.database import SessionLocal
from app.db.models import CodeNode
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AstParserServicer(atlas_pb2_grpc.AstParserServiceServicer):
    def __init__(self):
        self.parser = AstParser()

    def ParseFile(self, request, context):
        try:
            nodes_data = self.parser.parse_code(
                file_path=request.file_path, 
                content=request.file_content, 
                language=request.language
            )
            
            pb_nodes = []
            for n in nodes_data:
                pb_nodes.append(atlas_pb2.CodeNode(
                    id=f"{request.repo_id}::{request.file_path}::{n['name']}:{n['start_line']}",
                    name=n['name'],
                    type=n['type'].lower(),
                    file_path=n['file_path'],
                    start_line=n['start_line'],
                    end_line=n['end_line'],
                    language=n['language'],
                    signature=n['signature']
                ))
                
            return atlas_pb2.FileParseResponse(
                nodes=pb_nodes,
                edges=[]
            )
        except Exception as e:
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return atlas_pb2.FileParseResponse()

    def ParseRepository(self, request, context):
        return atlas_pb2.ParseResponse(
            repo_id=request.repo_id,
            total_files=0,
            total_nodes=0,
            total_edges=0
        )


class EmbeddingServicer(atlas_pb2_grpc.EmbeddingServiceServicer):
    def __init__(self):
        self.service = EmbeddingService()

    def SearchSimilar(self, request, context):
        db: Session = SessionLocal()
        try:
            llm = LlmService()
            results = llm.search_codebase(db, request.repo_id, request.query, request.top_k)
            
            pb_results = []
            for r in results:
                pb_results.append(atlas_pb2.SearchResult(
                    node_id=str(r.id),
                    node_name=r.name or "",
                    node_type=r.type or "",
                    file_path=r.file_path or "",
                    score=1.0 # Pseudo-score since pgvector distance isn't retrieved directly
                ))
                
            return atlas_pb2.SearchResponse(results=pb_results)
        except Exception as e:
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return atlas_pb2.SearchResponse()
        finally:
            db.close()
            
    def EmbedNodes(self, request, context):
        return atlas_pb2.EmbedResponse(success=True, embedded_count=len(request.items))

class LlmQueryServicer(atlas_pb2_grpc.LlmQueryServiceServicer):
    def __init__(self):
        self.service = LlmService()

    def QueryWithContext(self, request, context):
        db: Session = SessionLocal()
        try:
            # Fetch context nodes from database
            nodes = db.query(CodeNode).filter(CodeNode.id.in_(request.context_node_ids)).all()
            
            token_stream = self.service.stream_answer(request.question, nodes)
            for token in token_stream:
                yield atlas_pb2.LlmChunk(token=token, is_final=False)
                
            yield atlas_pb2.LlmChunk(token="", is_final=True)
        except Exception as e:
            logger.error(f"Error in QueryWithContext: {e}")
            yield atlas_pb2.LlmChunk(token=f"Error: {e}", is_final=True)
        finally:
            db.close()
            
    def FindFeaturePath(self, request, context):
        return atlas_pb2.FeaturePathResponse(node_ids=[], node_names=[], explanation="")
