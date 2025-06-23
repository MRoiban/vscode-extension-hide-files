import * as vscode from 'vscode';
import * as path from 'path';
import { workspaceManager } from './WorkspaceManager';

export async function getHiddenFilePatterns(): Promise<string[]> {
  const rootPath = workspaceManager.getRootPath();
  if (!rootPath) {
    return [];
  }

  try {
    const hiddenFilePath = vscode.Uri.file(path.join(rootPath, '.hidden'));
    const contentBytes = await vscode.workspace.fs.readFile(hiddenFilePath);
    const content = Buffer.from(contentBytes).toString('utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  } catch (error) {
    return [];
  }
} 