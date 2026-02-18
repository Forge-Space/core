# ML Model Integration Patterns

Patterns for integrating machine learning models into production applications, covering model serving, inference optimization, monitoring, and lifecycle management.

## 📁 Directory Structure

```text
ml-integration/
├── model-serving/          # Model serving and deployment patterns
├── inference-optimization/ # Latency and throughput optimization
├── monitoring/             # Model performance and drift monitoring
├── feature-store/          # Feature engineering and storage patterns
└── README.md
```

## 🎯 Patterns

### Model Serving

**REST API Serving** — Expose models via HTTP endpoints with versioning:

```python
# FastAPI model serving pattern
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ML Model API", version="1.0.0")

class PredictionRequest(BaseModel):
    features: list[float]
    model_version: str = "latest"

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str
    latency_ms: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    model = model_registry.get(request.model_version)
    if not model:
        raise HTTPException(status_code=404, detail="Model version not found")

    import time
    start = time.time()
    prediction = model.predict([request.features])[0]
    confidence = float(model.predict_proba([request.features]).max())
    latency_ms = (time.time() - start) * 1000

    return PredictionResponse(
        prediction=float(prediction),
        confidence=confidence,
        model_version=request.model_version,
        latency_ms=latency_ms
    )
```

**Batch Inference** — Process large datasets efficiently:

```python
# Batch inference pattern with chunking
import pandas as pd
from typing import Iterator

def batch_predict(
    model,
    data_path: str,
    output_path: str,
    chunk_size: int = 1000
) -> dict:
    results = []
    total_processed = 0

    for chunk in pd.read_csv(data_path, chunksize=chunk_size):
        features = preprocess(chunk)
        predictions = model.predict(features)
        results.append(pd.DataFrame({
            "id": chunk["id"],
            "prediction": predictions
        }))
        total_processed += len(chunk)

    pd.concat(results).to_csv(output_path, index=False)
    return {"processed": total_processed, "output": output_path}
```

### Inference Optimization

**Model Caching** — Cache models in memory to avoid repeated loading:

```python
from functools import lru_cache
import joblib

class ModelRegistry:
    _cache: dict = {}

    @classmethod
    def get(cls, version: str = "latest"):
        if version not in cls._cache:
            cls._cache[version] = joblib.load(f"models/{version}/model.pkl")
        return cls._cache[version]

    @classmethod
    def preload(cls, versions: list[str]):
        for v in versions:
            cls.get(v)
```

**ONNX Export for Cross-Platform Inference**:

```python
# Export PyTorch model to ONNX for faster inference
import torch
import onnx
import onnxruntime as ort

def export_to_onnx(model, sample_input, output_path: str):
    model.eval()
    torch.onnx.export(
        model,
        sample_input,
        output_path,
        export_params=True,
        opset_version=17,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
    )
    onnx.checker.check_model(output_path)
    return output_path

def onnx_inference(model_path: str, inputs: list):
    session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name
    return session.run(None, {input_name: inputs})[0]
```

### Model Monitoring

**Prediction Drift Detection**:

```python
import numpy as np
from scipy import stats

class DriftDetector:
    def __init__(self, reference_data: np.ndarray, threshold: float = 0.05):
        self.reference = reference_data
        self.threshold = threshold

    def detect(self, current_data: np.ndarray) -> dict:
        statistic, p_value = stats.ks_2samp(self.reference, current_data)
        drift_detected = p_value < self.threshold
        return {
            "drift_detected": drift_detected,
            "p_value": float(p_value),
            "statistic": float(statistic),
            "severity": "high" if p_value < 0.01 else "medium" if drift_detected else "none"
        }
```

**Performance Metrics Logging**:

```python
import time
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class InferenceMetrics:
    model_version: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    latency_ms: float = 0.0
    prediction: float = 0.0
    confidence: float = 0.0
    input_features: int = 0

def track_inference(model_version: str):
    def decorator(func):
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            metrics = InferenceMetrics(
                model_version=model_version,
                latency_ms=(time.time() - start) * 1000,
                prediction=result.get("prediction", 0),
                confidence=result.get("confidence", 0)
            )
            metrics_store.append(metrics)
            return result
        return wrapper
    return decorator
```

### Feature Store Pattern

```python
# Simple feature store with versioning
import json
from pathlib import Path
from datetime import datetime

class FeatureStore:
    def __init__(self, store_path: str = "./feature-store"):
        self.path = Path(store_path)
        self.path.mkdir(parents=True, exist_ok=True)

    def save_features(self, entity_id: str, features: dict, version: str = None):
        version = version or datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        feature_path = self.path / entity_id / f"{version}.json"
        feature_path.parent.mkdir(parents=True, exist_ok=True)
        feature_path.write_text(json.dumps({
            "entity_id": entity_id,
            "version": version,
            "timestamp": datetime.utcnow().isoformat(),
            "features": features
        }))
        return version

    def get_features(self, entity_id: str, version: str = "latest") -> dict:
        entity_path = self.path / entity_id
        if version == "latest":
            versions = sorted(entity_path.glob("*.json"))
            if not versions:
                raise KeyError(f"No features found for entity: {entity_id}")
            feature_path = versions[-1]
        else:
            feature_path = entity_path / f"{version}.json"
        return json.loads(feature_path.read_text())["features"]
```

## 🔒 Security Considerations

- Never log raw input data containing PII
- Validate and sanitize all model inputs
- Use `{{MODEL_API_KEY}}` placeholder for any model API credentials
- Apply rate limiting on inference endpoints
- Audit all model predictions for compliance-sensitive use cases

## 📊 Performance Targets

| Metric | Target |
| --- | --- |
| REST inference latency (p95) | < 100ms |
| Batch throughput | > 10,000 records/min |
| Model load time | < 5 seconds |
| Cache hit rate | > 90% |

## 🔗 Related Patterns

- [`patterns/ai/project-templates/`](../project-templates/) — Project scaffolding
- [`patterns/ai/workflows/`](../workflows/) — CI/CD for ML models
- [`patterns/shared-infrastructure/logger/`](../../shared-infrastructure/logger/) — Structured logging for inference
