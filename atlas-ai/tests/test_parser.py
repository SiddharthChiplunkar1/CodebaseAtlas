import unittest
from app.parser.core import AstParser

class TestAstParser(unittest.TestCase):
    def setUp(self):
        self.parser = AstParser()

    def test_parse_python(self):
        code = """
class TestClass:
    def test_method(self):
        pass

def standalone_func():
    return True
"""
        nodes = self.parser.parse_code("test.py", code, "python")
        
        self.assertEqual(len(nodes), 3)
        
        class_node = next((n for n in nodes if n["name"] == "TestClass"), None)
        self.assertIsNotNone(class_node)
        self.assertEqual(class_node["type"], "CLASS")
        
        method_node = next((n for n in nodes if n["name"] == "test_method"), None)
        self.assertIsNotNone(method_node)
        self.assertEqual(method_node["type"], "FUNCTION")
        
        func_node = next((n for n in nodes if n["name"] == "standalone_func"), None)
        self.assertIsNotNone(func_node)
        self.assertEqual(func_node["type"], "FUNCTION")

    def test_parse_java(self):
        code = """
public class HelloWorld {
    public void main(String[] args) {
        System.out.println("Hello World");
    }
}
"""
        nodes = self.parser.parse_code("HelloWorld.java", code, "java")
        self.assertEqual(len(nodes), 2)
        
        class_node = next((n for n in nodes if n["name"] == "HelloWorld"), None)
        self.assertIsNotNone(class_node)
        self.assertEqual(class_node["type"], "CLASS")
        
        func_node = next((n for n in nodes if n["name"] == "main"), None)
        self.assertIsNotNone(func_node)
        self.assertEqual(func_node["type"], "FUNCTION")

if __name__ == '__main__':
    unittest.main()
