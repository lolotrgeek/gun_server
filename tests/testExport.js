const fs = require("fs")
const deepEqual = require('deep-equal')
const sortKeys = require('sort-keys')
const process = require("process")
const truth = require('./testdata.json')
const exported = require('../1602869511144.json')
/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}
function DiffObjects(o1, o2) {
    // choose a map() impl.
    // you may use $.map from jQuery if you wish
    var map = Array.prototype.map?
        function(a) { return Array.prototype.map.apply(a, Array.prototype.slice.call(arguments, 1)); } :
        function(a, f) { 
            var ret = new Array(a.length), value;
            for ( var i = 0, length = a.length; i < length; i++ ) 
                ret[i] = f(a[i], i);
            return ret.concat();
        };

    // shorthand for push impl.
    var push = Array.prototype.push;

    // check for null/undefined values
    if ((o1 == null) || (o2 == null)) {
        if (o1 != o2)
            return [["", "null", o1!=null, o2!=null]];

        return undefined; // both null
    }
    // compare types
    if ((o1.constructor != o2.constructor) ||
        (typeof o1 != typeof o2)) {
        return [["", "type", Object.prototype.toString.call(o1), Object.prototype.toString.call(o2) ]]; // different type

    }

    // compare arrays
    if (Object.prototype.toString.call(o1) == "[object Array]") {
        if (o1.length != o2.length) { 
            return [["", "length", o1.length, o2.length]]; // different length
        }
        var diff =[];
        for (var i=0; i<o1.length; i++) {
            // per element nested diff
            var innerDiff = DiffObjects(o1[i], o2[i]);
            if (innerDiff) { // o1[i] != o2[i]
                // merge diff array into parent's while including parent object name ([i])
                push.apply(diff, map(innerDiff, function(o, j) { o[0]="[" + i + "]" + o[0]; return o; }));
            }
        }
        // if any differences were found, return them
        if (diff.length)
            return diff;
        // return nothing if arrays equal
        return undefined;
    }

    // compare object trees
    if (Object.prototype.toString.call(o1) == "[object Object]") {
        var diff =[];
        // check all props in o1
        for (var prop in o1) {
            // the double check in o1 is because in V8 objects remember keys set to undefined 
            if ((typeof o2[prop] == "undefined") && (typeof o1[prop] != "undefined")) {
                // prop exists in o1 but not in o2
                diff.push([prop, "prop exists in truth but not in export", o1[prop], undefined]); // prop exists in o1 but not in o2

            }
            else {
                // per element nested diff
                var innerDiff = DiffObjects(o1[prop], o2[prop]);
                if (innerDiff) { // o1[prop] != o2[prop]
                    // merge diff array into parent's while including parent object name ([prop])
                    push.apply(diff, map(innerDiff, function(o, j) { o[0]="[" + prop + "]" + o[0]; return o; }));
                }

            }
        }
        for (var prop in o2) {
            // the double check in o2 is because in V8 objects remember keys set to undefined 
            if ((typeof o1[prop] == "undefined") && (typeof o2[prop] != "undefined")) {
                // prop exists in o2 but not in o1
                diff.push([prop, "prop exists in export but not in truth", undefined, o2[prop]]); // prop exists in o2 but not in o1

            }
        }
        // if any differences were found, return them
        if (diff.length)
            return diff;
        // return nothing if objects equal
        return undefined;
    }
    // if same type and not null or objects or arrays
    // perform primitive value comparison
    if (o1 != o2)
        return [["", "value", o1, o2]];

    // return nothing if values are equal
    return undefined;
}
const clean = data => {
    let cleandata = {}
    if (typeof data === 'string') {
        data = JSON.parse(data)
    }
    if (typeof data === 'object') {
        for (key in data) {
            let entry = trimSoul(data[key])
            cleandata[key] = entry
        }
    }
    return cleandata
}

const testExport = (truth, exported) => {
    exported = clean(exported)
    console.log(typeof exported)
    truth = clean(truth)
    console.log(typeof truth)
    // return deepEqual(exported, truth)
    return DiffObjects(truth, exported)
}

let run = testExport(truth, exported)
console.log("Diffs? ", run)
if(run.length > 0) {
    console.error('FAILED.')
}
