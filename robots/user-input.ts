const readline = require('readline-sync');

export default function robot(content) {
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    
    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];

        console.log(selectedPrefixText);
        return selectedPrefixText
    }
}