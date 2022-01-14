const fs = require('fs');
const commandLineArgs = require('command-line-args');
const deepcopy = require('deepcopy');

const cmp = require('./comparison');
const res = require('./resolve');

const optionDefinitions = [
    { name: 'input', type: String, multiple: true, defaultOption: true},
    { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
]
const options = commandLineArgs(optionDefinitions);

module.exports = function main(arg_sdfFile1, arg_sdfFile2, verbose){
    var sdfFile1 = deepcopy(arg_sdfFile1);
    var sdfFile2 = deepcopy(arg_sdfFile2);

    const namespace1 = getNamespace(sdfFile1);
    const namespace2 = getNamespace(sdfFile2);

    const sdfObj1 = getObject(sdfFile1);
    const sdfObj2 = getObject(sdfFile2);

    return cmp.sdfObject(res.resolve(namespace1, sdfObj1), res.resolve(namespace2, sdfObj2), verbose);
}

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

if (options.input) {
    const sdfFile1 = JSON.parse(fs.readFileSync(options.input[0]));
    const sdfFile2 = JSON.parse(fs.readFileSync(options.input[1]));

    console.log(main(sdfFile1, sdfFile2, options.verbose));
}
