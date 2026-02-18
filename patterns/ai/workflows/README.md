# AI Development Workflows

Automation workflows for ML/AI development lifecycle — from data preparation through model training, validation, deployment, and monitoring.

## 📁 Directory Structure

```text
workflows/
├── training-pipeline/     # Model training automation
├── evaluation/            # Model evaluation and validation
├── deployment/            # Model deployment workflows
├── monitoring/            # Production monitoring automation
└── README.md
```

## 🎯 Workflows

### 1. Training Pipeline

**GitHub Actions — Model Training Workflow**:

```yaml
# .github/workflows/ml-training.yml
name: ML Model Training

on:
  push:
    paths:
      - 'data/**'
      - 'src/models/**'
      - 'configs/training.yml'
  workflow_dispatch:
    inputs:
      experiment_name:
        description: 'MLflow experiment name'
        required: true
        default: 'default'

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Validate training data
        run: python scripts/validate_data.py --config configs/training.yml

      - name: Train model
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_TRACKING_URI }}
          MLFLOW_EXPERIMENT: ${{ github.event.inputs.experiment_name || 'ci' }}
        run: python src/train.py --config configs/training.yml

      - name: Evaluate model
        run: python src/evaluate.py --threshold 0.85

      - name: Upload model artifact
        uses: actions/upload-artifact@v4
        with:
          name: trained-model
          path: models/
          retention-days: 30
```

### 2. Model Evaluation Gate

**Automated quality gate before deployment**:

```python
# scripts/evaluate_model.py
import argparse
import json
import sys
from pathlib import Path
import joblib
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
import numpy as np

QUALITY_THRESHOLDS = {
    "accuracy": 0.85,
    "f1_score": 0.80,
    "roc_auc": 0.88,
}

def evaluate(model_path: str, test_data_path: str) -> dict:
    model = joblib.load(model_path)
    data = np.load(test_data_path)
    X_test, y_test = data["X"], data["y"]

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred, average="weighted"),
        "roc_auc": roc_auc_score(y_test, y_proba),
    }

    passed = all(metrics[k] >= QUALITY_THRESHOLDS[k] for k in QUALITY_THRESHOLDS)
    return {"metrics": metrics, "passed": passed, "thresholds": QUALITY_THRESHOLDS}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--data", required=True)
    parser.add_argument("--output", default="evaluation_report.json")
    args = parser.parse_args()

    result = evaluate(args.model, args.data)
    Path(args.output).write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))

    if not result["passed"]:
        print("❌ Model failed quality gate", file=sys.stderr)
        sys.exit(1)

    print("✅ Model passed quality gate")
```

### 3. Model Deployment Workflow

**Blue/green deployment for ML models**:

```yaml
# .github/workflows/ml-deploy.yml
name: Deploy ML Model

on:
  workflow_run:
    workflows: ["ML Model Training"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Download model artifact
        uses: actions/download-artifact@v4
        with:
          name: trained-model
          path: models/

      - name: Run smoke tests
        run: python scripts/smoke_test.py --model models/latest/

      - name: Deploy to staging
        run: |
          docker build -t ml-model:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/ml-model:${{ github.sha }}

      - name: Run integration tests against staging
        run: python scripts/integration_test.py --env staging

      - name: Promote to production
        run: |
          kubectl set image deployment/ml-model \
            ml-model=${{ secrets.REGISTRY }}/ml-model:${{ github.sha }}
          kubectl rollout status deployment/ml-model
```

### 4. Model Monitoring Workflow

**Scheduled drift detection**:

```yaml
# .github/workflows/ml-monitoring.yml
name: ML Model Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Check prediction drift
        env:
          MODEL_API_URL: ${{ secrets.MODEL_API_URL }}
          METRICS_DB_URL: ${{ secrets.METRICS_DB_URL }}
        run: python scripts/check_drift.py --window 6h

      - name: Check data quality
        run: python scripts/check_data_quality.py

      - name: Generate monitoring report
        run: python scripts/generate_report.py --output monitoring_report.html

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: monitoring-report-${{ github.run_id }}
          path: monitoring_report.html

      - name: Alert on drift
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Model Drift Detected',
              body: 'Automated monitoring detected prediction drift. Review the monitoring report.',
              labels: ['ml-ops', 'urgent']
            })
```

### 5. Data Validation Workflow

**Pre-training data quality checks**:

```python
# scripts/validate_data.py
import pandas as pd
import numpy as np
import sys
from pathlib import Path

class DataValidator:
    def __init__(self, config: dict):
        self.config = config
        self.errors = []
        self.warnings = []

    def check_missing_values(self, df: pd.DataFrame) -> bool:
        missing_pct = df.isnull().mean()
        for col, pct in missing_pct.items():
            if pct > self.config.get("max_missing_pct", 0.05):
                self.errors.append(f"Column '{col}' has {pct:.1%} missing values")
            elif pct > 0:
                self.warnings.append(f"Column '{col}' has {pct:.1%} missing values")
        return len(self.errors) == 0

    def check_class_balance(self, df: pd.DataFrame, target_col: str) -> bool:
        counts = df[target_col].value_counts(normalize=True)
        min_class_pct = counts.min()
        if min_class_pct < self.config.get("min_class_pct", 0.10):
            self.errors.append(f"Severe class imbalance: minority class is {min_class_pct:.1%}")
        return len(self.errors) == 0

    def check_feature_ranges(self, df: pd.DataFrame, feature_specs: dict) -> bool:
        for col, spec in feature_specs.items():
            if col not in df.columns:
                self.errors.append(f"Required feature '{col}' missing from dataset")
                continue
            if "min" in spec and df[col].min() < spec["min"]:
                self.errors.append(f"Column '{col}' has values below minimum {spec['min']}")
            if "max" in spec and df[col].max() > spec["max"]:
                self.errors.append(f"Column '{col}' has values above maximum {spec['max']}")
        return len(self.errors) == 0

    def validate(self, data_path: str) -> dict:
        df = pd.read_csv(data_path)
        self.check_missing_values(df)
        if "target" in self.config:
            self.check_class_balance(df, self.config["target"])
        if "features" in self.config:
            self.check_feature_ranges(df, self.config["features"])

        return {
            "valid": len(self.errors) == 0,
            "errors": self.errors,
            "warnings": self.warnings,
            "rows": len(df),
            "columns": len(df.columns)
        }
```

## 🔒 Security

- All API keys and credentials use `{{PLACEHOLDER}}` syntax — never hardcode
- Model artifacts stored in private registries with access control
- Training data never logged or exposed in CI output
- Use GitHub Environments for production deployment gates

## 🔗 Related Patterns

- [`patterns/ai/ml-integration/`](../ml-integration/) — Model serving and inference
- [`patterns/ai/project-templates/`](../project-templates/) — Project scaffolding
- [`patterns/docker/`](../../docker/) — Container patterns for model serving
