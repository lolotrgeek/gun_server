/* eslint-disable no-unused-vars */
const Gun = require('gun')
const gun = Gun()
const {iskeyset, log, trimSoul, printProgress, save } = require('./functions')

const debug = false
// const output = Date.now() + ".json"
const output = "exported.json"

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
 * Walks the graph
 * @param {*} key 
 * @param {*} final 
 * @todo works, but seems to miss certain keys... cause unknown... see TODO below
 */
const recursiveCall = (key, final) => {
    return new Promise((resolve) => {
        log('[Getting next] ' + key)
        gun.get(key).once((current, currentkey) => {
            if (current && current !== null && current !== undefined) {
                current = trimSoul(current)
                final[key] = current
                let entry = `${JSON.stringify(key)}:${JSON.stringify(current)}`
                // final.push(entry)
                // log(`[Updating] ${JSON.stringify(entry)}`)
                let values = Object.values(current)
                if (iskeyset(values) === true) {
                    values.forEach( async value => {
                        resolve(recursiveCall(value['#'], final))
                    })
                }
                else {
                    log(' [End of Chain] ' + currentkey)
                    log(`[Storing] ${JSON.stringify(final)}`)
                    save(output, JSON.stringify(final))
                    return resolve()
                }
            }
        })
        // printProgress(key)
    })

}


/**
 * Convert radata into JSON and save it
 */
const Export = () => {
    let final = {}
    recursiveCall('app', final).then(() => {
        console.log('done.')
        log('[Storing] root promise finished...')
    });
    // root promise will resolve before the children promises resolve, not sure how to await recursive promises...

}
Export()

// TODO: seems to miss one entry...
// gun.get('app/date/projects/10-01-2020/57nX6nPVR').once((data, key) => console.log(data, key))
// if we remove that entry from the test data, and re-import the export works...

module.exports = { Export }