# Cost Monitoring Patterns for UIForge Projects
# Zero-cost tracking and optimization for certification studies

## 🎯 Overview

This directory contains cost monitoring patterns designed for zero-cost development environments. All patterns focus on cost awareness, optimization strategies, and free tier monitoring while maintaining production-ready cost management practices.

## 📋 Available Patterns

### Cost Tracking
- **Free Tier Monitoring**: Track AWS free tier usage
- **Resource Costing**: Calculate resource costs locally
- **Budget Alerts**: Set up cost notifications
- **Usage Analytics**: Monitor resource utilization

### Optimization Strategies
- **Resource Rightsizing**: Optimize instance types and sizes
- **Storage Optimization**: Choose cost-effective storage classes
- **Network Optimization**: Minimize data transfer costs
- **Scheduling**: Use time-based cost controls

### Certification Cost Scenarios
- **Free Tier Maximization**: Make the most of AWS free tier
- **Cost-Effective Architectures**: Design patterns for low cost
- **Break-Even Analysis**: Calculate cost vs. benefit
- **ROI Calculations**: Return on investment for features

## 🚀 Quick Start

### Enable Cost Monitoring
```yaml
# patterns/config/patterns-config.yml
infrastructure:
  cost_monitoring: true

cost:
  free_tier_tracking: true
  budget_alerts: true
  optimization_suggestions: true
  reporting_interval: daily
  currency: USD
```

### Run Cost Analysis
```bash
# Analyze current costs
./patterns/cost/scripts/cost-analysis.sh

# Generate cost report
./patterns/cost/scripts/cost-report.sh

# Check free tier usage
./patterns/cost/scripts/free-tier-check.sh
```

## 📁 Pattern Structure

```
patterns/cost/
├── scripts/           # Cost monitoring and analysis scripts
├── templates/         # Cost report templates
├── scenarios/         # Certification cost scenarios
├── calculators/       # Cost calculation tools
├── alerts/           # Budget alert configurations
└── reports/          # Generated cost reports
```

## 🔧 Configuration Examples

### Cost Tracking Configuration
```yaml
# cost/config.yml
cost_tracking:
  enabled: true
  currency: USD
  update_interval: hourly

  free_tier:
    ec2_hours: 750
    s3_storage_gb: 5
    lambda_invocations: 1000000
    data_transfer_gb: 100
    sns_messages: 1000000
    sqs_messages: 1000000

  budgets:
    monthly_limit: 50
    alert_threshold: 0.8
    currency: USD

  optimization:
    auto_suggestions: true
    rightsizing_enabled: true
    storage_optimization: true
```

### Cost Calculator
```python
# calculators/cost_calculator.py
class CostCalculator:
    def __init__(self, config):
        self.config = config
        self.pricing = self._load_pricing()

    def calculate_ec2_cost(self, instance_type, hours, region='us-west-2'):
        """Calculate EC2 instance cost"""
        price_per_hour = self.pricing['ec2'][region].get(instance_type, 0)
        return price_per_hour * hours

    def calculate_s3_cost(self, storage_gb, requests, storage_class='standard'):
        """Calculate S3 storage cost"""
        storage_price = self.pricing['s3'][storage_class]
        request_price = self.pricing['s3']['requests']

        storage_cost = storage_gb * storage_price
        request_cost = requests * request_price
        return storage_cost + request_cost

    def calculate_lambda_cost(self, invocations, duration_ms, memory_mb):
        """Calculate Lambda function cost"""
        # Free tier: 1M invocations + 400,000 GB-seconds
        free_invocations = 1000000
        free_gb_seconds = 400000

        if invocations <= free_invocations:
            invocation_cost = 0
        else:
            invocation_cost = (invocations - free_invocations) * 0.0000002

        # Calculate GB-seconds
        gb_seconds = (invocations * duration_ms * memory_mb) / 1000000

        if gb_seconds <= free_gb_seconds:
            compute_cost = 0
        else:
            compute_cost = (gb_seconds - free_gb_seconds) * 0.0000166667

        return invocation_cost + compute_cost

    def calculate_data_transfer_cost(self, gb_transferred, region='us-west-2'):
        """Calculate data transfer cost"""
        # Free tier: 100 GB/month
        free_gb = 100

        if gb_transferred <= free_gb:
            return 0
        else:
            return (gb_transferred - free_gb) * 0.09  # $0.09 per GB after free tier
```

