# Kubernetes Patterns for UIForge Projects
# Cost-effective local Kubernetes patterns for certification studies

## 🎯 Overview

This directory contains Kubernetes patterns designed for local development and AWS Solutions Architect certification preparation. All patterns use free local clusters (Minikube/k3s) with zero cloud costs.

## 📋 Available Patterns

### Cluster Configurations
- **Minikube**: Single-node cluster for development
- **k3s**: Lightweight Kubernetes for resource efficiency
- **Kind**: Docker-based Kubernetes clusters

### Application Patterns
- **Deployments**: Basic application deployment
- **Services**: Service discovery and load balancing
- **ConfigMaps**: Configuration management
- **Secrets**: Secure credential management
- **Ingress**: External access routing

### Advanced Patterns
- **Autoscaling**: Horizontal Pod Autoscaling
- **Network Policies**: Security and traffic control
- **Resource Limits**: Performance and cost optimization
- **Health Checks**: Application reliability
- **Rolling Updates**: Zero-downtime deployments

## 🚀 Quick Start

### Enable Kubernetes Patterns
```yaml
# patterns/config/patterns-config.yml
infrastructure:
  kubernetes: true

kubernetes:
  provider: minikube
  cluster_name: uiforge-local
```

### Start Local Cluster
```bash
# Minikube
minikube start --memory=4096 --cpus=2 --driver=docker

# k3s
curl -sfL https://get.k3s.io | sh -

# Kind
kind create cluster --name uiforge-local
```

### Deploy Application
```bash
# Apply manifests
kubectl apply -f patterns/kubernetes/manifests/

# Check status
kubectl get pods,svc,ingress
```

## 📁 Pattern Structure

```
patterns/kubernetes/
├── clusters/           # Cluster configurations
├── manifests/          # Kubernetes manifests
├── helm/              # Helm charts
├── monitoring/        # Monitoring patterns
├── security/          # Security patterns
└── examples/          # Learning examples
```

## 🔧 Configuration Examples

### Basic Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uiforge-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: uiforge-app
  template:
    metadata:
      labels:
        app: uiforge-app
    spec:
      containers:
      - name: app
        image: uiforge/app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Service Configuration
```yaml
apiVersion: v1
kind: Service
metadata:
  name: uiforge-service
spec:
  selector:
    app: uiforge-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: uiforge-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: uiforge-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🎓 Certification Study Areas

### Design Resilient Architectures
- **Pod Disruption Budgets**: Ensure availability during maintenance
- **Multi-zone deployments**: High availability patterns
- **Health checks**: Application reliability
- **Rolling updates**: Zero-downtime deployments

### Design High-Performing Architectures
- **Resource requests/limits**: Performance optimization
- **Autoscaling**: Dynamic scaling based on demand
- **Load balancing**: Traffic distribution
- **Caching strategies**: Performance optimization

### Design Secure Applications
- **Network policies**: Traffic control and security
- **RBAC**: Role-based access control
- **Secrets management**: Secure credential handling
- **Security contexts**: Container security

### Design Cost-Optimized Architectures
- **Resource optimization**: Right-sizing containers
- **Cluster efficiency**: Resource utilization
- **Monitoring**: Cost tracking and optimization
- **Autoscaling**: Cost-effective scaling

## 🛡️ Security Patterns

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: uiforge-network-policy
spec:
  podSelector:
    matchLabels:
      app: uiforge-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3000
```

### RBAC Configuration
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: uiforge-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: uiforge-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: uiforge-sa
  namespace: default
roleRef:
  kind: Role
  name: uiforge-role
  apiGroup: rbac.authorization.k8s.io
```

## 📊 Monitoring Patterns

### Resource Monitoring
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
```

### Health Checks
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: uiforge/app:latest
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 5
```

## 🔄 Operations Patterns

### Rolling Updates
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uiforge-app
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        image: uiforge/app:latest
```

### Blue-Green Deployments
```bash
# Deploy new version
kubectl apply -f green-deployment.yaml

# Switch traffic
kubectl patch service uiforge-service -p '{"spec":{"selector":{"version":"green"}}}'

# Verify and cleanup
kubectl delete deployment uiforge-app-blue
```

## 💰 Cost Optimization

### Resource Limits
```yaml
resources:
  requests:
    memory: "128Mi"    # Minimum required
    cpu: "100m"         # Minimum required
  limits:
    memory: "512Mi"    # Maximum allowed
    cpu: "500m"         # Maximum allowed
```

### Cluster Efficiency
```bash
# Monitor resource usage
kubectl top nodes
kubectl top pods

# Optimize cluster
kubectl autoscale deployment uiforge-app --cpu-percent=70 --min=2 --max=10
```

## 🧪 Testing Patterns

### Integration Testing
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: test
    image: curlimages/curl
    command: ['sh', '-c', 'curl http://uiforge-service/health']
  restartPolicy: Never
```

### Load Testing
```bash
# Deploy load test
kubectl apply -f load-test.yaml

# Monitor results
kubectl logs -f load-test-pod
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Check cluster status
kubectl cluster-info

# Debug pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Resource usage
kubectl top nodes
kubectl top pods
```

### Network Debugging
```bash
# Test connectivity
kubectl exec -it <pod-name> -- nslookup uiforge-service

# Port forwarding
kubectl port-forward service/uiforge-service 8080:80
```

## 📚 Learning Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Guide](https://minikube.sigs.k8s.io/docs/)
- [k3s Documentation](https://docs.k3s.io/)
- [Kind Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/)

## 🎯 Next Steps

1. Choose your cluster provider (Minikube/k3s/Kind)
2. Update `patterns-config.yml` to enable Kubernetes
3. Start your local cluster
4. Deploy sample applications
5. Explore advanced patterns
6. Practice certification scenarios

All Kubernetes patterns are designed for **zero-cost local development** while providing **real-world experience** for AWS Solutions Architect certification preparation.