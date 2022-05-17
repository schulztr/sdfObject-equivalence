var synonyms = require("synonyms");

const COMMON_KEYS = ["sdfRef", "sdfRequired"]
const DATA_KEYS = ["type", "const", "default", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "pattern", "format", "required", "properties", "unit", "readable", "writable", "observable", "nullable", "contentFormat", "sdfType", "sdfChoice", "items"];
const CLASS_KEYS = ["sdfObject", "sdfProperty", "sdfAction", "sdfEvent", "sdfData"]

var verbose;

/**
 * Compare two sdfObjects based on draft-ietf-asdf-sdf-07 (https://www.ietf.org/archive/id/draft-ietf-asdf-sdf-07.html).
 * @param {*} obj1 sdfObject 2
 * @param {*} obj2 sdfObject 1
 * @param {*} verbose_l print information about equivalence.
 * @param {*} sort create object sort that is a sorted version of obj2, so that obj1 and obj2 are in the same order.
 * @returns Are sdfObject 1 and sdfObject 2 equivalent.
 */
exports.sdfObject = function (obj1, obj2, verbose_l, sort) {
    verbose = verbose_l
    key1 = Object.keys(obj1)[0];
    key2 = Object.keys(obj2)[0];

    //class name
    if (!className(key1, key2)) {
        if (verbose)
            console.log(`Name ${key1} and ${key2} not equal`)
        return false;
    }

    obj1 = obj1[key1];
    obj2 = obj2[key2];

    //sdfProperty
    if(sort){
        sort.sdfProperty = {};
    }
    for (const key1 in obj1.sdfProperty) {
        equal = false;
        for (const key2 in obj2.sdfProperty) {
            if (sdfProperty(key1, obj1.sdfProperty[key1], key2, obj2.sdfProperty[key2])) {
                equal = true;
                if(sort){
                    sort.sdfProperty[key2]=obj2.sdfProperty[key2]
                }
                delete obj1.sdfProperty[key1];//ToD: Property and Pro_perty in one object?
                delete obj2.sdfProperty[key2];
                break;
            }
        }
        if (!equal) {
            if (verbose)
                console.log(`Property ${key1} differs`);
            return false;
        }
        equal = false;
    }
    if (obj2.sdfProperty && Object.entries(obj2.sdfProperty).length != 0) {
        if (verbose)
            console.log(`sdfProperties not equal`);
        return false;
    }
    delete obj1.sdfProperty;
    delete obj2.sdfProperty;

    //sdfEvent
    if(sort){
        sort.sdfEvent = {};
    }
    for (const key1 in obj1.sdfEvent) {
        equal = false;
        for (const key2 in obj2.sdfEvent) {
            if (sdfEvent(key1, obj1.sdfEvent[key1], key2, obj1.sdfEvent[key2])) {
                equal = true;
                if(sort){
                    sort.sdfEvent[key2] = obj2.sdfEvent[key2];
                }
                delete obj1.sdfEvent[key1];
                delete obj2.sdfEvent[key2];
                break;
            }
        }
        if (!equal) {
            if (verbose)
                console.log(`Event ${key1} differs`);
            return false;
        }
        equal = false;
    }
    if (obj2.sdfEvent && Object.entries(obj2.sdfEvent).length != 0) {
        if (verbose)
            console.log(`${Object.entries(obj.sdfEvent).length} event(s) differ`)
        return false;
    }
    delete obj1.sdfEvent;
    delete obj2.sdfEvent;

    //sdfAction
    if(sort){
        sort.sdfAction = {};
    }
    for (const key1 in obj1.sdfAction) {
        equal = false;
        for (const key2 in obj2.sdfAction) {
            if (sdfAction(key1, obj1.sdfAction[key1], key2, obj2.sdfAction[key2])) {
                equal = true;
                if(sort){
                    sort.sdfAction[key2] = obj2.sdfAction[key2];
                }
                delete obj1.sdfAction[key1];
                delete obj2.sdfAction[key2];
                break;
            }
        }
        if (!equal) {
            if (verbose)
                console.log(`Action ${key1} differs`)
            return false;
        }
        equal = false;
    }
    if (obj2.sdfAction && Object.entries(obj2.sdfAction).length != 0) {
        if (verbose)
            console.log(`${Object.entries(obj2.sdfAction).length} action(s) differ`)
        return false;
    }
    delete obj1.sdfAction;
    delete obj2.sdfAction;

    //common qualities
    if (COMMON_KEYS.map(key => commonQualitiy(key, obj1[key], obj2[key])).some(v => v == false)) {
        if (verbose)
            console.log(`common qualities from ${key1} differ`)
        return false;
    }

    return true;
}