### Budget Alert Configuration
```yaml
# alerts/budget-alerts.yml
budgets:
  monthly:
    limit: 50.00
    currency: USD
    alert_thresholds:
      warning: 0.7    # 70% of budget
      critical: 0.9   # 90% of budget
      exceeded: 1.0  # 100% of budget

    notifications:
      email: true
      slack: true
      webhook: true

    services:
      ec2:
        limit: 20.00
        alert_threshold: 0.8
      s3:
        limit: 10.00
        alert_threshold: 0.8
      lambda:
        limit: 15.00
        alert_threshold: 0.8
      data_transfer:
        limit: 5.00
        alert_threshold: 0.8

alerts:
  free_tier:
    ec2_hours:
      threshold: 750
      alert_at: 700
    s3_storage:
      threshold: 5
      alert_at: 4.5
    lambda_invocations:
      threshold: 1000000
      alert_at: 900000
```

## 🎓 Certification Study Areas

### Cost Optimization Strategies
- **Instance Types**: Choose cost-effective EC2 instances
- **Reserved Instances**: Save money with commitment
- **Spot Instances**: Use spare capacity at lower cost
- **Auto Scaling**: Scale based on demand

### Storage Cost Management
- **S3 Storage Classes**: Use appropriate storage tiers
- **Lifecycle Policies**: Automate data movement
- **Data Compression**: Reduce storage costs
- **Cleanup Policies**: Remove unused data

### Network Cost Optimization
- **CloudFront**: Use CDN for content delivery
- **VPC Endpoints**: Reduce data transfer costs
- **Direct Connect**: For high-volume data transfer
- **Regional Optimization**: Place resources near users

### Monitoring and Alerting
- **CloudWatch**: Set up cost monitoring
- **Budgets**: Create spending limits
- **Anomaly Detection**: Identify unusual spending
- **Cost Allocation Tags**: Track costs by project

## 💰 Free Tier Maximization

### Free Tier Tracking Script
```bash
#!/bin/bash
# scripts/free-tier-tracker.sh

echo "📊 AWS Free Tier Usage Tracker"
echo "================================"

# Get current month
current_month=$(date +%Y-%m)
echo "Month: $current_month"

# Track EC2 usage
echo "🖥️ EC2 Usage:"
ec2_hours=$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].InstanceId" --output text | wc -l)
echo "  Running instances: $ec2_hours"
echo "  Free tier remaining: $((750 - ec2_hours * 24)) hours"

# Track S3 usage
echo "📦 S3 Usage:"
s3_buckets=$(aws s3 ls | wc -l)
echo "  Buckets: $s3_buckets"
echo "  Free tier remaining: $((5 - s3_buckets)) GB"

# Track Lambda usage
echo "⚡ Lambda Usage:"
lambda_functions=$(aws lambda list-functions --query "Functions[].FunctionName" --output text | wc -l)
echo "  Functions: $lambda_functions"
echo "  Free tier invocations: 1,000,000"

# Track data transfer
echo "🌐 Data Transfer:"
echo "  Free tier: 100 GB/month"
echo "  Monitor your CloudWatch metrics for actual usage"

# Generate recommendations
echo ""
echo "💡 Optimization Recommendations:"
if [ $ec2_hours -gt 20 ]; then
  echo "  - Consider using smaller instance types or spot instances"
fi
if [ $s3_buckets -gt 3 ]; then
  echo "  - Review S3 storage classes and lifecycle policies"
fi
if [ $lambda_functions -gt 10 ]; then
  echo "  - Optimize Lambda function memory and duration"
fi
```

