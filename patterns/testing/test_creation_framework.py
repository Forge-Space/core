"""
Reusable Test Creation Framework

This module provides a comprehensive framework for creating high-quality tests
across different projects. It includes workflows for unit tests, integration tests,
and end-to-end tests with built-in quality validation.

Features:
- Automated test generation workflows
- Business logic-focused test creation
- Mock and isolation management
- Error scenario generation
- Test data management
- Quality validation and reporting

Usage:
    from patterns.testing.test_creation_framework import TestCreationFramework
    
    framework = TestCreationFramework(
        project_root=Path("/path/to/project"),
        config=TestCreationConfig(...)
    )
    
    # Generate unit tests
    framework.create_unit_tests(module_path="src/core/calculator.py")
    
    # Generate integration tests
    framework.create_integration_tests(components=["api", "database"])
    
    # Generate E2E tests
    framework.create_e2e_tests(workflows=["user_registration", "checkout"])
"""

from __future__ import annotations

import ast
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from .test_quality_validator import TestQualityValidator, TestQualityConfig


@dataclass
class TestCreationConfig:
    """Configuration for test creation workflows."""
    # Output settings
    output_directory: str = "tests"
    test_file_prefix: str = "test_"
    
    # Generation settings
    include_error_scenarios: bool = True
    include_edge_cases: bool = True
    include_performance_tests: bool = False
    include_integration_tests: bool = True
    
    # Quality settings
    min_assertions_per_test: int = 2
    max_test_length: int = 50
    include_docstrings: bool = True
    
    # Mock settings
    auto_generate_mocks: bool = True
    mock_external_dependencies: bool = True
    mock_database_operations: bool = True
    
    # Test data settings
    generate_realistic_data: bool = True
    include_boundary_values: bool = True
    include_negative_cases: bool = True


