"""Tree-sitter based source parser used by the indexing gRPC service."""

import logging
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

import tree_sitter_java as tsjava
import tree_sitter_javascript as tsjavascript
import tree_sitter_python as tspython
import tree_sitter_typescript as tstypescript
from tree_sitter import Language, Parser

logger = logging.getLogger(__name__)

LANGUAGES = {
    "python": Language(tspython.language()),
    "javascript": Language(tsjavascript.language()),
    "typescript": Language(tstypescript.language_typescript()),
    "java": Language(tsjava.language()),
}

EXTENSIONS = {
    ".py": "python", ".js": "javascript", ".jsx": "javascript",
    ".ts": "typescript", ".tsx": "typescript", ".java": "java",
}

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
        (interface_declaration name: (type_identifier) @interface.name) @interface.def
        (function_declaration name: (identifier) @func.name) @func.def
        (method_definition name: (property_identifier) @func.name) @func.def
    """,
    "java": """
        (class_declaration name: (identifier) @class.name) @class.def
        (interface_declaration name: (identifier) @interface.name) @interface.def
        (method_declaration name: (identifier) @func.name) @func.def
    """,
}

# Annotation patterns that classify a Java class as a ROUTE (controller/endpoint)
_ROUTE_ANNOTATIONS = re.compile(
    r"@(RestController|Controller|RequestMapping|FeignClient)\b"
)

# Annotation or name conventions that classify a class as a TEST
_TEST_ANNOTATIONS = re.compile(r"@(Test|ExtendWith|RunWith|SpringBootTest)\b")
_TEST_NAME_SUFFIXES = ("Test", "Tests", "Spec", "IT", "ITCase")

# Inheritance / implementation patterns for Java class declarations
_EXTENDS_RE = re.compile(r"\bclass\s+\w+.*?\bextends\s+(\w+)")
_IMPLEMENTS_RE = re.compile(r"\bclass\s+\w+.*?\bimplements\s+([\w\s,]+?)(?:\{|$)")


def _refine_java_class_type(entity: Dict[str, Any]) -> None:
    """
    Post-process a parsed Java CLASS entity and upgrade its type to ROUTE or
    TEST when annotations or naming conventions indicate it.
    """
    if entity["type"] != "CLASS":
        return
    sig = entity.get("signature", "")
    name = entity.get("name", "")

    if _ROUTE_ANNOTATIONS.search(sig):
        entity["type"] = "ROUTE"
    elif _TEST_ANNOTATIONS.search(sig) or name.endswith(_TEST_NAME_SUFFIXES):
        entity["type"] = "TEST"


def _extract_inheritance_edges(
    nodes: List[Dict[str, Any]], declarations: Dict[str, Dict[str, Any]]
) -> List[Dict[str, str]]:
    """
    For Java CLASS nodes, extract EXTENDS and IMPLEMENTS relationships
    from the raw class declaration text.
    """
    edges: List[Dict[str, str]] = []
    for node in nodes:
        if node["type"] not in ("CLASS", "ROUTE", "TEST"):
            continue
        sig = node.get("signature", "")
        # EXTENDS
        m = _EXTENDS_RE.search(sig)
        if m:
            parent_name = m.group(1).strip()
            if parent_name in declarations and declarations[parent_name] is not node:
                edges.append({
                    "from_id": node["id"],
                    "to_id": declarations[parent_name]["id"],
                    "edge_type": "extends",
                })
        # IMPLEMENTS
        m = _IMPLEMENTS_RE.search(sig)
        if m:
            for iface_name in m.group(1).split(","):
                iface_name = iface_name.strip()
                if iface_name in declarations and declarations[iface_name] is not node:
                    edges.append({
                        "from_id": node["id"],
                        "to_id": declarations[iface_name]["id"],
                        "edge_type": "implements",
                    })
    return edges


class AstParser:
    def __init__(self) -> None:
        self.parsers: Dict[str, Parser] = {}
        for language, language_object in LANGUAGES.items():
            parser = Parser()
            parser.language = language_object
            self.parsers[language] = parser

    def parse_code(self, file_path: str, content: str, language: str) -> List[Dict[str, Any]]:
        """Extract classes, interfaces, functions and methods from one file."""
        if language not in LANGUAGES:
            logger.warning("Unsupported language: %s", language)
            return []

        source = content.encode("utf-8")
        tree = self.parsers[language].parse(source)
        captures = LANGUAGES[language].query(QUERIES[language]).captures(tree.root_node)
        if isinstance(captures, dict):
            captures = [(node, name) for name, nodes in captures.items() for node in nodes]
        entities: Dict[int, Dict[str, Any]] = {}

        for node, capture_name in captures:
            if capture_name.endswith(".def"):
                entity_type = capture_name.split(".")[0].upper()
                if entity_type == "FUNC":
                    entity_type = "FUNCTION"
                entities[node.id] = {
                    "type": entity_type,
                    "start_line": node.start_point[0] + 1,
                    "end_line": node.end_point[0] + 1,
                    "signature": source[node.start_byte:node.end_byte].decode("utf-8", errors="replace").replace("\x00", ""),
                    "file_path": file_path,
                    "language": language,
                    "name": "unknown",
                }
            elif capture_name.endswith(".name"):
                parent = node.parent
                while parent and parent.id not in entities:
                    parent = parent.parent
                if parent and parent.id in entities:
                    entities[parent.id]["name"] = source[node.start_byte:node.end_byte].decode(
                        "utf-8", errors="replace"
                    ).replace("\x00", "")

        result = list(entities.values())

        # Post-process: refine Java CLASS types to ROUTE/TEST where applicable
        if language == "java":
            for entity in result:
                _refine_java_class_type(entity)

        return result

    def parse_file_graph(self, repo_id: str, file_path: str, content: str, language: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]]]:
        nodes = self.parse_code(file_path, content, language)
        for node in nodes:
            node["id"] = f"{repo_id}::{file_path}::{node['name']}:{node['start_line']}"

        # Same-file CALLS edges
        edges: List[Dict[str, str]] = []
        declarations = {node["name"]: node for node in nodes if node["name"] != "unknown"}
        for caller in nodes:
            for name, callee in declarations.items():
                if caller is callee:
                    continue
                if re.search(rf"(?<![.\w]){re.escape(name)}\s*\(", caller["signature"]):
                    edges.append({"from_id": caller["id"], "to_id": callee["id"], "edge_type": "calls"})

        # EXTENDS / IMPLEMENTS edges (Java only)
        if language == "java":
            edges.extend(_extract_inheritance_edges(nodes, declarations))

        return nodes, edges

    def parse_repository(self, repo_id: str, repo_path: str, skip_directories: Iterable[str] = ()) -> Tuple[List[Dict[str, Any]], List[Dict[str, str]], int]:
        root = Path(repo_path).resolve()
        if not root.is_dir():
            raise ValueError(f"Repository path does not exist or is not a directory: {repo_path}")

        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, str]] = []
        total_files = 0
        skipped = set(skip_directories)
        for path in root.rglob("*"):
            if not path.is_file() or any(part in skipped for part in path.relative_to(root).parts):
                continue
            language = EXTENSIONS.get(path.suffix.lower())
            if not language:
                continue
            try:
                content = path.read_text(encoding="utf-8")
                relative_path = path.relative_to(root).as_posix()
                file_nodes, file_edges = self.parse_file_graph(repo_id, relative_path, content, language)
                nodes.extend(file_nodes)
                edges.extend(file_edges)
                total_files += 1
            except (OSError, UnicodeDecodeError) as exc:
                logger.warning("Skipping unreadable source file %s: %s", path, exc)

        # ── Cross-file CALLS detection ──────────────────────────────────────
        # After all files are parsed, scan every symbol's signature for
        # references to symbols declared in OTHER files. This captures the
        # Spring DI pattern where Service A injects Service B via constructor.
        global_declarations: Dict[str, Dict[str, Any]] = {}
        for node in nodes:
            name = node.get("name", "unknown")
            if name != "unknown":
                # Last-write wins for duplicate names; good enough for cross-file
                global_declarations[name] = node

        seen_cross_edges: set = set()
        cross_file_edges: List[Dict[str, str]] = []

        for caller in nodes:
            caller_file = caller["file_path"]
            sig = caller.get("signature", "")
            for callee_name, callee in global_declarations.items():
                if callee["file_path"] == caller_file:
                    continue  # already handled by same-file pass
                if callee is caller:
                    continue
                # Match: ClassName( or ClassName<  or ClassName.method or : ClassName
                if re.search(rf"(?<![.\w]){re.escape(callee_name)}(?:\s*[(<.]|\s+\w)", sig):
                    key = (caller["id"], callee["id"])
                    if key not in seen_cross_edges:
                        seen_cross_edges.add(key)
                        cross_file_edges.append({
                            "from_id": caller["id"],
                            "to_id": callee["id"],
                            "edge_type": "calls",
                        })

        edges.extend(cross_file_edges)
        logger.info(
            "Parsed repo %s: %d nodes, %d same-file edges, %d cross-file edges across %d files",
            repo_id, len(nodes), len(edges) - len(cross_file_edges),
            len(cross_file_edges), total_files,
        )
        return nodes, edges, total_files
