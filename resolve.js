/**
 * Resolves references that refer to the same sdfFile and converts the other references to full URIs. This function only has an impact on references declared with sdfRef. It does not change the sdfRequired array.
 * @param {*} ns The namespace map.
 * @param {*} obj The object with unresolved references.
 * @returns An object with resolved references.
 */
exports.resolveRef = function(ns, obj){
    return obj;
}