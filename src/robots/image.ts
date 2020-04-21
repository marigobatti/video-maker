import { google } from 'googleapis';

import googleData from '../../credentials/google-search.json';
import { Content } from './input';
import { load, save } from './state';


const customSearch = google.customsearch('v1');

export default async function robot() {
    const content = load() as Content;

    await fetchImagesOfAllSentences(content);

    save(content);

    async function fetchImagesOfAllSentences(content: Content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`;
            sentence.images = await fetchGoogleAndReturnImagesLinks(query);

            sentence.googleSearchQuery = query;
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query: string) {
        const response = await customSearch.cse.list({
            auth: googleData.apiKey,
            cx: googleData.searchEngine,
            q: query,
            num: 2,
            searchType: 'image',
            imgSize: 'huge',
        });

        const imagesUrl =
            response.data.items?.filter(item => item).map(item => item.link ?? '') ?? [];

        return imagesUrl;
    }
}