### Cost Optimization Suggestions
```python
# scripts/optimization_suggestions.py
class CostOptimizer:
    def __init__(self):
        self.suggestions = []

    def analyze_ec2_usage(self, instances):
        """Analyze EC2 instances for optimization opportunities"""
        for instance in instances:
            if instance['type'] in ['t2.micro', 't3.micro']:
                if instance['cpu_utilization'] < 10:
                    self.suggestions.append({
                        'service': 'EC2',
                        'instance': instance['id'],
                        'issue': 'Low CPU utilization',
                        'suggestion': 'Consider using smaller instance or spot instance',
                        'potential_savings': '$5-10/month'
                    })

            if instance['type'] in ['m5.large', 'c5.large']:
                if instance['cpu_utilization'] < 50:
                    self.suggestions.append({
                        'service': 'EC2',
                        'instance': instance['id'],
                        'issue': 'Underutilized large instance',
                        'suggestion': 'Downsize to smaller instance type',
                        'potential_savings': '$20-50/month'
                    })

    def analyze_s3_usage(self, buckets):
        """Analyze S3 buckets for optimization opportunities"""
        for bucket in buckets:
            if bucket['storage_class'] == 'Standard' and bucket['age_days'] > 90:
                self.suggestions.append({
                    'service': 'S3',
                    'bucket': bucket['name'],
                    'issue': 'Old data in Standard storage',
                    'suggestion': 'Move to Glacier or Infrequent Access',
                    'potential_savings': '$5-15/month'
                })

            if bucket['versioning'] and bucket['old_versions_size'] > 1000000000:  # 1GB
                self.suggestions.append({
                    'service': 'S3',
                    'bucket': bucket['name'],
                    'issue': 'Large version history',
                    'suggestion': 'Clean up old versions or use lifecycle policies',
                    'potential_savings': '$2-8/month'
                })

    def analyze_lambda_usage(self, functions):
        """Analyze Lambda functions for optimization opportunities"""
        for function in functions:
            if function['memory_size'] > 512 and function['avg_duration'] < 100:
                self.suggestions.append({
                    'service': 'Lambda',
                    'function': function['name'],
                    'issue': 'High memory for short duration',
                    'suggestion': 'Reduce memory allocation',
                    'potential_savings': '$1-5/month'
                })

            if function['invocations'] < 1000:
                self.suggestions.append({
                    'service': 'Lambda',
                    'function': function['name'],
                    'issue': 'Low usage function',
                    'suggestion': 'Consider removing or consolidating',
                    'potential_savings': '$0.50-2/month'
                })

    def generate_report(self):
        """Generate optimization report"""
        if not self.suggestions:
            return "✅ No optimization opportunities found"

        report = "💰 Cost Optimization Report\n"
        report += "==========================\n\n"

        total_savings = 0
        for suggestion in self.suggestions:
            report += f"Service: {suggestion['service']}\n"
            report += f"Issue: {suggestion['issue']}\n"
            report += f"Suggestion: {suggestion['suggestion']}\n"
            report += f"Potential Savings: {suggestion['potential_savings']}\n\n"

            # Extract numeric savings
            savings_match = re.search(r'\$(\d+)-(\d+)', suggestion['potential_savings'])
            if savings_match:
                avg_savings = (int(savings_match.group(1)) + int(savings_match.group(2))) / 2
                total_savings += avg_savings

        report += f"Total Potential Savings: ${total_savings:.2f}/month\n"
        return report
```

## 📊 Cost Reporting

