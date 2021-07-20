const COMMON_KEYS = ["sdfRef", "sdfRequired"]//without description, $comment and label
const DATA_KEYS = ["type", "const", "default", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "pattern", "format", "required", "properties", "unit", "readable", "writable", "observable", "nullable", "contentFormat", "sdfType", "sdfChoice", "enum"];
const CLASS_KEYS = ["sdfObject", "sdfProperty", "sdfAction", "sdfEvent", "sdfData"]

exports.sdfObject = function (obj1, obj2) {
    key1 = Object.keys(obj1)[0];
    key2 = Object.keys(obj2)[0];

    //class name
    if (!className(key1, key2))
        return false;

    obj1 = obj1[key1];
    obj2 = obj2[key2];

    //sdfProperty
    for (key1 in obj1.sdfProperty) {
        equal = false;
        for (key2 in obj2.sdfProperty) {
            if (sdfProperty(key1, obj1.sdfProperty[key1], key2, obj2.sdfProperty[key2])) {
                equal = true;
                delete obj1.sdfProperty[key1];//ToD: Property and Pro_perty in one object?
                delete obj2.sdfProperty[key2];
                break;
            }
        }
        if (!equal)
            return false;
        equal = false;
    }
    if (obj2.sdfProperty && Object.entries(obj2.sdfProperty).length != 0)
        return false;
    delete obj1.sdfProperty;
    delete obj2.sdfProperty;

    //sdfEvent
    for (key1 in obj1.sdfEvent) {
        equal = false;
        for (key2 in obj2.sdfEvent) {
            if (sdfEvent(key1, obj1.sdfEvent[key1], key2, obj1.sdfEvent[key2])) {
                equal = true;
                delete obj1.sdfEvent[key1];
                delete obj2.sdfEvent[key2];
                break;
            }
        }
        if (!equal)
            return false;
        equal = false;
    }
    if (obj2.sdfEvent && Object.entries(obj2.sdfEvent).length != 0)
        return false;
    delete obj1.sdfEvent;
    delete obj2.sdfEvent;

    //sdfAction
    for (key1 in obj1.sdfAction) {
        equal = false;
        for (key2 in obj2.sdfAction) {
            if (sdfAction(key1, obj1.sdfAction[key1], key2, obj2.sdfAction[key2])) {
                equal = true;
                delete obj1.sdfAction[key1];
                delete obj2.sdfAction[key2];
                break;
            }
        }
        if (!equal)
            return false;
        equal = false;
    }
    if (obj2.sdfAction && Object.entries(obj2.sdfAction).length != 0)
        return false;
    delete obj1.sdfAction;
    delete obj2.sdfAction;

    //common qualities
    if (COMMON_KEYS.map(key => commonQualitiy(key, obj1[key], obj2[key])).some(v => v == false))
        return false;

    return true;
}

function className(name1, name2) {//TODO: use label and synonymes
    name1 = unifyName(name1);
    name2 = unifyName(name2);
    return !(name1.localeCompare(name2, 'en', { sensitivity: 'base' }));
}

function sdfProperty(key1, property1, key2, property2) {
    if (!className(key1, key2))
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, property1[key], property2[key])).some(v => v == false))
        return false;

    if (DATA_KEYS.map(key => dataQuality(key, property1[key], property2[key])).some(v => v == false))
        return false;

    return true;
}

function sdfEvent(key1, event1, key2, event2) {
    if (!className(key1, key2))
        return false;

    //sdfOutputData
    for (k1 in event1.sdfOutputData) {
        equal = false;
        for (k2 in event2.sdfOutputData) {
            if (sdfIOData(k1, event1.sdfOutputData[k1], k2, event2.sdfOutputData[k2])) {
                equal = true;
                delete event1.sdfOutputData[k1];
                delete event2.sdfOutputData[k2];
                break;
            }
        }
        if (!equal)
            return false;
    }
    if (event2.sdfOutputData && Object.entries(event2.sdfOutputData).length != 0)
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, event1[key], event2[key2]).some(v => v == false)))
        return false;

    if (DATA_KEYS.map(key => dataQuality(key, event1[key], event2[key])).some(v => v == false))
        return false;

    return true;
}

