import { App, Editor, FileSystemAdapter, FuzzySuggestModal, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
// import fetch
import { createCard, extractCardInfo, getHeading } from './src/card'
import { AnkiService } from 'src/anki';
import * as path from 'path';

// Remember to rename these classes and interfaces!


export default class MyPlugin extends Plugin {
	private ankiService = new AnkiService();

	async onload() {

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'open-card',
			name: 'Open Anki Card',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const { cardId } = extractCardInfo(selection)
				this.ankiService.openCardInEdit(cardId);
			}
		});
		this.addCommand({
			id: 'update-anki-card',
			name: 'Update Anki Card',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

			},
		});
		this.addCommand({
			id: 'create-anki-card',
			name: 'Create Anki card',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const decks = await this.ankiService.allDecks();
				const currentFile = this.app.workspace.getActiveFile();
				if (currentFile) {

					const fileName = currentFile.name;
					
					const tags = (this.app.metadataCache.getFileCache(currentFile)?.tags || []).map((tag) => tag.tag);

					const currentFileText = await this.app.vault.read(currentFile);

					new DecksModal(this.app, decks, (deck) => {
						const selection = editor.getSelection();
						const card = createCard(selection, currentFileText, tags, deck, (image) => {
							return path.join(
								(this.app.vault.adapter as FileSystemAdapter).getBasePath(),
								this.app.metadataCache.getFirstLinkpathDest(image, currentFile.path)!.path
							)
						});
						card.addFileName(fileName);

						this.ankiService.addCard(card).then(cardId => {
							const heading = getHeading(selection);
							const cardInfo = `%% { "cardId": ${cardId}, "front": "${card.front}", "deck": "${card.deck}"  } %%`;

							const newSelection = selection.replace(heading, `${heading} #card\n${cardInfo}\n`)
							editor.replaceSelection(newSelection);
							
						});
					}).open();
				}
			}

		});
	}

	onunload() {

	}
}

export class DecksModal extends FuzzySuggestModal<string> {
  constructor(app: App, private items: string[], private choose: (items: string) => void) {
		super(app)
  }
  getItems(): string [] {
    return this.items;
  }

  getItemText(item: string): string {
    return item;
  }

  onChooseItem(item: string, evt: MouseEvent | KeyboardEvent) {
	this.choose(item);
    new Notice(`Selected ${item}`);
  }
}