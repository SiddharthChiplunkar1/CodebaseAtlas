import os
import logging
from typing import List
from openai import OpenAI

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, api_key: str = None):
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            logger.warning("OPENAI_API_KEY is not set. Embedding calls will fail.")
        self.client = OpenAI(api_key=key)
        self.model = "text-embedding-3-small"

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embeddings for a list of text strings using OpenAI.
        """
        if not texts:
            return []

        try:
            response = self.client.embeddings.create(
                input=texts,
                model=self.model
            )
            # OpenAI returns the embeddings in the same order as the input
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise

    def embed_nodes(self, nodes: List[dict]) -> List[dict]:
        """
        Takes a list of AST node dictionaries, generates embeddings for their signatures,
        and attaches the embedding back to the dictionary.
        """
        if not nodes:
            return []

        # Extract the signatures to embed
        # We enrich the text with type and name for better semantic search context
        texts_to_embed = [
            f"{node['type']} {node['name']}:\n{node['signature']}" 
            for node in nodes
        ]
        
        embeddings = self.generate_embeddings(texts_to_embed)
        
        # Attach embeddings back to nodes
        for node, emb in zip(nodes, embeddings):
            node['embedding'] = emb
            
        return nodes
