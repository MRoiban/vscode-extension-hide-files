import * as vscode from 'vscode';
import { workspaceManager } from './WorkspaceManager';
import { getHiddenFilePatterns } from './hiddenFile';

class ConfigManager {
  private _onDidChangeHiddenFiles: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeHiddenFiles: vscode.Event<void> = this._onDidChangeHiddenFiles.event;

  private static _instance: ConfigManager;
  private readonly FILES_EXCLUDE_SECTION = 'exclude';
  private readonly HIDE_FILES_SECTION = 'hide-files';

  private constructor() {
    // Listen for configuration changes to handle external modifications
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.HIDE_FILES_SECTION)) {
        this.updateFilesExclude();
        this._onDidChangeHiddenFiles.fire();
      }
    });
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager._instance) {
      ConfigManager._instance = new ConfigManager();
    }
    return ConfigManager._instance;
  }

  public getSavedHiddenFiles(): string[] {
    const config = workspaceManager.getWorkspaceConfig(this.HIDE_FILES_SECTION);
    const files = config.get<string[]>('files') || [];
    console.log('getSavedHiddenFiles:', files);
    return files;
  }

  public async saveHiddenFiles(files: string[]): Promise<void> {
    console.log('saveHiddenFiles: saving files:', files);
    const config = workspaceManager.getWorkspaceConfig(this.HIDE_FILES_SECTION);
    // Use Workspace target if available, otherwise Global
    const target = vscode.workspace.workspaceFolders 
      ? vscode.ConfigurationTarget.Workspace 
      : vscode.ConfigurationTarget.Global;
    await config.update('files', files, target);
    console.log('saveHiddenFiles: files saved with target:', target);
  }
  
  public async updateFilesExclude(): Promise<void> {
    const hiddenBySettings = this.getSavedHiddenFiles();
    const hiddenByFile = await getHiddenFilePatterns();
    const allHiddenFiles = [...new Set([...hiddenBySettings, ...hiddenByFile])];

    const filesConfig = workspaceManager.getWorkspaceConfig('files');
    const defaultExclude = filesConfig.inspect<Record<string, boolean>>(this.FILES_EXCLUDE_SECTION)?.defaultValue || {};

    const newExclude: Record<string, boolean> = { ...defaultExclude };
    for (const file of allHiddenFiles) {
      newExclude[file] = true;
    }
    
    await workspaceManager.updateWorkspaceConfig(this.FILES_EXCLUDE_SECTION, newExclude);
  }

  public async addFileToHidden(filePath: string): Promise<void> {
    const files = this.getSavedHiddenFiles();
    if (!files.includes(filePath)) {
      files.push(filePath);
      await this.saveHiddenFiles(files);
      await this.updateFilesExclude();
      this._onDidChangeHiddenFiles.fire();
    }
  }

  public async removeFileFromHidden(filePath: string): Promise<void> {
    let files = this.getSavedHiddenFiles();
    files = files.filter(f => f !== filePath);
    await this.saveHiddenFiles(files);
    await this.updateFilesExclude();
    this._onDidChangeHiddenFiles.fire();
  }
}

export const configManager = ConfigManager.getInstance(); 