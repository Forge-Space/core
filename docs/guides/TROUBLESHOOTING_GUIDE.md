# Troubleshooting Guide

## Overview

This guide provides solutions to common issues you might encounter when using
UIForge Patterns. It covers integration problems, CLI tool issues, feature
toggle problems, and general troubleshooting steps.

## Quick Diagnosis

### Step 1: Run Validation Tests

```bash
# Check if your integration is working
npm run validate

# Run comprehensive validation tests
node test/feature-toggle-validation.js

# Run cross-project integration tests
node test/cross-project-integration.js
```

### Step 2: Check Environment

```bash
# Check Node.js version
node --version  # Should be 16+

# Check if you're in the right directory
ls package.json  # Should exist

# Check if forge-features CLI is executable
./scripts/forge-features help
```

## Integration Issues

### Problem: Integration Script Fails

**Symptoms:**

- Integration script exits with error
- Files not copied to project
- Package.json not updated

**Solutions:**

1. **Check Project Structure**

   ```bash
   # Ensure you're in project root
   pwd
   ls package.json  # Should exist

   # If package.json doesn't exist, create it
   npm init -y
   ```

2. **Check Permissions**

   ```bash
   # Ensure script is executable
   chmod +x scripts/forge-features

   # Check write permissions
   ls -la patterns/
   ```

3. **Run Integration Manually**
   ```bash
   # Use local script instead of npx
   node /path/to/forge-patterns/scripts/integrate.js integrate --project=your-project
   ```

### Problem: ESLint Errors After Integration

**Symptoms:**

- Linting errors appear after integration
- Code formatting issues

**Solutions:**

1. **Run Lint Fix**

   ```bash
   npm run lint
   ```

2. **Check Configuration**

   ```bash
   # Verify ESLint config exists
   cat .eslintrc.js

   # Check for syntax errors
   node -c .eslintrc.js
   ```

3. **Update Dependencies**
   ```bash
   npm install
   npm run lint
   ```

### Problem: TypeScript Compilation Errors

**Symptoms:**

- TypeScript errors after integration
- Type definitions missing

**Solutions:**

1. **Check TypeScript Config**

   ```bash
   # Verify tsconfig.json exists
   cat tsconfig.json

   # Check for syntax errors
   npx tsc --noEmit
   ```

2. **Install Type Definitions**
   ```bash
   npm install --save-dev @types/node @types/express
   ```

## CLI Tool Issues

### Problem: forge-features Command Not Found

**Symptoms:**

- Command not found error
- Permission denied

**Solutions:**

1. **Check File Existence**

   ```bash
   ls -la scripts/forge-features
   ```

2. **Make Executable**

   ```bash
   chmod +x scripts/forge-features
   ```

3. **Test Directly**
   ```bash
   ./scripts/forge-features help
   ```

### Problem: CLI Help Command Fails

**Symptoms:**

- Help command exits with error
- No output or error message

**Solutions:**

1. **Check Script Syntax**

   ```bash
   bash -n scripts/forge-features
   ```

2. **Test with Bash Explicitly**

   ```bash
   bash scripts/forge-features help
   ```

3. **Check for Special Characters**

   ```bash
   # Check file encoding
   file scripts/forge-features

   # Convert to Unix line endings if needed
   dos2unix scripts/forge-features
   ```

### Problem: Feature Enable/Disable Commands Fail

**Symptoms:**

- Commands fail with connection errors
- Unable to connect to Unleash server

**Solutions:**

1. **Check Unleash Server**

   ```bash
   # Test connectivity
   curl $UNLEASH_URL/api/health

   # Check environment variables
   echo $UNLEASH_URL
   echo $UNLEASH_CLIENT_KEY
   ```

2. **Set Environment Variables**

   ```bash
   export UNLEASH_URL=http://localhost:4242
   export UNLEASH_CLIENT_KEY=default:development
   ```

3. **Use Test Mode**
   ```bash
   # For testing without Unleash server
   export UNLEASH_URL=http://localhost:4242
   export UNLEASH_CLIENT_KEY=default:development
   ```

## Feature Toggle Issues

### Problem: Feature Toggle Library Not Working

**Symptoms:**

- Library import errors
- unleash-client-node not found

**Solutions:**

1. **Install Dependencies**

   ```bash
   npm install unleash-client-node
   ```

2. **Check Library Path**

   ```bash
   # Verify library exists
   ls patterns/feature-toggles/libraries/nodejs/index.js

   # Check syntax
   node -c patterns/feature-toggles/libraries/nodejs/index.js
   ```

3. **Test Library Import**
   ```bash
   node -e "require('./patterns/feature-toggles/libraries/nodejs/index.js')"
   ```

### Problem: Configuration File Not Found

**Symptoms:**

- Configuration file missing
- YAML parsing errors

**Solutions:**

1. **Check Configuration Path**

   ```bash
   # Verify config exists
   ls patterns/feature-toggles/config/centralized-config.yml

   # Check YAML syntax
   python -c "import yaml; yaml.safe_load(open('patterns/feature-toggles/config/centralized-config.yml'))"
   ```

2. **Create Default Configuration**
   ```bash
   # Copy from patterns if missing
   cp /path/to/forge-patterns/patterns/feature-toggles/config/centralized-config.yml \
     patterns/feature-toggles/config/
   ```

### Problem: Feature Status Not Updating

**Symptoms:**

- Feature status doesn't change
- Stale feature values

**Solutions:**

1. **Check Unleash Connection**

   ```bash
   # Test API connectivity
   curl -H "Authorization: $UNLEASH_CLIENT_KEY" \
        "$UNLEASH_URL/api/admin/features"
   ```

2. **Clear Cache**

   ```bash
   # Restart application to clear cache
   npm start
   ```

