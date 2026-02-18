# Deep Learning Project Template

A comprehensive deep learning project template with best practices for neural network development, training, and deployment.

## 🎯 Overview

This template provides a complete structure for deep learning projects including:

- Neural network architecture development
- Training pipeline with experiment tracking
- Model optimization and hyperparameter tuning
- Deployment and inference optimization
- GPU acceleration and distributed training
- Comprehensive monitoring and logging

## 📁 Project Structure

```
deep-learning/
├── data/                   # Data storage and processing
│   ├── raw/               # Raw datasets
│   ├── processed/         # Preprocessed data
│   ├── splits/            # Train/val/test splits
│   └── augmented/         # Data augmentation outputs
├── models/                 # Model definitions and architectures
│   ├── architectures/     # Neural network architectures
│   ├── layers/           # Custom layer implementations
│   ├── losses/           # Custom loss functions
│   └── optimizers/       # Custom optimizers
├── training/               # Training scripts and utilities
│   ├── trainers/         # Training loop implementations
│   ├── schedulers/       # Learning rate schedulers
│   ├── callbacks/        # Training callbacks
│   └── utils/            # Training utilities
├── evaluation/             # Model evaluation and testing
│   ├── metrics/          # Evaluation metrics
│   ├── visualizations/   # Result visualizations
│   └── benchmarks/       # Performance benchmarks
├── deployment/             # Model deployment and serving
│   ├── inference/        # Inference engines
│   ├── optimization/     # Model optimization
│   └── serving/          # Serving implementations
├── experiments/           # Experiment tracking and results
├── notebooks/             # Jupyter notebooks for research
├── configs/               # Configuration files
├── scripts/               # Utility scripts
├── tests/                 # Unit and integration tests
└── requirements/          # Dependencies by environment
```

## 🚀 Quick Start

### Bootstrap Deep Learning Project

```bash
# Create new deep learning project
./scripts/bootstrap/project.sh --template=deep-learning --name=my-dl-app

# Navigate to project
cd my-dl-app

# Install dependencies
pip install -r requirements/gpu.txt

# Run initial setup
./scripts/setup.sh --gpu
```

### Development Workflow

```bash
# Preprocess data
python scripts/data/preprocess.py --config=configs/data_config.yaml

# Train model
python training/train.py --config=configs/model_config.yaml --gpu

# Evaluate model
python evaluation/evaluate.py --model=experiments/best_model.pth --test-data=data/splits/test/

# Optimize model for deployment
python deployment/optimize.py --model=experiments/best_model.pth --output=deployment/models/optimized/

# Deploy model
python deployment/serve.py --model=deployment/models/optimized/ --port=8000
```

## 📋 Configuration

### Model Configuration (`configs/model_config.yaml`)

```yaml
model:
  type: "resnet50"
  num_classes: 1000
  pretrained: true
  freeze_backbone: false

architecture:
  input_size: [224, 224, 3]
  hidden_layers: [512, 256, 128]
  dropout: 0.5
  activation: "relu"
  batch_norm: true

training:
  batch_size: 32
  learning_rate: 0.001
  epochs: 100
  optimizer: "adam"
  scheduler: "cosine"
  early_stopping:
    patience: 10
    min_delta: 0.001

data:
  augmentation:
    horizontal_flip: 0.5
    vertical_flip: 0.2
    rotation_range: 15
    zoom_range: 0.1
    brightness_range: [0.8, 1.2]
  
  preprocessing:
    normalize:
      mean: [0.485, 0.456, 0.406]
      std: [0.229, 0.224, 0.225]
    resize: [224, 224]

hardware:
  gpu: true
  mixed_precision: true
  distributed: false
  num_workers: 4
  pin_memory: true

experiment:
  name: "resnet50_experiment"
  tracking: "tensorboard"
  save_every: 10
  validate_every: 5
```

### Training Configuration (`configs/training_config.yaml`)

```yaml
trainer:
  type: "pytorch"
  device: "cuda"
  num_gpus: 1
  mixed_precision: "amp"

optimization:
  optimizer:
    type: "adamw"
    weight_decay: 0.01
    betas: [0.9, 0.999]
  
  scheduler:
    type: "cosine_annealing"
    warmup_epochs: 5
    min_lr: 1e-6

regularization:
  dropout: 0.5
  weight_decay: 0.01
  label_smoothing: 0.1
  mixup_alpha: 0.2

logging:
  level: "INFO"
  tensorboard:
    log_dir: "logs/tensorboard"
    log_graph: true
    log_images: true
  
  wandb:
    project: "deep-learning-project"
    entity: "your-team"
    tags: ["resnet", "classification"]
```

## 🔧 Implementation

