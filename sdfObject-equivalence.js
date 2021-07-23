const fs = require('fs');
const commandLineArgs = require('command-line-args');

const cmp = require('./comparison');
const res = require('./resolve');

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

function getNamespace(sdfFile) {
    if(!sdfFile)
        throw Error("Need two arguments");

    if(!sdfFile.namespace)
        return {};
    
    return sdfFile.namespace;
}

const sdfFile1 = JSON.parse(fs.readFileSync(options.input[0]));
const sdfFile2 = JSON.parse(fs.readFileSync(options.input[1]));

const namespace1 = getNamespace(sdfFile1);
const namespace2 = getNamespace(sdfFile2);

const sdfObj1 = getObject(sdfFile1);
const sdfObj2 = getObject(sdfFile2);

console.log(cmp.sdfObject(res.resolve(namespace1, sdfObj1), res.resolve(namespace2, sdfObj2)));