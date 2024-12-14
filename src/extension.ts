import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated.");
  const fileDecorationProvider = new FileDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(fileDecorationProvider)
  );
  
  // Refresh decorations immediately on activation
  fileDecorationProvider.refresh();

  // Register the scan command (manual trigger)
  const disposable = vscode.commands.registerCommand(
    'clientServerDifferentiator.scanFiles',
    async () => {
      console.log("Scan command executed.");
      await fileDecorationProvider.refresh();
      vscode.window.showInformationMessage("Scan complete: Files in src folders tagged as 'C' for Client Side Component and 'S' for Server Side Component.");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

class FileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

  private srcFiles: vscode.Uri[] = [];
  private cache: Map<string, boolean> = new Map();

  constructor() {
    this.findSrcFiles();

    // Listen for changes in text documents
    vscode.workspace.onDidSaveTextDocument((document) => {
		const savedUri = document.uri;
	  
		// Check if the saved file is in srcFiles
		const isTargetedFile = this.srcFiles.some(
		  (file) => path.normalize(file.fsPath).toLowerCase() === path.normalize(savedUri.fsPath).toLowerCase()
		);
	  
		if (isTargetedFile) {
		  console.log(`File saved: ${savedUri.fsPath}`);
		  this.cache.delete(savedUri.fsPath); // Clear cache for the saved file
		  this._onDidChangeFileDecorations.fire(savedUri); // Refresh decoration
		}
	  });
	  

    // Listen for newly created files
    vscode.workspace.onDidCreateFiles((event) => {
      event.files.forEach((file) => {
        console.log(`File added: ${file.fsPath}`);
        this.cache.delete(file.fsPath);
        this._onDidChangeFileDecorations.fire(file); // Trigger decoration for the new file
      });

      // Refresh if a new next.config.js/mjs is detected
      if (event.files.some((file) => file.fsPath.endsWith('next.config.js') || file.fsPath.endsWith('next.config.mjs'))) {
        console.log("New next.config.js/mjs detected. Refreshing src files...");
        this.refresh(); // Re-scan src folders
      }
    });

    // Listen for deleted files
    vscode.workspace.onDidDeleteFiles((event) => {
      event.files.forEach((file) => {
        console.log(`File deleted: ${file.fsPath}`);
        this.cache.delete(file.fsPath);
      });

      // Refresh if a next.config.js/mjs is deleted
      if (event.files.some((file) => file.fsPath.endsWith('next.config.js') || file.fsPath.endsWith('next.config.mjs'))) {
        console.log("Deleted next.config.js/mjs detected. Refreshing src files...");
        this.refresh(); // Re-scan src folders
      }
    });

    // Listen for workspace folder changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      console.log("Workspace folders changed. Refreshing src files...");
      this.refresh();
    });
  }

  async provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration | undefined> {
    // Only handle files that exist in the `this.srcFiles` list
    const normalizedUriPath = path.normalize(uri.fsPath).toLowerCase();
    const isTargetedFile = this.srcFiles.some(
      (file) => path.normalize(file.fsPath).toLowerCase() === normalizedUriPath
    );

    if (!isTargetedFile) {
      // Skip files or folders not in `srcFiles`
      console.log(`${uri.fsPath} is not a targeted file.`);
      return;
    }

    console.log(`Decorating file: ${uri.fsPath}`);

    // Check cache for precomputed status
    let isClient: boolean | undefined = this.cache.get(uri.fsPath);

    if (isClient === undefined) {
      try {
        const document = await vscode.workspace.openTextDocument(uri);
        const text = document.getText();
        isClient = /['"]use client['"]/.test(text); // Check for "use client"
        this.cache.set(uri.fsPath, isClient);
        console.log(`${uri.fsPath} is ${isClient ? "Client-Side" : "Server-Side"}`);
      } catch (error) {
        console.error(`Error reading file: ${uri.fsPath}`, error);
      }
    }

    // Apply decorations based on the content
    return {
      badge: isClient ? 'C' : 'S', // C for Client-Side, S for Server-Side
      tooltip: isClient ? 'Client Side Component' : 'Server Side Component',
      color: isClient
        ? new vscode.ThemeColor('charts.orange') // Orange for CSC
        : new vscode.ThemeColor('charts.blue')  // Blue for SSC
    };
  }

  async refresh(): Promise<void> {
    console.log("Refreshing decorations...");
    this.cache.clear();
    await this.findSrcFiles();
    this._onDidChangeFileDecorations.fire(undefined); // Refresh decorations for all files
    console.log("File decoration event fired for all files.");
  }

  private async findSrcFiles(): Promise<void> {
    console.log("Scanning for next.config.js/mjs...");

	// Find all next.config.js/mjs files
	const nextConfigFiles = await vscode.workspace.findFiles('**/next.config.{js,mjs}', '**/node_modules/**');
	console.log("Found next.config.js/mjs files:", nextConfigFiles.map((file) => file.fsPath));
  
	// Find sibling src folders for each next.config.js/mjs
	const srcFolders: vscode.Uri[] = [];
	for (const nextConfig of nextConfigFiles) {
	  const configDir = path.dirname(nextConfig.fsPath); // Directory containing next.config.js/mjs
	  const potentialSrcFolder = vscode.Uri.file(path.join(configDir, 'src'));
	  
	  try {
		const stat = await vscode.workspace.fs.stat(potentialSrcFolder);
		if (stat.type === vscode.FileType.Directory) {
		  srcFolders.push(potentialSrcFolder);
		  console.log(`Found valid src folder: ${potentialSrcFolder.fsPath}`);
		}
	  } catch (error) {
		console.log(`No src folder found for ${configDir}`);
	  }
	}
  
	// Update srcFiles by scanning files under valid src folders
	const srcFiles = await Promise.all(
	  srcFolders.map((srcFolder) =>
		vscode.workspace.findFiles(
		  new vscode.RelativePattern(srcFolder, '**/*.{tsx,jsx,ts,js}'),
		  '**/node_modules/**'
		)
	  )
	);
  
	// Flatten srcFiles and update
	this.srcFiles = srcFiles.flat();
	console.log("Src files updated:", this.srcFiles.map((f) => f.fsPath));
  }
}
