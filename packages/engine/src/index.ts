import image from './robots/image';
import input from './robots/input';
import { load } from './robots/state';
import text from './robots/text';


async function start() {
    input();
    await text();
    await image();

    const content = load();
    console.dir(content, { depth: null });
}

start();
