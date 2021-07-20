const fs = require('fs');
const commandLineArgs = require('command-line-args');
var cmp = require('./comparison')

const optionDefinitions = [
    { name: 'input', type: String, multiple: true, defaultOption: true}
]
const options = commandLineArgs(optionDefinitions);

function getObject(sdfFile) {
    if (!sdfFile) {
        throw Error("Need two arguments");
    }
    if(Object.keys(sdfFile.sdfObject).length != 1 ){
        throw Error("Can only compare single sdfObjects");
    }

    return sdfFile.sdfObject
}

const sdfObj1 = getObject(JSON.parse(fs.readFileSync(options.input[0])));
const sdfObj2 = getObject(JSON.parse(fs.readFileSync(options.input[1])));

console.log(cmp.sdfObject(sdfObj1, sdfObj2));
