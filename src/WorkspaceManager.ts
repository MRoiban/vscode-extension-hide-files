import * as vscode from 'vscode';

class WorkspaceManager {
  private static _instance: WorkspaceManager;

  private constructor() {}

  public static getInstance(): WorkspaceManager {
    if (!WorkspaceManager._instance) {
      WorkspaceManager._instance = new WorkspaceManager();
    }
    return WorkspaceManager._instance;
  }

  public getRootPath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
    return undefined;
  }

  public getWorkspaceConfig(section: string): vscode.WorkspaceConfiguration {
      const rootUri = this.getRootPath() ? vscode.Uri.file(this.getRootPath()!) : undefined;
      return vscode.workspace.getConfiguration(section, rootUri);
  }

  public async updateWorkspaceConfig(section: string, value: any, target?: vscode.ConfigurationTarget) {
      const config = this.getWorkspaceConfig('files');
      // Use Workspace target if available, otherwise Global
      const actualTarget = target ?? (vscode.workspace.workspaceFolders 
        ? vscode.ConfigurationTarget.Workspace 
        : vscode.ConfigurationTarget.Global);
      return config.update(section, value, actualTarget);
  }
}

export const workspaceManager = WorkspaceManager.getInstance(); 