/**
 * Compare Class Names using synonyms.
 * @param {*} name1 name 1
 * @param {*} name2 name 2 
 * @returns Are name 1 and name 2 equal?
 */
function className(name1, name2) {//TODO: use label and synonymes
    name1 = unifyName(name1);
    name2 = unifyName(name2);
    return !(name1.localeCompare(name2, 'en', { sensitivity: 'base' })) ||
        (Array.isArray(synonyms(name1, "n")) && synonyms(name1, "n").includes(name2)) ||
        (Array.isArray(synonyms(name2, "n")) && synonyms(name2, "n").includes(name1));
}

/**
 * Compare the given Properties, named by the given Class Names.
 * @param {String} key1 Class Name 1
 * @param {Object} property1 Property 1
 * @param {String} key2 Class Name 2
 * @param {Object} property2 Property 2
 * @returns Are both sdfProperties equal?
 */
function sdfProperty(key1, property1, key2, property2) {
    if (!className(key1, key2))
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, property1[key], property2[key])).some(v => v == false))
        return false;

    if (DATA_KEYS.map(key => dataQuality(key, property1[key], property2[key])).some(v => v == false)) {
        if (verbose)
            console.log(`property ${key1} not equivalent`);
        return false;
    }

    return true;
}

/**
 * Compare the given Events, named by the given Class Names.
 * @param {String} key1 Class Name 1
 * @param {Object} event1 Event 1 
 * @param {String} key2 Class Name 2
 * @param {Object} event2 Event 2
 * @returns Are both sdfEvents equal?
 */
function sdfEvent(key1, event1, key2, event2) {
    if (!className(key1, key2))
        return false;

    //sdfOutputData
    if (!sdfIOData(event1.sdfOutputData, event2.sdfOutputData))
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, event1[key], event2[key2])).some(v => v == false)) {
        if (verbose)
            console.log("Event: common qualities not equivalent");
        return false;
    }

    if (DATA_KEYS.map(key => dataQuality(key, event1[key], event2[key])).some(v => v == false)) {
        if (verbose)
            console.log("Event: data qualities not equivalent");
        return false;
    }

    return true;
}

/**
 * Compare the given Actions, named by the given Class Names.
 * @param {String} key1 Class Name 1
 * @param {Object} action1 Action 1
 * @param {String} key2 Class Name 2
 * @param {Object} action2 Action 2
 * @returns Are both sdfActions equal?
 */
function sdfAction(key1, action1, key2, action2) {
    if (!className(key1, key2))
        return false;

    //sdfInputData
    if (!sdfIOData(action1.sdfInputData, action2.sdfInputData))
        return false;

    //sdfOutputData
    if (!sdfIOData(action1.sdfOutputData, action2.sdfOutputData))
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, action1[key], action2[key])).some(v => v == false))
        return false;

    if (DATA_KEYS.map(key => dataQuality(key, action1[key], action2[key])).some(v => v == false))
        return false;

    return true;
}

/**
 * @param {String} key The Name of the Qualities
 * @param {*} quality1 Quality 1
 * @param {*} quality2 Quality 2
 * @returns Are both Qualities equal?
 */
function commonQualitiy(key, quality1, quality2) {
    if (!(quality1 || quality2))
        return true;

    if (!(quality1 && quality2))
        return false

    switch (key) {
        case "sdfRef":
            return quality1.localeCompare(quality2) == 0
        case "sdfRequired":
            return sdfRequired(quality1, quality2);
        case "description":
            return true;
        default:
            throw Error("Invalid key");
    }
}

/**
 * @param {String} key The Name of the Qualities
 * @param {*} quality1 Quality 1
 * @param {*} quality2 Quality 2
 * @returns Are both Qualities equal?
 */