### Monthly Cost Report
```bash
#!/bin/bash
# scripts/monthly-cost-report.sh

echo "📊 Monthly Cost Report"
echo "===================="

# Get current month
current_month=$(date +%Y-%m)
echo "Report Period: $current_month"

# Generate cost breakdown
echo ""
echo "💰 Cost Breakdown:"
echo "----------------"

# Simulate cost calculation (replace with actual AWS Cost Explorer API)
ec2_cost=$(python3 scripts/calculate_costs.py --service ec2 --month $current_month)
s3_cost=$(python3 scripts/calculate_costs.py --service s3 --month $current_month)
lambda_cost=$(python3 scripts/calculate_costs.py --service lambda --month $current_month)
data_transfer_cost=$(python3 scripts/calculate_costs.py --service data-transfer --month $current_month)

total_cost=$(echo "$ec2_cost + $s3_cost + $lambda_cost + $data_transfer_cost" | bc)

echo "EC2: $$ec2_cost"
echo "S3: $$s3_cost"
echo "Lambda: $$lambda_cost"
echo "Data Transfer: $$data_transfer_cost"
echo "Total: $$total_cost"

# Free tier usage
echo ""
echo "🆓 Free Tier Usage:"
echo "------------------"
echo "EC2 Hours: $(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "length(Reservations[].Instances[])" --output text)"
echo "S3 Storage: $(aws s3 ls | wc -l) buckets"
echo "Lambda Invocations: $(aws lambda list-functions --query "length(Functions[])" --output text) functions"

# Recommendations
echo ""
echo "💡 Recommendations:"
echo "------------------"
if (( $(echo "$total_cost > 40" | bc -l) )); then
    echo "⚠️  High cost detected - review resource usage"
fi

if (( $(echo "$ec2_cost > 20" | bc -l) )); then
    echo "🖥️  Consider optimizing EC2 instances"
fi

if (( $(echo "$s3_cost > 10" | bc -l) )); then
    echo "📦 Review S3 storage classes and lifecycle policies"
fi

echo "📈 Enable detailed monitoring with AWS Cost Explorer"
echo "🏷️  Add cost allocation tags to resources"
echo "📊 Set up budget alerts for better cost control"
```

## 🔧 Utility Scripts

### Cost Analysis Script
```bash
#!/bin/bash
# scripts/cost-analysis.sh

echo "🔍 Cost Analysis Tool"
echo "==================="

# Parse arguments
SERVICE=$1
PERIOD=${2:-month}

case $SERVICE in
  "ec2")
    echo "🖥️ EC2 Cost Analysis"
    python3 scripts/analyze_costs.py --service ec2 --period $PERIOD
    ;;
  "s3")
    echo "📦 S3 Cost Analysis"
    python3 scripts/analyze_costs.py --service s3 --period $PERIOD
    ;;
  "lambda")
    echo "⚡ Lambda Cost Analysis"
    python3 scripts/analyze_costs.py --service lambda --period $PERIOD
    ;;
  "all")
    echo "📊 Complete Cost Analysis"
    python3 scripts/analyze_costs.py --service all --period $PERIOD
    ;;
  *)
    echo "Usage: $0 {ec2|s3|lambda|all} [day|week|month]"
    exit 1
    ;;
esac
```

### Budget Alert Setup
```bash
#!/bin/bash
# scripts/setup-budget-alerts.sh

echo "🚨 Setting Up Budget Alerts"
echo "=========================="

# Create budget using AWS CLI
aws budgets create-budget \
  --account-id "$(aws sts get-caller-identity --query Account --output text)" \
  --budget '{
    "BudgetName": "uiforge-monthly-budget",
    "BudgetType": "COST",
    "TimeUnit": "MONTHLY",
    "BudgetLimit": {
      "Amount": "50",
      "Unit": "USD"
    },
    "CostFilters": [
      {
        "Dimension": "SERVICE",
        "Values": ["Amazon EC2", "Amazon S3", "AWS Lambda"]
      }
    ]
  }' \
  --notifications-with-subscribers '[
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "admin@uiforge.local"
        }
      ]
    }
  ]'

echo "✅ Budget alerts configured"
echo "📧 Notifications will be sent to admin@uiforge.local"
echo "🚨 Alert triggered at 80% of budget ($40)"
```

## 📚 Learning Resources

