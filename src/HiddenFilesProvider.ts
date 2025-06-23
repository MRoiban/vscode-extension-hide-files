import * as vscode from 'vscode';
import { configManager } from './ConfigManager';

export class HiddenFilesProvider implements vscode.TreeDataProvider<FileTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileTreeItem | undefined | null | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<FileTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {
    configManager.onDidChangeHiddenFiles(() => this.refresh());
  }

  getTreeItem(element: FileTreeItem): FileTreeItem {
    return element;
  }

  getChildren(element?: FileTreeItem): vscode.ProviderResult<FileTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const hiddenFiles = configManager.getSavedHiddenFiles();
    return Promise.resolve(
      hiddenFiles.map(file => new FileTreeItem(file))
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class FileTreeItem extends vscode.TreeItem {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Click to show this file again`;
    this.command = {
      command: 'hide-files.show',
      title: 'Show File',
      arguments: [this.label],
    };
    this.iconPath = new vscode.ThemeIcon('eye-closed');
  }
}