class TestTemplate:
    """Template for generating test files."""
    
    @staticmethod
    def generate_unit_test_template(module_info: Dict[str, Any], 
                                  config: TestCreationConfig) -> str:
        """Generate a unit test template for a module."""
        module_name = module_info.get("name", "module")
        functions = module_info.get("functions", [])
        classes = module_info.get("classes", [])
        
        template = f'''"""
Unit tests for {module_name} module.

This file contains comprehensive unit tests for the {module_name} module,
testing business logic, error conditions, and edge cases.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
'''
        
        # Add imports for the module
        template += f"\nfrom {module_info.get('import_path', module_name)} import "
        
        # Add function imports
        function_names = [f["name"] for f in functions if not f.get("is_private", False)]
        if function_names:
            template += ", ".join(function_names)
        
        # Add class imports
        class_names = [c["name"] for c in classes if not c.get("is_private", False)]
        if class_names:
            if function_names:
                template += ", "
            template += ", ".join(class_names)
        
        template += "\n\n"
        
        # Generate test fixtures
        template += TestTemplate._generate_fixtures(module_info, config)
        
        # Generate function tests
        for func_info in functions:
            if not func_info.get("is_private", False):
                template += TestTemplate._generate_function_tests(func_info, config)
        
        # Generate class tests
        for class_info in classes:
            if not class_info.get("is_private", False):
                template += TestTemplate._generate_class_tests(class_info, config)
        
        return template
    
    @staticmethod
    def _generate_fixtures(module_info: Dict[str, Any], config: TestCreationConfig) -> str:
        """Generate pytest fixtures for the module."""
        fixtures = []
        
        # Common fixtures
        fixtures.append('''@pytest.fixture
def sample_input():
    """Sample input data for testing."""
    return {
        "valid_data": {"key": "value"},
        "invalid_data": {},
        "edge_case_data": {"key": None}
    }''')
        
        if config.auto_generate_mocks:
            fixtures.append('''@pytest.fixture
def mock_external_service():
    """Mock external service for testing."""
    with patch('requests.get') as mock_get:
        mock_get.return_value.json.return_value = {"status": "success"}
        yield mock_get''')
        
        fixtures.append('''@pytest.fixture
def mock_database():
    """Mock database connection for testing."""
    with patch('sqlite3.connect') as mock_connect:
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_connect.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        yield mock_cursor''')
        
        fixtures.append('''@pytest.fixture
def mock_logger():
    """Mock logger for testing."""
    with patch('logging.getLogger') as mock_get_logger:
        mock_logger = Mock()
        mock_get_logger.return_value = mock_logger
        yield mock_logger''')
        
        fixtures.append('''@pytest.fixture
def temp_file(tmp_path):
    """Temporary file fixture for testing."""
    file_path = tmp_path / "test_file.txt"
    file_path.write_text("test content")
    return file_path''')
        
        return "\n\n".join(fixtures) + "\n\n"
    
    @staticmethod
    def _generate_function_tests(func_info: Dict[str, Any], config: TestCreationConfig) -> str:
        """Generate tests for a function."""
        func_name = func_info["name"]
        params = func_info.get("parameters", [])
        return_type = func_info.get("return_type", "Any")
        
        tests = []
        
        # Basic functionality test
        test_name = f"test_{func_name}_basic_functionality"
        test_body = TestTemplate._generate_basic_function_test(func_name, params, config)
        tests.append(f'''class Test{func_name.title()}:
    """Test cases for {func_name} function."""

    def {test_name}(self, sample_input{', mock_external_service' if config.auto_generate_mocks else ''}):
        """Test basic functionality of {func_name}."""
{test_body}''')
        
        # Error scenarios
        if config.include_error_scenarios:
            error_test = TestTemplate._generate_error_test(func_name, params, config)
            tests.append(f'''
    def test_{func_name}_error_scenarios(self{', mock_external_service' if config.auto_generate_mocks else ''}):
        """Test error handling in {func_name}."""
{error_test}''')
        
        # Edge cases
        if config.include_edge_cases:
            edge_test = TestTemplate._generate_edge_case_test(func_name, params, config)
            tests.append(f'''
    def test_{func_name}_edge_cases(self{', mock_external_service' if config.auto_generate_mocks else ''}):
        """Test edge cases for {func_name}."""
{edge_test}''')
        
        return "\n".join(tests) + "\n\n"
    
    @staticmethod
    def _generate_basic_function_test(func_name: str, params: List[Dict[str, Any]], 
                                    config: TestCreationConfig) -> str:
        """Generate basic functionality test."""
        if not params:
            return '''        # Test with no parameters
        result = {func_name}()
        assert result is not None
        assert isinstance(result, expected_type)  # Replace with actual expected type'''.format(func_name=func_name)
        
        # Generate test with valid parameters
        param_assignments = []
        param_names = []
        
        for param in params[:3]:  # Limit to first 3 parameters
            param_name = param["name"]
            param_names.append(param_name)
            
            # Generate appropriate test value based on parameter type
            param_type = param.get("type", "str").lower()
            if "int" in param_type or "number" in param_type:
                param_assignments.append(f"        {param_name} = 1")
            elif "float" in param_type or "decimal" in param_type:
                param_assignments.append(f"        {param_name} = 1.0")
            elif "bool" in param_type:
                param_assignments.append(f"        {param_name} = True")
            elif "list" in param_type or "array" in param_type:
                param_assignments.append(f"        {param_name} = []")
            elif "dict" in param_type or "object" in param_type:
                param_assignments.append(f"        {param_name} = {{}}")
            else:
                param_assignments.append(f"        {param_name} = 'test_value'")
        
        param_call = ", ".join(param_names)
        
        return '''        # Test with valid parameters
{param_assignments}
        result = {func_name}({param_call})
        
        # Add assertions based on expected behavior
        assert result is not None
        # TODO: Add specific assertions for {func_name} functionality
        # assert result.property == expected_value'''.format(
            param_assignments="\n".join(param_assignments),
            func_name=func_name,
            param_call=param_call
        )
    
    @staticmethod
    def _generate_error_test(func_name: str, params: List[Dict[str, Any]], 
                            config: TestCreationConfig) -> str:
        """Generate error scenario test."""
        error_tests = []
        
        # Test with invalid parameters
        if params:
            first_param = params[0]["name"]
            error_tests.append(f'''        # Test with invalid {first_param}
        with pytest.raises((ValueError, TypeError, KeyError)):
            {func_name}(invalid_value)''')
        
        # Test with missing required parameters
        if len(params) > 1:
            error_tests.append(f'''        # Test with missing required parameters
        with pytest.raises((TypeError, ValueError)):
            {func_name}()  # Missing required parameters''')
        
        # Test with None values
        if params:
            error_tests.append(f'''        # Test with None values
        with pytest.raises((ValueError, AttributeError, TypeError)):
            {func_name}(None)''')
        
        if not error_tests:
            return '''        # TODO: Add specific error scenarios for {func_name}
        # Consider testing:
        # - Invalid input parameters
        # - Missing required data
        # - Network failures
        # - Database errors
        # - Permission issues'''.format(func_name=func_name)
        
        return "\n".join(error_tests)
    
    @staticmethod
    def _generate_edge_case_test(func_name: str, params: List[Dict[str, Any]], 
                                config: TestCreationConfig) -> str:
        """Generate edge case test."""
        edge_tests = []
        
        # Test boundary values
        if params:
            first_param = params[0]["name"]
            param_type = params[0].get("type", "str").lower()
            
            if "int" in param_type or "number" in param_type:
                edge_tests.append(f'''        # Test boundary values
        result_zero = {func_name}(0)
        result_negative = {func_name}(-1)
        result_large = {func_name}(999999)
        
        assert result_zero is not None
        assert result_negative is not None
        assert result_large is not None''')
            elif "str" in param_type:
                edge_tests.append(f'''        # Test string edge cases
        result_empty = {func_name}("")
        result_whitespace = {func_name}("   ")
        result_special_chars = {func_name}("!@#$%^&*()")
        
        assert result_empty is not None
        assert result_whitespace is not None
        assert result_special_chars is not None''')
        
        # Test with empty collections
        if any("list" in p.get("type", "").lower() for p in params):
            edge_tests.append(f'''        # Test with empty collections
        result = {func_name}([])
        assert result is not None''')
        
        if not edge_tests:
            return '''        # TODO: Add edge cases for {func_name}
        # Consider testing:
        # - Boundary values (0, -1, max values)
        # - Empty strings/collections
        # - Special characters
        # - Unicode characters
        # - Very large inputs'''.format(func_name=func_name)
        
        return "\n".join(edge_tests)
    
    @staticmethod
    def _generate_class_tests(class_info: Dict[str, Any], config: TestCreationConfig) -> str:
        """Generate tests for a class."""
        class_name = class_info["name"]
        methods = class_info.get("methods", [])
        
        tests = []
        
        # Test class instantiation
        tests.append(f'''class Test{class_name}:
    """Test cases for {class_name} class."""

    def test_{class_name.lower()}_instantiation(self):
        """Test basic class instantiation."""
        # TODO: Initialize with appropriate parameters
        instance = {class_name}()
        assert instance is not None
        assert isinstance(instance, {class_name})''')
        
        # Test methods
        for method_info in methods:
            if not method_info.get("is_private", False) and not method_info.get("is_dunder", False):
                method_name = method_info["name"]
                tests.append(f'''
    def test_{method_name}(self):
        """Test {method_name} method."""
        # TODO: Set up test instance and method parameters
        instance = {class_name}()
        result = instance.{method_name}()
        
        # Add assertions based on expected behavior
        assert result is not None
        # assert result.property == expected_value''')
        
        return "\n".join(tests) + "\n\n"


