import * as vscode from 'vscode';
import * as path from 'path';
import { configManager } from './ConfigManager';
import { hiddenFilesProvider } from './extension';
import { workspaceManager } from './WorkspaceManager';

export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('hide-files.hide', handleHide),
    vscode.commands.registerCommand('hide-files.show', handleShow),
    vscode.commands.registerCommand('hide-files.refresh', handleRefresh)
  );
}

async function handleHide(uri: vscode.Uri, uris: vscode.Uri[]): Promise<void> {
  console.log('handleHide called with:', { uri, uris });
  
  const rootPath = workspaceManager.getRootPath();
  if (!rootPath) {
    vscode.window.showErrorMessage('No workspace folder found.');
    return;
  }

  const filesToHide = (uris || [uri])
    .filter(u => u && u.fsPath)
    .map(u => {
      const relativePath = path.relative(rootPath, u.fsPath);
      console.log('Hiding file:', relativePath, 'from:', u.fsPath);
      return relativePath;
    });

  console.log('Files to hide:', filesToHide);

  for (const file of filesToHide) {
    await configManager.addFileToHidden(file);
  }
  
  vscode.window.showInformationMessage(`Hidden ${filesToHide.length} file(s)`);
}

async function handleShow(fileRelativePath: string): Promise<void> {
  await configManager.removeFileFromHidden(fileRelativePath);
}

function handleRefresh(): void {
  hiddenFilesProvider.refresh();
  vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
}
