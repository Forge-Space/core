# Terraform Patterns for UIForge Projects
# Cost-effective Infrastructure as Code with local backend

## 🎯 Overview

This directory contains Terraform patterns designed for local development and AWS Solutions Architect certification preparation. All patterns use local backend storage with zero cloud costs while providing real Infrastructure as Code experience.

## 📋 Available Patterns

### Infrastructure Modules
- **VPC**: Virtual Private Cloud configuration
- **Security Groups**: Network security and access control
- **IAM**: Identity and Access Management
- **Compute**: EC2 instances and auto-scaling
- **Storage**: S3 buckets and EBS volumes
- **Database**: RDS instances and DynamoDB tables
- **Networking**: Load balancers and VPC endpoints

### AWS Service Patterns
- **Serverless**: Lambda functions and API Gateway
- **Containers**: EKS clusters and ECS services
- **Monitoring**: CloudWatch and CloudTrail
- **Messaging**: SQS queues and SNS topics
- **CDN**: CloudFront distributions

### Local Development Patterns
- **LocalStack Integration**: AWS service emulation
- **Local Backend**: State management without cloud storage
- **Cost Monitoring**: Free tier tracking and alerts
- **Environment Management**: Multi-environment configurations

## 🚀 Quick Start

### Enable Terraform Patterns
```yaml
# patterns/config/patterns-config.yml
infrastructure:
  terraform: true

terraform:
  backend: local
  state_file: terraform.tfstate
```

### Initialize Terraform
```bash
# Navigate to pattern directory
cd patterns/terraform/modules/vpc

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan

# Apply infrastructure (local)
terraform apply
```

### Use with LocalStack
```bash
# Start LocalStack
docker run -d -p 4566:4566 localstack/localstack

# Set environment variables
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-west-2
export AWS_ENDPOINT_URL=http://localhost:4566

# Run Terraform with LocalStack
terraform apply -var="aws_endpoint_url=http://localhost:4566"
```

## 📁 Pattern Structure

```
patterns/terraform/
├── modules/            # Reusable infrastructure modules
├── environments/       # Environment-specific configurations
├── examples/          # Learning examples and scenarios
├── localstack/        # LocalStack integration patterns
├── monitoring/        # Cost and performance monitoring
└── scripts/           # Utility scripts and helpers
```

## 🔧 Configuration Examples

### Local Backend Configuration
```hcl
# backend.tf
terraform {
  backend "local" {
    path = "${path.module}/terraform.tfstate"
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# provider.tf
provider "aws" {
  region = var.aws_region
  
  # Use LocalStack for development
  endpoints {
    s3       = var.aws_endpoint_url
    dynamodb = var.aws_endpoint_url
    lambda   = var.aws_endpoint_url
    apigateway = var.aws_endpoint_url
    sqs      = var.aws_endpoint_url
    sns      = var.aws_endpoint_url
    iam      = var.aws_endpoint_url
  }
  
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
}
```

### VPC Module
```hcl
# modules/vpc/main.tf
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "uiforge-vpc"
    Environment = var.environment
    Project     = "uiforge"
  }
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index % 2]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "uiforge-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index % 2]
  
  tags = {
    Name        = "uiforge-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
  }
}
```

### Security Group Module
```hcl
# modules/security-groups/main.tf
resource "aws_security_group" "web" {
  name_prefix = "uiforge-web-"
  description = "Security group for web servers"
  vpc_id      = var.vpc_id
  
  ingress {
    description = "HTTP from load balancer"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [var.alb_security_group_id]
  }
  
  ingress {
    description = "HTTPS from load balancer"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [var.alb_security_group_id]
  }
  
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "uiforge-web-sg"
    Environment = var.environment
  }
}
```

## 🎓 Certification Study Areas

### Design Resilient Architectures
- **Multi-AZ Deployments**: High availability across availability zones
- **Auto Scaling Groups**: Dynamic scaling based on demand
- **Load Balancing**: Traffic distribution and failover
- **Backup and Recovery**: Data protection strategies

### Design High-Performing Architectures
- **Instance Types**: Right-sizing compute resources
- **Storage Optimization**: EBS volumes and S3 performance
- **CDN Implementation**: CloudFront for content delivery
- **Caching Strategies**: ElastiCache and CloudFront caching

### Design Secure Applications
- **IAM Policies**: Principle of least privilege
- **Network Security**: Security groups and NACLs
- **Data Encryption**: Encryption at rest and in transit
- **Monitoring and Logging**: CloudTrail and CloudWatch

### Design Cost-Optimized Architectures
- **Reserved Instances**: Cost optimization strategies
- **Auto Scaling**: Cost-effective scaling
- **Storage Classes**: S3 storage tier optimization
- **Resource Tagging**: Cost allocation and monitoring

## 💰 Cost Optimization Patterns

