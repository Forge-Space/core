# AI API Service Template

A comprehensive template for building AI-powered API services with best practices for scalability, security, and maintainability.

## 🎯 Overview

This template provides a complete structure for AI API services including:

- FastAPI-based REST API with AI model integration
- Async/await patterns for high-performance inference
- Comprehensive error handling and validation
- Rate limiting and authentication
- Monitoring and logging
- Docker deployment and scaling
- API documentation and testing

## 📁 Project Structure

```
ai-api/
├── app/                    # FastAPI application
│   ├── api/               # API routes and endpoints
│   │   ├── v1/           # API version 1
│   │   │   ├── endpoints/ # Specific endpoints
│   │   │   └── router.py  # API router
│   │   └── dependencies.py # API dependencies
│   ├── core/              # Core application logic
│   │   ├── config.py     # Configuration management
│   │   ├── security.py    # Security utilities
│   │   └── exceptions.py  # Custom exceptions
│   ├── models/            # Pydantic models
│   │   ├── requests.py   # Request models
│   │   ├── responses.py  # Response models
│   │   └── schemas.py    # Database schemas
│   ├── services/          # Business logic services
│   │   ├── ai_service.py  # AI model service
│   │   ├── cache_service.py # Caching service
│   │   └── monitoring_service.py # Monitoring
│   └── main.py           # FastAPI application entry
├── ai/                    # AI model management
│   ├── models/           # Model definitions
│   ├── loaders/          # Model loading utilities
│   ├── preprocessors/    # Input preprocessing
│   └── postprocessors/   # Output postprocessing
├── tests/                 # Test suite
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── scripts/               # Utility scripts
├── configs/              # Configuration files
├── docker/               # Docker configurations
├── docs/                 # API documentation
└── requirements/         # Dependencies
```

## 🚀 Quick Start

### Bootstrap AI API Project

```bash
# Create new AI API project
./scripts/bootstrap/project.sh --template=ai-api --name=my-ai-api

# Navigate to project
cd my-ai-api

# Install dependencies
pip install -r requirements/prod.txt

# Run initial setup
./scripts/setup.sh

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Development Workflow

```bash
# Load AI model
python scripts/load_model.py --model-path=models/my_model.pt

# Run tests
pytest tests/ -v

# Start with specific configuration
uvicorn app.main:app --reload --config-file configs/development.yaml

# Generate API documentation
python scripts/generate_docs.py
```

## 📋 Configuration

### Application Configuration (`configs/app_config.yaml`)

```yaml
app:
  name: "AI API Service"
  version: "1.0.0"
  description: "AI-powered API service"
  debug: false
  host: "0.0.0.0"
  port: 8000

api:
  v1:
    prefix: "/api/v1"
    title: "AI API v1"
    description: "First version of AI API"

security:
  jwt:
    secret_key: "${JWT_SECRET_KEY}"
    algorithm: "HS256"
    access_token_expire_minutes: 30
  rate_limiting:
    requests_per_minute: 60
    burst_size: 10

ai:
  model:
    path: "models/default_model.pt"
    device: "cpu"  # cpu, cuda, mps
    batch_size: 1
    max_sequence_length: 512
  
  inference:
    timeout: 30.0
    max_concurrent_requests: 10
    cache_results: true
    cache_ttl: 3600

monitoring:
  prometheus:
    enabled: true
    port: 9090
  logging:
    level: "INFO"
    format: "json"
    file: "logs/app.log"
  
  tracing:
    jaeger:
      enabled: false
      endpoint: "http://localhost:14268/api/traces"

database:
  url: "${DATABASE_URL}"
  pool_size: 10
  max_overflow: 20
  echo: false

cache:
  redis:
    url: "${REDIS_URL}"
    ttl: 3600
    max_connections: 10
```

### Model Configuration (`configs/model_config.yaml`)

```yaml
model:
  type: "transformer"  # transformer, cnn, rnn, custom
  architecture: "bert-base-uncased"
  task: "classification"  # classification, generation, embedding
  
  preprocessing:
    tokenizer: "bert-base-uncased"
    max_length: 512
    truncation: true
    padding: "max_length"
    return_tensors: "pt"
  
  postprocessing:
    apply_softmax: true
    return_probabilities: true
    threshold: 0.5
  
  optimization:
    torch_script: false
    quantization: false
    onnx: false
    batch_inference: false
