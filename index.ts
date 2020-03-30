import userInput from './robots/user-input';
import text from './robots/text';

function start() {
    const content = {};
    
    userInput(content);
    text(content);

    console.log(content);
}

start();