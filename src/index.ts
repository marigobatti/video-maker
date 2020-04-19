import text from './robots/text';
import userInput from './robots/user-input';


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

async function start() {
    const content = {
        maximumSentences: 7,
    } as Content;

    userInput(content);
    await text(content);

    console.log(content);
}

start();
