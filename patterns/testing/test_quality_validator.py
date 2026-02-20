"""
Reusable Test Quality Validation Framework

This module provides a comprehensive framework for analyzing and validating
test quality across different projects. It's designed to be project-agnostic
and configurable for various testing standards and requirements.
"""

from __future__ import annotations

import ast
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Tuple


@dataclass
class QualityMetrics:
    """Metrics for assessing test quality."""
    business_logic_coverage: float = 0.0
    error_scenario_coverage: float = 0.0
    mock_isolation_score: float = 0.0
    realistic_data_score: float = 0.0
    documentation_score: float = 0.0
    maintenance_score: float = 0.0
    integration_coverage: float = 0.0
    overall_quality_score: float = 0.0


@dataclass
class TestIssue:
    """Represents an issue found in test analysis."""
    file_path: str
    line_number: int
    issue_type: str
    severity: str
    description: str
    suggestion: str = ""


@dataclass
class TestQualityConfig:
    """Configuration for test quality validation."""
    # Coverage thresholds
    min_coverage_threshold: float = 80.0
    min_business_logic_threshold: float = 70.0
    min_error_scenario_threshold: float = 60.0
    
    # Quality weights (should sum to 1.0)
    business_logic_weight: float = 0.25
    error_scenario_weight: float = 0.20
    mock_isolation_weight: float = 0.15
    realistic_data_weight: float = 0.15
    documentation_weight: float = 0.15
    maintenance_weight: float = 0.10
    
    # File patterns
    test_file_patterns: List[str] = field(default_factory=lambda: ["test_*.py", "*_test.py"])
    source_file_patterns: List[str] = field(default_factory=lambda: ["*.py"])
    
    # Directories to exclude
    exclude_dirs: List[str] = field(default_factory=lambda: [
        ".venv", "venv", "env", "__pycache__", "node_modules", 
        ".git", ".pytest_cache", "htmlcov", ".coverage"
    ])
    
    # Quality thresholds
    min_test_length: int = 10
    max_test_length: int = 200
    min_assertions_per_test: int = 1
    max_mock_objects_per_test: int = 5


