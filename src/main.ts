import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { FileUtils } from './fileUtils';
import { Templates } from './templates';

interface AgenticChatbotSettings {
	apiKey: string;
	model: string;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
}

const DEFAULT_SETTINGS: AgenticChatbotSettings = {
	apiKey: '',
	model: 'gpt-3.5-turbo',
	temperature: 0.7,
	maxTokens: 1000,
	systemPrompt: 'You are a helpful AI assistant integrated into Obsidian. You can help with note-taking, research, writing, and knowledge management tasks.'
}

export default class AgenticChatbotPlugin extends Plugin {
	settings: AgenticChatbotSettings;
	fileUtils: FileUtils;

	async onload() {
		await this.loadSettings();
		this.fileUtils = new FileUtils(this.app);

		// Add ribbon icon for quick access to chatbot
		this.addRibbonIcon('message-circle', 'Open Agentic Chatbot', (evt: MouseEvent) => {
			new ChatbotModal(this.app, this).open();
		});

		// Add command to open chatbot
		this.addCommand({
			id: 'open-chatbot',
			name: 'Open Agentic Chatbot',
			callback: () => {
				new ChatbotModal(this.app, this).open();
			}
		});

		// Add command to chat with current note context
		this.addCommand({
			id: 'chat-with-note',
			name: 'Chat about current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const content = editor.getValue();
				const fileName = view.file?.name || 'Current note';
				new ChatbotModal(this.app, this, { context: content, fileName }).open();
			}
		});

		// Add command to create sample file
		this.addCommand({
			id: 'create-sample-file',
			name: 'Create Sample File',
			callback: async () => {
				await this.createSampleFile();
			}
		});

		// Add command to create daily journal
		this.addCommand({
			id: 'create-daily-journal',
			name: 'Create Daily Journal',
			callback: async () => {
				await this.createDailyJournal();
			}
		});

		// Add command to create meeting notes
		this.addCommand({
			id: 'create-meeting-notes',
			name: 'Create Meeting Notes',
			callback: async () => {
				await this.createMeetingNotes();
			}
		});

		// Add command to create research notes
		this.addCommand({
			id: 'create-research-notes',
			name: 'Create Research Notes',
			callback: async () => {
				await this.createResearchNotes();
			}
		});

		// Add settings tab
		this.addSettingTab(new ChatbotSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Core agent functionality
	async sendMessage(message: string, context?: string): Promise<string> {
		if (!this.settings.apiKey) {
			throw new Error('API key not configured. Please set it in plugin settings.');
		}

		try {
			const response = await this.callLLMAPI(message, context);
			return response;
		} catch (error) {
			console.error('Error calling LLM API:', error);
			throw error;
		}
	}

	private async callLLMAPI(message: string, context?: string): Promise<string> {
		// This is a placeholder for LLM API integration
		// You would replace this with actual API calls to OpenAI, Anthropic, etc.
		
		const systemMessage = this.settings.systemPrompt;
		const contextMessage = context ? `Context from current note:\n${context}\n\nUser message: ${message}` : message;
		
		// For now, return a mock response
		// In production, implement actual API calls here
		return `Mock response to: "${message}". ${context ? 'I can see you provided context from your note.' : ''}`;
	}

	// Agent capabilities
	async analyzeNote(content: string): Promise<string> {
		const prompt = `Analyze this note and provide insights, suggestions, or improvements:\n\n${content}`;
		return await this.sendMessage(prompt);
	}

	async generateSummary(content: string): Promise<string> {
		const prompt = `Create a concise summary of this content:\n\n${content}`;
		return await this.sendMessage(prompt);
	}

	async suggestTags(content: string): Promise<string[]> {
		const prompt = `Suggest relevant tags for this content. Return only the tags, one per line:\n\n${content}`;
		const response = await this.sendMessage(prompt);
		return response.split('\n').filter(tag => tag.trim().length > 0);
	}

	async expandIdeas(content: string): Promise<string> {
		const prompt = `Expand on the ideas in this content with additional insights and connections:\n\n${content}`;
		return await this.sendMessage(prompt);
	}

	async createSampleFile(): Promise<void> {
		const currentDate = new Date().toISOString().split('T')[0];
		const fileName = `Sample Note ${currentDate}`;
		const content = Templates.getSampleNoteContent();

		try {
			await this.fileUtils.createFolder('Agent Created');
			await this.fileUtils.createAndWriteFile(fileName, content, 'Agent Created');
		} catch (error) {
			// If folder doesn't exist, create in root
			await this.fileUtils.createAndWriteFile(fileName, content);
		}
	}

	async createDailyJournal(): Promise<void> {
		const currentDate = new Date().toISOString().split('T')[0];
		const fileName = `Daily Journal ${currentDate}`;
		const content = Templates.getDailyJournalTemplate();

		try {
			await this.fileUtils.createFolder('Daily Journals');
			await this.fileUtils.createAndWriteFile(fileName, content, 'Daily Journals');
		} catch (error) {
			await this.fileUtils.createAndWriteFile(fileName, content);
		}
	}

	async createMeetingNotes(): Promise<void> {
		const currentDate = new Date().toISOString().split('T')[0];
		const fileName = `Meeting Notes ${currentDate}`;
		const content = Templates.getMeetingNotesTemplate();

		try {
			await this.fileUtils.createFolder('Meeting Notes');
			await this.fileUtils.createAndWriteFile(fileName, content, 'Meeting Notes');
		} catch (error) {
			await this.fileUtils.createAndWriteFile(fileName, content);
		}
	}

	async createResearchNotes(): Promise<void> {
		const currentDate = new Date().toISOString().split('T')[0];
		const fileName = `Research Notes ${currentDate}`;
		const content = Templates.getResearchNotesTemplate();

		try {
			await this.fileUtils.createFolder('Research');
			await this.fileUtils.createAndWriteFile(fileName, content, 'Research');
		} catch (error) {
			await this.fileUtils.createAndWriteFile(fileName, content);
		}
	}
}

class ChatbotModal extends Modal {
	plugin: AgenticChatbotPlugin;
	context?: { context: string; fileName: string };
	chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

