# LLM Code Generation Pattern

A comprehensive pattern for integrating Large Language Model (LLM) code generation into development workflows while maintaining security, quality, and reproducibility.

## 🎯 Overview

This pattern provides a structured approach to using LLMs for code generation, including:

- Prompt engineering templates and best practices
- Code validation and quality assurance
- Security filtering and compliance checking
- Integration with existing development workflows
- Performance monitoring and optimization

## 📁 Pattern Structure

```
llm-codegen/
├── prompts/                # LLM prompt templates
│   ├── code-generation/    # Code generation prompts
│   ├── refactoring/        # Code refactoring prompts
│   ├── testing/            # Test generation prompts
│   └── documentation/      # Documentation prompts
├── templates/              # Code templates for generation
├── validation/             # Code validation and filtering
├── integration/            # Workflow integration scripts
├── monitoring/             # Performance and usage tracking
└── README.md              # This file
```

## 🚀 Quick Start

### Setup LLM Code Generation

```bash
# Initialize LLM code generation in project
./scripts/ai/setup-llm-codegen.sh

# Configure LLM provider
./scripts/ai/configure-provider.sh --provider=openai --model=gpt-4

# Test code generation
./scripts/ai/generate-code.sh --prompt="create a user authentication service" --language=python
```

### Basic Code Generation

```python
# Generate code using LLM
from patterns.ai.code_generation.llm_codegen import CodeGenerator

generator = CodeGenerator(
    provider="openai",
    model="gpt-4",
    config_path="patterns/ai/config/llm-config.yaml"
)

# Generate code
code = generator.generate_code(
    prompt="Create a REST API service for user management",
    language="python",
    framework="fastapi"
)

# Validate and save generated code
validated_code = generator.validate_code(code)
generator.save_code(validated_code, "src/api/user_service.py")
```

## 📋 Configuration

### LLM Configuration (`patterns/ai/config/llm-config.yaml`)

```yaml
provider:
  name: "openai"  # openai, anthropic, google, local
  model: "gpt-4"
  api_key_env: "OPENAI_API_KEY"
  base_url: null  # Override for custom endpoints

generation:
  max_tokens: 2000
  temperature: 0.1
  top_p: 0.9
  frequency_penalty: 0.0
  presence_penalty: 0.0

validation:
  enable_security_scan: true
  enable_quality_check: true
  enable_style_check: true
  min_confidence: 0.8

security:
  block_secrets: true
  block_insecure_code: true
  validate_imports: true
  scan_vulnerabilities: true

monitoring:
  log_requests: true
  track_usage: true
  measure_performance: true
```

### Prompt Templates (`prompts/code-generation/api-service.txt`)

```
You are an expert software developer. Generate a {language} {framework} API service for {purpose}.

Requirements:
- Follow best practices for {framework}
- Include proper error handling
- Add input validation
- Include comprehensive documentation
- Follow security best practices
- Use proper logging
- Include unit tests structure

Context:
{context}

Generate only the code without explanations. Ensure the code is production-ready and follows all security guidelines.
```

## 🔧 Implementation

### Code Generator Class

```python
# patterns/ai/code-generation/llm_codegen/generator.py
import os
import yaml
from typing import Dict, Any, Optional
from .validation import CodeValidator
from .security import SecurityScanner
from .monitoring import UsageMonitor

class CodeGenerator:
    def __init__(self, provider: str, model: str, config_path: str):
        self.config = self._load_config(config_path)
        self.provider = provider
        self.model = model
        self.validator = CodeValidator(self.config['validation'])
        self.scanner = SecurityScanner(self.config['security'])
        self.monitor = UsageMonitor(self.config['monitoring'])
    
    def generate_code(self, prompt: str, language: str, 
                     framework: Optional[str] = None,
                     context: Optional[Dict[str, Any]] = None) -> str:
        """Generate code using LLM with validation and security checks"""
        
        # Log generation request
        self.monitor.log_request(prompt, language, framework)
        
        # Build enhanced prompt
        enhanced_prompt = self._build_prompt(prompt, language, framework, context)
        
        # Generate code
        raw_code = self._call_llm(enhanced_prompt)
        
        # Validate generated code
        validated_code = self.validator.validate(raw_code, language)
        
        # Security scan
        secure_code = self.scanner.scan_and_filter(validated_code)
        
        # Log successful generation
        self.monitor.log_generation(secure_code, language)
        
        return secure_code
    
    def _build_prompt(self, prompt: str, language: str, 
                     framework: Optional[str], 
                     context: Optional[Dict[str, Any]]) -> str:
        """Build enhanced prompt with templates and context"""
        
        template_path = f"prompts/code-generation/{framework or 'generic'}.txt"
        
        if os.path.exists(template_path):
            with open(template_path, 'r') as f:
                template = f.read()
            
            return template.format(
                language=language,
                framework=framework,
                purpose=prompt,
                context=self._format_context(context)
            )
        
        return f"Generate {language} code for: {prompt}"
    
    def _call_llm(self, prompt: str) -> str:
        """Call LLM API (implementation varies by provider)"""
        # Implementation would depend on the specific LLM provider
        # This is a placeholder for the actual API call
        pass
    
    def validate_code(self, code: str, language: str) -> str:
        """Validate generated code"""
        return self.validator.validate(code, language)
    
    def save_code(self, code: str, filepath: str):
        """Save generated code to file"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(code)
```