class ModuleAnalyzer:
    """Analyzes Python modules to extract structure for test generation."""
    
    @staticmethod
    def analyze_module(file_path: Path) -> Dict[str, Any]:
        """Analyze a Python module and extract its structure."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            module_info = {
                "name": file_path.stem,
                "import_path": ModuleAnalyzer._get_import_path(file_path),
                "functions": [],
                "classes": [],
                "imports": [],
                "constants": []
            }
            
            # Extract imports
            for node in tree.body:
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        module_info["imports"].append({
                            "type": "import",
                            "module": alias.name,
                            "alias": alias.asname
                        })
                elif isinstance(node, ast.ImportFrom):
                    module_name = node.module or ""
                    for alias in node.names:
                        module_info["imports"].append({
                            "type": "from_import",
                            "module": module_name,
                            "name": alias.name,
                            "alias": alias.asname
                        })
            
            # Extract functions and classes
            for node in tree.body:
                if isinstance(node, ast.FunctionDef):
                    module_info["functions"].append(ModuleAnalyzer._analyze_function(node))
                elif isinstance(node, ast.ClassDef):
                    module_info["classes"].append(ModuleAnalyzer._analyze_class(node))
                elif isinstance(node, ast.Assign):
                    # Extract module-level constants
                    for target in node.targets:
                        if isinstance(target, ast.Name) and target.id.isupper():
                            module_info["constants"].append({
                                "name": target.id,
                                "value": ModuleAnalyzer._get_node_value(node.value)
                            })
            
            return module_info
            
        except Exception as e:
            return {
                "name": file_path.stem,
                "import_path": file_path.stem,
                "error": str(e),
                "functions": [],
                "classes": [],
                "imports": [],
                "constants": []
            }
    
    @staticmethod
    def _get_import_path(file_path: Path) -> str:
        """Get the import path for a module file."""
        # Convert file path to Python import path
        parts = file_path.with_suffix("").parts
        
        # Remove common source directories
        source_dirs = {"src", "lib", "app"}
        if parts and parts[0] in source_dirs:
            parts = parts[1:]
        
        return ".".join(parts)
    
    @staticmethod
    def _analyze_function(node: ast.FunctionDef) -> Dict[str, Any]:
        """Analyze a function definition."""
        func_info = {
            "name": node.name,
            "is_private": node.name.startswith('_'),
            "parameters": [],
            "return_type": None,
            "docstring": ast.get_docstring(node) or "",
            "decorators": []
        }
        
        # Extract parameters
        if node.args:
            for arg in node.args.args:
                param_info = {
                    "name": arg.arg,
                    "type": None,
                    "default": None
                }
                
                # Try to get type annotation
                if arg.annotation:
                    param_info["type"] = ModuleAnalyzer._get_node_type(arg.annotation)
                
                func_info["parameters"].append(param_info)
        
        # Extract return type
        if node.returns:
            func_info["return_type"] = ModuleAnalyzer._get_node_type(node.returns)
        
        # Extract decorators
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Name):
                func_info["decorators"].append(decorator.id)
        
        return func_info
    
    @staticmethod
    def _analyze_class(node: ast.ClassDef) -> Dict[str, Any]:
        """Analyze a class definition."""
        class_info = {
            "name": node.name,
            "is_private": node.name.startswith('_'),
            "bases": [],
            "methods": [],
            "properties": [],
            "docstring": ast.get_docstring(node) or "",
            "decorators": []
        }
        
        # Extract base classes
        for base in node.bases:
            if isinstance(base, ast.Name):
                class_info["bases"].append(base.id)
        
        # Extract methods and properties
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                method_info = ModuleAnalyzer._analyze_function(item)
                method_info["is_dunder"] = item.name.startswith('__')
                class_info["methods"].append(method_info)
            elif isinstance(item, ast.Assign):
                # Extract class properties
                for target in item.targets:
                    if isinstance(target, ast.Name) and not target.name.startswith('_'):
                        class_info["properties"].append({
                            "name": target.name,
                            "value": ModuleAnalyzer._get_node_value(item.value)
                        })
        
        return class_info
    
    @staticmethod
    def _get_node_type(node: ast.AST) -> str:
        """Get string representation of a type annotation node."""
        try:
            if isinstance(node, ast.Name):
                return node.id
            elif isinstance(node, ast.Attribute):
                return f"{ModuleAnalyzer._get_node_type(node.value)}.{node.attr}"
            elif isinstance(node, ast.Subscript):
                base = ModuleAnalyzer._get_node_type(node.value)
                if hasattr(node, 'slice'):
                    slice_str = ModuleAnalyzer._get_node_type(node.slice)
                    return f"{base}[{slice_str}]"
                return base
            elif isinstance(node, ast.Constant):
                return str(node.value)
            else:
                return "Any"
        except:
            return "Any"
    
    @staticmethod
    def _get_node_value(node: ast.AST) -> str:
        """Get string representation of a node value."""
        try:
            if isinstance(node, ast.Constant):
                return repr(node.value)
            elif isinstance(node, ast.Name):
                return node.id
            elif isinstance(node, ast.Call):
                return f"{ModuleAnalyzer._get_node_value(node.func)}(...)"
            else:
                return "..."
        except:
            return "..."


class TestCreationFramework:
    """Main framework for creating tests across projects."""
    
    def __init__(self, project_root: Path, config: TestCreationConfig | None = None):
        self.project_root = project_root
        self.config = config or TestCreationConfig()
        self.quality_config = TestQualityConfig()
        self.quality_validator = TestQualityValidator(project_root, self.quality_config)
    
    def create_unit_tests(self, module_path: str) -> Dict[str, Any]:
        """Create unit tests for a specific module."""
        module_file = self.project_root / module_path
        
        if not module_file.exists():
            return {"error": f"Module file not found: {module_path}"}
        
        # Analyze the module
        module_info = ModuleAnalyzer.analyze_module(module_file)
        
        if "error" in module_info:
            return {"error": f"Failed to analyze module: {module_info['error']}"}
        
        # Generate test content
        test_content = TestTemplate.generate_unit_test_template(module_info, self.config)
        
        # Determine output path
        output_dir = self.project_root / self.config.output_directory
        test_file_name = f"{self.config.test_file_prefix}{module_file.stem}.py"
        output_path = output_dir / test_file_name
        
        # Create output directory if needed
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Write test file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        # Validate generated test
        validation_result = self._validate_generated_test(output_path)
        
        return {
            "module_path": module_path,
            "output_path": str(output_path),
            "module_info": module_info,
            "validation": validation_result
        }
    
    def create_integration_tests(self, components: List[str]) -> Dict[str, Any]:
        """Create integration tests for specified components."""
        # This is a placeholder for integration test creation
        # Implementation would depend on specific project architecture
        
        integration_test_content = f'''"""