```

## 🔧 Implementation

### FastAPI Application

```python
# app/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import uuid
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.api.v1.router import api_router
from app.services.monitoring_service import MonitoringService
from ai.models.model_manager import ModelManager

# Global variables
model_manager: ModelManager = None
monitoring_service: MonitoringService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global model_manager, monitoring_service
    
    # Startup
    print("🚀 Starting AI API Service...")
    
    # Initialize model manager
    model_manager = ModelManager(settings.ai.model)
    await model_manager.load_model()
    
    # Initialize monitoring
    monitoring_service = MonitoringService(settings.monitoring)
    await monitoring_service.start()
    
    print("✅ AI API Service started successfully")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down AI API Service...")
    await model_manager.unload_model()
    await monitoring_service.stop()
    print("✅ AI API Service shut down")

# Create FastAPI app
app = FastAPI(
    title=settings.app.name,
    version=settings.app.version,
    description=settings.app.description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.security.allowed_hosts
)

# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Setup exception handlers
setup_exception_handlers(app)

# Include API router
app.include_router(api_router, prefix=settings.api.v1.prefix)

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.app.version,
        "model_loaded": model_manager.is_loaded() if model_manager else False
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.app.name}",
        "version": settings.app.version,
        "docs": "/docs",
        "health": "/health"
    }
```

### AI Service

```python
# app/services/ai_service.py
from typing import List, Dict, Any, Optional
import asyncio
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np

from app.core.config import settings
from ai.models.model_manager import ModelManager
from ai.preprocessors.text_preprocessor import TextPreprocessor
from ai.postprocessors.output_processor import OutputProcessor

class AIService:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.preprocessor = TextPreprocessor(settings.ai.model)
        self.output_processor = OutputProcessor(settings.ai.model)
        self._semaphore = asyncio.Semaphore(settings.ai.inference.max_concurrent_requests)
    
    async def predict(self, text: str, **kwargs) -> Dict[str, Any]:
        """Make prediction using AI model"""
        async with self._semaphore:
            try:
                # Preprocess input
                processed_input = await self.preprocessor.process(text)
                
                # Run inference
                with torch.no_grad():
                    outputs = await self.model_manager.predict(processed_input, **kwargs)
                
                # Postprocess output
                result = await self.output_processor.process(outputs)
                
                return result
            
            except Exception as e:
                raise AIServiceError(f"Prediction failed: {str(e)}")
    
    async def batch_predict(self, texts: List[str], **kwargs) -> List[Dict[str, Any]]:
        """Make batch predictions"""
        async with self._semaphore:
            try:
                # Preprocess inputs
                processed_inputs = await asyncio.gather(*[
                    self.preprocessor.process(text) for text in texts
                ])
                
                # Batch inference
                with torch.no_grad():
                    outputs = await self.model_manager.batch_predict(processed_inputs, **kwargs)
                
                # Postprocess outputs
                results = await asyncio.gather(*[
                    self.output_processor.process(output) for output in outputs
                ])
                
                return results
            
            except Exception as e:
                raise AIServiceError(f"Batch prediction failed: {str(e)}")
    
    async def embed(self, text: str) -> List[float]:
        """Generate text embeddings"""
        async with self._semaphore:
            try:
                # Preprocess input
                processed_input = await self.preprocessor.process(text)
                
                # Generate embeddings
                with torch.no_grad():
                    embeddings = await self.model_manager.embed(processed_input)
                
                return embeddings.tolist()
            
            except Exception as e:
                raise AIServiceError(f"Embedding generation failed: {str(e)}")
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_type": self.model_manager.model_type,
            "model_name": self.model_manager.model_name,
            "device": str(self.model_manager.device),
            "is_loaded": self.model_manager.is_loaded(),
            "max_sequence_length": settings.ai.model.max_sequence_length
        }

class AIServiceError(Exception):
    """AI service specific error"""
    pass
```

### API Endpoints

```python
# app/api/v1/endpoints/predict.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any
import asyncio

