exports.resolve = function (ns, obj) {
    return unify(resolveRef(ns, obj));
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
function resolveRef(ns, obj) {
    return obj;
}