### Code Validation

```python
# patterns/ai/code-generation/llm_codegen/validation.py
import ast
import subprocess
from typing import List, Dict, Any

class CodeValidator:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.quality_checker = QualityChecker()
        self.style_checker = StyleChecker()
    
    def validate(self, code: str, language: str) -> str:
        """Comprehensive code validation"""
        
        # Syntax validation
        if not self._check_syntax(code, language):
            raise ValueError("Generated code has syntax errors")
        
        # Quality validation
        if self.config.get('enable_quality_check', True):
            code = self.quality_checker.check_and_fix(code, language)
        
        # Style validation
        if self.config.get('enable_style_check', True):
            code = self.style_checker.format_code(code, language)
        
        return code
    
    def _check_syntax(self, code: str, language: str) -> bool:
        """Check code syntax"""
        try:
            if language == 'python':
                ast.parse(code)
            # Add other language syntax checks
            return True
        except SyntaxError:
            return False

class QualityChecker:
    def check_and_fix(self, code: str, language: str) -> str:
        """Check code quality and apply fixes"""
        # Implementation for quality checks
        # - Error handling patterns
        # - Input validation
        # - Resource management
        # - Performance optimizations
        return code

class StyleChecker:
    def format_code(self, code: str, language: str) -> str:
        """Format code according to style guidelines"""
        # Implementation for code formatting
        # - Prettier for JavaScript/TypeScript
        # - Black for Python
        # - ESLint fixes
        return code
```

### Security Scanner

```python
# patterns/ai/code-generation/llm_codegen/security.py
import re
from typing import List, Tuple

class SecurityScanner:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.secret_patterns = self._load_secret_patterns()
        self.insecure_patterns = self._load_insecure_patterns()
    
    def scan_and_filter(self, code: str) -> str:
        """Scan code for security issues and filter unsafe content"""
        
        if self.config.get('block_secrets', True):
            code = self._remove_secrets(code)
        
        if self.config.get('block_insecure_code', True):
            code = self._remove_insecure_patterns(code)
        
        if self.config.get('validate_imports', True):
            code = self._validate_imports(code)
        
        return code
    
    def _remove_secrets(self, code: str) -> str:
        """Remove or replace potential secrets"""
        for pattern, replacement in self.secret_patterns:
            code = re.sub(pattern, replacement, code, flags=re.IGNORECASE)
        return code
    
    def _remove_insecure_patterns(self, code: str) -> str:
        """Remove insecure code patterns"""
        for pattern, replacement in self.insecure_patterns:
            code = re.sub(pattern, replacement, code, flags=re.IGNORECASE)
        return code
    
    def _validate_imports(self, code: str) -> str:
        """Validate and filter imports"""
        # Implementation for import validation
        return code
    
    def _load_secret_patterns(self) -> List[Tuple[str, str]]:
        """Load patterns for detecting secrets"""
        return [
            (r'(api[_-]?key\s*=\s*["\'][^"\']+["\'])', 'api_key = "REPLACE_WITH_API_KEY"'),
            (r'(password\s*=\s*["\'][^"\']+["\'])', 'password = "REPLACE_WITH_PASSWORD"'),
            (r'(secret[_-]?key\s*=\s*["\'][^"\']+["\'])', 'secret_key = "REPLACE_WITH_SECRET"'),
            (r'(token\s*=\s*["\'][^"\']+["\'])', 'token = "REPLACE_WITH_TOKEN"'),
        ]
    
    def _load_insecure_patterns(self) -> List[Tuple[str, str]]:
        """Load patterns for insecure code"""
        return [
            (r'eval\s*\(', '# eval() disabled for security'),
            (r'exec\s*\(', '# exec() disabled for security'),
            (r'shell\s*=\s*True', '# shell=True disabled for security'),
            (r'subprocess\.call\s*\([^,)]*,\s*shell=True', '# shell=True disabled for security'),
        ]
```

