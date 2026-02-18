#!/bin/bash
# Terraform Cost Monitoring Script for Forge Patterns
# Monitors and analyzes Terraform infrastructure costs

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_DIR/../terraform"
CONFIG_FILE="$PROJECT_DIR/config/cost.yml"

# Source output formatter
source "$SCRIPT_DIR/utils/output-formatter.sh"

# Initialize formatting
init_formatting

# Check Terraform installation
check_terraform() {
    log_info "Checking Terraform installation..."

    if command -v terraform &> /dev/null; then
        local terraform_version=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || echo "Unknown")
        log_success "Terraform found: version $terraform_version"
    else
        log_warning "Terraform not found - some features will be limited"
    fi
}

# Analyze Terraform files for cost indicators
analyze_terraform_files() {
    log_info "Analyzing Terraform files for cost indicators..."

    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        log_warning "Terraform directory not found: $TERRAFORM_DIR"
        return 1
    fi

    # Count Terraform files
    local tf_files=$(find "$TERRAFORM_DIR" -name "*.tf" -type f | wc -l)
    log_info "Found $tf_files Terraform files"

    # Check for cost-related resources
    local expensive_resources=0

    # Check for EC2 instances
    local ec2_count=$(grep -r "aws_instance" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $ec2_count -gt 0 ]]; then
        log_info "Found $ec2_count EC2 instances"
        expensive_resources=$((expensive_resources + ec2_count))
    fi

    # Check for RDS instances
    local rds_count=$(grep -r "aws_db_instance" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $rds_count -gt 0 ]]; then
        log_info "Found $rds_count RDS instances"
        expensive_resources=$((expensive_resources + rds_count))
    fi

    # Check for EKS clusters
    local eks_count=$(grep -r "aws_eks_cluster" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $eks_count -gt 0 ]]; then
        log_info "Found $eks_count EKS clusters"
        expensive_resources=$((expensive_resources + eks_count))
    fi

    # Check for NAT Gateways
    local nat_count=$(grep -r "aws_nat_gateway" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $nat_count -gt 0 ]]; then
        log_info "Found $nat_count NAT Gateways"
        expensive_resources=$((expensive_resources + nat_count))
    fi

    if [[ $expensive_resources -gt 0 ]]; then
        log_warning "Found $expensive_resources potentially expensive resources"
    else
        log_success "No expensive resources detected"
    fi
}

# Check for cost optimization patterns
check_optimization_patterns() {
    log_info "Checking for cost optimization patterns..."

    # Check for LocalStack usage
    local localstack_usage=$(grep -r "use_localstack.*=.*true" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $localstack_usage -gt 0 ]]; then
        log_success "Found LocalStack optimization in $localstack_usage configurations"
    fi

    # Check for spot instances
    local spot_instances=$(grep -r "instance_market_options" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $spot_instances -gt 0 ]]; then
        log_success "Found $spot_instances spot instance configurations"
    fi

    # Check for auto-scaling
    local autoscaling=$(grep -r "aws_autoscaling_group" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $autoscaling -gt 0 ]]; then
        log_success "Found $autoscaling auto-scaling configurations"
    fi

    # Check for resource tagging
    local tagging=$(grep -r "tags.*=" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $tagging -gt 0 ]]; then
        log_success "Found resource tagging in $tagging places"
    fi
}

# Generate cost estimates
generate_cost_estimates() {
    log_info "Generating cost estimates..."

    echo ""
    draw_box "💰 TERRAFORM COST ANALYSIS" "📊 Resource Summary:
  • VPCs: $(grep -r "aws_vpc" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)
  • Subnets: $(grep -r "aws_subnet" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)
  • EC2 Instances: $(grep -r "aws_instance" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)
  • RDS Instances: $(grep -r "aws_db_instance" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)
  • Load Balancers: $(grep -r "aws_lb" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)
  • NAT Gateways: $(grep -r "aws_nat_gateway" "$TERRAFORM_DIR" --include="*.tf" 2>/dev/null | wc -l)

💡 Cost Optimization Recommendations:
  • Use LocalStack for development environments
  • Implement auto-scaling for variable workloads
  • Use spot instances for non-critical workloads
  • Enable resource tagging for cost allocation
  • Regular review of unused resources
  • Consider serverless alternatives when possible"
}

# Check for free tier eligible resources
check_free_tier_resources() {
    log_info "Checking for free tier eligible resources..."

    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        return 1
    fi

    # Check for t2.micro instances (free tier eligible)
    local t2_micro=$(grep -r "t2.micro" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $t2_micro -gt 0 ]]; then
        log_success "Found $t2_micro t2.micro instances (free tier eligible)"
    fi

    # Check for S3 buckets (free tier)
    local s3_buckets=$(grep -r "aws_s3_bucket" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $s3_buckets -gt 0 ]]; then
        log_success "Found $s3_buckets S3 buckets (free tier storage available)"
    fi

    # Check for Lambda functions (free tier)
    local lambda_functions=$(grep -r "aws_lambda_function" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $lambda_functions -gt 0 ]]; then
        log_success "Found $lambda_functions Lambda functions (free tier million requests)"
    fi

    # Check for DynamoDB tables (free tier)
    local dynamodb_tables=$(grep -r "aws_dynamodb_table" "$TERRAFORM_DIR" --include="*.tf" | wc -l)
    if [[ $dynamodb_tables -gt 0 ]]; then
        log_success "Found $dynamodb_tables DynamoDB tables (free tier available)"
    fi
}

# Main function
main() {
    echo "$TERRAFORM_HEADER"
    echo ""

    log_section "🔧 Terraform Environment Check"
    check_terraform

    echo ""
    log_section "📋 Analyzing Terraform Files"
    analyze_terraform_files

    echo ""
    log_section "⚙️ Checking Optimization Patterns"
    check_optimization_patterns

    echo ""
    log_section "🆓 Free Tier Resource Analysis"
    check_free_tier_resources

    echo ""
    log_section "💰 Generating Cost Estimates"
    generate_cost_estimates

    echo ""
    print_banner "🏗️ Terraform Cost Analysis Completed!"
    echo ""
    draw_box "📋 SUMMARY" "Infrastructure patterns analyzed
Cost optimization opportunities identified
Free tier resources checked
Recommendations provided"
    echo ""
    print_footer
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
