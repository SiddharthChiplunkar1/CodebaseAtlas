import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, api_key: str = None):
        logger.info("Initializing SentenceTransformer embedding model (all-MiniLM-L6-v2)...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embeddings for a list of text strings using a local SentenceTransformer model.
        """
        if not texts:
            return []

        try:
            # Output is a numpy array of shape (len(texts), 384)
            embeddings = self.model.encode(texts, show_progress_bar=False)
            # Convert to list of floats for pgvector insertion
            return [emb.tolist() for emb in embeddings]
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
