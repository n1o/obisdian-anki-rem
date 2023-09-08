import axios from "axios";
import { Card } from "./card";

class AnkiService {
    private url: string;

    constructor() {
        this.url = "http://127.0.0.1:8765";
    };

    async allDecks(): Promise<string[]> {

        const body = JSON.stringify({
            'action': 'deckNames',
            'version': 6,
        });


        const result = await axios.post(this.url, body);
        return result.data.result;

    }

    async addCard(card: Card): Promise<string>  {
        const body = JSON.stringify({
            'action': 'addNote',
            'version': 6,
            "params": {
                "note": {
                    "deckName": card.deck,
                    "modelName": "Basic",
                    "fields": {
                        "Front": card.front,
                        "Back": card.back
                    },
                    "options": {
                        "allowDuplicate": false,
                        "duplicateScope": "deck"
                    },
                    "tags": card.tags
                }
            }
        });

        const result = await axios.post(this.url, body);

        return result.data.result;
    }

    async openCardInEdit(cardId: number): Promise<void> {
        const body = JSON.stringify({
            'action': 'guiEditNote',
            'version': 6,
            "params": {
                "note": cardId
            }
        });

        await axios.post(this.url, body);
    }

};

export {
    AnkiService
};