### Model Architecture

```python
# models/architectures/resnet_custom.py
import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

class CustomResNet50(nn.Module):
    def __init__(self, num_classes=1000, pretrained=True, freeze_backbone=False):
        super().__init__()
        
        # Load pretrained ResNet50
        self.backbone = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2 if pretrained else None)
        
        # Freeze backbone if specified
        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False
        
        # Custom classifier head
        self.backbone.fc = nn.Identity()
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(2048, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)
```

### Training Pipeline

```python
# training/trainers/pytorch_trainer.py
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.cuda.amp import autocast, GradScaler
import yaml
from tqdm import tqdm
import logging

class PyTorchTrainer:
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        
        self.device = torch.device("cuda" if self.config["hardware"]["gpu"] else "cpu")
        self.scaler = GradScaler() if self.config["hardware"]["mixed_precision"] else None
        
        self.setup_logging()
        self.setup_model()
        self.setup_data()
        self.setup_optimizer()
        self.setup_scheduler()
    
    def setup_logging(self):
        logging.basicConfig(
            level=getattr(logging, self.config["logging"]["level"]),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_model(self):
        from models.architectures.resnet_custom import CustomResNet50
        
        self.model = CustomResNet50(
            num_classes=self.config["model"]["num_classes"],
            pretrained=self.config["model"]["pretrained"],
            freeze_backbone=self.config["model"]["freeze_backbone"]
        ).to(self.device)
        
        self.criterion = nn.CrossEntropyLoss(
            label_smoothing=self.config["regularization"]["label_smoothing"]
        )
    
    def setup_data(self):
        from data.datasets import create_dataloaders
        
        self.train_loader, self.val_loader = create_dataloaders(
            config=self.config["data"],
            batch_size=self.config["training"]["batch_size"],
            num_workers=self.config["hardware"]["num_workers"]
        )
    
    def setup_optimizer(self):
        optimizer_config = self.config["optimization"]["optimizer"]
        
        if optimizer_config["type"] == "adamw":
            self.optimizer = torch.optim.AdamW(
                self.model.parameters(),
                lr=self.config["training"]["learning_rate"],
                weight_decay=optimizer_config["weight_decay"],
                betas=optimizer_config["betas"]
            )
    
    def setup_scheduler(self):
        scheduler_config = self.config["optimization"]["scheduler"]
        
        if scheduler_config["type"] == "cosine_annealing":
            self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                self.optimizer,
                T_max=self.config["training"]["epochs"],
                eta_min=scheduler_config["min_lr"]
            )
    
    def train_epoch(self, epoch: int):
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        
        pbar = tqdm(self.train_loader, desc=f"Epoch {epoch}")
        
        for batch_idx, (data, targets) in enumerate(pbar):
            data, targets = data.to(self.device), targets.to(self.device)
            
            self.optimizer.zero_grad()
            
            if self.scaler:
                with autocast():
                    outputs = self.model(data)
                    loss = self.criterion(outputs, targets)
                
                self.scaler.scale(loss).backward()
                self.scaler.step(self.optimizer)
                self.scaler.update()
            else:
                outputs = self.model(data)
                loss = self.criterion(outputs, targets)
                loss.backward()
                self.optimizer.step()
            
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()
            
            pbar.set_postfix({
                'Loss': f'{loss.item():.4f}',
                'Acc': f'{100.*correct/total:.2f}%'
            })
        
        avg_loss = total_loss / len(self.train_loader)
        accuracy = 100. * correct / total
        
        self.logger.info(f"Train Epoch: {epoch} Loss: {avg_loss:.4f} Acc: {accuracy:.2f}%")
        
        return avg_loss, accuracy
    
    def validate_epoch(self, epoch: int):
        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for data, targets in self.val_loader:
                data, targets = data.to(self.device), targets.to(self.device)
                
                if self.scaler:
                    with autocast():
                        outputs = self.model(data)
                        loss = self.criterion(outputs, targets)
                else:
                    outputs = self.model(data)
                    loss = self.criterion(outputs, targets)
                
                total_loss += loss.item()
                _, predicted = outputs.max(1)
                total += targets.size(0)
                correct += predicted.eq(targets).sum().item()
        
        avg_loss = total_loss / len(self.val_loader)
        accuracy = 100. * correct / total
        
        self.logger.info(f"Val Epoch: {epoch} Loss: {avg_loss:.4f} Acc: {accuracy:.2f}%")
        
        return avg_loss, accuracy
    
    def train(self):
        best_val_acc = 0.0
        patience_counter = 0
        
        for epoch in range(1, self.config["training"]["epochs"] + 1):
            train_loss, train_acc = self.train_epoch(epoch)
            val_loss, val_acc = self.validate_epoch(epoch)
            
            # Learning rate scheduling
            self.scheduler.step()
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(self.model.state_dict(), f"experiments/best_model.pth")
                patience_counter = 0
            else:
                patience_counter += 1
            
            # Early stopping
            if patience_counter >= self.config["training"]["early_stopping"]["patience"]:
                self.logger.info(f"Early stopping at epoch {epoch}")
                break
            
            # Log to tensorboard
            if self.config["experiment"]["tracking"] == "tensorboard":
                self.log_to_tensorboard(epoch, train_loss, train_acc, val_loss, val_acc)
    
    def log_to_tensorboard(self, epoch: int, train_loss: float, train_acc: float, 
                          val_loss: float, val_acc: float):
        from torch.utils.tensorboard import SummaryWriter
        
        writer = SummaryWriter(self.config["logging"]["tensorboard"]["log_dir"])
        
        writer.add_scalar("Loss/Train", train_loss, epoch)
        writer.add_scalar("Loss/Validation", val_loss, epoch)
        writer.add_scalar("Accuracy/Train", train_acc, epoch)
        writer.add_scalar("Accuracy/Validation", val_acc, epoch)
        writer.add_scalar("Learning_Rate", self.optimizer.param_groups[0]["lr"], epoch)
        
        writer.close()
```

