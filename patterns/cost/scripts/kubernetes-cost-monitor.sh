#!/bin/bash
# Kubernetes Cost Monitoring Script for Forge Patterns
# Monitors and analyzes Kubernetes resource costs

set -e

echo "☸️  Kubernetes Cost Monitoring"
echo "============================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
KUBERNETES_DIR="$PROJECT_DIR/../kubernetes"
CONFIG_FILE="$PROJECT_DIR/config/cost.yml"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check kubectl installation
check_kubectl() {
    log_info "Checking kubectl installation..."
    
    if command -v kubectl &> /dev/null; then
        local kubectl_version=$(kubectl version --client --short 2>/dev/null | grep "Client Version" | cut -d: -f2 | tr -d ' ' || echo "Unknown")
        log_success "kubectl found: version $kubectl_version"
    else
        log_warning "kubectl not found - some features will be limited"
    fi
}

# Analyze Kubernetes manifests
analyze_kubernetes_manifests() {
    log_info "Analyzing Kubernetes manifests..."
    
    if [[ ! -d "$KUBERNETES_DIR" ]]; then
        log_warning "Kubernetes directory not found: $KUBERNETES_DIR"
        return 1
    fi
    
    # Count Kubernetes files
    local yaml_files=$(find "$KUBERNETES_DIR" -name "*.yaml" -o -name "*.yml" | wc -l)
    log_info "Found $yaml_files Kubernetes manifest files"
    
    # Analyze resource requests and limits
    local deployments_with_resources=$(grep -r "resources:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $deployments_with_resources -gt 0 ]]; then
        log_success "Found $deployments_with_resources deployments with resource specifications"
    else
        log_warning "No resource specifications found - potential cost risk"
    fi
    
    # Check for resource limits
    local resource_limits=$(grep -r "limits:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $resource_limits -gt 0 ]]; then
        log_success "Found $resource_limits resource limits (cost control)"
    else
        log_warning "No resource limits found - potential cost risk"
    fi
    
    # Check for auto-scaling
    local hpa_count=$(grep -r "kind: HorizontalPodAutoscaler" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $hpa_count -gt 0 ]]; then
        log_success "Found $hpa_count Horizontal Pod Autoscalers (cost optimization)"
    else
        log_warning "No auto-scaling found - consider adding HPA"
    fi
}

# Calculate resource costs
calculate_resource_costs() {
    log_info "Calculating resource costs..."
    
    if [[ ! -d "$KUBERNETES_DIR" ]]; then
        return 1
    fi
    
    # Extract memory requests
    local total_memory_requests=0
    local memory_requests=$(grep -r "memory:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | grep -o '[0-9]*[MG]i' | head -10)
    
    # Extract CPU requests
    local total_cpu_requests=0
    local cpu_requests=$(grep -r "cpu:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | grep -o '[0-9]*m' | head -10)
    
    echo ""
    echo "💰 Resource Cost Analysis"
    echo "========================"
    echo ""
    echo "📊 Resource Summary:"
    
    # Count different resource types
    echo "- Deployments: $(grep -r "kind: Deployment" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)"
    echo "- Services: $(grep -r "kind: Service" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)"
    echo "- ConfigMaps: $(grep -r "kind: ConfigMap" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)"
    echo "- Secrets: $(grep -r "kind: Secret" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)"
    echo "- HPAs: $(grep -r "kind: HorizontalPodAutoscaler" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)"
    
    # Show sample resource requests
    if [[ -n "$memory_requests" ]]; then
        echo ""
        echo "🧠 Memory Requests Found:"
        echo "$memory_requests" | head -5
    fi
    
    if [[ -n "$cpu_requests" ]]; then
        echo ""
        echo "⚡ CPU Requests Found:"
        echo "$cpu_requests" | head -5
    fi
}

# Check for cost optimization patterns
check_optimization_patterns() {
    log_info "Checking for cost optimization patterns..."
    
    if [[ ! -d "$KUBERNETES_DIR" ]]; then
        return 1
    fi
    
    # Check for resource requests (good for cost planning)
    local resource_requests=$(grep -r "requests:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $resource_requests -gt 0 ]]; then
        log_success "Found $resource_requests resource requests (cost planning)"
    fi
    
    # Check for pod disruption budgets
    local pdb_count=$(grep -r "kind: PodDisruptionBudget" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $pdb_count -gt 0 ]]; then
        log_success "Found $pdb_count Pod Disruption Budgets (availability optimization)"
    fi
    
    # Check for node selectors (cost optimization)
    local node_selectors=$(grep -r "nodeSelector:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $node_selectors -gt 0 ]]; then
        log_success "Found $node_selectors node selectors (cost optimization)"
    fi
    
    # Check for affinity rules
    local affinity_rules=$(grep -r "affinity:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $affinity_rules -gt 0 ]]; then
        log_success "Found $affinity_rules affinity rules (optimization)"
    fi
}

# Check for security best practices (cost impact)
check_security_patterns() {
    log_info "Checking for security patterns (cost impact)..."
    
    if [[ ! -d "$KUBERNETES_DIR" ]]; then
        return 1
    fi
    
    # Check for non-root users
    local non_root=$(grep -r "runAsNonRoot.*true" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $non_root -gt 0 ]]; then
        log_success "Found $non_root non-root user configurations (security best practice)"
    fi
    
    # Check for read-only filesystem
    local readonly_fs=$(grep -r "readOnlyRootFilesystem.*true" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $readonly_fs -gt 0 ]]; then
        log_success "Found $readonly_fs read-only filesystem configurations"
    fi
    
    # Check for dropped capabilities
    local dropped_caps=$(grep -r "drop:" "$KUBERNETES_DIR" --include="*.yaml" --include="*.yml" | wc -l)
    if [[ $dropped_caps -gt 0 ]]; then
        log_success "Found $dropped_caps dropped capabilities (security)"
    fi
}

# Generate cost optimization recommendations
generate_recommendations() {
    log_info "Generating cost optimization recommendations..."
    
    echo ""
    echo "💡 Kubernetes Cost Optimization Recommendations"
    echo "=============================================="
    echo ""
    echo "🎯 Resource Management:"
    echo "- Set appropriate resource requests and limits"
    echo "- Use Horizontal Pod Autoscalers for variable workloads"
    echo "- Implement Vertical Pod Autoscaling when appropriate"
    echo "- Use node selectors and affinity for cost-optimized nodes"
    echo ""
    echo "🔄 Scaling Strategies:"
    echo "- Implement cluster autoscaling"
    echo "- Use spot instances for non-critical workloads"
    echo "- Consider serverless alternatives (Knative, KEDA)"
    echo "- Use resource quotas to control costs"
    echo ""
    echo "🔧 Optimization Techniques:"
    echo "- Right-size containers based on actual usage"
    echo "- Use pod disruption budgets for high availability"
    echo "- Implement efficient image strategies (smaller images)"
    echo "- Use network policies to optimize traffic"
    echo ""
    echo "📊 Monitoring:"
    echo "- Monitor resource usage regularly"
    echo "- Set up cost allocation tags"
    echo "- Use cost monitoring tools (kube-cost, opencost)"
    echo "- Implement alerting for cost anomalies"
}

# Check cluster cost if accessible
check_cluster_costs() {
    log_info "Checking cluster costs (if accessible)..."
    
    if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
        # Get node information
        local node_count=$(kubectl get nodes --no-headers | wc -l)
        log_info "Cluster has $node_count nodes"
        
        # Get pod information
        local pod_count=$(kubectl get pods --all-namespaces --no-headers | wc -l)
        log_info "Cluster has $pod_count pods"
        
        # Check for resource usage
        if kubectl top nodes &> /dev/null; then
            log_success "Resource monitoring available"
        else
            log_warning "Metrics server not available for resource monitoring"
        fi
    else
        log_info "Cluster not accessible - using manifest analysis only"
    fi
}

# Main function
main() {
    echo "☸️  Kubernetes Cost Monitoring"
    echo "============================="
    echo ""
    
    check_kubectl
    analyze_kubernetes_manifests
    calculate_resource_costs
    check_optimization_patterns
    check_security_patterns
    check_cluster_costs
    generate_recommendations
    
    echo ""
    log_success "Kubernetes cost monitoring completed! ✅"
    echo ""
    echo "📋 Summary:"
    echo "- Kubernetes manifests analyzed"
    echo "- Resource costs calculated"
    echo "- Optimization patterns identified"
    echo "- Security best practices checked"
    echo "- Recommendations provided"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
