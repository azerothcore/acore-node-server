import fs from 'fs';
import path from 'path';

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = (source, filter) => {
    var res = fs.readdirSync(source);
    if (filter) {
        res = res.filter(filter)
    }

    return res.map(name => path.join(source, name)).filter(isDirectory);
}

export {
    isDirectory,
    getDirectories
}