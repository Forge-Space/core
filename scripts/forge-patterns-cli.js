#!/usr/bin/env node

/**
 * forge-patterns CLI
 *
 * Command-line tool for discovering, listing, and applying patterns
 * from the UIForge Patterns library.
 *
 * Usage:
 *   forge-patterns list
 *   forge-patterns info <pattern>
 *   forge-patterns apply <pattern> [--target <dir>]
 *   forge-patterns validate [--target <dir>]
 *   forge-patterns search <query>
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PATTERNS_DIR = path.join(__dirname, '..', 'patterns');

const program = new Command();

program
  .name('forge-patterns')
  .description('UIForge Patterns CLI — discover, apply, and validate patterns')
  .version('1.1.0');

// ─── list ────────────────────────────────────────────────────────────────────

program
  .command('list')
  .description('List all available patterns')
  .option('--category <category>', 'Filter by category (ai, cloud-native, docker, etc.)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const patterns = await discoverPatterns(options.category);

    if (options.json) {
      console.log(JSON.stringify(patterns, null, 2));
      return;
    }

    console.log(chalk.bold.cyan('\n📦 Available Patterns\n'));

    const grouped = groupByCategory(patterns);
    for (const [category, items] of Object.entries(grouped)) {
      console.log(chalk.bold.yellow(`  ${category}/`));
      for (const item of items) {
        console.log(chalk.gray('    ├── ') + chalk.white(item.name) + chalk.gray(` — ${item.description}`));
      }
      console.log();
    }

    console.log(chalk.gray(`Total: ${patterns.length} patterns\n`));
  });

// ─── info ─────────────────────────────────────────────────────────────────────

program
  .command('info <pattern>')
  .description('Show details about a specific pattern')
  .action(async (patternPath) => {
    const fullPath = path.join(PATTERNS_DIR, patternPath, 'README.md');

    if (!await fs.pathExists(fullPath)) {
      console.error(chalk.red(`\n❌ Pattern not found: ${patternPath}`));
      console.log(chalk.gray('Run `forge-patterns list` to see available patterns.\n'));
      process.exit(1);
    }

    const readme = await fs.readFile(fullPath, 'utf8');
    const title = readme.match(/^# (.+)/m)?.[1] || patternPath;
    const description = readme.match(/^[^#\n].+/m)?.[0] || 'No description available.';

    console.log(chalk.bold.cyan(`\n📋 ${title}`));
    console.log(chalk.gray(`Path: patterns/${patternPath}`));
    console.log(chalk.white(`\n${description}\n`));
    console.log(chalk.gray(`Full docs: patterns/${patternPath}/README.md\n`));
  });

// ─── search ───────────────────────────────────────────────────────────────────

program
  .command('search <query>')
  .description('Search patterns by name or description')
  .action(async (query) => {
    const patterns = await discoverPatterns();
    const q = query.toLowerCase();
    const matches = patterns.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      console.log(chalk.yellow(`\n⚠️  No patterns found matching "${query}"\n`));
      return;
    }

    console.log(chalk.bold.cyan(`\n🔍 Search results for "${query}"\n`));
    for (const p of matches) {
      console.log(`  ${chalk.bold.white(p.category + '/' + p.name)}`);
      console.log(chalk.gray(`    ${p.description}\n`));
    }
  });

// ─── apply ────────────────────────────────────────────────────────────────────

program
  .command('apply <pattern>')
  .description('Copy a pattern into your project')
  .option('--target <dir>', 'Target directory', process.cwd())
  .option('--dry-run', 'Preview what would be copied without making changes')
  .action(async (patternPath, options) => {
    const sourcePath = path.join(PATTERNS_DIR, patternPath);

    if (!await fs.pathExists(sourcePath)) {
      console.error(chalk.red(`\n❌ Pattern not found: ${patternPath}`));
      console.log(chalk.gray('Run `forge-patterns list` to see available patterns.\n'));
      process.exit(1);
    }

    const targetPath = path.join(options.target, 'patterns', patternPath);
    const files = await getFilesRecursive(sourcePath);

    console.log(chalk.bold.cyan(`\n🚀 Applying pattern: ${patternPath}\n`));
    console.log(chalk.gray(`  Source: ${sourcePath}`));
    console.log(chalk.gray(`  Target: ${targetPath}\n`));

    for (const file of files) {
      const relative = path.relative(sourcePath, file);
      const dest = path.join(targetPath, relative);
      if (options.dryRun) {
        console.log(chalk.gray('  [dry-run] ') + chalk.white(`→ ${path.join('patterns', patternPath, relative)}`));
      } else {
        await fs.ensureDir(path.dirname(dest));
        await fs.copy(file, dest, { overwrite: false });
        console.log(chalk.green('  ✓ ') + chalk.white(path.join('patterns', patternPath, relative)));
      }
    }

    if (options.dryRun) {
      console.log(chalk.yellow('\n  [dry-run] No files were written.\n'));
    } else {
      console.log(chalk.bold.green('\n✅ Pattern applied successfully!\n'));
      console.log(chalk.gray(`  Review the README at: patterns/${patternPath}/README.md\n`));
    }
  });

// ─── validate ─────────────────────────────────────────────────────────────────

program
  .command('validate')
  .description('Validate patterns in the current project against BR-001 to BR-005')
  .option('--target <dir>', 'Target directory', process.cwd())
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🔍 Validating patterns...\n'));

    const checks = [
      await checkNoSecrets(options.target),
      await checkDocumentation(options.target),
      await checkVersioning(options.target)
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      if (check.passed) {
        console.log(chalk.green(`  ✅ ${check.rule}: ${check.message}`));
        passed++;
      } else {
        console.log(chalk.red(`  ❌ ${check.rule}: ${check.message}`));
        if (check.details) {
          for (const d of check.details) {
            console.log(chalk.gray(`     • ${d}`));
          }
        }
        failed++;
      }
    }

    console.log(chalk.bold(`\n  Passed: ${passed} | Failed: ${failed}\n`));

    if (failed > 0) {
      process.exit(1);
    }
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function discoverPatterns(categoryFilter) {
  const patterns = [];

  if (!await fs.pathExists(PATTERNS_DIR)) {
    return patterns;
  }

  const categories = await fs.readdir(PATTERNS_DIR);

  for (const category of categories) {
    if (categoryFilter && category !== categoryFilter) continue;

    const categoryPath = path.join(PATTERNS_DIR, category);
    const stat = await fs.stat(categoryPath);
    if (!stat.isDirectory()) continue;

    const readmePath = path.join(categoryPath, 'README.md');
    let description = '';

    if (await fs.pathExists(readmePath)) {
      const content = await fs.readFile(readmePath, 'utf8');
      description = content.match(/^[^#\n].+/m)?.[0]?.trim() || '';
    }

    patterns.push({
      category,
      name: category,
      path: category,
      description: description.slice(0, 80) + (description.length > 80 ? '…' : '')
    });

    // Also discover sub-patterns
    const entries = await fs.readdir(categoryPath);
    for (const entry of entries) {
      const entryPath = path.join(categoryPath, entry);
      const entryStat = await fs.stat(entryPath);
      if (!entryStat.isDirectory()) continue;

      const subReadme = path.join(entryPath, 'README.md');
      let subDesc = '';
      if (await fs.pathExists(subReadme)) {
        const content = await fs.readFile(subReadme, 'utf8');
        subDesc = content.match(/^[^#\n].+/m)?.[0]?.trim() || '';
      }

      patterns.push({
        category,
        name: entry,
        path: `${category}/${entry}`,
        description: subDesc.slice(0, 80) + (subDesc.length > 80 ? '…' : '')
      });
    }
  }

  return patterns;
}

function groupByCategory(patterns) {
  return patterns.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    if (p.name !== p.category) acc[p.category].push(p);
    return acc;
  }, {});
}

async function getFilesRecursive(dir) {
  const files = [];
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      files.push(...await getFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function checkNoSecrets(targetDir) {
  const secretPatterns = [
    /password\s*=\s*['"][^'"{{]+['"]/i,
    /api[_-]?key\s*=\s*['"][^'"{{]+['"]/i,
    /secret\s*=\s*['"][^'"{{]+['"]/i,
    /token\s*=\s*['"][^'"{{]+['"]/i
  ];

  const violations = [];
  const files = await getFilesRecursive(targetDir).catch(() => []);

  for (const file of files.slice(0, 200)) {
    if (file.includes('node_modules') || file.includes('.git')) continue;
    try {
      const content = await fs.readFile(file, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          violations.push(path.relative(targetDir, file));
          break;
        }
      }
    } catch {
      // skip binary files
    }
  }

  return {
    rule: 'BR-001 Zero-Secrets',
    passed: violations.length === 0,
    message: violations.length === 0
      ? 'No hardcoded secrets detected'
      : `${violations.length} file(s) may contain hardcoded secrets`,
    details: violations.slice(0, 5)
  };
}

async function checkDocumentation(targetDir) {
  const patternsPath = path.join(targetDir, 'patterns');
  if (!await fs.pathExists(patternsPath)) {
    return { rule: 'BR-004 Documentation', passed: true, message: 'No patterns directory found — skipped' };
  }

  const categories = await fs.readdir(patternsPath);
  const missing = [];

  for (const cat of categories) {
    const catPath = path.join(patternsPath, cat);
    const stat = await fs.stat(catPath);
    if (!stat.isDirectory()) continue;
    const readme = path.join(catPath, 'README.md');
    if (!await fs.pathExists(readme)) {
      missing.push(`patterns/${cat}/README.md`);
    }
  }

  return {
    rule: 'BR-004 Documentation',
    passed: missing.length === 0,
    message: missing.length === 0
      ? 'All pattern categories have README.md'
      : `${missing.length} pattern(s) missing README.md`,
    details: missing
  };
}

async function checkVersioning(targetDir) {
  const pkgPath = path.join(targetDir, 'package.json');
  const changelogPath = path.join(targetDir, 'CHANGELOG.md');

  const hasPkg = await fs.pathExists(pkgPath);
  const hasChangelog = await fs.pathExists(changelogPath);

  let version = null;
  if (hasPkg) {
    const pkg = await fs.readJson(pkgPath);
    ({ version } = pkg);
  }

  const semverPattern = /^\d+\.\d+\.\d+$/;
  const validVersion = version && semverPattern.test(version);

  return {
    rule: 'BR-002 Pattern Versioning',
    passed: validVersion && hasChangelog,
    message: validVersion && hasChangelog
      ? `Version ${version} with CHANGELOG.md present`
      : `Missing: ${!validVersion ? 'valid semver version' : ''} ${!hasChangelog ? 'CHANGELOG.md' : ''}`.trim()
  };
}

program.parse(process.argv);
