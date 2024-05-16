// import {  } from 'obsidian';

import { TFile } from 'obsidian';
import { Converter } from 'showdown';
import { readFileSync } from 'fs';


const MATH = /(\${1,2})(.+)(\${1,2})/g;
const MAKRDOWN_HEADING = /^#+\s(.*)$/gm;
const OBSIDIAN_IMAGE = /\!\[\[(.+)\]\]|!\[.+\]((.+))/g;
const EXTRACT_CARD_INFO = /%% \{"cardId": (.+), "front": (.+), "deck": (.+)\} %%/gm;

class Card {

    constructor(
        public front: string, 
        public back: string, 
        public tags: string[], 
        public deck: string, 
        public cardId: string| undefined
        ) {
    }


    toString(): string {
        return JSON.stringify(this);
    }

    addFileName(fileName: string) {
        this.front = `${fileName} -> ${this.front}`
    }
}

function extractCardInfo(selection: string): { cardId: number, front: string, deck: string } {
    const match = selection.match(EXTRACT_CARD_INFO);
    if (!match) {
        throw new Error("Could not find card info in selection");
    } else {
        const data = JSON.parse(match[0].replace(/%/g,""));
        return {
            cardId: Number(data.cardId),
            front: data.front,
            deck: data.deck
        }
    }
}

function createCard(
    selection: string, 
    wholeNote: string, 
    tags: string[], 
    deck: string,
    imagePath: (image: string) => string
    ): Card {
    const headings = getAllHeadings(wholeNote);
    var { front, back } = splitFrontAndHeading(wholeNote, selection);
    
    const firstLineEnd = selection.indexOf('\n')

    back = replaceMath(back);
    // read file encode base64
    back = inlineImages(back, (image) => {
        return readFileSync(imagePath(image), { encoding: 'base64' })
    });

    back = backAsHtml(back);

    return new Card(front, back, tags, deck, undefined);
}

function getHeading(selection: string): string {
    return selection.match(MAKRDOWN_HEADING)![0];
}

function splitFrontAndHeading(wholeNote: string, selection: string): { front: string, back: string } {
    const firstHeading = getHeading(selection);
    const allHeadings = getAllHeadings(wholeNote);

    const front = determineFrontFromHeadings(allHeadings, firstHeading);

    const back = selection.slice(firstHeading.length).trimStart().trimEnd();

    return { front, back };

}

function extractaAllImages(selection: string): string[] {
    return Array.from(selection.matchAll(OBSIDIAN_IMAGE)).map(x => x[1])
}

function replaceMath(selection: string): string {
    var copy = selection;

    const inlineMathMatch = copy.matchAll(MATH);
    for (const match of inlineMathMatch) {

        const wholeMatch = match[0];
        const math = match[2];

        if (wholeMatch.startsWith("$$")){
            const _math = `[$$$]${math.slice(0, math.length-1)}[/$$$]`
            copy = copy.replace(wholeMatch, _math);
        } else {
            copy = copy.replace(wholeMatch, `[$]${math}[/$]`)
        }
    }
    return copy;
}

function inlineImages(selection: string, loadImage: (path: string) => string): string {
    const matches = selection.matchAll(OBSIDIAN_IMAGE);
    var copy = selection;

    for (const match of matches) {
        const wholePath = match[0];
        const imagePath = match[1];

        const end = imagePath.lastIndexOf(".") + 1
        const imageType = imagePath.slice(end)

        const imgBase64 = loadImage(imagePath);

        copy = copy.replace(wholePath, `<img src="data:image/${imageType};base64, ${imgBase64}"/>`)
    }
    return copy 
}

function backAsHtml(back: string): string {
    const converter = new Converter()
    return converter.makeHtml(back);
}

function getFront(page: string, selection: string): string {
    if (!selection.startsWith("#")) {
        // error message that includes selection and says it does not start with #
        throw new Error(`${selection} does not start with #`)
    }
    const firstHeading = page.match(MAKRDOWN_HEADING)![0];

    const headings = getAllHeadings(page);
    return determineFrontFromHeadings(headings, firstHeading);
}

function getAllHeadings(page: string): string[] {
    // extract all mardkown headings from page
    return Array.from(page.matchAll(MAKRDOWN_HEADING)).map(m => m[0].trim());
}

function determineFrontFromHeadings(headings: string[], heading: string): string {
    if (!heading.startsWith("#")) {
        throw new Error("Heading must start with #");
    }

    const level = heading.match(/#/g)!.length;

    const index = headings.findIndex(h => h === heading);
    var currentLevel = level;
    const path = [heading.replace(/#/g, "").trim()];
    for (let i = index - 1; i >= 0; i--) {
        const previous = headings[i];
        if (!previous.startsWith("#")) {
            throw new Error("Headings must start with #");
        }
        const previousLevel = previous.match(/#/g)!.length;
        if (previousLevel < currentLevel) {
            path.push(previous.replace(/#/g, "").trim());
            currentLevel = previousLevel;
        }
    }
    return path.reverse().join(" -> ");
}

export { 
    determineFrontFromHeadings,
    getAllHeadings,
    inlineImages,
    backAsHtml,
    replaceMath,
    createCard,
    getHeading,
    Card,
    extractCardInfo
};