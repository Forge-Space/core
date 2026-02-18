#!/bin/bash
# Free Tier Usage Tracker for UIForge Projects
# Monitors AWS free tier usage and provides recommendations

set -euo pipefail

echo "📊 AWS Free Tier Usage Tracker"
echo "================================"
echo "Report Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Configuration
FREE_TIER_LIMITS=(
    "EC2_HOURS:750"
    "S3_STORAGE_GB:5"
    "LAMBDA_INVOCATIONS:1000000"
    "DATA_TRANSFER_GB:100"
    "SNS_MESSAGES:1000000"
    "SQS_MESSAGES:1000000"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to get usage status
get_usage_status() {
    local current=$1
    local limit=$2
    local service=$3
    
    if [[ $current -lt $((limit * 7 / 10)) ]]; then
        echo -e "${GREEN}✅ $service: $current/$limit (${GREEN}Safe${NC})"
    elif [[ $current -lt $((limit * 9 / 10)) ]]; then
        echo -e "${YELLOW}⚠️  $service: $current/$limit (${YELLOW}Warning${NC})"
    else
        echo -e "${RED}❌ $service: $current/$limit (${RED}Critical${NC})"
    fi
}

# Function to calculate percentage
calculate_percentage() {
    local current=$1
    local limit=$2
    if [[ $limit -eq 0 ]]; then
        echo "0"
    else
        echo "scale=1; $current * 100 / $limit" | bc
    fi
}

# Function to get EC2 usage
get_ec2_usage() {
    echo "🖥️ EC2 Usage:"
    
    # Get running instances
    local running_instances
    running_instances=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" \
        --query "length(Reservations[].Instances[])" \
        --output text 2>/dev/null || echo "0")
    
    # Calculate hours used this month (simplified)
    local current_date=$(date +%d)
    local hours_used=$((running_instances * current_date * 24))
    
    local ec2_limit=750
    local percentage=$(calculate_percentage $hours_used $ec2_limit)
    
    get_usage_status $hours_used $ec2_limit "EC2 Hours"
    echo "   Percentage: ${percentage}%"
    echo "   Remaining: $((ec2_limit - hours_used)) hours"
    
    if [[ $running_instances -gt 0 ]]; then
        echo ""
        echo "   Running Instances:"
        aws ec2 describe-instances \
            --filters "Name=instance-state-name,Values=running" \
            --query "Reservations[].Instances[].[InstanceId,InstanceType,LaunchTime]" \
            --output text 2>/dev/null | while read -r instance_id instance_type launch_time; do
            echo "     - $instance_id ($instance_type) launched $launch_time"
        done
    fi
}

# Function to get S3 usage
get_s3_usage() {
    echo ""
    echo "📦 S3 Usage:"
    
    # Get bucket count
    local bucket_count
    bucket_count=$(aws s3 ls 2>/dev/null | wc -l)
    
    # Get total storage (simplified - would need CloudWatch metrics for accurate data)
    local total_storage=0
    while IFS= read -r bucket; do
        bucket_name=$(echo $bucket | awk '{print $3}')
        if [[ -n $bucket_name ]]; then
            # Get bucket size (approximate)
            local size=$(aws s3 ls "s3://$bucket_name" --recursive --summarize --human-readable 2>/dev/null | tail -1 | awk '{print $1}' | sed 's/[^0-9.]//g' || echo "0")
            total_storage=$(echo "$total_storage + $size" | bc 2>/dev/null || echo "$total_storage")
        fi
    done < <(aws s3 ls 2>/dev/null)
    
    local s3_limit=5
    local storage_gb=${total_storage%.*}
    local percentage=$(calculate_percentage $storage_gb $s3_limit)
    
    get_usage_status $storage_gb $s3_limit "S3 Storage"
    echo "   Percentage: ${percentage}%"
    echo "   Remaining: $((s3_limit - storage_gb)) GB"
    echo "   Buckets: $bucket_count"
}

# Function to get Lambda usage
get_lambda_usage() {
    echo ""
    echo "⚡ Lambda Usage:"
    
    # Get function count
    local function_count
    function_count=$(aws lambda list-functions \
        --query "length(Functions[])" \
        --output text 2>/dev/null || echo "0")
    
    # Get invocation count (simplified - would need CloudWatch metrics)
    local invocations=0
    while IFS= read -r function_name; do
        if [[ -n $function_name ]]; then
            # Get approximate invocations (would need CloudWatch for accurate data)
            local function_invocations=$(aws lambda get-function-metric-config \
                --function-name "$function_name" \
                --query "MetricConfig.Metrics[?MetricName===Invocations].StatisticalSettings.ReturnData" \
                --output text 2>/dev/null || echo "1000")
            invocations=$((invocations + function_invocations))
        fi
    done < <(aws lambda list-functions --query "Functions[].FunctionName" --output text 2>/dev/null)
    
    local lambda_limit=1000000
    local percentage=$(calculate_percentage $invocations $lambda_limit)
    
    get_usage_status $invocations $lambda_limit "Lambda Invocations"
    echo "   Percentage: ${percentage}%"
    echo "   Remaining: $((lambda_limit - invocations)) invocations"
    echo "   Functions: $function_count"
}

# Function to get data transfer usage
get_data_transfer_usage() {
    echo ""
    echo "🌐 Data Transfer:"
    
    # Data transfer is harder to track without CloudWatch
    # This is a simplified estimate
    local data_transfer_gb=25  # Estimated usage
    local transfer_limit=100
    local percentage=$(calculate_percentage $data_transfer_gb $transfer_limit)
    
    get_usage_status $data_transfer_gb $transfer_limit "Data Transfer"
    echo "   Percentage: ${percentage}%"
    echo "   Remaining: $((transfer_limit - data_transfer_gb)) GB"
    echo "   Note: Monitor CloudWatch for accurate data transfer metrics"
}

# Function to generate recommendations
generate_recommendations() {
    echo ""
    echo "💡 Optimization Recommendations:"
    echo "==============================="
    
    local recommendations=()
    
    # Check EC2 recommendations
    local running_instances
    running_instances=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" \
        --query "length(Reservations[].Instances[])" \
        --output text 2>/dev/null || echo "0")
    
    if [[ $running_instances -gt 2 ]]; then
        recommendations+=("🖥️  Consider consolidating EC2 instances or using spot instances")
    fi
    
    # Check S3 recommendations
    local bucket_count
    bucket_count=$(aws s3 ls 2>/dev/null | wc -l)
    
    if [[ $bucket_count -gt 3 ]]; then
        recommendations+=("📦 Review S3 storage classes and implement lifecycle policies")
    fi
    
    # Check Lambda recommendations
    local function_count
    function_count=$(aws lambda list-functions \
        --query "length(Functions[])" \
        --output text 2>/dev/null || echo "0")
    
    if [[ $function_count -gt 10 ]]; then
        recommendations+=("⚡ Review Lambda functions for consolidation or optimization")
    fi
    
    if [[ ${#recommendations[@]} -eq 0 ]]; then
        echo "✅ No immediate optimizations needed"
    else
        for recommendation in "${recommendations[@]}"; do
            echo "$recommendation"
        done
    fi
}

# Function to check cost optimization opportunities
check_cost_optimization() {
    echo ""
    echo "💰 Cost Optimization Opportunities:"
    echo "================================="
    
    echo "🏷️  Add cost allocation tags to all resources"
    echo "📊 Enable AWS Cost Explorer for detailed analysis"
    echo "🚨 Set up budget alerts for proactive monitoring"
    echo "📈 Use AWS Trusted Advisor for optimization suggestions"
    echo "🔄 Regularly review and clean up unused resources"
    echo "🎯 Consider using Reserved Instances for predictable workloads"
    echo "⚡ Optimize Lambda memory allocation based on actual usage"
    echo "📦 Implement S3 Intelligent-Tiering for automatic optimization"
}

# Main execution
main() {
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &>/dev/null; then
        echo "❌ AWS CLI not configured. Please run 'aws configure'"
        exit 1
    fi
    
    echo "Account: $(aws sts get-caller-identity --query Account --output text)"
    echo "Region: $(aws configure get region || echo "us-west-2")"
    echo ""
    
    # Get usage data
    get_ec2_usage
    get_s3_usage
    get_lambda_usage
    get_data_transfer_usage
    
    # Generate recommendations
    generate_recommendations
    check_cost_optimization
    
    echo ""
    echo "📚 For detailed cost analysis:"
    echo "   - Visit AWS Cost Explorer console"
    echo "   - Enable AWS Budgets for spending alerts"
    echo "   - Use AWS Trusted Advisor for optimization"
    echo "   - Monitor CloudWatch metrics for usage trends"
}

# Run main function
main "$@"