### Data Pipeline

```python
# data/datasets.py
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
import os

class ImageDataset(Dataset):
    def __init__(self, csv_file: str, root_dir: str, transform=None):
        self.annotations = pd.read_csv(csv_file)
        self.root_dir = root_dir
        self.transform = transform
    
    def __len__(self):
        return len(self.annotations)
    
    def __getitem__(self, idx):
        img_path = os.path.join(self.root_dir, self.annotations.iloc[idx, 0])
        image = Image.open(img_path).convert("RGB")
        y_label = torch.tensor(int(self.annotations.iloc[idx, 1]))
        
        if self.transform:
            image = self.transform(image)
        
        return (image, y_label)

def create_dataloaders(config: dict, batch_size: int, num_workers: int):
    # Data augmentation
    train_transform = transforms.Compose([
        transforms.Resize(config["preprocessing"]["resize"]),
        transforms.RandomHorizontalFlip(config["augmentation"]["horizontal_flip"]),
        transforms.RandomVerticalFlip(config["augmentation"]["vertical_flip"]),
        transforms.RandomRotation(config["augmentation"]["rotation_range"]),
        transforms.RandomAffine(0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
        transforms.ColorJitter(
            brightness=config["augmentation"]["brightness_range"][0],
            contrast=config["augmentation"]["brightness_range"][1]
        ),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=config["preprocessing"]["normalize"]["mean"],
            std=config["preprocessing"]["normalize"]["std"]
        )
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(config["preprocessing"]["resize"]),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=config["preprocessing"]["normalize"]["mean"],
            std=config["preprocessing"]["normalize"]["std"]
        )
    ])
    
    # Create datasets
    train_dataset = ImageDataset(
        csv_file="data/splits/train.csv",
        root_dir="data/processed/",
        transform=train_transform
    )
    
    val_dataset = ImageDataset(
        csv_file="data/splits/val.csv",
        root_dir="data/processed/",
        transform=val_transform
    )
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=config["pin_memory"]
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=config["pin_memory"]
    )
    
    return train_loader, val_loader
```

## 🚀 Deployment

### Model Optimization

```python
# deployment/optimization/torchscript.py
import torch
from models.architectures.resnet_custom import CustomResNet50

def optimize_for_inference(model_path: str, output_path: str):
    """Optimize model for inference using TorchScript"""
    
    # Load model
    model = CustomResNet50(num_classes=1000)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Trace model
    traced_model = torch.jit.trace(model, dummy_input)
    
    # Optimize
    optimized_model = torch.jit.optimize_for_inference(traced_model)
    
    # Save optimized model
    optimized_model.save(output_path)
    
    print(f"Model optimized and saved to {output_path}")

def quantize_model(model_path: str, output_path: str):
    """Quantize model for reduced size and faster inference"""
    
    # Load model
    model = CustomResNet50(num_classes=1000)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    # Prepare for quantization
    model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
    torch.quantization.prepare(model, inplace=True)
    
    # Calibrate with sample data
    # (Add calibration data here)
    
    # Convert to quantized model
    quantized_model = torch.quantization.convert(model, inplace=False)
    
    # Save quantized model
    torch.save(quantized_model.state_dict(), output_path)
    
    print(f"Model quantized and saved to {output_path}")
```

### Inference Server