function dataQuality(key, quality1, quality2) {
    if (quality1 == null && quality2 == null)
        return true;
    if (quality1 == null || quality2 == null) {
        return false;
    }

    number_cmp = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "scaleMinimum", "scaleMaximum", "observable", "readable", "writable", "nullable"];//number or boolean
    str_cmp = ["type", "pattern", "format", "unit", "contentFormat"]//string
    value_cmp = ["const", "default"]//allowed value

    if (number_cmp.includes(key)) {
        return quality1 == quality2;
    }
    else if (str_cmp.includes(key)) {
        if (quality1.localeCompare(quality2)) {
            return false;
        }
        else {
            return true;
        }
    }
    else if (value_cmp.includes(key)) {
        if (typeof (quality1) === 'string' && typeof (quality2) === 'string') {
            return quality1.localeCompare(quality2) == 0;
        } else {
            return quality1 === quality2;
        }
    }
    else if (!key.localeCompare("items")) {
        return dq_items(quality1, quality2);
    }
    else if (!key.localeCompare("required")) {
        return dq_required(quality1, quality2);
    }
    else if (!key.localeCompare("properties")) {
        return dq_properties(quality1, quality2);
    }
    else if (!key.localeCompare("sdfType")) {
        if (typeof (quality1) === 'string' && typeof (quality2) === 'string')
            return quality1.localeCompare(quality2) === 0;
        else if (typeof (quality1) === 'number' && typeof (quality2) === 'number')
            return quality1 == quality2;
        else
            return false;
    }
    else if (!key.localeCompare("sdfChoice")) {
        return sdfChoice(quality1, quality2);
    } else {
        throw Error(`${key} is not a data quality`);
    }
}

/**
 * Compare to Qualities representing either an sdfInputData or an sdfOutputData.
 * 
 * @param {Object} IOData1 Quality 1
 * @param {Object} IOData2 Quality 2
 * @returns Are both sdfInputDatas or sdfOutputDatas equal?
 */
function sdfIOData(IOData1, IOData2) {
    if (!(IOData1 || IOData2))
        return true;

    if (!(IOData1 && IOData2))
        return false;

    if (!Array.isArray(IOData1))
        IOData1 = [IOData1];
    if (!Array.isArray(IOData2))
        IOData2 = [IOData2]

    for (const data1 of IOData1) {
        equal = false;
        for (const data2 of IOData2) {
            if (typeof (data1) === 'string' && typeof (data2) === `string` && !data1.localeCompare(data2)) {
                equal = true;
                break;
            }
            if (dq_items(data1, data2)) {
                equal = true;
                break;
            }
            console.log(JSON.stringify(data2, null, 4))
        }
        if (!equal) {
            if (verbose)
                console.log(`IOData ${JSON.stringify(data1, null, 4)} differs`)
            return false;
        }
        equal = false;
    }


    return true;
}

/**
 * Compare two arrays representing a sdfRequired.
 * @param {Array} req1 sdfRequired 1
 * @param {Array} req2 sdfRequired 2
 * @returns Require both arrays the same qualities?
 */
function sdfRequired(req1, req2) {
    if (!(req1 || req2))
        return true;
    if (!(req1 && req2))
        return false;

    if (req1.length != req2.length)
        return false;

    //split to array of keys
    req1 = req1.map(elem => elem.split('/'));
    req2 = req2.map(elem => elem.split('/'));

    req1.forEach(e => e.shift());
    req2.forEach(e => e.shift())

    for (i1 = 0; i1 < req1.length; i1++) {
        equal = false
        for (i2 = 0; i2 < req2.length; i2++) {
            if (req_items(req1[i1], req2[i2])) {//could get expensive
                equal = true;
                delete req1[i1];
                delete req2[i2];
                break;
            }

        }
        if (!equal) {
            return false;
        }
        equal = false;
    }

    return true;
}

/**
 * Compare single items of a sdfRequired-Array.
 * @param {String} p1 item 1
 * @param {String} p2 item 2
 * @returns Are both items equal?
 */
function req_items(p1, p2) {
    if (!(p1 || p2))
        return true;
    if (!(p1 && p2))
        return false;

    if (p1.length != p2.length)
        return false;

    return p1.map((e, i) => {
        if (CLASS_KEYS.includes(e))
            return e.localeCompare(p2[i]) == 0;

        return className(e, p2[i]);
    }).every(v => v == true);
}

/**
 * Compare the data quality items.
 * @param {Object} item1 items 1
 * @param {Object} item2 items 2
 * @returns Are both items equal?
 */
