import { readFileSync, writeFileSync } from 'fs';


const contentFilePath = './content.json';

export function save(content: any) {
    const contentString = JSON.stringify(content);
    return writeFileSync(contentFilePath, contentString);
}

export function load() {
    const fileBuffer = readFileSync(contentFilePath, 'utf-8');
    const contentJson = JSON.parse(fileBuffer);
    return contentJson;
}
