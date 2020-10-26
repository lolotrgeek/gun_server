const process = require("process")
const fs = require("fs")

const logfile = "log" + Date.now() + ".csv"

/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}
/**
 * stdout on single line
 * @param {*} progress 
 */
function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress.toString());
}

/**
 * 
 * @param {array} values typically an array of `Object.values()`
 */
function iskeyset(values) {
    return values.some(value => value && value['#'] && typeof value['#'] === 'string')
}
/**
 * 
 * @param {string} string 
 */
function log(string) {
    fs.appendFile(logfile, string + '\n', "utf8", () => { })
}

const save = (file, entry) => fs.writeFile(file, entry, "utf8", () => { })
const start = () => fs.writeFile(output, '{' + '\n', "utf8", () => { console.log('Exporting...') })
const end = () => fs.appendFile(output, '}' + '\n', "utf8", () => { console.log('finished.') })
const endAll = final => fs.writeFile(output, JSON.stringify(final) + '\n', "utf8", () => { console.log('done.') })
const endEach = final => {
    final.forEach((entry, index) => {
        if (index + 1 === final.length) {
            fs.appendFile(output, entry, "utf8", () => { })
            end()
        } else {
            fs.appendFile(output, entry + ",", "utf8", () => { })
        }
    })
}

module.exports = { trimSoul, printProgress, log, iskeyset, save }