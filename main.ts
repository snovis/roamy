import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string,
	noBullets: boolean,
	message: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	noBullets: true,
	message: "Roamy Rules!"
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log("Loading Roamy Plugin");

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Roamy', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is Roamy!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Roamy Status Bar');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-roamy-modal-simple',
			name: 'Open roamy modal (simple)',
			callback: () => {
				new RoamyModal(this.app, this.settings.message).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		/***
		 * This next section is what I'm looking for.  If the editor is in markdown view, yyou can use an 
		 * editor call back and that will give you access ot the editor, so you can do things like replace
		 * the selection with new text.  This could be my entry to modify the content inside the editor!
		***/
		this.addCommand({
			id: 'roamy-editor-command-test',
			name: 'roamy editor test',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log("Roamy: Called Editor Command with selection:" + editor.getSelection());
				// editor.replaceSelection('Roamy Editor Command');
			}
		});

		this.addCommand({
			id: 'roamy-editor-command-fix-bullets',
			name: 'roamy fix bullets',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log("Roamy Fix Bullets");
				// editor.replaceSelection('Roamy Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-roamy-modal-complex',
			name: 'Open roamy modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new RoamyModal(this.app, this.settings.message).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RoamySettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('Roamy click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RoamyModal extends Modal {
	message: string;

	constructor(app: App, msg: string) {
		super(app);
		this.message = msg;
	}


	onOpen() {
		const {contentEl} = this;
		contentEl.setText(this.message);
		console.log("RoamyModal Called")
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class RoamySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Roamy Settings.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Message')
			.setDesc('What should Roamy Say?')
			.addText(text => text
				.setPlaceholder('Message')
				.setValue(this.plugin.settings.message)
				.onChange(async (value) => {
					console.log('Message: ' + value);
					this.plugin.settings.message = value;
					await this.plugin.saveSettings();
				}));
	}
}
