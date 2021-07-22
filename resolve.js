var pointer = require('json-pointer');

exports.resolve = function (ns, obj) {
    return resolveIOData(ns, unify(resolveRef(ns, obj)));
}

/**
 * Converts all enums to sdfChoice and removes label, description and $comment.
 * @param {*} obj The object with enums
 * @returns Object without enums.
 */
function unify(obj) {
    Object.keys(obj).forEach((key) => {
        if (!key.localeCompare("enum")) {
            if (Object.keys(obj).includes("sdfChoice")) {
                throw Error(`enum ${obj["enum"]} would override sdfChoice ${obj["sdfChoice"]}`);
            }

            sdfChoice = {};
            _enum = obj[key];
            _enum.forEach(elem => {
                quality = {};
                quality.const = elem;
                sdfChoice[elem] = quality;
            })
            delete obj.enum
            obj.sdfChoice = sdfChoice;

        }
        else if (!key.localeCompare("label"))
            delete obj.label;
        else if (!key.localeCompare("description"))
            delete obj.description;
        else if (!key.localeCompare("$comment"))
            delete obj["$comment"];
        switch (typeof (obj[key])) {
            case 'undefined':
                break;
            case 'object':
                unify(obj[key]);
                break;
            case 'array':
                obj[key].forEach(o => unify(o));

        }
    });

    return obj;
}

/**
 * Resolves references that refer to the same sdfFile and converts the other references to full URIs. This function only has an impact on references declared with sdfRef. It does not change the sdfRequired array.
 * @param {*} ns The namespace map.
 * @param {*} obj The object with unresolved references.
 * @returns An object with resolved references.
 */
function resolveRef(ns, obj, subObj=obj, location="") {//ToDo dereference input and output data
    Object.keys(subObj).forEach((key) => {
        if (!key.localeCompare("sdfRef")) {
            ptr = subObj[key];
            if (!ptr.charAt(0).localeCompare("#")) {//local pointer
                ptr = ptr.substring(11);
                new_obj = JSON.parse(JSON.stringify(pointer.get(obj, ptr)));//to get real copy of object
                old_obj = subObj;

                //merge
                delete old_obj.sdfRef;
                Object.keys(old_obj).forEach((key) => {
                    if (old_obj[key] === null) {
                        delete new_obj[key]
                    }
                    else {
                        new_obj[key] = old_obj[key];

                    }
                })

                pointer.set(obj, location, new_obj);
            } else {//global pointer
                ref = ptr.split(":");
                subObj.sdfRef = ns[ref[0]].concat(ref[1]);
            }
        }

        switch (typeof (subObj[key])) {
            case 'undefined':
                break;
            case 'object':
                if (subObj[key] !== null) {
                    resolveRef(ns, obj, subObj[key], location.concat(`/${key}`));
                }
                break;
            case 'array':
                subObj[key].forEach(o => resolveRef(ns, obj, o, location.concat(`/${key}`)));

        }
    });
    return obj;
}

function resolveIOData(ns,obj, subObj=obj, location="") {
    Object.keys(subObj).forEach((key) => {
        if (!key.localeCompare("sdfInputData")) {
            new_data = [];
            remove = []
            subObj.sdfInputData.forEach((ptr, i) => {
                if (typeof (ptr) === 'string') {
                    if (!ptr.charAt(0).localeCompare("#")) {//local
                        ptr = ptr.substring(11);
                        new_obj = JSON.parse(JSON.stringify(pointer.get(obj, ptr)));//to get real copy of object
                        new_data.push(new_obj);
                        remove.push(i);
                    } else {//global
                        ref = ptr.split(":");
                        new_data.push(ns[ref[0]].concat(ref[1]));
                        remove.push(i);
                    }
                }
            });
            offset = 0;
            for (const i of remove) {
                subObj.sdfInputData.splice(i - offset, 1);
                ++offset;
            }
            new_data.forEach(elem => subObj.sdfInputData.push(elem));
        } else if (!key.localeCompare("sdfOutputData") && typeof (subObj.sdfOutputData === 'array')) {
            subObj.sdfOutputData.forEach(ptr => {
                if (!ptr.charAt(0).localeCompare("#")) {
                    //ToDo
                } else {
                    //ToDo
                }
            });
        }

        switch (typeof (subObj[key])) {
            case 'undefined':
                break;
            case 'object':
                if (subObj[key] !== null) {
                    resolveIOData(ns, obj, subObj[key], location.concat(`/${key}`));
                }
                break;
            case 'array':
                subObj[key].forEach(o => resolveIOData(ns, obj, o, location.concat(`/${key}`)));

        }
    });
    return obj;
}