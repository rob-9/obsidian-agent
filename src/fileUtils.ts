import { App, Notice, TFile } from 'obsidian';

export class FileUtils {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async createAndWriteFile(fileName: string, content: string, folderPath?: string): Promise<TFile> {
		try {
			const vault = this.app.vault;
			const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
			
			// Ensure the file has a .md extension if it doesn't already
			const finalPath = fullPath.endsWith('.md') ? fullPath : `${fullPath}.md`;
			
			// Create the file
			const file = await vault.create(finalPath, content);
			
			new Notice(`Created file: ${finalPath}`);
			return file;
		} catch (error) {
			console.error('Error creating file:', error);
			new Notice(`Error creating file: ${error.message}`);
			throw error;
		}
	}

	async updateFile(file: TFile, content: string): Promise<void> {
		try {
			await this.app.vault.modify(file, content);
			new Notice(`Updated file: ${file.name}`);
		} catch (error) {
			console.error('Error updating file:', error);
			new Notice(`Error updating file: ${error.message}`);
			throw error;
		}
	}

	async appendToFile(file: TFile, content: string): Promise<void> {
		try {
			const existingContent = await this.app.vault.read(file);
			const newContent = existingContent + '\n' + content;
			await this.app.vault.modify(file, newContent);
			new Notice(`Appended to file: ${file.name}`);
		} catch (error) {
			console.error('Error appending to file:', error);
			new Notice(`Error appending to file: ${error.message}`);
			throw error;
		}
	}

	async createFolder(folderPath: string): Promise<void> {
		try {
			await this.app.vault.createFolder(folderPath);
			new Notice(`Created folder: ${folderPath}`);
		} catch (error) {
			if (!error.message.includes('already exists')) {
				console.error('Error creating folder:', error);
				new Notice(`Error creating folder: ${error.message}`);
				throw error;
			}
		}
	}

	async fileExists(path: string): Promise<boolean> {
		const file = this.app.vault.getAbstractFileByPath(path);
		return file !== null;
	}

	async readFile(path: string): Promise<string> {
		try {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (file instanceof TFile) {
				return await this.app.vault.read(file);
			}
			throw new Error('File not found');
		} catch (error) {
			console.error('Error reading file:', error);
			throw error;
		}
	}
}