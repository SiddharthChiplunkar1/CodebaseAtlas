import tree_sitter_python as tspython
from tree_sitter import Language, Parser

lang = Language(tspython.language())
parser = Parser()
parser.language = lang

code = b"""
class MyClass:
    def my_func(self):
        pass
"""

tree = parser.parse(code)
q = lang.query("(class_definition name: (identifier) @class.name) @class.def")
caps = q.captures(tree.root_node)

print(type(caps))
if isinstance(caps, dict):
    for k, v in caps.items():
        print(k, v)
elif isinstance(caps, list):
    for n, name in caps:
        print(name, n.type)