from app.models.requests import PredictRequest, BatchPredictRequest
from app.models.responses import PredictResponse, BatchPredictResponse
from app.services.ai_service import AIService, AIServiceError
from app.services.cache_service import CacheService
from app.api.dependencies import get_ai_service, get_cache_service, get_current_user

router = APIRouter(prefix="/predict", tags=["Prediction"])
security = HTTPBearer()

@router.post("/text", response_model=PredictResponse)
async def predict_text(
    request: PredictRequest,
    background_tasks: BackgroundTasks,
    ai_service: AIService = Depends(get_ai_service),
    cache_service: CacheService = Depends(get_cache_service),
    credentials: HTTPAuthorizationCredentials = Depends(get_current_user)
):
    """Predict text classification"""
    try:
        # Check cache first
        cache_key = f"predict:text:{hash(request.text)}"
        cached_result = await cache_service.get(cache_key)
        
        if cached_result:
            return PredictResponse(**cached_result)
        
        # Make prediction
        result = await ai_service.predict(
            text=request.text,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Cache result
        background_tasks.add_task(
            cache_service.set,
            cache_key,
            result,
            ttl=3600
        )
        
        return PredictResponse(**result)
    
    except AIServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@router.post("/batch", response_model=BatchPredictResponse)
async def batch_predict(
    request: BatchPredictRequest,
    background_tasks: BackgroundTasks,
    ai_service: AIService = Depends(get_ai_service),
    cache_service: CacheService = Depends(get_cache_service),
    credentials: HTTPAuthorizationCredentials = Depends(get_current_user)
):
    """Batch predict multiple texts"""
    try:
        # Check cache for each text
        results = []
        uncached_texts = []
        uncached_indices = []
        
        for i, text in enumerate(request.texts):
            cache_key = f"predict:text:{hash(text)}"
            cached_result = await cache_service.get(cache_key)
            
            if cached_result:
                results.append(cached_result)
            else:
                uncached_texts.append(text)
                uncached_indices.append(i)
                results.append(None)
        
        # Batch predict uncached texts
        if uncached_texts:
            batch_results = await ai_service.batch_predict(
                texts=uncached_texts,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            # Update results and cache
            for i, (text, result) in enumerate(zip(uncached_texts, batch_results)):
                original_index = uncached_indices[i]
                results[original_index] = result
                
                # Cache individual result
                cache_key = f"predict:text:{hash(text)}"
                background_tasks.add_task(
                    cache_service.set,
                    cache_key,
                    result,
                    ttl=3600
                )
        
        return BatchPredictResponse(results=results)
    
    except AIServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch prediction failed: {str(e)}")

@router.post("/embed")
async def embed_text(
    request: PredictRequest,
    background_tasks: BackgroundTasks,
    ai_service: AIService = Depends(get_ai_service),
    cache_service: CacheService = Depends(get_cache_service),
    credentials: HTTPAuthorizationCredentials = Depends(get_current_user)
):
    """Generate text embeddings"""
    try:
        # Check cache first
        cache_key = f"embed:text:{hash(request.text)}"
        cached_result = await cache_service.get(cache_key)
        
        if cached_result:
            return {"embeddings": cached_result}
        
        # Generate embeddings
        embeddings = await ai_service.embed(text=request.text)
        
        # Cache result
        background_tasks.add_task(
            cache_service.set,
            cache_key,
            embeddings,
            ttl=3600
        )
        
        return {"embeddings": embeddings}
    
    except AIServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Embedding generation failed: {str(e)}")

@router.get("/model/info")
async def get_model_info(
    ai_service: AIService = Depends(get_ai_service),
    credentials: HTTPAuthorizationCredentials = Depends(get_current_user)
):
    """Get model information"""
    try:
        return await ai_service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")
```

### Model Manager

```python
# ai/models/model_manager.py
import torch
from transformers import AutoTokenizer, AutoModel, AutoModelForSequenceClassification
from typing import Dict, Any, List, Optional
import asyncio
from pathlib import Path

class ModelManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.tokenizer = None
        self.device = torch.device(config.get("device", "cpu"))
        self.model_path = Path(config.get("path", "models/default"))
        self.is_model_loaded = False
    
    async def load_model(self) -> None:
        """Load AI model and tokenizer"""
        try:
            print(f"🔄 Loading model from {self.model_path}...")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_path,
                use_fast=True
            )
            
            # Load model
            if self.config.get("task") == "classification":
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_path
                )
            else:
                self.model = AutoModel.from_pretrained(self.model_path)
            
            # Move to device
            self.model.to(self.device)
            
            # Set to eval mode
            self.model.eval()
            
            self.is_model_loaded = True
            print(f"✅ Model loaded successfully on {self.device}")
        
        except Exception as e:
            raise ModelLoadError(f"Failed to load model: {str(e)}")
    
    async def unload_model(self) -> None:
        """Unload model and free memory"""
        if self.model is not None:
            del self.model
            self.model = None
        
        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        self.is_model_loaded = False
        print("🗑️ Model unloaded and memory freed")
    
    async def predict(self, inputs: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Make single prediction"""
        if not self.is_model_loaded:
            raise ModelNotLoadedError("Model is not loaded")
        
        try:
            # Prepare inputs
            input_ids = inputs["input_ids"].to(self.device)
            attention_mask = inputs["attention_mask"].to(self.device)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    **kwargs
                )
            
            return outputs
        
        except Exception as e:
            raise InferenceError(f"Prediction failed: {str(e)}")
    
    async def batch_predict(self, inputs_list: List[Dict[str, Any]], **kwargs) -> List[Dict[str, Any]]:
        """Make batch predictions"""
        if not self.is_model_loaded:
            raise ModelNotLoadedError("Model is not loaded")
        
        try:
            # Prepare batch inputs
            batch_input_ids = torch.cat([inp["input_ids"] for inp in inputs_list]).to(self.device)
            batch_attention_mask = torch.cat([inp["attention_mask"] for inp in inputs_list]).to(self.device)
            
            # Run batch inference
            with torch.no_grad():
                outputs = self.model(
                    input_ids=batch_input_ids,
                    attention_mask=batch_attention_mask,
                    **kwargs
                )
            
            # Split outputs back to individual predictions
            batch_size = len(inputs_list)
            split_outputs = []
            
            for i in range(batch_size):
                output_dict = {}
                for key, value in outputs.items():
                    if isinstance(value, torch.Tensor):
                        output_dict[key] = value[i:i+1]
                    else:
                        output_dict[key] = value
                split_outputs.append(output_dict)
            
            return split_outputs
        
        except Exception as e:
            raise InferenceError(f"Batch prediction failed: {str(e)}")
    
    async def embed(self, inputs: Dict[str, Any]) -> torch.Tensor:
        """Generate embeddings"""
        if not self.is_model_loaded:
            raise ModelNotLoadedError("Model is not loaded")
        
        try:
            # Prepare inputs
            input_ids = inputs["input_ids"].to(self.device)
            attention_mask = inputs["attention_mask"].to(self.device)
            
            # Generate embeddings
            with torch.no_grad():
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    output_hidden_states=True,
                    return_dict=True
                )
                
                # Use last hidden state as embeddings
                embeddings = outputs.last_hidden_state
                
                # Pool embeddings (mean pooling)
                attention_mask_expanded = attention_mask.unsqueeze(-1).expand(embeddings.size()).float()
                sum_embeddings = torch.sum(embeddings * attention_mask_expanded, 1)
                sum_mask = torch.clamp(attention_mask_expanded.sum(1), min=1e-9)
                mean_pooled_embeddings = sum_embeddings / sum_mask
            
            return mean_pooled_embeddings
        
        except Exception as e:
            raise InferenceError(f"Embedding generation failed: {str(e)}")
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.is_model_loaded
    
    @property
    def model_type(self) -> str:
        """Get model type"""
        return self.config.get("type", "unknown")
    
    @property
    def model_name(self) -> str:
        """Get model name"""
        return self.config.get("architecture", "unknown")

class ModelLoadError(Exception):
    """Model loading error"""
    pass

class ModelNotLoadedError(Exception):
    """Model not loaded error"""
    pass

class InferenceError(Exception):
    """Inference error"""
    pass
```

## 🚀 Deployment

### Docker Configuration

```dockerfile
# docker/Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt

# Copy application
COPY app/ app/
COPY ai/ ai/
COPY configs/ configs/
COPY scripts/ scripts/

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  ai-api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/ai_api
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ../models:/app/models:ro
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=ai_api
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ../ssl:/etc/nginx/ssl:ro
    depends_on:
      - ai-api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 📊 Monitoring

### Prometheus Metrics

```python
# app/services/monitoring_service.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time
from typing import Dict, Any

class MonitoringService:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Define metrics
        self.request_count = Counter(
            'ai_api_requests_total',
            'Total number of API requests',
            ['method', 'endpoint', 'status_code']
        )
        
        self.request_duration = Histogram(
            'ai_api_request_duration_seconds',
            'Request duration in seconds',
            ['method', 'endpoint']
        )
        
        self.model_inference_count = Counter(
            'ai_model_inference_total',
            'Total number of model inferences',
            ['model_type', 'batch_size']
        )
        
        self.model_inference_duration = Histogram(
            'ai_model_inference_duration_seconds',
            'Model inference duration in seconds',
            ['model_type', 'batch_size']
        )
        
        self.active_connections = Gauge(
            'ai_api_active_connections',
            'Number of active connections'
        )
    
    async def start(self):
        """Start monitoring service"""
        if self.config.get("prometheus", {}).get("enabled", False):
            print("📊 Prometheus monitoring enabled")
    
    async def stop(self):
        """Stop monitoring service"""
        print("📊 Monitoring service stopped")
    
    def record_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Record API request metrics"""
        self.request_count.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        
        self.request_duration.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
    
    def record_inference(self, model_type: str, batch_size: int, duration: float):
        """Record model inference metrics"""
        self.model_inference_count.labels(
            model_type=model_type,
            batch_size=batch_size
        ).inc()
        
        self.model_inference_duration.labels(
            model_type=model_type,
            batch_size=batch_size
        ).observe(duration)
    
    def update_active_connections(self, count: int):
        """Update active connections gauge"""
        self.active_connections.set(count)
    
    def get_metrics(self) -> str:
        """Get Prometheus metrics"""
        return generate_latest().decode('utf-8')
```

## 🧪 Testing

### API Testing

```python
# tests/integration/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestPredictionAPI:
    def test_predict_text_success(self):
        """Test successful text prediction"""
        response = client.post(
            "/api/v1/predict/text",
            json={
                "text": "This is a test text for prediction",
                "temperature": 0.1,
                "max_tokens": 100
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "confidence" in data
    
    def test_predict_text_invalid_input(self):
        """Test prediction with invalid input"""
        response = client.post(
            "/api/v1/predict/text",
            json={
                "text": "",  # Empty text
                "temperature": 0.1,
                "max_tokens": 100
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 400
    
    def test_batch_predict_success(self):
        """Test successful batch prediction"""
        response = client.post(
            "/api/v1/predict/batch",
            json={
                "texts": [
                    "First test text",
                    "Second test text",
                    "Third test text"
                ],
                "temperature": 0.1,
                "max_tokens": 100
            },
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 3
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "model_loaded" in data
```

## 🔒 Security Considerations

- ✅ **Authentication**: JWT-based authentication with proper token validation
- ✅ **Authorization**: Role-based access control for different endpoints
- ✅ **Rate Limiting**: Prevent abuse with configurable rate limits
- ✅ **Input Validation**: Comprehensive input sanitization and validation
- ✅ **HTTPS**: Enforce HTTPS in production
- ✅ **CORS**: Proper CORS configuration for cross-origin requests
- ✅ **Security Headers**: Add security headers for enhanced protection

## 📚 Best Practices

1. **Async/Await**: Use async patterns for high-performance I/O operations
2. **Error Handling**: Comprehensive error handling with proper HTTP status codes
3. **Logging**: Structured logging with correlation IDs
4. **Monitoring**: Prometheus metrics for observability
5. **Testing**: Comprehensive unit, integration, and E2E tests
6. **Documentation**: Auto-generated API documentation with OpenAPI
7. **Configuration**: Environment-based configuration management
8. **Deployment**: Containerized deployment with Docker and orchestration

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Python 3.8+, FastAPI 0.104+, PyTorch 2.0+  
**License**: MIT