- [AWS Cost Explorer Documentation](https://docs.aws.amazon.com/aws-cost-management/latest/userguide/)
- [AWS Budgets User Guide](https://docs.aws.amazon.com/aws-cost-management/latest/userguide/budgets-managing-costs.html)
- [AWS Free Tier Guide](https://aws.amazon.com/free/)
- [Cost Optimization Best Practices](https://docs.aws.amazon.com/aws-cost-management/latest/userguide/cost-optimization-best-practices.html)

## 🔄 Development Workflow

### Trunk Based Development

This project follows Trunk Based Development with continuous integration:

#### Branch Structure
- **main**: Production-ready code, always deployable
- **dev**: Development environment branch, continuously deployed
- **release/x.y.z**: Release preparation branches
- **feature/***: Feature development branches

#### Development Workflow
1. **Feature Development**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/cost-optimization dev
   # Make your changes
   git commit -m "feat: add cost optimization patterns"
   git push origin feature/cost-optimization
   ```

2. **Testing & Review**
   - Create PR from `feature/cost-optimization` to `release/x.y.z`
   - All CI tests must pass
   - Code review required

3. **Release Preparation**
   ```bash
   # Create release branch from main
   ./scripts/create-release-branch.sh 1.0.1
   ```

4. **Production Deployment**
   - Merge `release/x.y.z` to `main`
   - Automatic production deployment triggered
   - Release tag and GitHub release created

#### Environments
- **Development**: Auto-deployed from `dev` branch
- **Production**: Deployed from `main` branch merges

### Commit Message Format

Follow Angular commit convention (strict):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

**Scopes:** `cost`, `monitoring`, `optimization`, `budget`, `analytics`, `free-tier`

**Subject rules:** imperative, lower-case start, max 50 chars, no trailing period

**Body rules:** explain what and why, not how. Lines ≤ 72 chars

**Footer:** reference issues, breaking changes, release notes

#### Examples
```
feat(cost): add free tier monitoring dashboard

- Implement real-time AWS free tier usage tracking
- Add cost optimization suggestions engine
- Create budget alert configuration
- Generate monthly cost reports

Closes #123
```

```
fix(cost): resolve free tier calculation error

- Fix EC2 hours calculation in free tier tracker
- Update S3 storage counting logic
- Add error handling for missing metrics

Fixes #124
```

## 📋 Version Management

### Semantic Versioning (SemVer)

Follow strict semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** (x.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.x.0): New features, backward-compatible functionality
- **PATCH** (0.0.x): Bug fixes, backward-compatible patches

### Version File Consistency

**CRITICAL**: All version files MUST be updated together:

1. **package.json** - Node.js client version
2. **pyproject.toml** - Python tool version
3. **CHANGELOG.md** - Version history with dates

### Version Update Workflow

```bash
# 1. Determine version type (patch/minor/major)
# 2. Update all version files
# 3. Update CHANGELOG.md with new version section
# 4. Commit with conventional commit
git add package.json pyproject.toml CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z"

# 5. Create annotated git tag
git tag -a vX.Y.Z -m "Release vX.Y.Z - [brief description]"

# 6. Push commit and tag
git push origin main
git push origin vX.Y.Z
```

### CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New cost monitoring features
- Free tier optimization suggestions

### Changed
- Updated cost calculation algorithms
- Improved budget alert accuracy

### Fixed
- Fixed free tier calculation error
- Resolved budget alert false positives

## [1.0.0] - 2026-02-17

### Added
- Initial cost monitoring implementation
- Free tier tracking dashboard
- Budget alert system
- Cost optimization engine
```

### Pre-release Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Linting and type checking passing
- [ ] Security audit passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with version and date
- [ ] All version files updated consistently
- [ ] Breaking changes documented

## 🎯 Next Steps

1. Set up cost monitoring scripts
2. Configure budget alerts
3. Analyze current spending patterns
4. Implement optimization suggestions
5. Track free tier usage
6. Generate regular cost reports
7. Follow trunk-based development workflow
8. Maintain semantic versioning consistency

All cost monitoring patterns are designed for **zero-cost development** while providing **production-ready cost management** practices for certification studies and real-world applications, following the Forge project's established development standards.
