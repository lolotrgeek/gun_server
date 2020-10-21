/* eslint-disable no-unused-vars */
const Gun = require('gun')
const gun = Gun()
const fs = require("fs")
const process = require("process")

const debug = false
const logfile = "log" + Date.now() + ".csv"
// const output = Date.now() + ".json"
const output = "exported.json"

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

const runChain = ({ key, final, count, total }) => {
    if (!key) { console.log('No Key'); return false }
    if (!count) count = 0
    if (!total) total = []
    if (!final) final = {}
    // if(Object.keys(final).length === 0) final[key] = {}
    // debug && console.log('Getting Key: ', key)
    gun.get(key).once((current, currentkey) => {
        if (current === null || current === undefined) { debug && console.log(' [End of Chain]'); return false }
        current = trimSoul(current)
        debug && console.log('Moving Down Chain:', currentkey, current)
        final[key] = current
        debug && console.log(final)
        let values = Object.values(current)
        debug && console.log(values)
        // total.push(values.length)
        let log = `${count},${key},${JSON.stringify(current)}\n`
        fs.appendFile(logfile, log, "utf8", () => { })
        fs.writeFile(output, JSON.stringify(final), "utf8", () => { })
        let check = values.some(value => value && value['#'] && typeof value['#'] === 'string')
        if (check) {
            values.forEach(value => {
                debug && console.log('Getting next: ', value['#'])
                ++count
                runChain({ key: value['#'], final, count, total })
            })
        }
        printProgress(count + ' - ' + key)
    })
}

const recursiveCallBase = (index, values) => {
    return new Promise((resolve) => {
        // console.log(index);
        if (index < values.length && values) {
            values.forEach(value => {
                console.log(value)
                return resolve(recursiveCall(++index, value))
            })
        } else {
            return resolve()
        }
    })
}

/**
 * 
 * @param {array} values 
 */
const check = values => values.some(value => value && value['#'] && typeof value['#'] === 'string')

const recursiveCall = (index, key, final) => {
    return new Promise((resolve) => {
        console.log('Getting next: ', key)
        gun.get(key).once((current, currentkey) => {
            if (current === null || current === undefined) {
                console.log(' [End of Chain]')
                return resolve()
            }
            current = trimSoul(current)
            final[key] = current
            console.log()
            let values = Object.values(current)
            if (check(values) === true) {
                values.forEach(value => resolve(recursiveCall(++index, value['#'], final)))
            }
            else return resolve()
        })
    })
}


/**
 * Convert radata into JSON and save it
 */
const Export = () => {
    // runChain({ key: 'app' })
    let final = {}
    console.log('Exporting...')
    recursiveCall(0, 'app', final).then(() => fs.writeFile(output, JSON.stringify(final), "utf8", () => { console.log('done') }));


}
Export()

module.exports = { Export }