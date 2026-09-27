import unittest
from unittest.mock import MagicMock, patch
from app.ai.embedding import EmbeddingService

class TestEmbeddingService(unittest.TestCase):

    @patch('app.ai.embedding.OpenAI')
    def setUp(self, MockOpenAI):
        self.mock_openai_instance = MockOpenAI.return_value
        
        # Setup mock response from OpenAI API
        self.mock_response = MagicMock()
        mock_data_1 = MagicMock()
        mock_data_1.embedding = [0.1] * 1536
        mock_data_2 = MagicMock()
        mock_data_2.embedding = [0.2] * 1536
        
        self.mock_response.data = [mock_data_1, mock_data_2]
        self.mock_openai_instance.embeddings.create.return_value = self.mock_response
        
        self.service = EmbeddingService(api_key="fake_key")

    def test_generate_embeddings(self):
        texts = ["def foo(): pass", "class Bar: pass"]
        embeddings = self.service.generate_embeddings(texts)
        
        self.assertEqual(len(embeddings), 2)
        self.assertEqual(len(embeddings[0]), 1536)
        self.mock_openai_instance.embeddings.create.assert_called_once_with(
            input=texts,
            model="text-embedding-3-small"
        )

    def test_embed_nodes(self):
        nodes = [
            {"type": "FUNCTION", "name": "foo", "signature": "def foo(): pass"},
            {"type": "CLASS", "name": "Bar", "signature": "class Bar: pass"}
        ]
        
        enriched_nodes = self.service.embed_nodes(nodes)
        
        self.assertEqual(len(enriched_nodes), 2)
        self.assertIn("embedding", enriched_nodes[0])
        self.assertEqual(enriched_nodes[0]["embedding"], [0.1] * 1536)
        self.assertEqual(enriched_nodes[1]["embedding"], [0.2] * 1536)

if __name__ == '__main__':
    unittest.main()
