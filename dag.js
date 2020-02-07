// import 'gun-asyncstorage'
// import Gun from 'gun/gun.js'

const Gun = require('gun')
const port = '8765'
const address = '192.168.1.109'
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
 * Add key value pair to graph
 * @param {Array} item [key, value]
 * @todo decouple validation
 */
function _storeItem(item) {
    return new Promise((resolve, reject) => {
        let key = item[0]
        let value = item[1]
        const entries = gun.get('Items').get(key)
        const entry = gun.get(Date.now().toString())
        entry.put(value)
        entries.set(entry)
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
 * Update existing key with given value in Async Storage
 * @param {Array} item [key, value]
 */
exports.updateItem = async item => {
    let key = item[0]
    let value = item[1]
    if (typeof value === 'object' || Array.isArray(value)) value = JSON.stringify(value)
    gun.get('Items').get(key).put(value)
}

/**
 * Remove item in Gun Store
 * @param {*} item 
 */
exports.removeItem = async item => {
    return new Promise((resolve, reject) => {
        gun.get('Items').map().get(item[0]).put(null, (ack) => {
            if (ack.err) reject(ack.err)
            else resolve(item)
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
 * Get all Items from Gun Store 
 * @param {boolean} [validator] (key, value) critera for each item to pass
 */
const _getAll = () => {
    gun.get('Items').map().once((value, key) => {
        console.log(key, value)
        if (typeof value === 'object') {
            gun.get(value).map().once((value, key) => {
                console.log(key, value)
            })
        }
        // return new Promise((resolve, reject) => { resolve([key, value]) })
    })
}
/**
 * Delete entire Gun Store
 * @param {function} state
 */
exports.removeAll = async () => {
    return new Promise(async (resolve, reject) => {
        gun.get('Items').map().once((value, key) => {
            gun.get('Item').get(key).put(null)
        })
    })
}
module.exports = {
    getAll: getAll,
    _getAll: _getAll,
    storeItem: storeItem,
    getItem: getItem,
    getValue: getValue
}