class TestAnalyzer:
    """Analyzes individual test files for quality metrics."""
    
    def __init__(self, config: TestQualityConfig):
        self.config = config
    
    def analyze_test_file(self, file_path: Path) -> Tuple[QualityMetrics, List[TestIssue]]:
        """Analyze a single test file and return metrics and issues."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            metrics = QualityMetrics()
            issues = []
            
            # Analyze AST for quality metrics
            self._analyze_test_structure(tree, file_path, metrics, issues)
            self._analyze_business_logic_coverage(tree, file_path, metrics, issues)
            self._analyze_error_scenarios(tree, file_path, metrics, issues)
            self._analyze_mock_usage(tree, file_path, metrics, issues)
            self._analyze_documentation(tree, file_path, metrics, issues)
            self._analyze_maintainability(tree, file_path, metrics, issues)
            
            # Calculate overall score
            metrics.overall_quality_score = self._calculate_overall_score(metrics)
            
            return metrics, issues
            
        except Exception as e:
            # Return empty metrics and an error issue if analysis fails
            issues.append(TestIssue(
                file_path=str(file_path),
                line_number=1,
                issue_type="analysis_error",
                severity="high",
                description=f"Failed to analyze test file: {str(e)}",
                suggestion="Check if the file contains valid Python code"
            ))
            return QualityMetrics(), issues
    
    def _analyze_test_structure(self, tree: ast.AST, file_path: Path, 
                               metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze basic test structure and quality."""
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
                
            # Check test length
            func_lines = func.end_lineno - func.lineno if hasattr(func, 'end_lineno') else 0
            if func_lines < self.config.min_test_length:
                issues.append(TestIssue(
                    file_path=str(file_path),
                    line_number=func.lineno,
                    issue_type="test_too_short",
                    severity="medium",
                    description=f"Test function '{func.name}' is too short ({func_lines} lines)",
                    suggestion="Add more comprehensive test scenarios or combine with related tests"
                ))
            
            # Count assertions
            assertions = [node for node in ast.walk(func) if isinstance(node, (ast.Assert, ast.Call))]
            assertion_count = len([a for a in assertions if isinstance(a, ast.Assert)])
            
            if assertion_count < self.config.min_assertions_per_test:
                issues.append(TestIssue(
                    file_path=str(file_path),
                    line_number=func.lineno,
                    issue_type="insufficient_assertions",
                    severity="medium",
                    description=f"Test function '{func.name}' has only {assertion_count} assertions",
                    suggestion="Add more assertions to verify expected behavior thoroughly"
                ))
    
    def _analyze_business_logic_coverage(self, tree: ast.AST, file_path: Path,
                                      metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze business logic coverage in tests."""
        business_logic_indicators = [
            "calculate_", "compute_", "process_", "handle_", "validate_",
            "transform_", "convert_", "apply_", "execute_", "perform_"
        ]
        
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        business_logic_tests = 0
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
            
            # Check if test covers business logic
            func_content = ast.get_source_segment(open(file_path).read(), func) or ""
            
            for indicator in business_logic_indicators:
                if indicator in func_content.lower():
                    business_logic_tests += 1
                    break
        
        total_tests = len([f for f in test_functions if f.name.startswith('test_')])
        if total_tests > 0:
            metrics.business_logic_coverage = (business_logic_tests / total_tests) * 100
        else:
            metrics.business_logic_coverage = 0.0
        
        if metrics.business_logic_coverage < self.config.min_business_logic_threshold:
            issues.append(TestIssue(
                file_path=str(file_path),
                line_number=1,
                issue_type="low_business_logic_coverage",
                severity="high",
                description=f"Low business logic coverage: {metrics.business_logic_coverage:.1f}%",
                suggestion="Add tests that verify core business logic and user workflows"
            ))
    
    def _analyze_error_scenarios(self, tree: ast.AST, file_path: Path,
                                metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze error scenario coverage in tests."""
        error_indicators = [
            "raises", "exception", "error", "fail", "invalid", "malformed",
            "timeout", "network", "permission", "authentication", "authorization"
        ]
        
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        error_tests = 0
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
            
            func_content = ast.get_source_segment(open(file_path).read(), func) or ""
            
            # Check for error testing patterns
            has_error_test = any(indicator in func_content.lower() for indicator in error_indicators)
            has_with_raises = "with raises" in func_content or "pytest.raises" in func_content
            
            if has_error_test or has_with_raises:
                error_tests += 1
        
        total_tests = len([f for f in test_functions if f.name.startswith('test_')])
        if total_tests > 0:
            metrics.error_scenario_coverage = (error_tests / total_tests) * 100
        else:
            metrics.error_scenario_coverage = 0.0
    
    def _analyze_mock_usage(self, tree: ast.AST, file_path: Path,
                           metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze mock usage and test isolation."""
        mock_indicators = ["mock", "patch", "MagicMock", "AsyncMock", "stub"]
        
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        isolated_tests = 0
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
            
            func_content = ast.get_source_segment(open(file_path).read(), func) or ""
            mock_count = sum(func_content.lower().count(indicator) for indicator in mock_indicators)
            
            # Consider test isolated if it uses mocks appropriately
            if 0 < mock_count <= self.config.max_mock_objects_per_test:
                isolated_tests += 1
            elif mock_count > self.config.max_mock_objects_per_test:
                issues.append(TestIssue(
                    file_path=str(file_path),
                    line_number=func.lineno,
                    issue_type="too_many_mocks",
                    severity="medium",
                    description=f"Test '{func.name}' uses {mock_count} mock objects",
                    suggestion="Consider simplifying the test or breaking it into multiple focused tests"
                ))
        
        total_tests = len([f for f in test_functions if f.name.startswith('test_')])
        if total_tests > 0:
            metrics.mock_isolation_score = (isolated_tests / total_tests) * 100
        else:
            metrics.mock_isolation_score = 0.0
    
    def _analyze_documentation(self, tree: ast.AST, file_path: Path,
                            metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze test documentation quality."""
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        documented_tests = 0
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
            
            if (func.docstring and 
                len(func.docstring.strip()) > 20 and 
                any(keyword in func.docstring.lower() for keyword in ["test", "verify", "check", "ensure"])):
                documented_tests += 1
            else:
                issues.append(TestIssue(
                    file_path=str(file_path),
                    line_number=func.lineno,
                    issue_type="missing_documentation",
                    severity="low",
                    description=f"Test function '{func.name}' lacks proper documentation",
                    suggestion="Add a descriptive docstring explaining what the test verifies"
                ))
        
        total_tests = len([f for f in test_functions if f.name.startswith('test_')])
        if total_tests > 0:
            metrics.documentation_score = (documented_tests / total_tests) * 100
        else:
            metrics.documentation_score = 0.0
    
    def _analyze_maintainability(self, tree: ast.AST, file_path: Path,
                                metrics: QualityMetrics, issues: List[TestIssue]) -> None:
        """Analyze test maintainability factors."""
        test_functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        maintainable_tests = 0
        
        for func in test_functions:
            if not func.name.startswith('test_'):
                continue
            
            # Check for maintainability factors
            func_lines = func.end_lineno - func.lineno if hasattr(func, 'end_lineno') else 0
            
            # Consider maintainable if reasonable length and clear structure
            if (self.config.min_test_length <= func_lines <= self.config.max_test_length and
                func.name and '_' in func.name):  # Descriptive naming
                maintainable_tests += 1
            elif func_lines > self.config.max_test_length:
                issues.append(TestIssue(
                    file_path=str(file_path),
                    line_number=func.lineno,
                    issue_type="test_too_long",
                    severity="medium",
                    description=f"Test function '{func.name}' is too long ({func_lines} lines)",
                    suggestion="Break down into multiple smaller, focused test functions"
                ))
        
        total_tests = len([f for f in test_functions if f.name.startswith('test_')])
        if total_tests > 0:
            metrics.maintenance_score = (maintainable_tests / total_tests) * 100
        else:
            metrics.maintenance_score = 0.0
    
    def _calculate_overall_score(self, metrics: QualityMetrics) -> float:
        """Calculate overall quality score from individual metrics."""
        weights = {
            'business_logic_coverage': self.config.business_logic_weight,
            'error_scenario_coverage': self.config.error_scenario_weight,
            'mock_isolation_score': self.config.mock_isolation_weight,
            'realistic_data_score': self.config.realistic_data_weight,
            'documentation_score': self.config.documentation_weight,
            'maintenance_score': self.config.maintenance_weight,
        }
        
        score = 0.0
        for metric_name, weight in weights.items():
            metric_value = getattr(metrics, metric_name, 0.0)
            score += metric_value * weight
        
        return min(score, 100.0)  # Cap at 100%


class TestQualityValidator:
    """Main validator for test quality analysis."""
    
    def __init__(self, project_root: Path, config: TestQualityConfig | None = None):
        self.project_root = project_root
        self.config = config or TestQualityConfig()
        self.analyzer = TestAnalyzer(self.config)
    
    def analyze_project(self, output_path: Path | None = None) -> Dict[str, Any]:
        """Analyze entire project for test quality."""
        # Find all test files
        test_files = self._find_test_files()
        
        if not test_files:
            return {"error": "No test files found"}
        
        # Analyze each test file
        all_metrics = []
        all_issues = []
        
        for test_file in test_files:
            metrics, issues = self.analyzer.analyze_test_file(test_file)
            metrics.file_path = str(test_file)  # Add file path for tracking
            all_metrics.append(metrics)
            all_issues.extend(issues)
        
        # Calculate project-wide metrics
        project_metrics = self._calculate_project_metrics(all_metrics)
        
        # Generate issue summary
        issue_summary = self._summarize_issues(all_issues)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(project_metrics, issue_summary)
        
        report = {
            "project_path": str(self.project_root),
            "test_files_analyzed": len(test_files),
            "project_metrics": asdict(project_metrics),
            "file_metrics": [asdict(m) for m in all_metrics],
            "issue_summary": issue_summary,
            "recommendations": recommendations,
            "quality_grade": self._calculate_quality_grade(project_metrics.overall_quality_score)
        }
        
        # Save report if output path specified
        if output_path:
            self._save_report(report, output_path)
        
        return report
    
    def _find_test_files(self) -> List[Path]:
        """Find all test files in the project."""
        test_files = []
        
        for pattern in self.config.test_file_patterns:
            for test_file in self.project_root.rglob(pattern):
                # Check if any excluded directory is in the path components
                path_parts = test_file.parts
                should_exclude = False
                
                for exclude in self.config.exclude_dirs:
                    if exclude in path_parts:
                        should_exclude = True
                        break
                
                if should_exclude:
                    continue
                
                # Only include files in the project
                if self.project_root in test_file.parents:
                    test_files.append(test_file)
        
        return sorted(test_files)
    
    def _calculate_project_metrics(self, file_metrics: List[QualityMetrics]) -> QualityMetrics:
        """Calculate project-wide metrics from file metrics."""
        if not file_metrics:
            return QualityMetrics()
        
        # Average all metrics
        totals = QualityMetrics()
        
        for metric in file_metrics:
            totals.business_logic_coverage += metric.business_logic_coverage
            totals.error_scenario_coverage += metric.error_scenario_coverage
            totals.mock_isolation_score += metric.mock_isolation_score
            totals.realistic_data_score += metric.realistic_data_score
            totals.documentation_score += metric.documentation_score
            totals.maintenance_score += metric.maintenance_score
            totals.overall_quality_score += metric.overall_quality_score
        
        count = len(file_metrics)
        return QualityMetrics(
            business_logic_coverage=totals.business_logic_coverage / count,
            error_scenario_coverage=totals.error_scenario_coverage / count,
            mock_isolation_score=totals.mock_isolation_score / count,
            realistic_data_score=totals.realistic_data_score / count,
            documentation_score=totals.documentation_score / count,
            maintenance_score=totals.maintenance_score / count,
            overall_quality_score=totals.overall_quality_score / count,
        )
    
    def _summarize_issues(self, issues: List[TestIssue]) -> Dict[str, Any]:
        """Summarize issues by type and severity."""
        summary = {
            "total_issues": len(issues),
            "by_severity": {
                "critical": len([i for i in issues if i.severity == "critical"]),
                "high": len([i for i in issues if i.severity == "high"]),
                "medium": len([i for i in issues if i.severity == "medium"]),
                "low": len([i for i in issues if i.severity == "low"]),
            },
            "by_type": {},
            "files_with_issues": len(set(i.file_path for i in issues))
        }
        
        # Count by issue type
        for issue in issues:
            issue_type = issue.issue_type
            if issue_type not in summary["by_type"]:
                summary["by_type"][issue_type] = 0
            summary["by_type"][issue_type] += 1
        
        return summary
    
    def _generate_recommendations(self, metrics: QualityMetrics, 
                                 issue_summary: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations based on analysis."""
        recommendations = []
        
        if metrics.business_logic_coverage < self.config.min_business_logic_threshold:
            recommendations.append(
                f"Improve business logic coverage (currently {metrics.business_logic_coverage:.1f}%). "
                "Add tests that verify core functionality and user workflows."
            )
        
        if metrics.error_scenario_coverage < self.config.min_error_scenario_threshold:
            recommendations.append(
                f"Add more error scenario tests (currently {metrics.error_scenario_coverage:.1f}%). "
                "Test edge cases, invalid inputs, and failure conditions."
            )
        
        if metrics.mock_isolation_score < 70:
            recommendations.append(
                f"Improve test isolation (currently {metrics.mock_isolation_score:.1f}%). "
                "Ensure tests are properly isolated and don't depend on external systems."
            )
        
        if metrics.documentation_score < 70:
            recommendations.append(
                f"Improve test documentation (currently {metrics.documentation_score:.1f}%). "
                "Add descriptive docstrings to explain test purpose and expected behavior."
            )
        
        if issue_summary["by_severity"]["high"] > 0 or issue_summary["by_severity"]["critical"] > 0:
            recommendations.append(
                f"Address {issue_summary['by_severity']['high']} high and "
                f"{issue_summary['by_severity']['critical']} critical priority issues first."
            )
        
        return recommendations
    
    def _calculate_quality_grade(self, score: float) -> str:
        """Calculate quality grade based on score."""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _save_report(self, report: Dict[str, Any], output_path: Path) -> None:
        """Save the analysis report to a file."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
    
    def print_summary_report(self, report: Dict[str, Any]) -> None:
        """Print a formatted summary of the analysis results."""
        print("\n" + "="*60)
        print("📊 TEST QUALITY ANALYSIS REPORT")
        print("="*60)
        
        if "error" in report:
            print(f"❌ Error: {report['error']}")
            return
        
        metrics = report["project_metrics"]
        issue_summary = report["issue_summary"]
        
        print(f"\n📁 Project: {report['project_path']}")
        print(f"📄 Test Files Analyzed: {report['test_files_analyzed']}")
        print(f"📈 Overall Quality Score: {metrics['overall_quality_score']:.1f}%")
        print(f"🏆 Quality Grade: {report['quality_grade']}")
        
        print(f"\n📋 Quality Metrics:")
        print(f"  • Business Logic Coverage: {metrics['business_logic_coverage']:.1f}%")
        print(f"  • Error Scenario Coverage: {metrics['error_scenario_coverage']:.1f}%")
        print(f"  • Test Isolation Score: {metrics['mock_isolation_score']:.1f}%")
        print(f"  • Documentation Score: {metrics['documentation_score']:.1f}%")
        print(f"  • Maintainability Score: {metrics['maintenance_score']:.1f}%")
        
        print(f"\n⚠️  Issues Summary:")
        print(f"  • Total Issues: {issue_summary['total_issues']}")
        print(f"  • Critical: {issue_summary['by_severity']['critical']}")
        print(f"  • High: {issue_summary['by_severity']['high']}")
        print(f"  • Medium: {issue_summary['by_severity']['medium']}")
        print(f"  • Low: {issue_summary['by_severity']['low']}")
        print(f"  • Files with Issues: {issue_summary['files_with_issues']}")
        
        if report["recommendations"]:
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(report["recommendations"], 1):
                print(f"  {i}. {rec}")
        
        print("\n" + "="*60)