```python
# deployment/serving/fastapi_server.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import uvicorn

app = FastAPI(title="Deep Learning Inference API")

# Load optimized model
model = torch.jit.load("deployment/models/optimized/model.pt")
model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read and preprocess image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0)
        
        # Inference
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = F.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
        
        return JSONResponse({
            "predicted_class": predicted.item(),
            "confidence": confidence.item(),
            "probabilities": probabilities.tolist()[0]
        })
    
    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500
        )

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 📊 Monitoring

### Performance Monitoring

```python
# deployment/monitoring/performance.py
import time
import psutil
import torch
from typing import Dict, Any

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            "inference_times": [],
            "memory_usage": [],
            "gpu_utilization": [],
            "throughput": []
        }
    
    def measure_inference(self, model, input_tensor, num_runs=100):
        """Measure inference performance"""
        
        # Warmup
        for _ in range(10):
            with torch.no_grad():
                _ = model(input_tensor)
        
        # Measure inference times
        times = []
        for _ in range(num_runs):
            start_time = time.time()
            with torch.no_grad():
                _ = model(input_tensor)
            end_time = time.time()
            times.append(end_time - start_time)
        
        self.metrics["inference_times"] = times
        return {
            "avg_inference_time": sum(times) / len(times),
            "min_inference_time": min(times),
            "max_inference_time": max(times),
            "throughput": 1.0 / (sum(times) / len(times))
        }
    
    def measure_memory(self):
        """Measure memory usage"""
        memory = psutil.virtual_memory()
        gpu_memory = torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
        
        return {
            "cpu_memory_percent": memory.percent,
            "cpu_memory_used_gb": memory.used / (1024**3),
            "gpu_memory_allocated_gb": gpu_memory / (1024**3)
        }
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate performance report"""
        return {
            "inference_performance": self.analyze_inference_times(),
            "memory_usage": self.measure_memory(),
            "system_info": self.get_system_info()
        }
    
    def analyze_inference_times(self) -> Dict[str, float]:
        """Analyze inference time statistics"""
        times = self.metrics["inference_times"]
        return {
            "mean": sum(times) / len(times),
            "median": sorted(times)[len(times) // 2],
            "p95": sorted(times)[int(len(times) * 0.95)],
            "p99": sorted(times)[int(len(times) * 0.99)]
        }
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            "cpu_count": psutil.cpu_count(),
            "gpu_available": torch.cuda.is_available(),
            "gpu_name": torch.cuda.get_device_name() if torch.cuda.is_available() else None,
            "gpu_memory_total": torch.cuda.get_device_properties(0).total_memory / (1024**3) if torch.cuda.is_available() else 0
        }
```

## 🧪 Testing

### Model Testing

```python
# tests/test_model.py
import pytest
import torch
from models.architectures.resnet_custom import CustomResNet50

class TestCustomResNet50:
    def setup_method(self):
        self.model = CustomResNet50(num_classes=1000, pretrained=False)
        self.dummy_input = torch.randn(1, 3, 224, 224)
    
    def test_model_forward(self):
        """Test model forward pass"""
        output = self.model(self.dummy_input)
        assert output.shape == (1, 1000)
    
    def test_model_gradients(self):
        """Test gradient computation"""
        output = self.model(self.dummy_input)
        loss = output.sum()
        loss.backward()
        
        for param in self.model.parameters():
            assert param.grad is not None
    
    def test_model_inference_mode(self):
        """Test model inference mode"""
        self.model.eval()
        output = self.model(self.dummy_input)
        
        # Should not compute gradients in eval mode
        assert not torch.is_grad_enabled()
    
    def test_model_device_compatibility(self):
        """Test model on different devices"""
        if torch.cuda.is_available():
            model_gpu = self.model.cuda()
            input_gpu = self.dummy_input.cuda()
            output = model_gpu(input_gpu)
            assert output.shape == (1, 1000)
```

## 🔒 Security Considerations

- ✅ **Model Security**: Validate model inputs and outputs
- ✅ **Data Privacy**: Ensure data encryption and access control
- ✅ **API Security**: Implement authentication and rate limiting
- ✅ **Model Integrity**: Verify model checksums and versions
- ✅ **Inference Security**: Sanitize inputs and validate outputs

## 📚 Best Practices

1. **Experiment Tracking**: Use TensorBoard/W&B for comprehensive tracking
2. **Model Versioning**: Maintain version history and metadata
3. **Performance Optimization**: Use mixed precision and model optimization
4. **Resource Management**: Monitor GPU memory and utilization
5. **Reproducibility**: Set random seeds and log all configurations
6. **Testing**: Comprehensive unit and integration tests

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: PyTorch 2.0+, CUDA 11.8+  
**License**: MIT