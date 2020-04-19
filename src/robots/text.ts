import algorithmia from 'algorithmia';
import { IamAuthenticator } from 'ibm-watson/auth';
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1';
import sentenceBoundaryDetection from 'sbd';

import { Content } from '../';
import algorithmiaData from '../../credentials/algorithmia.json';
import watsonData from '../../credentials/watson-nlu.json';


const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: watsonData.apikey }),
    version: '2018-04-05',
    url: watsonData.url,
});

export default async function robot(content: Content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);
    await fetchKeywordsOfAllSentences(content);

    async function fetchContentFromWikipedia(content: Content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaData.apiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponse.get();
        content.sourceContentOriginal = wikipediaContent.content;
    }

    function sanitizeContent(content: Content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkDown(
            content.sourceContentOriginal
        );

        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

        content.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankLinesAndMarkDown(text: string) {
            const allLines = text.split('\n');
            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                }

                return true;
            });

            return withoutBlankLinesAndMarkdown.join(' ');
        }

        function removeDatesInParentheses(text: string) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
        }
    }

    function breakContentIntoSentences(content: Content) {
        content.sentences = [];

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: [],
            });
        });
    }

    function limitMaximumSentences(content: Content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences);
    }

    async function fetchWatsonAndReturnKeywords(sentence: string): Promise<string[]> {
        return new Promise(resolve => {
            nlu.analyze(
                {
                    text: sentence,
                    features: {
                        keywords: {},
                    },
                },
                (error, response) => {
                    if (error) {
                        throw error;
                    }
                    const keywords =
                        response?.result?.keywords
                            ?.filter(keyword => keyword)
                            .map(keyword => keyword.text ?? '') ?? [];

                    resolve(keywords);
                }
            );
        });
    }

    async function fetchKeywordsOfAllSentences(content: Content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
        }
    }
}
