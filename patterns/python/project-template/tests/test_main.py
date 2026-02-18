"""Tests for main module."""

from src.main import hello


def test_hello_default() -> None:
    assert hello() == "Hello, World!"


def test_hello_custom() -> None:
    assert hello("UIForge") == "Hello, UIForge!"