function dq_items(item1, item2) {
    if (!(item1 || item2))
        return true;

    if (!(item1 && item2))
        return false;

    keys1 = Object.keys(item1).sort();
    keys2 = Object.keys(item2).sort();

    if (keys1.length != keys2.length)
        return false;

    for (i = 0; i < keys1.length; i++) {
        if (keys1[i].localeCompare(keys2[i]))
            return false;

        key = keys1[i]
        if (COMMON_KEYS.includes(key))
            if (commonQualitiy(key, item1[key], item2[key]))
                continue;
            else
                return false
        else if (DATA_KEYS.includes(key))
            if (dataQuality(key, item1[key], item2[key]))
                continue;
            else
                return false;
        else
            throw Error(`unknown key: ${key}`);
    }
    return true;
}

/**
 * Compare the data quality required.
 * @param {Array} req1 required 1
 * @param {Array} req2 required 2
 * @returns Are both required-arrays equal?
 */
function dq_required(req1, req2) {
    if (!(req1 || req2))
        return true;

    if (!(req1 && req2))
        return false;

    if (req1.length != req2.length)
        return false;

    req1.sort();
    req2.sort();

    for (i = 0; i < req1.length; i++) {
        if (req1[i].localeCompare(req[i]))
            return false;
    }

    return true;
}

/**
 * Compare the data quality properties.
 * @param {Object} prop1 properties 1
 * @param {Object} prop2 properties 2
 * @returns Are both properties equal?
 */
function dq_properties(prop1, prop2) {
    if (!(prop1 || prop2))
        return true;
    if (!(prop1 && prop2))
        return false;

    if (Object.keys(prop1).length != Object.keys(prop2).length)
        return false;
    for (key1 in prop1) {
        equal = false;
        for (key2 in prop2) {
            if (!className(key1, key2))//could get expansive
                continue;
            sub_prop1 = prop1[key1];
            sub_prop2 = prop2[key2];
            sub_prop1_k = Object.keys(sub_prop1).sort();
            sub_prop2_k = Object.keys(sub_prop2).sort();

            if (sub_prop1_k.length != sub_prop2_k.length) {
                return false;
            }

            for (i = 0; i < sub_prop1_k.length; i++) {
                if (sub_prop1_k[i].localeCompare(sub_prop2_k[i])) {
                    return false;
                }

                k = sub_prop1_k[i];
                if (COMMON_KEYS.includes(k)) {
                    if (commonQualitiy(k, sub_prop1[k], sub_prop2[k]))
                        continue;
                    else {
                        return false;
                    }
                } else if (DATA_KEYS.includes(k)) {
                    if (dataQuality(k, sub_prop1[k], sub_prop2[k])) {
                        continue;
                    }
                    else {
                        return false;
                    }
                } else
                    throw Error(`unknown key: ${k}`);

            }
            equal = true;
        }
        if (!equal) {
            return false;
        }
        equal = false;
    }
    return true;
}

/**
 * Compare two sdfChoices.
 * @param {Object} choice1 sdfChoice 1
 * @param {Object} choice2 sdfChoice 2
 * @returns Are both sdfChoices equal?
 */
function sdfChoice(choice1, choice2) {
    if (Object.entries(choice1).length != Object.entries(choice2).length) {
        if (verbose)
            console.log(`sdfChoice: number of elements differs`);
        return false;
    }

    for (const key1 in choice1) {
        equal = false;
        prop1_k = Object.keys(choice1[key1]).sort();
        for (const key2 in choice2) {
            prop2_k = Object.keys(choice2[key2]).sort();
            if (prop1_k.length != prop2_k.length) {
                continue;
            }

            if (prop1_k.map((q1_k, i) => {
                if (q1_k.localeCompare(prop2_k[i])) {
                    return false;
                } else {
                    if (COMMON_KEYS.includes(q1_k)) {
                        return commonQualitiy(q1_k, choice1[key1][q1_k], choice2[key2][prop2_k[i]]);
                    } else if (DATA_KEYS.includes(q1_k)) {
                        return dataQuality(q1_k, choice1[key1][q1_k], choice2[key2][prop2_k[i]]);
                    } else {
                        throw Error(`${q1_k} no common or data quality`)
                    }
                }
            }).every(v => v == true)) {
                equal = true;
            }
        }
        if (!equal) {
            if (verbose)
                console.log(`sdfChoice: ${JSON.stringify(choice1[key1])} differs`);
            return false;
        }
        equal = false;
    }
    return true;
}

/**
 * Unify Class Name.
 * @param {String} name Class Name
 * @returns unified Class Name
 */
function unifyName(name) {
    return name.replace(/(-|\.|_)/g, '').toLowerCase();
}
