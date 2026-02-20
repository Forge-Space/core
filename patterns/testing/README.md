# Reusable Test Workflows Pattern

This pattern provides a comprehensive, reusable framework for test creation and quality validation that can be applied across different projects. It emphasizes **Quality Over Quantity** and helps teams maintain high testing standards.

## 🚀 Quick Start

### Installation

Add this pattern to your project by copying the testing framework files:

```bash
# Copy the testing framework to your project
cp -r /path/to/forge-patterns/patterns/testing ./patterns/testing
```

### Basic Usage

```python
from patterns.testing.test_workflows_cli import TestWorkflowsCLI
from pathlib import Path

# Initialize the CLI for your project
cli = TestWorkflowsCLI(Path.cwd())

# Analyze current test quality
report = cli.analyze_project()

# Create unit tests for a module
result = cli.create_unit_tests("src/core/calculator.py")

# Validate quality against threshold
validation = cli.validate_quality(threshold=85.0)
```

## 📁 Files Overview

### Core Framework Files

- **`test_quality_validator.py`** - Comprehensive test quality analysis and validation
- **`test_creation_framework.py`** - Automated test generation workflows
- **`test_workflows_cli.py`** - Command-line interface for all operations

### Key Classes

#### `TestQualityValidator`
Analyzes test files and provides quality metrics:
- Business logic coverage assessment
- Error scenario validation
- Mock isolation verification
- Documentation quality checks
- Maintainability scoring

#### `TestCreationFramework`
Generates high-quality tests automatically:
- Unit test creation with proper fixtures
- Integration test templates
- End-to-end test workflows
- Quality validation of generated tests

#### `TestWorkflowsCLI`
Unified command-line interface for all testing operations.

## 🛠️ Features

### Test Quality Analysis

The framework analyzes tests across multiple dimensions:

```python
from patterns.testing.test_quality_validator import TestQualityValidator, TestQualityConfig

# Configure quality standards
config = TestQualityConfig(
    min_coverage_threshold=80.0,
    business_logic_weight=0.25,
    error_scenario_weight=0.20,
    # ... other settings
)

validator = TestQualityValidator(project_root, config)
report = validator.analyze_project()
```

**Quality Metrics:**
- **Business Logic Coverage**: Tests that verify actual functionality
- **Error Scenario Coverage**: Tests for edge cases and failures
- **Mock Isolation Score**: Proper test isolation and mocking
- **Documentation Score**: Test documentation quality
- **Maintenance Score**: Code maintainability and readability
- **Overall Quality Score**: Weighted composite score

### Automated Test Generation

Generate comprehensive tests with built-in quality:

```python
from patterns.testing.test_creation_framework import TestCreationFramework, TestCreationConfig

# Configure test generation
config = TestCreationConfig(
    include_error_scenarios=True,
    include_edge_cases=True,
    auto_generate_mocks=True,
    generate_realistic_data=True
)

framework = TestCreationFramework(project_root, config)

# Create unit tests
result = framework.create_unit_tests("src/core/calculator.py")

# Create integration tests
result = framework.create_integration_tests(["api", "database"])

# Create E2E tests
result = framework.create_e2e_tests(["user_registration", "checkout"])
```

### Command-Line Interface

Use the CLI for quick operations:

```bash
# Analyze test quality
python patterns/testing/test_workflows_cli.py analyze --output report.json

# Create unit tests
python patterns/testing/test_workflows_cli.py create-unit src/core/calculator.py

# Create integration tests
python patterns/testing/test_workflows_cli.py create-integration api database

# Create E2E tests
python patterns/testing/test_workflows_cli.py create-e2e user_registration checkout

# Validate quality
python patterns/testing/test_workflows_cli.py validate --threshold 85

# Analyze project structure
python patterns/testing/test_workflows_cli.py analyze-project

# Initialize project configuration
python patterns/testing/test_workflows_cli.py init-config
```

## ⚙️ Configuration

### Project Configuration

Create a `.test-workflows-config.json` file in your project root:

```json
{
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
    "include_error_scenarios": true,
    "include_edge_cases": true,
    "include_performance_tests": false,
    "include_integration_tests": true,
    "min_assertions_per_test": 2,
    "max_test_length": 50,
    "include_docstrings": true,
    "auto_generate_mocks": true,
    "mock_external_dependencies": true,
    "mock_database_operations": true,
    "generate_realistic_data": true,
    "include_boundary_values": true,
    "include_negative_cases": true
  }
}
```

### Quality Standards

The framework enforces these quality principles:

#### ✅ Good Test Patterns
- **Business Logic Testing**: Tests that verify actual functionality
- **Error Scenario Coverage**: Testing edge cases and failure conditions
- **Proper Mocking**: Isolated tests with appropriate mocking
- **Realistic Test Data**: Meaningful test scenarios
- **Good Documentation**: Clear test descriptions and purposes

