import { google } from 'googleapis';
import { image } from 'image-downloader';

import googleData from '../../credentials/google-search.json';
import { Content } from './input';
import { load, save } from './state';


const customSearch = google.customsearch('v1');

export default async function robot() {
    const content = load() as Content;

    await fetchImagesOfAllSentences(content);
    await downloadAllImages(content);

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

    async function downloadAllImages(content: Content) {
        content.downloadedImages = [];

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images;

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex];

                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Imagem já foi baixada');
                    }

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);

                    content.downloadedImages.push(imageUrl);
                    console.log(
                        `> [${sentenceIndex}] [${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`
                    );
                    break;
                } catch (error) {
                    console.log(
                        `> [${sentenceIndex}] [${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`
                    );
                }
            }
        }
    }

    async function downloadAndSave(url: string, fileName: string) {
        return image({
            url,
            dest: `./content/${fileName}`,
        });
    }
}
