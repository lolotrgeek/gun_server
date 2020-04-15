// import 'gun-asyncstorage'
// import Gun from 'gun/gun.js'

const Gun = require('gun')
const port = '8765'
const address = 'localhost'
// const gun = new Gun(`http://${address}:${port}`)
const gun = Gun([`http://${address}:${port}`])

/**
 * Add key value pair to graph
 * @param {Array} item [key, value]
 * @todo decouple validation
 */
function storeItem(item) {
    return new Promise((resolve, reject) => {
        if (typeof item[1] !== 'object') return item
        let key = item[0]
        let value = JSON.stringify(item[1])
        gun.get('Items').get(key).put(value, (ack) => {
            if (ack.err) reject(ack.err)
            else resolve(item)
        })
    })

}
/**
 * retrieve item key, value pair from graph
 * @param {Array} id 
 */
function getItem(id) {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(id, (ack) => {
            if (ack.err) { reject(ack.err) }
            else if (!ack.put) { reject(`Nothing Found for id : ${id}`) }
            else { resolve([id, ack.put]) }
        })

    })
}

/**
 * retrieve value from graph
 * @param {Array} id 
 */
function getValue(id) {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(id, (ack) => {
            if (ack.err) { reject(ack.err) }
            else if (!ack.put) { reject(`Nothing Found for id : ${id}`) }
            else { resolve(ack.put) }
        })
    })
}

/**
 * Update existing key with given value
 * @param {Array} item [key, value]
 */
exports.updateItem = async item => storeItem(item)

/**
 * Remove item in Gun Store
 * @param {*} key 
 */
const removeItem = async key => {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(key).put(null, (ack) => {
            if (ack.err) reject(ack.err)
            else resolve(key)
        })
    })
}

/**
 * Run validator against result
 * @param {*} result 
 * @param {*} validator
 * @todo check for bad validator 
 */
const storeMap = (result, validator) => {
    let key = result[0]
    let value = result[1]
    if (!key || key === 'undefined') return false
    if (!value || value === 'undefined') return false
    if (typeof value === 'string' && value.charAt(0) === '{') {
        let value = JSON.parse(result[1])
        if (validator(value) === true) return [key, value]
        else return false
    }
    else return false
}

/**
 * Get all Items from Gun Store 
 * @param {boolean} [validator] (key, value) critera for each item to pass
 */
const getAll = validator => {
    return new Promise(async (resolve, reject) => {
        let results = []
        await gun.get('Items').map().once((value, key) => {
            return new Promise((resolve, reject) => { resolve(results.push([key, value])) })
        })
        if (!validator) resolve(results)
        else resolve(results.map(result => storeMap(result, validator)).filter(result => result))
    })
}

/**
 * Delete entire Gun Store
 */
const removeAll = () => {
    return new Promise(async (resolve, reject) => {
        let done = []
        await gun.get('Items').map().once((value, key) => {
            return new Promise(async (resolve, reject) => {
                await gun.get('Items').get(key).put(null, ack => {
                    return new Promise((resolve, reject) => {
                        console.log(`removing ${key}`)
                        ack.err ? reject(ack.err) : resolve(done.push(key))
                    })
                })
                resolve(done)
            })
        })
        resolve(done)
    })
}

module.exports = {
    getAll: getAll,
    storeItem: storeItem,
    getItem: getItem,
    getValue: getValue,
    removeAll: removeAll,
    removeItem : removeItem

}