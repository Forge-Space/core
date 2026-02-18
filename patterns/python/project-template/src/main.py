"""
Main entry point for {{PROJECT_NAME}}.
"""

import sys


def hello(name: str = "World") -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"


if __name__ == "__main__":
    _name = sys.argv[1] if len(sys.argv) > 1 else "World"
    print(hello(_name))
