import readline from 'readline-sync';

import { save } from './state';


export interface Content {
    searchTerm: string;
    prefix: string;
    sourceContentOriginal: string;
    sourceContentSanitized: string;
    sentences: {
        text: string;
        keywords: string[];
        images: [];
    }[];
    maximumSentences: number;
}

export default function robot() {
    const content = {
        maximumSentences: 7,
    } as Content;

    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    save(content);

    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];

        console.log(selectedPrefixText);
        return selectedPrefixText;
    }
}
