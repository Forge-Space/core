# VPC Module for UIForge Projects
# Virtual Private Cloud configuration for AWS certification studies

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

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

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

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.30.0/24", "10.0.40.0/24"]
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in VPC"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support in VPC"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "uiforge"
    ManagedBy   = "terraform"
  }
}

# LocalStack configuration for local development
variable "use_localstack" {
  description = "Use LocalStack for local development"
  type        = bool
  default     = false
}

variable "aws_endpoint_url" {
  description = "AWS endpoint URL for LocalStack"
  type        = string
  default     = ""
}

# Provider configuration
provider "aws" {
  region = var.aws_region
  
  dynamic "endpoints" {
    for_each = var.use_localstack ? [1] : []
    content {
      s3       = var.aws_endpoint_url
      dynamodb = var.aws_endpoint_url
      ec2      = var.aws_endpoint_url
      lambda   = var.aws_endpoint_url
      apigateway = var.aws_endpoint_url
      sqs      = var.aws_endpoint_url
      sns      = var.aws_endpoint_url
      iam      = var.aws_endpoint_url
      rds      = var.aws_endpoint_url
    }
  }
  
  access_key = var.use_localstack ? "test" : null
  secret_key = var.use_localstack ? "test" : null
  
  skip_credentials_validation = var.use_localstack
  skip_metadata_api_check     = var.use_localstack
  skip_requesting_account_id  = var.use_localstack
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-vpc"
    Environment = var.environment
    Type        = "Main"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-igw"
    Environment = var.environment
  })
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index % 2]
  map_public_ip_on_launch = true
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
    AZ          = data.aws_availability_zones.available.names[count.index % 2]
  })
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-public-rt"
    Environment = var.environment
  })
}

# Route for Internet Gateway
resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

# Route Table Association for Public Subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Subnets
resource "aws_subnet" "private" {
  count                   = length(var.private_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index % 2]
  map_public_ip_on_launch = false
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
    AZ          = data.aws_availability_zones.available.names[count.index % 2]
  })
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count = var.use_localstack ? 0 : 1
  domain = "vpc"
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-nat-eip"
    Environment = var.environment
  })
  
  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway
resource "aws_nat_gateway" "main" {
  count         = var.use_localstack ? 0 : 1
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-nat"
    Environment = var.environment
  })
  
  depends_on = [aws_internet_gateway.main]
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-private-rt"
    Environment = var.environment
  })
}

# Route for NAT Gateway
resource "aws_route" "private_nat" {
  count = var.use_localstack ? 0 : 1
  
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[0].id
}

# Route Table Association for Private Subnets
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Database Subnets (Optional)
resource "aws_subnet" "database" {
  count = length(var.database_subnet_cidrs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index % 2]
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-db-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Database"
    AZ          = data.aws_availability_zones.available.names[count.index % 2]
  })
}

# Database Route Table
resource "aws_route_table" "database" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-db-rt"
    Environment = var.environment
  })
}

# Database Route Table Association
resource "aws_route_table_association" "database" {
  count          = length(aws_subnet.database)
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

# VPC Flow Logs (Optional)
resource "aws_flow_log" "vpc" {
  count = var.use_localstack ? 0 : 1
  
  iam_role_arn = aws_iam_role.vpc_flow_log[0].arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_log[0].arn
  traffic_type = "ALL"
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-vpc-flow-log"
    Environment = var.environment
  })
}

# IAM Role for VPC Flow Logs
resource "aws_iam_role" "vpc_flow_log" {
  count = var.use_localstack ? 0 : 1
  
  name = "uiforge-${var.environment}-vpc-flow-log-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-vpc-flow-log-role"
    Environment = var.environment
  })
}

# IAM Policy for VPC Flow Logs
resource "aws_iam_role_policy" "vpc_flow_log" {
  count = var.use_localstack ? 0 : 1
  
  name = "uiforge-${var.environment}-vpc-flow-log-policy"
  role = aws_iam_role.vpc_flow_log[0].id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# CloudWatch Log Group for VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow_log" {
  count = var.use_localstack ? 0 : 1
  
  name = "/aws/vpc/flow-logs/uiforge-${var.environment}"
  retention_in_days = 14
  
  tags = merge(var.tags, {
    Name        = "uiforge-${var.environment}-vpc-flow-log"
    Environment = var.environment
  })
}

# Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "List of database subnet IDs"
  value       = aws_subnet.database[*].id
}

output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "The ID of the NAT Gateway"
  value       = var.use_localstack ? null : aws_nat_gateway.main[0].id
}

output "availability_zones" {
  description = "List of availability zones"
  value       = data.aws_availability_zones.available.names
}