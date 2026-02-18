# LocalStack Patterns for UIForge Projects
# Zero-cost AWS service emulation for certification studies

## 🎯 Overview

This directory contains LocalStack patterns designed for local AWS service emulation. All patterns provide zero-cost AWS service simulation while maintaining real AWS API compatibility for certification studies.

## 📋 Available Patterns

### AWS Service Emulation
- **S3**: Simple Storage Service for object storage
- **DynamoDB**: NoSQL database service
- **Lambda**: Serverless compute functions
- **API Gateway**: RESTful API management
- **SQS**: Simple Queue Service
- **SNS**: Simple Notification Service
- **IAM**: Identity and Access Management
- **CloudWatch**: Monitoring and logging

### Integration Patterns
- **Docker Compose**: Multi-service local stacks
- **Terraform Integration**: Infrastructure as Code with LocalStack
- **Application Integration**: SDK and CLI configurations
- **Testing Patterns**: Local testing frameworks

### Development Workflows
- **Service Discovery**: Local service registration
- **Data Persistence**: Local data storage
- **Network Configuration**: Service networking
- **Monitoring Setup**: Local monitoring and logging

## 🚀 Quick Start

### Enable LocalStack Patterns
```yaml
# patterns/config/patterns-config.yml
infrastructure:
  localstack: true

localstack:
  port: 4566
  services:
    - s3
    - dynamodb
    - lambda
    - apigateway
    - sqs
    - sns
    - iam
    - cloudwatch
  persistence: true
  debug: false
```

### Start LocalStack
```bash
# Using Docker Compose
docker-compose -f patterns/localstack/docker-compose.yml up -d

# Or using Docker directly
docker run -d -p 4566:4566 \
  -e SERVICES=s3,dynamodb,lambda,apigateway,sqs,sns,iam,cloudwatch \
  -e DEBUG=1 \
  -e DATA_DIR=/tmp/localstack/data \
  -v /tmp/localstack/data:/tmp/localstack/data \
  localstack/localstack
```

### Configure AWS CLI
```bash
# Set up AWS CLI for LocalStack
aws configure set aws-access-key-id test
aws configure set aws-secret-access-key test
aws configure set default-region us-west-2
aws configure set default.endpoint-url http://localhost:4566

# Or use environment variables
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-west-2
export AWS_ENDPOINT_URL=http://localhost:4566
```

## 📁 Pattern Structure

```
patterns/localstack/
├── docker-compose.yml      # LocalStack service configuration
├── terraform/             # Terraform integration patterns
├── examples/              # Learning examples and scenarios
├── scripts/               # Utility scripts and helpers
├── configs/               # Service configuration files
└── monitoring/            # Local monitoring setup
```

## 🔧 Configuration Examples

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
      - "4510-4559:4510-4559"  # External service ports
    environment:
      - SERVICES=s3,dynamodb,lambda,apigateway,sqs,sns,iam,cloudwatch
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
      - PORT_WEB_UI=8080
      - LAMBDA_EXECUTOR=docker-reuse
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - "/tmp/localstack:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4566/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Web UI for LocalStack
  localstack-ui:
    image: localstack/localstack:latest
    ports:
      - "8080:8080"
    environment:
      - SERVICES=s3,dynamodb,lambda,apigateway,sqs,sns,iam,cloudwatch
      - DEBUG=1
      - PORT_WEB_UI=8080
    depends_on:
      - localstack
```

### Terraform Integration
```hcl
# terraform/provider.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
  
  # LocalStack endpoints
  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    apigateway = "http://localhost:4566"
    sqs      = "http://localhost:4566"
    sns      = "http://localhost:4566"
    iam      = "http://localhost:4566"
    cloudwatch = "http://localhost:4566"
  }
  
  access_key = "test"
  secret_key = "test"
  
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
}
```

### S3 Bucket Creation
```hcl
# terraform/s3.tf
resource "aws_s3_bucket" "uiforge_bucket" {
  bucket = "uiforge-local-bucket"
  
  tags = {
    Name        = "uiforge-local-bucket"
    Environment = "local"
    Project     = "uiforge"
  }
}

