const COMMON_KEYS = ["sdfRef", "sdfRequired"]//without description, $comment and label
const DATA_KEYS = ["type", "const", "default", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems", "uniqueItems", "pattern", "format", "required", "properties", "unit", "readable", "writable", "observable", "nullable", "contentFormat", "sdfChoice", "enum"];
const SDF_TYPE_KEYS = ["byte-string", "unix-time"];

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

    if (DATA_KEYS.map(key => dataQualitiy(property1[key], property2[key])).some(v => v == false))
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

    if (DATA_KEYS.map(key => dataQualitiy(key, event1[key], event2[key])).some(v => v == false))
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

    if (DATA_KEYS.map(key => dataQualitiy(key, action1[key], action2[key])).some(v => v == false))
        return false;

    return true;
}

function commonQualitiy(key, quality1, quality2) {
    if (!(quality1 || quality2))
        return true;

    if (!(quality1 && quality2))
        return false

    switch(key){
        case "sdfRef":
            return sdfRef(quality1[key], quality2[key]);
        case "sdfRequired":
            return sdfRequired(quality1[key], quality2[key]);
        default:
            throw Error("Invalid key");
    }
}

function dataQualitiy(key, quality1, quality2) {//ToDo: check for null
    return true;
}

function sdfIOData(key1, IOData1, key2, IOData2) {
    return true;
}

function sdfRef(ref1, ref2){
    return true;
}

function sdfRequired(req1, req2){
    return true;
}

function unifyName(name) {
    return name.replace(/(-|\.|_)/g, '').toLowerCase();
}