#### ❌ Anti-Patterns to Avoid
- **False Positive Tests**: Tests that only increase coverage without value
- **Trivial Assertions**: Testing obvious or meaningless conditions
- **Hardcoded Test Data**: Unrealistic or meaningless test inputs
- **Poor Isolation**: Tests that depend on external systems
- **Missing Documentation**: Tests without clear purposes

## 📊 Quality Reporting

The framework generates comprehensive reports:

### Sample Report Output

```
============================================================
📊 TEST QUALITY ANALYSIS REPORT
============================================================

📁 Project: /path/to/project
📄 Test Files Analyzed: 15
📈 Overall Quality Score: 82.5%
🏆 Quality Grade: B

📋 Quality Metrics:
  • Business Logic Coverage: 78.2%
  • Error Scenario Coverage: 65.0%
  • Test Isolation Score: 85.7%
  • Documentation Score: 90.3%
  • Maintainability Score: 88.1%

⚠️  Issues Summary:
  • Total Issues: 12
  • Critical: 0
  • High: 2
  • Medium: 5
  • Low: 5
  • Files with Issues: 4

💡 Recommendations:
  1. Improve error scenario coverage (currently 65.0%). Add tests that verify edge cases, invalid inputs, and failure conditions.
  2. Add more comprehensive business logic tests to reach 80% threshold.
  3. Address 2 high priority issues first.
============================================================
```

## 🎯 Integration Examples

### Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/test-quality.yml
name: Test Quality Validation

on: [push, pull_request]

jobs:
  test-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install pytest
          # Install forge-patterns testing framework
      
      - name: Validate Test Quality
        run: |
          python patterns/testing/test_workflows_cli.py validate --threshold 80
      
      - name: Upload Quality Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: test-quality-report.json
```

### Integration with Existing Projects

1. **Copy the framework** to your project
2. **Run analysis** to understand current state
3. **Configure standards** based on project needs
4. **Generate tests** for critical modules
5. **Validate quality** regularly in CI/CD

### Example: MCP Gateway Integration

```python
# scripts/quality_check.py
from patterns.testing.test_workflows_cli import TestWorkflowsCLI
from pathlib import Path

def main():
    cli = TestWorkflowsCLI(Path.cwd())
    
    # Analyze current quality
    report = cli.analyze_project()
    
    # Create tests for low-quality modules
    if report["project_metrics"]["overall_quality_score"] < 80:
        print("⚠️  Quality below threshold, generating tests...")
        
        # Find modules that need improvement
        low_quality_files = [
            m["file_path"] for m in report["file_metrics"]
            if m["overall_quality_score"] < 70
        ]
        
        for file_path in low_quality_files:
            module_path = file_path.replace("tests/", "src/").replace(".py", "")
            cli.create_unit_tests(module_path)

if __name__ == "__main__":
    main()
```

## 🔧 Customization

### Extending Quality Metrics

Add custom quality checks:

```python
from patterns.testing.test_quality_validator import TestAnalyzer

class CustomTestAnalyzer(TestAnalyzer):
    def _analyze_custom_metric(self, tree, file_path, metrics, issues):
        """Add custom quality analysis."""
        # Your custom analysis logic
        pass

# Use custom analyzer
validator = TestQualityValidator(project_root)
validator.analyzer = CustomTestAnalyzer(validator.config)
```

### Custom Test Templates

Extend test generation:

```python
from patterns.testing.test_creation_framework import TestTemplate

class CustomTestTemplate(TestTemplate):
    @staticmethod
    def generate_custom_test_template(module_info, config):
        """Generate custom test template."""
        # Your custom template logic
        pass
```

## 📈 Best Practices

### 1. Start with Analysis
Always analyze your project first to understand the current state:
```bash
python patterns/testing/test_workflows_cli.py analyze-project
```

### 2. Set Realistic Standards
Configure thresholds based on project maturity:
- **New projects**: 60-70% threshold
- **Mature projects**: 80-90% threshold
- **Critical systems**: 90%+ threshold

### 3. Focus on Business Value
Prioritize tests that verify:
- Core business logic
- User workflows
- Error handling
- Data integrity

### 4. Iterate and Improve
- Start with critical modules
- Gradually improve quality
- Monitor trends over time

### 5. Integrate with Development
- Run quality checks in CI/CD
- Use pre-commit hooks
- Review quality reports regularly

## 🤝 Contributing

To extend this pattern:

1. **Add new quality metrics** to `TestQualityValidator`
2. **Create new test templates** in `TestTemplate`
3. **Enhance CLI commands** in `TestWorkflowsCLI`
4. **Update documentation** with examples

## 📚 References

- [Testing Best Practices](https://docs.python.org/3/library/unittest.html)
- [pytest Documentation](https://docs.pytest.org/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Quality Assurance Standards](https://www.iso.org/iso-9001-quality-management.html)

---

**Remember**: The goal is **Quality Over Quantity**. Fewer high-quality tests are better than many low-quality tests that only increase coverage numbers without providing real value.
