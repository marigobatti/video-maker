import userInput from './robots/user-input';
import text from './robots/text';

export interface Content {
    searchTerm: string;
    prefix: string;
    sourceContentOriginal: string;
    sourceContentSanitized: string;
    sentences: {
        text: string;
        keywords: [];
        images: [];
    }[];
}

async function start() {
    const content = {} as Content;

    userInput(content);
    await text(content);

    console.log(content);
}

start();