3. **Check Feature Names**
   ```bash
   # Verify feature names match configuration
   ./scripts/forge-features list
   ```

## Performance Issues

### Problem: Slow Integration

**Symptoms:**

- Integration takes longer than expected
- Performance degradation

**Solutions:**

1. **Run Performance Benchmark**

   ```bash
   node test/performance-benchmark.js
   ```

2. **Check System Resources**

   ```bash
   # Check memory usage
   free -h

   # Check disk space
   df -h
   ```

3. **Optimize Integration**
   ```bash
   # Use local script instead of npx
   node /path/to/forge-patterns/scripts/integrate.js integrate
   ```

### Problem: High Memory Usage

**Symptoms:**

- Memory usage increases over time
- Application crashes

**Solutions:**

1. **Monitor Memory Usage**

   ```bash
   # Check Node.js memory
   node --max-old-space-size=4096 your-app.js
   ```

2. **Check for Memory Leaks**

   ```bash
   # Use Node.js debugging
   node --inspect your-app.js
   ```

3. **Optimize Feature Toggle Usage**

   ```javascript
   // Cache feature status
   const featureCache = new Map();

   function isFeatureEnabled(featureName) {
     if (!featureCache.has(featureName)) {
       featureCache.set(featureName, features.isEnabled(featureName));
     }
     return featureCache.get(featureName);
   }
   ```

## Environment Issues

### Problem: Environment Variables Not Set

**Symptoms:**

- Undefined environment variables
- Configuration errors

**Solutions:**

1. **Check Environment Variables**

   ```bash
   # List all environment variables
   env | grep -E "(UNLEASH|NODE_ENV|DEBUG)"
   ```

2. **Set Environment Variables**

   ```bash
   # For current session
   export UNLEASH_URL=http://localhost:4242
   export UNLEASH_CLIENT_KEY=default:development
   export NODE_ENV=development

   # For permanent configuration
   echo 'export UNLEASH_URL=http://localhost:4242' >> ~/.bashrc
   ```

3. **Create .env File**

   ```bash
   # Create .env file
   cat > .env << EOF
   UNLEASH_URL=http://localhost:4242
   UNLEASH_CLIENT_KEY=default:development
   NODE_ENV=development
   DEBUG=true
   EOF

   # Load .env file
   source .env
   ```

### Problem: Network Connectivity Issues

**Symptoms:**

- Cannot connect to Unleash server
- Timeout errors

**Solutions:**

1. **Test Network Connectivity**

   ```bash
   # Test basic connectivity
   ping google.com

   # Test Unleash server
   curl -I $UNLEASH_URL
   ```

2. **Check Firewall Settings**

   ```bash
   # Check if port is blocked
   telnet $UNLEASH_HOST 4242
   ```

3. **Use Proxy Settings**
   ```bash
   # Set proxy if needed
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

## Development Workflow Issues

### Problem: Git Hooks Not Working

**Symptoms:**

- Pre-commit hooks not running
- Hooks failing silently

**Solutions:**

1. **Check Git Hooks**

   ```bash
   # List hooks
   ls -la .git/hooks/

   # Check hook permissions
   chmod +x .git/hooks/pre-commit
   ```

2. **Test Hooks Manually**

   ```bash
   # Run pre-commit hook manually
   .git/hooks/pre-commit
   ```

3. **Reinstall Hooks**
   ```bash
   # Reinstall husky hooks
   npm run prepare
   ```

### Problem: CI/CD Pipeline Failures

**Symptoms:**

- Build failures in CI
- Test failures in pipeline

**Solutions:**

1. **Check CI Configuration**

   ```bash
   # Verify workflow files
   cat .github/workflows/ci.yml
   ```

2. **Run Tests Locally**

   ```bash
   # Run same tests as CI
   npm run test
   npm run lint
   npm run validate
   ```

3. **Check Node Version**
   ```bash
   # Ensure correct Node.js version
   nvm use 18
   node --version
   ```

## Getting Help

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=true
./scripts/forge-features list --verbose
```

### Log Files

Check application logs for detailed error information:

```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# System logs
journalctl -u your-app
```

### Community Support

1. **GitHub Issues**:
   [Create an issue](https://github.com/uiforge/forge-patterns/issues)
2. **Documentation**: [UIForge Patterns Docs](../README.md)
3. **Architecture**: [Architecture Decisions](../architecture-decisions/)

### Reporting Issues

When reporting issues, include:

1. **Environment Information**

   ```bash
   node --version
   npm --version
   uname -a
   ```

2. **Error Messages**
   - Full error output
   - Stack traces
   - Command used

3. **Configuration**
   - Relevant configuration files
   - Environment variables (sanitized)
   - Project structure

4. **Steps to Reproduce**
   - Exact commands used
   - Expected vs actual behavior

## Prevention Tips

### Regular Maintenance

1. **Update Dependencies**

   ```bash
   npm update
   npm audit fix
   ```

2. **Run Validation Tests**

   ```bash
   npm run validate
   node test/feature-toggle-validation.js
   ```

3. **Check Performance**
   ```bash
   node test/performance-benchmark.js
   ```

### Best Practices

1. **Always run validation after integration**
2. **Test in development before production**
3. **Keep dependencies updated**
4. **Monitor performance regularly**
5. **Document custom configurations**

### Backup and Recovery

1. **Backup Configuration**

   ```bash
   cp patterns/feature-toggles/config/centralized-config.yml backup/
   ```

2. **Version Control**

   ```bash
   git add .
   git commit -m "Backup before major changes"
   ```

3. **Rollback Plan**
   ```bash
   # Rollback to previous version
   git checkout HEAD~1
   npm install
   ```

This troubleshooting guide should help you resolve most common issues with
UIForge Patterns. For additional help, don't hesitate to reach out to the
community through GitHub issues.
