#!/usr/bin/env python3
"""
Test Workflows CLI

Command-line interface for the reusable test creation and quality validation framework.
This script provides a unified interface for all testing operations across projects.

Usage:
    python test_workflows.py analyze [--output report.json]
    python test_workflows.py create-unit <module_path> [--config config.json]
    python test_workflows.py create-integration <components...>
    python test_workflows.py create-e2e <workflows...>
    python test_workflows.py validate [--threshold 80]
    python test_workflows.py analyze-project
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Union

# Import the reusable framework
try:
    from patterns.testing.test_quality_validator import TestQualityValidator, TestQualityConfig
    from patterns.testing.test_creation_framework import TestCreationFramework, TestCreationConfig
except ImportError:
    print("Error: Could not import testing framework. Please ensure forge-patterns is installed.")
    sys.exit(1)


class TestWorkflowsCLI:
    """Command-line interface for test workflows."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.quality_config = TestQualityConfig()
        self.creation_config = TestCreationConfig()

        # Try to load project-specific configuration
        self._load_project_config()

    def _load_project_config(self) -> None:
        """Load project-specific configuration if available."""
        config_file = self.project_root / ".test-workflows-config.json"

        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    config_data = json.load(f)

                # Load quality config
                if "quality" in config_data:
                    quality_data = config_data["quality"]
                    self.quality_config = TestQualityConfig(**quality_data)

                # Load creation config
                if "creation" in config_data:
                    creation_data = config_data["creation"]
                    self.creation_config = TestCreationConfig(**creation_data)

                print(f"✅ Loaded configuration from {config_file}")

            except Exception as e:
                print(f"⚠️  Warning: Failed to load config file: {e}")

    def analyze_project(self, output_path: Union[Path, None] = None) -> Dict[str, Any]:
        """Analyze project for test quality."""
        print("🔍 Analyzing project for test quality...")

        validator = TestQualityValidator(self.project_root, self.quality_config)
        report = validator.analyze_project(output_path)

        validator.print_summary_report(report)

        return report

    def create_unit_tests(self, module_path: str) -> Dict[str, Any]:
        """Create unit tests for a module."""
        print(f"🧪 Creating unit tests for {module_path}...")

        framework = TestCreationFramework(self.project_root, self.creation_config)
        result = framework.create_unit_tests(module_path)

        if "error" in result:
            print(f"❌ Error: {result['error']}")
            return result

        print(f"✅ Created unit tests: {result['output_path']}")

        # Show validation results
        validation = result.get("validation", {})
        if "quality_score" in validation:
            print(f"📊 Quality Score: {validation['quality_score']:.1f}% (Grade: {validation['grade']})")

        return result

    def create_integration_tests(self, components: List[str]) -> Dict[str, Any]:
        """Create integration tests for components."""
        print(f"🔗 Creating integration tests for: {', '.join(components)}")

        framework = TestCreationFramework(self.project_root, self.creation_config)
        result = framework.create_integration_tests(components)

        print(f"✅ Created integration tests: {result['output_path']}")
        return result

    def create_e2e_tests(self, workflows: List[str]) -> Dict[str, Any]:
        """Create end-to-end tests for workflows."""
        print(f"🎭 Creating E2E tests for: {', '.join(workflows)}")

        framework = TestCreationFramework(self.project_root, self.creation_config)
        result = framework.create_e2e_tests(workflows)

        print(f"✅ Created E2E tests: {result['output_path']}")
        return result

    def validate_quality(self, threshold: float = 80.0) -> Dict[str, Any]:
        """Validate test quality against threshold."""
        print(f"✅ Validating test quality (threshold: {threshold}%)...")

        # Update threshold in config
        self.quality_config.min_coverage_threshold = threshold

        validator = TestQualityValidator(self.project_root, self.quality_config)
        report = validator.analyze_project()

        validator.print_summary_report(report)

        # Check if quality meets threshold
        overall_score = report["project_metrics"]["overall_quality_score"]

        if overall_score >= threshold:
            print(f"🎉 Quality validation PASSED: {overall_score:.1f}% >= {threshold}%")
        else:
            print(f"❌ Quality validation FAILED: {overall_score:.1f}% < {threshold}%")

        return report

    def analyze_project_structure(self) -> Dict[str, Any]:
        """Analyze project structure for testing needs."""
        print("📊 Analyzing project structure...")

        framework = TestCreationFramework(self.project_root, self.creation_config)
        analysis = framework.analyze_project_for_testing()

        print(f"\n📈 Project Analysis:")
        print(f"  • Total Modules: {analysis['total_modules']}")
        print(f"  • High Complexity: {len([m for m in analysis['modules'] if m['complexity'] == 'high'])}")
        print(f"  • Medium Complexity: {len([m for m in analysis['modules'] if m['complexity'] == 'medium'])}")
        print(f"  • Low Complexity: {len([m for m in analysis['modules'] if m['complexity'] == 'low'])}")

        print(f"\n💡 Recommendations:")
        for i, rec in enumerate(analysis['testing_recommendations'], 1):
            print(f"  {i}. {rec}")

        return analysis

    def create_project_config(self) -> None:
        """Create a sample project configuration file."""
        config = {
            "quality": {
                "min_coverage_threshold": 80.0,
                "min_business_logic_threshold": 70.0,
                "min_error_scenario_threshold": 60.0,
                "business_logic_weight": 0.25,
                "error_scenario_weight": 0.20,
                "mock_isolation_weight": 0.15,
                "realistic_data_weight": 0.15,
                "documentation_weight": 0.15,
                "maintenance_weight": 0.10
            },
            "creation": {
                "output_directory": "tests",
                "test_file_prefix": "test_",
                "include_error_scenarios": True,
                "include_edge_cases": True,
                "include_performance_tests": False,
                "include_integration_tests": True,
                "min_assertions_per_test": 2,
                "max_test_length": 50,
                "include_docstrings": True,
                "auto_generate_mocks": True,
                "mock_external_dependencies": True,
                "mock_database_operations": True,
                "generate_realistic_data": True,
                "include_boundary_values": True,
                "include_negative_cases": True
            }
        }

        config_file = self.project_root / ".test-workflows-config.json"

        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)

        print(f"✅ Created configuration file: {config_file}")
        print("📝 Edit this file to customize testing settings for your project.")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Test Workflows CLI - Reusable test creation and quality validation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s analyze --output report.json
  %(prog)s create-unit src/core/calculator.py
  %(prog)s create-integration api database
  %(prog)s create-e2e user_registration checkout
  %(prog)s validate --threshold 85
  %(prog)s analyze-project
  %(prog)s init-config
        """
    )

    # Determine project root (current directory or parent with .git)
    project_root = Path.cwd()
    if not (project_root / ".git").exists():
        parent = project_root.parent
        if (parent / ".git").exists():
            project_root = parent

    cli = TestWorkflowsCLI(project_root)

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Analyze command
    analyze_parser = subparsers.add_parser("analyze", help="Analyze test quality")
    analyze_parser.add_argument("--output", "-o", type=Path, help="Output report file")

    # Create unit tests command
    unit_parser = subparsers.add_parser("create-unit", help="Create unit tests")
    unit_parser.add_argument("module", help="Module path (e.g., src/core/calculator.py)")

    # Create integration tests command
    integration_parser = subparsers.add_parser("create-integration", help="Create integration tests")
    integration_parser.add_argument("components", nargs="+", help="Component names")

    # Create E2E tests command
    e2e_parser = subparsers.add_parser("create-e2e", help="Create end-to-end tests")
    e2e_parser.add_argument("workflows", nargs="+", help="Workflow names")

    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Validate test quality")
    validate_parser.add_argument("--threshold", "-t", type=float, default=80.0,
                                help="Quality threshold percentage (default: 80)")

    # Analyze project command
    project_parser = subparsers.add_parser("analyze-project", help="Analyze project structure")

    # Init config command
    init_parser = subparsers.add_parser("init-config", help="Create project configuration")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    try:
        if args.command == "analyze":
            cli.analyze_project(args.output)

        elif args.command == "create-unit":
            cli.create_unit_tests(args.module)

        elif args.command == "create-integration":
            cli.create_integration_tests(args.components)

        elif args.command == "create-e2e":
            cli.create_e2e_tests(args.workflows)

        elif args.command == "validate":
            cli.validate_quality(args.threshold)

        elif args.command == "analyze-project":
            cli.analyze_project_structure()

        elif args.command == "init-config":
            cli.create_project_config()

    except KeyboardInterrupt:
        print("\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
