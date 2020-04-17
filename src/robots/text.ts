import algorithmia from 'algorithmia';
import algorithmiaData from '../../credentials/algorithmia.json';
import sentenceBoundaryDetection from 'sbd';

import { Content } from '../';

export default async function robot(content: Content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);

    async function fetchContentFromWikipedia(content: Content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaData.apiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
            'web/WikipediaParser/0.1.2'
        );
        const wikipediaResponse = await wikipediaAlgorithm.pipe(
            content.searchTerm
        );
        const wikipediaContent = wikipediaResponse.get();
        content.sourceContentOriginal = wikipediaContent.content;
    }

    function sanitizeContent(content: Content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkDown(
            content.sourceContentOriginal
        );

        const withoutDatesInParentheses = removeDatesInParentheses(
            withoutBlankLinesAndMarkdown
        );

        content.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankLinesAndMarkDown(text: string) {
            const allLines = text.split('\n');
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                }

                return true;
            });

            return withoutBlankLinesAndMarkdown.join(' ');
        }

        function removeDatesInParentheses(text: string) {
            return text
                .replace(/\((?:\([^()]*\)|[^()])*\)/gm, '')
                .replace(/  /g, ' ');
        }
    }

    function breakContentIntoSentences(content: Content) {
        content.sentences = [];

        const sentences = sentenceBoundaryDetection.sentences(
            content.sourceContentSanitized
        );

        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: [],
            });
        });
    }
}