Integration tests for components: {', '.join(components)}.

This file contains integration tests that verify component interactions
and data flow between different parts of the system.
"""

import pytest
from unittest.mock import Mock, patch

class TestComponentIntegration:
    """Integration tests for component interactions."""

    def test_{components[0].lower()}_integration(self):
        """Test integration between components."""
        # TODO: Implement integration test
        # - Test component communication
        # - Test data flow
        # - Test error propagation
        pass

    def test_error_handling_integration(self):
        """Test error handling across components."""
        # TODO: Test error scenarios
        # - Network failures
        # - Database errors
        # - Component unavailability
        pass
'''
        
        output_dir = self.project_root / self.config.output_directory / "integration"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir / f"test_{'_'.join(components).lower()}_integration.py"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(integration_test_content)
        
        return {
            "components": components,
            "output_path": str(output_path),
            "type": "integration"
        }
    
    def create_e2e_tests(self, workflows: List[str]) -> Dict[str, Any]:
        """Create end-to-end tests for specified workflows."""
        e2e_test_content = f'''"""
End-to-end tests for workflows: {', '.join(workflows)}.

This file contains comprehensive E2E tests that verify complete user
workflows from start to finish.
"""

import pytest
from unittest.mock import Mock, patch

class TestUserWorkflows:
    """End-to-end tests for user workflows."""

    def test_{workflows[0].lower()}_workflow(self):
        """Test complete {workflows[0]} workflow."""
        # TODO: Implement E2E test
        # - Test complete user journey
        # - Test UI interactions
        # - Test database operations
        # - Test external service calls
        pass

    def test_workflow_performance(self):
        """Test workflow performance and reliability."""
        # TODO: Test performance
        # - Response times
        - Resource usage
        - Concurrent operations
        pass
'''
        
        output_dir = self.project_root / self.config.output_directory / "e2e"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir / f"test_{'_'.join(workflows).lower()}_e2e.py"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(e2e_test_content)
        
        return {
            "workflows": workflows,
            "output_path": str(output_path),
            "type": "e2e"
        }
    
    def _validate_generated_test(self, test_path: Path) -> Dict[str, Any]:
        """Validate the quality of a generated test file."""
        try:
            # Use the quality validator to check the generated test
            report = self.quality_validator.analyze_project()
            
            # Extract metrics for this specific file
            file_metrics = [
                m for m in report.get("file_metrics", [])
                if m.get("file_path") == str(test_path)
            ]
            
            if file_metrics:
                return {
                    "quality_score": file_metrics[0].get("overall_quality_score", 0),
                    "issues": len([i for i in report.get("issue_summary", {}).get("by_type", {}).values()]),
                    "grade": self.quality_validator._calculate_quality_grade(
                        file_metrics[0].get("overall_quality_score", 0)
                    )
                }
            else:
                return {"quality_score": 0, "issues": 0, "grade": "F"}
                
        except Exception as e:
            return {"error": f"Validation failed: {str(e)}"}
    
    def analyze_project_for_testing(self) -> Dict[str, Any]:
        """Analyze the entire project to identify testing needs."""
        # Find all Python modules
        python_files = list(self.project_root.rglob("*.py"))
        
        # Exclude test files and common directories
        exclude_patterns = ["test_", "__pycache__", ".venv", "venv", "node_modules"]
        source_files = [
            f for f in python_files 
            if not any(pattern in str(f) for pattern in exclude_patterns)
        ]
        
        analysis = {
            "total_modules": len(source_files),
            "modules": [],
            "testing_recommendations": []
        }
        
        for file_path in source_files[:10]:  # Limit to first 10 for demo
            module_info = ModuleAnalyzer.analyze_module(file_path)
            analysis["modules"].append({
                "path": str(file_path.relative_to(self.project_root)),
                "name": module_info["name"],
                "functions": len(module_info["functions"]),
                "classes": len(module_info["classes"]),
                "complexity": self._estimate_complexity(module_info)
            })
        
        # Generate recommendations
        analysis["testing_recommendations"] = self._generate_testing_recommendations(analysis["modules"])
        
        return analysis
    
    def _estimate_complexity(self, module_info: Dict[str, Any]) -> str:
        """Estimate the complexity of a module."""
        functions = len(module_info["functions"])
        classes = len(module_info["classes"])
        imports = len(module_info["imports"])
        
        if functions + classes > 20 or imports > 15:
            return "high"
        elif functions + classes > 10 or imports > 8:
            return "medium"
        else:
            return "low"
    
    def _generate_testing_recommendations(self, modules: List[Dict[str, Any]]) -> List[str]:
        """Generate testing recommendations based on module analysis."""
        recommendations = []
        
        high_complexity = [m for m in modules if m["complexity"] == "high"]
        medium_complexity = [m for m in modules if m["complexity"] == "medium"]
        
        if high_complexity:
            recommendations.append(
                f"Focus on {len(high_complexity)} high-complexity modules first. "
                "These likely contain critical business logic that needs comprehensive testing."
            )
        
        if medium_complexity:
            recommendations.append(
                f"Create integration tests for {len(medium_complexity)} medium-complexity modules "
                "to verify component interactions."
            )
        
        total_functions = sum(m["functions"] for m in modules)
        total_classes = sum(m["classes"] for m in modules)
        
        recommendations.append(
            f"Generate unit tests for {total_functions} functions and {total_classes} classes "
            "to ensure comprehensive code coverage."
        )
        
        return recommendations