resource "aws_s3_bucket_versioning" "uiforge_bucket" {
  bucket = aws_s3_bucket.uiforge_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "uiforge_bucket" {
  bucket = aws_s3_bucket.uiforge_bucket.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### DynamoDB Table
```hcl
# terraform/dynamodb.tf
resource "aws_dynamodb_table" "uiforge_table" {
  name           = "uiforge-local-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  attribute {
    name = "type"
    type = "S"
  }
  
  global_secondary_index {
    name     = "type-index"
    hash_key = "type"
    projection_type = "ALL"
  }
  
  tags = {
    Name        = "uiforge-local-table"
    Environment = "local"
    Project     = "uiforge"
  }
}
```

### Lambda Function
```hcl
# terraform/lambda.tf
resource "aws_iam_role" "lambda_role" {
  name = "uiforge-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_lambda_function" "uiforge_function" {
  function_name = "uiforge-local-function"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  
  filename = "lambda-function.zip"
  source_code_hash = filebase64sha256("lambda-function.zip")
  
  environment {
    variables = {
      ENVIRONMENT = "local"
      TABLE_NAME  = aws_dynamodb_table.uiforge_table.name
    }
  }
  
  tags = {
    Name        = "uiforge-local-function"
    Environment = "local"
    Project     = "uiforge"
  }
}
```

## 🎓 Certification Study Areas

### Storage Services
- **S3**: Object storage with versioning and lifecycle policies
- **DynamoDB**: NoSQL database with indexes and streams
- **Glacier**: Archive storage (simulated with S3)

### Compute Services
- **Lambda**: Serverless functions with triggers
- **ECS**: Container orchestration (with Docker)
- **EKS**: Kubernetes orchestration (with k3s)

### Database Services
- **DynamoDB**: NoSQL with global tables and auto-scaling
- **RDS**: Relational databases (simulated with PostgreSQL)
- **ElastiCache**: In-memory caching (simulated with Redis)

### Networking Services
- **API Gateway**: RESTful APIs with stages and caching
- **CloudFront**: CDN (simulated with local proxy)
- **Route 53**: DNS (simulated with local hosts)

### Security Services
- **IAM**: Identity and access management
- **KMS**: Key management (simulated with local encryption)
- **Secrets Manager**: Secrets storage (simulated with environment variables)

## 💰 Cost Optimization Patterns

### Free Tier Monitoring
```bash
# scripts/cost-monitor.sh
#!/bin/bash

echo "📊 LocalStack Cost Monitor"
echo "========================="

# Check service status
echo "🔍 Service Status:"
curl -s http://localhost:4566/health | jq '.services'

# Monitor resource usage
echo "📈 Resource Usage:"
echo "S3 Buckets: $(aws --endpoint-url=http://localhost:4566 s3 ls | wc -l)"
echo "DynamoDB Tables: $(aws --endpoint-url=http://localhost:4566 dynamodb list-tables | jq '.TableNames | length')"
echo "Lambda Functions: $(aws --endpoint-url=http://localhost:4566 lambda list-functions | jq '.Functions | length')"
echo "SQS Queues: $(aws --endpoint-url=http://localhost:4566 sqs list-queues | jq '.QueueUrls | length')"

# Data usage
echo "💾 Data Usage:"
echo "Local Data Directory: $(du -sh /tmp/localstack/data 2>/dev/null || echo 'Not available')"
echo "Docker Volumes: $(docker volume ls | grep localstack | wc -l)"
```

### Resource Cleanup
```bash
# scripts/cleanup.sh
#!/bin/bash

echo "🧹 Cleaning up LocalStack resources..."

# Clean up S3 buckets
echo "🗑️ Cleaning S3 buckets..."
aws --endpoint-url=http://localhost:4566 s3 ls | while read -r bucket; do
  if [[ $bucket != "" ]]; then
    bucket_name=$(echo $bucket | awk '{print $3}')
    echo "  Cleaning bucket: $bucket_name"
    aws --endpoint-url=http://localhost:4566 s3 rb "s3://$bucket_name" --force
  fi
done

# Clean up DynamoDB tables
echo "🗑️ Cleaning DynamoDB tables..."
aws --endpoint-url=http://localhost:4566 dynamodb list-tables | jq -r '.TableNames[]' | while read -r table; do
  echo "  Deleting table: $table"
  aws --endpoint-url=http://localhost:4566 dynamodb delete-table --table-name "$table"
done

# Clean up Lambda functions
echo "🗑️ Cleaning Lambda functions..."
aws --endpoint-url=http://localhost:4566 lambda list-functions | jq -r '.Functions[].FunctionName' | while read -r function; do
  echo "  Deleting function: $function"
  aws --endpoint-url=http://localhost:4566 lambda delete-function --function-name "$function"
done

echo "✅ Cleanup completed"
```

## 🔧 Utility Scripts

### Service Health Check
```bash
# scripts/health-check.sh
#!/bin/bash

echo "🏥 LocalStack Health Check"
echo "========================"

# Check if LocalStack is running
if ! curl -s http://localhost:4566/health > /dev/null; then
  echo "❌ LocalStack is not running"
  echo "🚀 Starting LocalStack..."
  docker-compose -f patterns/localstack/docker-compose.yml up -d
  sleep 10
fi

# Check service health
echo "🔍 Checking service health..."
health_response=$(curl -s http://localhost:4566/health)
echo "Services: $(echo $health_response | jq -r '.services | keys | join(", ")')"

# Check individual services
services=("s3" "dynamodb" "lambda" "apigateway" "sqs" "sns" "iam" "cloudwatch")

for service in "${services[@]}"; do
  if echo $health_response | jq -e ".services[\"$service\"]" > /dev/null; then
    echo "✅ $service: Available"
  else
    echo "❌ $service: Not available"
  fi
done

echo "🌐 LocalStack UI: http://localhost:8080"
echo "🔗 API Endpoint: http://localhost:4566"
```

### Data Persistence Setup
```bash
# scripts/setup-persistence.sh
#!/bin/bash

echo "💾 Setting up data persistence..."

# Create data directory
mkdir -p /tmp/localstack/data
mkdir -p /tmp/localstack/lambda

# Set permissions
chmod 755 /tmp/localstack/data
chmod 755 /tmp/localstack/lambda

# Create backup script
cat > /tmp/localstack/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/tmp/localstack/backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up LocalStack data..."
cp -r /tmp/localstack/data "$BACKUP_DIR/"
echo "✅ Backup completed: $BACKUP_DIR"
EOF

chmod +x /tmp/localstack/backup.sh

echo "✅ Data persistence configured"
echo "📦 Backup script: /tmp/localstack/backup.sh"
```

## 🧪 Testing Patterns

### Integration Tests
```javascript
// tests/localstack-integration.test.js
const AWS = require('aws-sdk');

// Configure AWS SDK for LocalStack
const aws = new AWS({
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-west-2',
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
});

describe('LocalStack Integration Tests', () => {
  test('S3 Bucket Operations', async () => {
    const s3 = new aws.S3();
    
    // Create bucket
    await s3.createBucket({ Bucket: 'test-bucket' }).promise();
    
    // List buckets
    const buckets = await s3.listBuckets().promise();
    expect(buckets.Buckets.some(b => b.Name === 'test-bucket')).toBe(true);
    
    // Delete bucket
    await s3.deleteBucket({ Bucket: 'test-bucket' }).promise();
  });

  test('DynamoDB Operations', async () => {
    const dynamodb = new aws.DynamoDB();
    
    // Create table
    await dynamodb.createTable({
      TableName: 'test-table',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();
    
    // List tables
    const tables = await dynamodb.listTables().promise();
    expect(tables.TableNames).toContain('test-table');
    
    // Delete table
    await dynamodb.deleteTable({ TableName: 'test-table' }).promise();
  });
});
```

## 📚 Learning Resources

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS CLI LocalStack Guide](https://docs.localstack.cloud/aws-cli/)
- [Terraform LocalStack Integration](https://docs.localstack.cloud/aws/integrations/terraform.html)
- [LocalStack Web UI](http://localhost:8080)

## 🎯 Next Steps

1. Start LocalStack with Docker Compose
2. Configure AWS CLI for local development
3. Create sample resources with Terraform
4. Test applications with local AWS services
5. Practice certification scenarios
6. Monitor and optimize resource usage

All LocalStack patterns are designed for **zero-cost AWS service emulation** while providing **real-world AWS API experience** for certification studies and development.