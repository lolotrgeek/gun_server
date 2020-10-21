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

function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress.toString());
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