### Free Tier Monitoring
```hcl
# modules/cost-monitoring/main.tf
locals {
  free_tier_limits = {
    ec2_t2_micro_hours = 750
    s3_storage_gb      = 5
    lambda_invocations = 1000000
    data_transfer_gb  = 100
  }
}

resource "aws_cloudwatch_metric_alarm" "ec2_cost" {
  alarm_name          = "uiforge-ec2-cost-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600"  # 6 hours
  statistic           = "Maximum"
  threshold           = "10"     # $10 alert threshold
  alarm_description   = "Alert when EC2 costs exceed $10"
  treat_missing_data  = "notBreaching"
}
```

### Resource Optimization
```hcl
# modules/optimization/main.tf
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "uiforge-scale-out"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.web.name
}

resource "aws_autoscaling_policy" "scale_in" {
  name                   = "uiforge-scale-in"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.web.name
}
```

## 🔒 Security Patterns

### IAM Role Configuration
```hcl
# modules/iam/main.tf
resource "aws_iam_role" "ec2_role" {
  name = "uiforge-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "ec2_policy" {
  name        = "uiforge-ec2-policy"
  description = "Policy for UIForge EC2 instances"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}
```

### Network Security
```hcl
# modules/network-security/main.tf
resource "aws_network_acl" "private" {
  vpc_id     = var.vpc_id
  subnet_ids = aws_subnet.private[*].id
  
  ingress {
    rule_no    = 100
    action     = "allow"
    from_port  = 0
    to_port    = 0
    protocol   = "-1"
    cidr_block = "10.0.0.0/8"
  }
  
  egress {
    rule_no    = 100
    action     = "allow"
    from_port  = 0
    to_port    = 0
    protocol   = "-1"
    cidr_block = "0.0.0.0/0"
  }
}
```

## 📊 Monitoring Patterns

### CloudWatch Alarms
```hcl
# modules/monitoring/main.tf
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "uiforge-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  treat_missing_data  = "notBreaching"
}

resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/uiforge/application"
  retention_in_days = 14
}
```

## 🔄 Operations Patterns

### Infrastructure Updates
```bash
# scripts/update-infrastructure.sh
#!/bin/bash
set -euo pipefail

echo "🔄 Updating infrastructure..."

# Plan changes
terraform plan -out=tfplan

# Review plan
echo "📋 Review the plan above before applying:"
read -p "Continue with apply? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform apply tfplan
    echo "✅ Infrastructure updated successfully"
else
    echo "❌ Update cancelled"
    rm tfplan
fi
```

### State Management
```bash
# scripts/state-management.sh
#!/bin/bash
set -euo pipefail

case "$1" in
    "backup")
        echo "📦 Backing up Terraform state..."
        cp terraform.tfstate "backup/terraform-$(date +%Y%m%d-%H%M%S).tfstate"
        ;;
    "list")
        echo "📋 Terraform state resources:"
        terraform state list
        ;;
    "refresh")
        echo "🔄 Refreshing Terraform state..."
        terraform refresh
        ;;
    *)
        echo "Usage: $0 {backup|list|refresh}"
        exit 1
        ;;
esac
```

## 🧪 Testing Patterns

### Infrastructure Testing
```hcl
# tests/infrastructure_test.tf
# Test configuration for Terraform

module "test_vpc" {
  source = "../modules/vpc"
  
  providers = {
    aws = aws.test
  }
  
  vpc_cidr = "10.1.0.0/16"
}

# Test assertions
resource "null_resource" "test_vpc_created" {
  triggers = {
    vpc_id = module.test_vpc.vpc_id
  }
}

resource "null_resource" "test_subnets_created" {
  triggers = {
    subnet_count = length(module.test_vpc.public_subnet_ids)
  }
}
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Terraform state issues
terraform state pull
terraform state list
terraform state show <resource>

# Provider issues
terraform init -upgrade
terraform validate
terraform fmt

# LocalStack issues
docker logs localstack
curl http://localhost:4566/health
```

### Debug Configuration
```hcl
# Debug provider configuration
provider "aws" {
  region = var.aws_region
  
  # Debug settings
  skip_credentials_validation = false
  skip_metadata_api_check     = false
  
  # LocalStack debugging
  endpoints {
    s3 = "http://localhost:4566"
  }
}
```

## 📚 Learning Resources

- [Terraform Documentation](https://www.terraform.io/docs/)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [LocalStack Terraform Guide](https://docs.localstack.cloud/aws/integrations/terraform.html)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/aws/)

## 🎯 Next Steps

1. Choose your learning path (VPC, Security, Compute, etc.)
2. Update `patterns-config.yml` to enable Terraform
3. Navigate to the desired module directory
4. Initialize and apply the configuration
5. Experiment with different scenarios
6. Practice certification exam patterns

All Terraform patterns are designed for **zero-cost local development** while providing **real-world Infrastructure as Code experience** for AWS Solutions Architect certification preparation.