function sdfAction(key1, action1, key2, action2) {
    if (!className(key1, key2))
        return false;

    //sdfInputData
    for (k1 in action1.sdfInputData) {
        equal = false;
        for (k2 in action2.sdfInputData) {
            if (sdfIOData(k1, action1.sdfInputData[k1], k2, action2.sdfInputData[k2])) {
                equal = true;
                delete action1.sdfInputData[k1];
                delete action2.sdfInputData[k2];
                break;
            }
        }
        if (!equal)
            return false;
    }
    if (action2.sdfInputData && Object.entries(action2.sdfInputData).length != 0)
        return false;

    //sdfOutputData
    for (k1 in action1.sdfOutputData) {
        equal = false;
        for (k2 in action2.sdfOutputData) {
            if (sdfIOData(k1, action1.sdfOutputData[k1], k2, action2.sdfOutputData[k2])) {
                equal = true;
                delete action1.sdfOutputData[k1];
                delete action2.sdfOutputData[k2];
                break;
            }
        }
        if (!equal)
            return false;
    }
    if (action2.sdfOutputData && Object.entries(action2.sdfOutputData).length != 0)
        return false;

    if (COMMON_KEYS.map(key => commonQualitiy(key, action1[key], action2[key2]).some(v => v == false)))
        return false;

    if (DATA_KEYS.map(key => dataQuality(key, action1[key], action2[key])).some(v => v == false))
        return false;

    return true;
}

function commonQualitiy(key, quality1, quality2) {
    if (!(quality1 || quality2))
        return true;

    if (!(quality1 && quality2))
        return false

    switch (key) {
        case "sdfRef":
            return sdfRef(quality1, quality2);
        case "sdfRequired":
            return sdfRequired(quality1, quality2);
        default:
            throw Error("Invalid key");
    }
}

function dataQuality(key, quality1, quality2) {
    if (!(quality1 || quality2))
        return true;
    if (!(quality1 && quality2)) {
        return false;
    }

    number_cmp = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "scaleMinimum", "scaleMaximum", "readable", "writable", "nullable"];//number or boolean
    str_cmp = ["type", "pattern", "format", "unit", "contentFormat"]//string
    value_cmp = ["const", "default"]//allowed value

    switch (true) {
        case number_cmp.includes(key):
            return quality1 == quality2;
        case str_cmp.includes(key):
            if (quality1.localeCompare(quality2))
                return false;
            else
                return true;
        case value_cmp.includes(key):
            return;
        case key.localeCompare("items"):
            return dq_items(quality1, quality2);
        case key.localeCompare("required"):
            return dq_required(quality1, quality2);
        case key.localeCompare("properties"):
            return dq_properties(quality1, quality2);
        case key.localeCompare("sdfType"):
            if (typeof (quality1) === 'string' && typeof (quality2) === 'string')
                return quality1.localeCompare(quality2) === 0 ? true : false;
            else if (typeof (quality1) === 'number' && typeof (quality2) === 'number')
                return quality1 == quality2;
            else
                return false;
        case key.localeCompare("sdfChoice"):
            return sdfChoice(quality1, quality2);
        case key.localeCompare("enum"):
            return dq_enum(quality1, quality2);
    }

    return Error(`${key} is not a data quality`);
}

function sdfIOData(key1, IOData1, key2, IOData2) {
    return true;
}

function sdfRef(ref1, ref2) {
    return true;
}

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

function req_items(p1, p2) {
    if (!(p1 || p2))
        return true;
    if (!(p1 && p2))
        return false;

    if (p1.length != p2.length)
        return false;

    return p1.map((e, i) => {
        if (CLASS_KEYS.includes(e))
            return e.localeCompare(p2[i]) == 0 ? true : false;

        return className(e, p2[i]);
    }).every(v => v == true);
}

function dq_items(item1, item2) {
    if (!(item1 || item2))
        return true;

    if (!(item1 && item2))
        return false;

    keys1 = Object.keys(item1).sort();
    keys2 = Object.keys(item2).sort();

    if (keys1.length != keys.length)
        return false;

    for (i = 0; i < keys1.length; i++) {
        if (!keys1[i].localeCompare(keys[i]))
            return false;

        key = keys1[i]
        if (key in COMMON_KEYS)
            if (commonQualitiy(key, item1[key], item2[key]))
                break;
            else
                return false
        else if (key in DATA_KEYS)
            if (dataQuality(key, item1[key], item2[key]))
                break;
            else
                return false;
        else
            throw Error("unknown key");
    }
    return true;
}

function dq_required(req1, req2) {
    return true;
}

function dq_properties(prop1, prop2) {
    return true;
}

function sdfChoice(choice1, choice2) {
    return true;
}

function dq_enum(enum1, enum2) {
    return true;
}

function unifyName(name) {
    return name.replace(/(-|\.|_)/g, '').toLowerCase();
}