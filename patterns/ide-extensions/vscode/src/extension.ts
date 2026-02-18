import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('forgePatterns.listPatterns', listPatterns),
    vscode.commands.registerCommand('forgePatterns.applyPattern', applyPattern),
    vscode.commands.registerCommand('forgePatterns.validateCompliance', validateCompliance)
  );
}

async function listPatterns(): Promise<void> {
  // TODO: Fetch patterns from local forge-patterns repo or bundled index
  const patterns = [
    'go/web-service',
    'go/cli-app',
    'rust/web-service',
    'rust/cli-app',
    'rust/library',
    'java/spring-boot-web',
    'java/cli-app',
    'java/library',
    'ai/ml-project',
    'ai/deep-learning',
    'ai/ai-api'
  ];

  const selected = await vscode.window.showQuickPick(patterns, {
    placeHolder: 'Select a pattern to view'
  });

  if (selected) {
    vscode.window.showInformationMessage(`Pattern selected: ${selected}`);
  }
}

async function applyPattern(): Promise<void> {
  // TODO: Scaffold selected pattern into the current workspace
  vscode.window.showInformationMessage(
    'Apply Pattern: Coming soon. Use the CLI (npx forge-patterns apply <pattern>) in the meantime.'
  );
}

async function validateCompliance(): Promise<void> {
  // TODO: Run pattern compliance checks against the current workspace
  vscode.window.showInformationMessage(
    'Validate Compliance: Coming soon. Use the CLI (npx forge-patterns validate) in the meantime.'
  );
}

export function deactivate(): void {}
