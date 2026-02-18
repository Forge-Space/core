#!/bin/bash
# Minikube cluster setup for UIForge patterns
# Cost-effective local Kubernetes cluster

set -euo pipefail

echo "🚀 Setting up Minikube cluster for UIForge patterns..."

# Configuration
CLUSTER_NAME="uiforge-local"
MEMORY="4096"
CPUS="2"
DRIVER="docker"
KUBERNETES_VERSION="1.28"

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "❌ Minikube is not installed. Please install Minikube first:"
    echo "   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64"
    echo "   sudo install minikube-darwin-amd64 /usr/local/bin/minikube"
    exit 1
fi

# Check if cluster already exists
if minikube status -p "$CLUSTER_NAME" | grep -q "Running"; then
    echo "✅ Cluster $CLUSTER_NAME is already running"
    echo "🔧 To reset cluster: minikube delete -p $CLUSTER_NAME && ./setup-minikube.sh"
    exit 0
fi

# Start Minikube cluster
echo "🔧 Starting Minikube cluster..."
minikube start \
    -p "$CLUSTER_NAME" \
    --memory="$MEMORY" \
    --cpus="$CPUS" \
    --driver="$DRIVER" \
    --kubernetes-version="$KUBERNETES_VERSION" \
    --container-runtime=docker \
    --dns-domain="uiforge.local" \
    --addons=ingress \
    --addons=metrics-server \
    --addons=dashboard

# Wait for cluster to be ready
echo "⏳ Waiting for cluster to be ready..."
minikube status -p "$CLUSTER_NAME" --wait=true

# Enable ingress
echo "🔧 Enabling ingress controller..."
minikube addons enable ingress -p "$CLUSTER_NAME"

# Enable metrics server
echo "🔧 Enabling metrics server..."
minikube addons enable metrics-server -p "$CLUSTER_NAME"

# Enable dashboard (optional)
echo "🔧 Enabling Kubernetes dashboard..."
minikube addons enable dashboard -p "$CLUSTER_NAME"

# Set up cluster context
echo "🔧 Setting up kubectl context..."
kubectl config use-context minikube

# Verify cluster setup
echo "✅ Verifying cluster setup..."
kubectl cluster-info
kubectl get nodes
kubectl get pods -n kube-system

# Create UIForge namespace
echo "🔧 Creating UIForge namespace..."
kubectl create namespace uiforge --dry-run=client -o yaml | kubectl apply -f -

# Add local registry (optional)
echo "🔧 Setting up local registry..."
minikube addons enable registry -p "$CLUSTER_NAME"

# Print cluster information
echo ""
echo "🎉 Minikube cluster setup complete!"
echo ""
echo "📊 Cluster Information:"
echo "  Name: $CLUSTER_NAME"
echo "  Memory: ${MEMORY}MB"
echo "  CPUs: $CPUS"
echo "  Driver: $DRIVER"
echo "  Kubernetes Version: $KUBERNETES_VERSION"
echo ""
echo "🔧 Useful Commands:"
echo "  View cluster status:      minikube status -p $CLUSTER_NAME"
echo "  Open dashboard:         minikube dashboard -p $CLUSTER_NAME"
echo "  Access cluster IP:      minikube ip -p $CLUSTER_NAME"
echo "  Delete cluster:         minikube delete -p $CLUSTER_NAME"
echo "  Stop cluster:           minikube stop -p $CLUSTER_NAME"
echo "  Start cluster:           minikube start -p $CLUSTER_NAME"
echo ""
echo "🌐 Access Services:"
echo "  Services will be available at: \$(minikube ip -p $CLUSTER_NAME).nip.io"
echo "  For local testing, add entries to /etc/hosts:"
echo "    \$(minikube ip -p $CLUSTER_NAME) uiforge.local"
echo "    \$(minikube ip -p $CLUSTER_NAME) api.uiforge.local"
echo ""
echo "📚 Next Steps:"
echo "  1. Deploy UIForge applications: kubectl apply -f patterns/kubernetes/manifests/"
echo "  2. Monitor deployment: kubectl get pods,svc,ingress"
echo "  3. Access applications: curl http://uiforge.local"
echo "  4. Practice certification scenarios"
echo ""
echo "💡 Learning Tips:"
echo "  - Use 'kubectl explain' to understand resource fields"
echo "  - Practice with different deployment strategies"
echo "  - Experiment with autoscaling and resource limits"
echo "  - Try network policies and security configurations"