// import {  } from 'obsidian';

import { MarkdownEditView } from "obsidian";

const MATH_INLINE = /\$(.*?)\$/g;
const MATH_MULTILINE = /\$\$(.*?)\$\$/g;
const MAKRDOWN_HEADING = /^#+\s(.*)$/gm;
const OBSIDIAN_IMAGE = /!\[(.*?)\]\((.*?)\)/g;

class Card {
    front: string;
    back: string;
    tags: string[];
    images: string[];

    constructor(front: string, back: string, tags: string[], images: string[]) {};
}

function makeCard(selection: string, page: string): Card {
    const front  = getFront(page, selection);
    // let card = new Card();
    // return card;
    throw new Error("Not implemented");
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
};