## 📊 Monitoring

### Usage Monitoring

```python
# patterns/ai/code-generation/llm_codegen/monitoring.py
import json
import time
from datetime import datetime
from typing import Dict, Any

class UsageMonitor:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.metrics = {
            'requests': 0,
            'generations': 0,
            'errors': 0,
            'total_tokens': 0,
            'average_response_time': 0
        }
    
    def log_request(self, prompt: str, language: str, framework: str):
        """Log generation request"""
        if self.config.get('log_requests', True):
            self.metrics['requests'] += 1
            self._log_event('request', {
                'prompt_length': len(prompt),
                'language': language,
                'framework': framework,
                'timestamp': datetime.now().isoformat()
            })
    
    def log_generation(self, code: str, language: str):
        """Log successful code generation"""
        if self.config.get('track_usage', True):
            self.metrics['generations'] += 1
            self.metrics['total_tokens'] += self._estimate_tokens(code)
            self._log_event('generation', {
                'code_length': len(code),
                'language': language,
                'timestamp': datetime.now().isoformat()
            })
    
    def log_error(self, error: str, context: Dict[str, Any]):
        """Log generation error"""
        self.metrics['errors'] += 1
        self._log_event('error', {
            'error': error,
            'context': context,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        return self.metrics.copy()
    
    def _log_event(self, event_type: str, data: Dict[str, Any]):
        """Log event to monitoring system"""
        # Implementation for logging to monitoring system
        pass
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text"""
        # Simple estimation: ~4 characters per token
        return len(text) // 4
```

## 🧪 Testing

### Unit Tests

```python
# tests/test_llm_code_generator.py
import pytest
from patterns.ai.code_generation.llm_codegen.generator import CodeGenerator

class TestCodeGenerator:
    def setup_method(self):
        self.generator = CodeGenerator(
            provider="openai",
            model="gpt-4",
            config_path="test_config.yaml"
        )
    
    def test_code_generation(self):
        """Test basic code generation"""
        code = self.generator.generate_code(
            prompt="Create a simple function",
            language="python"
        )
        
        assert "def " in code
        assert len(code) > 10
    
    def test_security_filtering(self):
        """Test security filtering"""
        malicious_prompt = "Create code with api_key='secret123'"
        code = self.generator.generate_code(
            prompt=malicious_prompt,
            language="python"
        )
        
        assert "secret123" not in code
        assert "REPLACE_WITH_API_KEY" in code
    
    def test_validation(self):
        """Test code validation"""
        invalid_code = "def broken_function(\n    pass"
        
        with pytest.raises(ValueError):
            self.generator.validate_code(invalid_code, "python")
```

## 🔒 Security Considerations

- ✅ **No Hardcoded Secrets**: All API keys and credentials loaded from environment
- ✅ **Input Validation**: Validate all prompts and generated code
- ✅ **Output Filtering**: Remove secrets and insecure patterns from generated code
- ✅ **Access Control**: Implement proper authentication and authorization
- ✅ **Audit Logging**: Track all code generation requests and results
- ✅ **Rate Limiting**: Prevent abuse and manage costs

## 📚 Best Practices

1. **Prompt Engineering**: Use structured prompts with clear requirements
2. **Validation**: Always validate generated code before use
3. **Security**: Filter out secrets and insecure patterns
4. **Testing**: Test generated code thoroughly
5. **Monitoring**: Track usage and performance metrics
6. **Documentation**: Document generated code thoroughly

## 🚀 Integration Examples

### CI/CD Integration

```yaml
# .github/workflows/ai-codegen.yml
name: AI Code Generation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  generate-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate Code
        run: |
          ./scripts/ai/generate-code.sh \
            --prompt="Add unit tests for changed files" \
            --language=python \
            --output=tests/generated/
      
      - name: Validate Generated Code
        run: |
          ./scripts/ai/validate-generated-code.sh \
            --directory=tests/generated/
      
      - name: Run Tests
        run: pytest tests/generated/
```

### IDE Integration

```python
# VS Code Extension
from patterns.ai.code_generation.llm_codegen import CodeGenerator

def generate_code_command(prompt, language):
    generator = CodeGenerator("openai", "gpt-4", "config.yaml")
    return generator.generate_code(prompt, language)
```

---

**Pattern Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Python 3.8+  
**License**: MIT