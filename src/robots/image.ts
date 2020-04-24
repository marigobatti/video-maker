import gm from 'gm';
import { google } from 'googleapis';
import { image } from 'image-downloader';

import googleData from '../../credentials/google-search.json';
import { Content } from './input';
import { load, save } from './state';


const customSearch = google.customsearch('v1');
const gmImageMagick = gm.subClass({ imageMagick: true });

type TemplateSettings = Record<string, { size: string; gravity: string }>;

export default async function robot() {
    const content = load() as Content;

    await fetchImagesOfAllSentences(content);
    await downloadAllImages(content);
    await convertAllImages(content);
    await createAllSentencesImages(content);
    await createYoutubeThumbnail();

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

    async function convertAllImages(content: Content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await convertImage(sentenceIndex);
        }
    }

    async function convertImage(sentenceIndex: number) {
        return new Promise((resolve, reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png[0]`;
            const outputFIle = `./content/${sentenceIndex}-converted.png`;
            const width = 1920;
            const height = 1080;

            gmImageMagick('')
                .in(inputFile)
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
                .out(')')
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${height}`)
                .write(outputFIle, error => {
                    if (error) return reject(error);

                    console.log(`> Image converted: ${inputFile}`);
                    resolve();
                });
        });
    }

    async function createAllSentencesImages(content: Content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text);
        }
    }

    async function createSentenceImage(sentenceIndex: number, sentenceText: string) {
        return new Promise((resolve, reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`;

            const templateSettings: TemplateSettings = {
                0: {
                    size: '1920x400',
                    gravity: 'center',
                },
                1: {
                    size: '1920x1080',
                    gravity: 'center',
                },
                2: {
                    size: '800x1080',
                    gravity: 'west',
                },
                3: {
                    size: '1920x400',
                    gravity: 'center',
                },
                4: {
                    size: '1920x1080',
                    gravity: 'center',
                },
                5: {
                    size: '800x1080',
                    gravity: 'west',
                },
                6: {
                    size: '1920x400',
                    gravity: 'center',
                },
            };

            gmImageMagick('')
                .out('-size', templateSettings[sentenceIndex].size)
                .out('-gravity', templateSettings[sentenceIndex].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, error => {
                    if (error) return reject(error);

                    console.log(`> Sentence created: ${outputFile}`);
                    resolve();
                });
        });
    }

    async function createYoutubeThumbnail() {
        return new Promise((resolve, reject) => {
            gmImageMagick('')
                .in('./content/0-converted.png')
                .write('./content/youtube-thumbnail.jpg', error => {
                    if (error) return reject(error);

                    console.log('> Creating Youtube thumbnail');
                    resolve();
                });
        });
    }
}
