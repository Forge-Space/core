#!/bin/bash
# k3s cluster setup for UIForge patterns
# Lightweight Kubernetes cluster for resource-efficient development

set -euo pipefail

echo "🚀 Setting up k3s cluster for UIForge patterns..."

# Configuration
K3S_VERSION="v1.28.3+k3s1"
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/rancher/k3s"
KUBECONFIG_DIR="$HOME/.kube"

# Check if running as root for installation
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script needs to be run with sudo for k3s installation"
   echo "   Please run: sudo ./setup-k3s.sh"
   exit 1
fi

# Check if k3s is already installed
if command -v k3s &> /dev/null; then
    echo "✅ k3s is already installed"
    
    # Check if k3s is running
    if systemctl is-active --quiet k3s; then
        echo "✅ k3s service is running"
        echo "🔧 To reset k3s: sudo k3s-uninstall.sh && ./setup-k3s.sh"
        exit 0
    else
        echo "🔧 Starting k3s service..."
        systemctl start k3s
        systemctl enable k3s
    fi
else
    echo "🔧 Installing k3s..."
    
    # Download k3s installation script
    curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
    
    # Wait for k3s to start
    echo "⏳ Waiting for k3s to start..."
    sleep 10
    
    # Enable and start k3s service
    systemctl enable k3s
    systemctl start k3s
    
    # Wait for k3s to be fully ready
    echo "⏳ Waiting for k3s nodes to be ready..."
    until k3s kubectl get nodes | grep -q "Ready"; do
        sleep 2
    done
fi

# Set up kubectl for current user
echo "🔧 Setting up kubectl access..."
mkdir -p "$KUBECONFIG_DIR"
cp "$CONFIG_DIR/k3s.yaml" "$KUBECONFIG_DIR/config"
chown -R $SUDO_USER:$SUDO_USER "$KUBECONFIG_DIR"

# Export KUBECONFIG for current session
export KUBECONFIG="$KUBECONFIG_DIR/config"

# Verify cluster setup
echo "✅ Verifying cluster setup..."
kubectl cluster-info
kubectl get nodes

# Create UIForge namespace
echo "🔧 Creating UIForge namespace..."
kubectl create namespace uiforge --dry-run=client -o yaml | kubectl apply -f -

# Install ingress controller (NGINX)
echo "🔧 Installing NGINX ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
echo "⏳ Waiting for ingress controller to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx --namespace=ingress-nginx --timeout=300s

# Install metrics server
echo "🔧 Installing metrics server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Wait for metrics server to be ready
echo "⏳ Waiting for metrics server to be ready..."
kubectl wait --for=condition=available deployment/metrics-server --namespace=kube-system --timeout=300s

# Set up cluster role binding for current user
echo "🔧 Setting up cluster access..."
kubectl create clusterrolebinding uiforge-admin --clusterrole=cluster-admin --user=$SUDO_USER --dry-run=client -o yaml | kubectl apply -f -

# Print cluster information
echo ""
echo "🎉 k3s cluster setup complete!"
echo ""
echo "📊 Cluster Information:"
echo "  Version: $K3S_VERSION"
echo "  Installation Directory: $INSTALL_DIR"
echo "  Config Directory: $CONFIG_DIR"
echo "  Kubeconfig: $KUBECONFIG_DIR/config"
echo ""
echo "🔧 Useful Commands:"
echo "  View cluster status:      kubectl cluster-info"
echo "  View nodes:              kubectl get nodes -o wide"
echo "  View system pods:         kubectl get pods -n kube-system"
echo "  View ingress pods:        kubectl get pods -n ingress-nginx"
echo "  Uninstall k3s:           sudo k3s-uninstall.sh"
echo "  Restart k3s:             sudo systemctl restart k3s"
echo "  View logs:               sudo journalctl -u k3s -f"
echo ""
echo "🌐 Access Services:"
echo "  Ingress IP will be available after service deployment"
echo "  Use 'kubectl get ingress' to see external access points"
echo ""
echo "📚 Next Steps:"
echo "  1. Deploy UIForge applications: kubectl apply -f patterns/kubernetes/manifests/"
echo "  2. Monitor deployment: kubectl get pods,svc,ingress --all-namespaces"
echo "  3. Access applications: check ingress endpoints"
echo "  4. Practice certification scenarios"
echo ""
echo "💡 Learning Tips:"
echo "  - k3s is lightweight and perfect for learning"
echo "  - Use 'kubectl explain' to understand resource fields"
echo "  - Practice with different deployment strategies"
echo "  - Experiment with resource limits and requests"
echo "  - Try network policies and security configurations"
echo ""
echo "🔍 Troubleshooting:"
echo "  - If pods aren't starting: kubectl describe pod <pod-name>"
echo "  - If ingress isn't working: kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx"
echo "  - For cluster issues: sudo journalctl -u k3s -f"
echo "  - To reset cluster: sudo k3s-uninstall.sh && ./setup-k3s.sh"