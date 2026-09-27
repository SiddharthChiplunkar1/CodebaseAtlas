import os
import logging
from typing import List, Generator
from sqlalchemy.orm import Session
from openai import OpenAI
from app.db.models import CodeNode
from app.ai.embedding import EmbeddingService

logger = logging.getLogger(__name__)

class LlmService:
    def __init__(self, api_key: str = None):
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            logger.warning("OPENAI_API_KEY is not set. LLM calls will fail.")
        self.client = OpenAI(api_key=key)
        self.embedding_service = EmbeddingService(api_key=key)
        self.model = "gpt-4o"

    def search_codebase(self, db: Session, repo_id: str, query: str, limit: int = 5) -> List[CodeNode]:
        """
        Embeds the query and performs a vector similarity search in PostgreSQL using pgvector.
        """
        if not query.strip():
            return []
            
        try:
            # 1. Embed the user's question
            query_embedding = self.embedding_service.generate_embeddings([query])[0]
            
            # 2. Perform Cosine Similarity Search in the Database
            results = db.query(CodeNode).filter(
                CodeNode.repo_id == repo_id
            ).order_by(
                CodeNode.embedding.cosine_distance(query_embedding)
            ).limit(limit).all()
            
            return results
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            raise

    def stream_answer(self, question: str, context_nodes: List[CodeNode]) -> Generator[str, None, None]:
        """
        Constructs a prompt from context nodes and streams the LLM answer back token by token.
        """
        context_text = "Here are the most relevant code snippets from the codebase:\n\n"
        for idx, node in enumerate(context_nodes):
            context_text += f"--- Snippet {idx+1} ({node.file_path}) ---\n"
            context_text += f"{node.type} {node.name}\n"
            context_text += f"```\n{node.signature}\n```\n\n"
            
        system_prompt = (
            "You are an expert programming assistant named Codebase Atlas. "
            "Use the provided code snippets to answer the user's question accurately. "
            "If the answer is not present in the snippets, say so politely."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{context_text}\n\nQuestion: {question}"}
        ]

        try:
            response_stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                temperature=0.2
            )
            
            for chunk in response_stream:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"LLM streaming failed: {e}")
            yield f"Error generating answer: {str(e)}"
