import logging
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript
import tree_sitter_java as tsjava
from tree_sitter import Language, Parser
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

LANGUAGES = {
    "python": Language(tspython.language()),
    "javascript": Language(tsjavascript.language()),
    "typescript": Language(tstypescript.language_typescript()),
    "java": Language(tsjava.language())
}

# Define queries for extracting classes and functions
QUERIES = {
    "python": """
        (class_definition name: (identifier) @class.name) @class.def
        (function_definition name: (identifier) @func.name) @func.def
    """,
    "javascript": """
        (class_declaration name: (identifier) @class.name) @class.def
        (function_declaration name: (identifier) @func.name) @func.def
        (method_definition name: (property_identifier) @func.name) @func.def
    """,
    "typescript": """
        (class_declaration name: (type_identifier) @class.name) @class.def
        (interface_declaration name: (type_identifier) @class.name) @interface.def
        (function_declaration name: (identifier) @func.name) @func.def
        (method_definition name: (property_identifier) @func.name) @func.def
    """,
    "java": """
        (class_declaration name: (identifier) @class.name) @class.def
        (interface_declaration name: (identifier) @class.name) @interface.def
        (method_declaration name: (identifier) @func.name) @func.def
    """
}

class AstParser:
    def __init__(self):
        self.parsers = {}
        for lang_name, lang_obj in LANGUAGES.items():
            parser = Parser()
            parser.language = lang_obj
            self.parsers[lang_name] = parser

    def parse_code(self, file_path: str, content: str, language: str) -> List[Dict[str, Any]]:
        """Parses the content and extracts classes and functions."""
        if language not in LANGUAGES:
            logger.warning(f"Unsupported language: {language}")
            return []
            
        parser = self.parsers[language]
        lang_obj = LANGUAGES[language]
        query_str = QUERIES.get(language)
        
        if not query_str:
            return []
            
        # Parse the raw code into an AST
        source_bytes = bytes(content, "utf8")
        tree = parser.parse(source_bytes)
        query = lang_obj.query(query_str)
        
        # In tree-sitter, captures returns a list of (node, capture_name)
        captures = query.captures(tree.root_node)
        
        entity_map = {}
        
        for node, capture_name in captures:
            node_id = node.id
            
            if capture_name.endswith(".def"):
                entity_type = capture_name.split(".")[0].upper() # CLASS, FUNC, INTERFACE
                if entity_type == "FUNC":
                    entity_type = "FUNCTION"
                    
                entity_map[node_id] = {
                    "type": entity_type,
                    "start_line": node.start_point[0] + 1,
                    "end_line": node.end_point[0] + 1,
                    "signature": source_bytes[node.start_byte:node.end_byte].decode("utf8"),
                    "file_path": file_path,
                    "language": language,
                    "name": "unknown" 
                }
            elif capture_name.endswith(".name"):
                # The name capture is a child of the def capture.
                # Traverse up the AST to find the parent node that exists in our map.
                parent = node.parent
                while parent and parent.id not in entity_map:
                    parent = parent.parent
                
                if parent and parent.id in entity_map:
                    name_str = source_bytes[node.start_byte:node.end_byte].decode("utf8")
                    entity_map[parent.id]["name"] = name_str

        return list(entity_map.values())
