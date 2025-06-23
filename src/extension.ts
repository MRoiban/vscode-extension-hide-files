import * as vscode from 'vscode';
import * as path from 'path';
import { registerCommands } from './commands';
import { HiddenFilesProvider } from './HiddenFilesProvider';
import { workspaceManager } from './WorkspaceManager';
import { configManager } from './ConfigManager';

export let hiddenFilesProvider: HiddenFilesProvider;

export function activate(context: vscode.ExtensionContext) {
  hiddenFilesProvider = new HiddenFilesProvider();
  vscode.window.createTreeView('hidden-files', {
    treeDataProvider: hiddenFilesProvider,
  });

  registerCommands(context);
  configManager.updateFilesExclude();

  const rootPath = workspaceManager.getRootPath();
  if (rootPath) {
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(rootPath, '.hidden'));

    const update = () => {
        configManager.updateFilesExclude();
        hiddenFilesProvider.refresh();
    };

    watcher.onDidChange(update);
    watcher.onDidCreate(update);
    watcher.onDidDelete(update);

    context.subscriptions.push(watcher);
  }
}

export function deactivate() {}
