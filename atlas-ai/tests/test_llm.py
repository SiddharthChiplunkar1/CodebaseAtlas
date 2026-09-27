import unittest
from unittest.mock import MagicMock, patch
from app.ai.llm import LlmService
from app.db.models import CodeNode

class TestLlmService(unittest.TestCase):

    @patch('app.ai.llm.OpenAI')
    @patch('app.ai.llm.EmbeddingService')
    def setUp(self, MockEmbeddingService, MockOpenAI):
        self.mock_openai = MockOpenAI.return_value
        self.mock_embedding = MockEmbeddingService.return_value
        self.service = LlmService(api_key="fake_key")

    def test_search_codebase(self):
        # Mock embedding response
        self.mock_embedding.generate_embeddings.return_value = [[0.1] * 1536]
        
        # Mock DB session and pgvector query chaining
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_order = mock_filter.order_by.return_value
        mock_limit = mock_order.limit.return_value
        
        mock_node = CodeNode(name="TestNode", type="FUNCTION")
        mock_limit.all.return_value = [mock_node]
        
        results = self.service.search_codebase(mock_db, repo_id="123", query="test query")
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].name, "TestNode")
        self.mock_embedding.generate_embeddings.assert_called_once_with(["test query"])

    def test_stream_answer(self):
        # Setup mock nodes
        node1 = CodeNode(file_path="src/main.py", type="FUNCTION", name="main", signature="def main(): pass")
        
        # Setup mock OpenAI stream response
        mock_chunk_1 = MagicMock()
        mock_chunk_1.choices[0].delta.content = "Hello "
        mock_chunk_2 = MagicMock()
        mock_chunk_2.choices[0].delta.content = "World"
        
        self.mock_openai.chat.completions.create.return_value = [mock_chunk_1, mock_chunk_2]
        
        # Execute stream
        generator = self.service.stream_answer("What does main do?", [node1])
        tokens = list(generator)
        
        self.assertEqual(tokens, ["Hello ", "World"])
        
        # Verify OpenAI was called correctly
        self.mock_openai.chat.completions.create.assert_called_once()
        call_kwargs = self.mock_openai.chat.completions.create.call_args[1]
        self.assertTrue(call_kwargs["stream"])
        self.assertEqual(call_kwargs["model"], "gpt-4o")
        
        # Check if the prompt contained the context
        messages = call_kwargs["messages"]
        self.assertTrue(any("def main(): pass" in m["content"] for m in messages if m["role"] == "user"))

if __name__ == '__main__':
    unittest.main()