	constructor(app: App, plugin: AgenticChatbotPlugin, context?: { context: string; fileName: string }) {
		super(app);
		this.plugin = plugin;
		this.context = context;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass('chatbot-modal');
		
		// Title
		const title = contentEl.createEl('h2', { text: 'Agentic Chatbot' });
		if (this.context) {
			title.appendText(` - ${this.context.fileName}`);
		}

		// Chat container
		const chatContainer = contentEl.createDiv('chat-container');
		const messagesDiv = chatContainer.createDiv('messages');
		
		// Input area
		const inputContainer = contentEl.createDiv('input-container');
		const messageInput = inputContainer.createEl('textarea', {
			placeholder: 'Type your message here...',
			attr: { rows: '3' }
		});
		
		const buttonContainer = inputContainer.createDiv('button-container');
		
		// Send button
		const sendButton = buttonContainer.createEl('button', { text: 'Send' });
		
		// Agent action buttons
		if (this.context) {
			const analyzeButton = buttonContainer.createEl('button', { text: 'Analyze Note' });
			const summaryButton = buttonContainer.createEl('button', { text: 'Summarize' });
			const tagsButton = buttonContainer.createEl('button', { text: 'Suggest Tags' });
			const expandButton = buttonContainer.createEl('button', { text: 'Expand Ideas' });

			analyzeButton.onclick = () => this.handleAgentAction('analyze');
			summaryButton.onclick = () => this.handleAgentAction('summary');
			tagsButton.onclick = () => this.handleAgentAction('tags');
			expandButton.onclick = () => this.handleAgentAction('expand');
		}

		// Event handlers
		const sendMessage = async () => {
			const message = messageInput.value.trim();
			if (!message) return;

			this.addMessage('user', message, messagesDiv);
			messageInput.value = '';

			try {
				const response = await this.plugin.sendMessage(message, this.context?.context);
				this.addMessage('assistant', response, messagesDiv);
			} catch (error) {
				this.addMessage('assistant', `Error: ${error.message}`, messagesDiv);
			}
		};

		sendButton.onclick = sendMessage;
		messageInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				sendMessage();
			}
		});

		// Show initial context message if available
		if (this.context) {
			this.addMessage('system', `Loaded context from "${this.context.fileName}"`, messagesDiv);
		}

		messageInput.focus();
	}

	private addMessage(role: 'user' | 'assistant' | 'system', content: string, container: HTMLElement) {
		const messageDiv = container.createDiv(`message ${role}`);
		const roleSpan = messageDiv.createSpan('role');
		roleSpan.textContent = role === 'user' ? 'You:' : role === 'assistant' ? 'Assistant:' : 'System:';
		
		const contentDiv = messageDiv.createDiv('content');
		contentDiv.textContent = content;

		container.scrollTop = container.scrollHeight;
		
		if (role !== 'system') {
			this.chatHistory.push({ role: role as 'user' | 'assistant', content });
		}
	}

	private async handleAgentAction(action: string) {
		if (!this.context) return;

		const messagesDiv = this.contentEl.querySelector('.messages') as HTMLElement;
		let response: string;

		try {
			switch (action) {
				case 'analyze':
					this.addMessage('system', 'Analyzing note...', messagesDiv);
					response = await this.plugin.analyzeNote(this.context.context);
					break;
				case 'summary':
					this.addMessage('system', 'Generating summary...', messagesDiv);
					response = await this.plugin.generateSummary(this.context.context);
					break;
				case 'tags':
					this.addMessage('system', 'Suggesting tags...', messagesDiv);
					const tags = await this.plugin.suggestTags(this.context.context);
					response = 'Suggested tags:\n' + tags.map(tag => `#${tag}`).join('\n');
					break;
				case 'expand':
					this.addMessage('system', 'Expanding ideas...', messagesDiv);
					response = await this.plugin.expandIdeas(this.context.context);
					break;
				default:
					return;
			}
			
			this.addMessage('assistant', response, messagesDiv);
		} catch (error) {
			this.addMessage('assistant', `Error: ${error.message}`, messagesDiv);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ChatbotSettingTab extends PluginSettingTab {
	plugin: AgenticChatbotPlugin;

	constructor(app: App, plugin: AgenticChatbotPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Enter your LLM API key (OpenAI, Anthropic, etc.)')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Choose the LLM model to use')
			.addText(text => text
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Controls randomness (0.0 to 1.0)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc('Maximum length of response')
			.addText(text => text
				.setValue(this.plugin.settings.maxTokens.toString())
				.onChange(async (value) => {
					this.plugin.settings.maxTokens = parseInt(value) || 1000;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('Instructions for the AI assistant')
			.addTextArea(text => text
				.setValue(this.plugin.settings.systemPrompt)
				.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				}));
	}
}