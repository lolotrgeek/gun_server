/* eslint-disable no-unused-vars */
const Gun = require('gun')
const gun = Gun()
const fs = require("fs")
const process = require("process")

const debug = false

/**
 * Load a web instance, dump localstorage, then save it as JSON
 */
const webExport = () => {
}
/**
 * use radless level? convert and update, or run an 'export' node on the network?
 * https://github.com/amark/gun/commit/84097d7e68ecaf7958cfcc2402d5638b81f47824
 * @param {*} data 
 */
const levelExport = () => {
  
}
/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}
const saveFile = obj => {
    fs.writeFile("filename.json", JSON.stringify(obj), "utf8", () => {
        console.log('Written to File.')
    })
}
function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress.toString());
}
function printLast(last) {
    process.stdout.clearLine();
    process.stdout.cursorTo(1);
    process.stdout.write(last.toString());
}
const runChain = ({ data, key, final, count }, callback) => {
    if (!key || !callback) return false
    count++
    if (!data) {
        gun.get(key).once((next, keychain) => {
            debug && console.log('Getting Root: ', keychain)
            debug && console.log(next)
            if (!next) return false
            next = trimSoul(next)
            runChain({ data: next, key: keychain, final, count }, callback)
        })
    }
    else if(data) {
        let last
        // key + datum
        for (datum in data) {
            if (datum && data[datum]) {
                let keyset = data[datum]['#'] // okay, these need to be mapped.
                if (keyset && key !== last) {
                    let chain = keyset
                    last = chain
                    // move to the next layer of the graph...
                    gun.get(chain).once((next, keychain) => {
                        next = trimSoul(next)
                        debug && console.log('Getting Next: ', keychain)
                        printLast(keychain)
                        debug && console.log(next)
                        if (!next) return false
                        // how to see if the next layer is a key set
                        runChain({ data: next, key: keychain, count, final }, callback)
                    })
                }
                // the next object found is not a key set, it is the end of the chain
                else {
                    count--
                    debug && console.log('End of Chain:', key, data)
                    last = key
                    final.push({ key: data })
                }
            }
        }
        printProgress(count)
        if (count === 0 && callback) callback(final)
    }

}
/**
 * Convert radata into JSON and save it
 */
const Export = () => {
    const done = []
    let count = 0
    runChain({ key: 'app', final: done, count }, output => saveFile(output))
}
Export()

module.exports = { Export }