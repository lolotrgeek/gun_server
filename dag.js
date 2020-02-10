// import 'gun-asyncstorage'
// import Gun from 'gun/gun.js'
const Gun = require('gun')
const port = '8765'
const address = 'localhost'
// const gun = new Gun(`http://${address}:${port}`)
const gun = Gun([`http://${address}:${port}`])



/**
 * Add key value pair to graph
 * @param {Array} item `[key, value]`
 * 
 * @todo decouple validation
 */
function storeItem(item) {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(item[0]).set(item[1], ack => {
            ack.err ? reject(ack.err) : resolve(item)
        })
    })
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

/**
 * retrieve last item from entry graph
 * @param {Array} id 
 */
function getItem(id) {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(id).map().once((data, key) => {
            if (!data) reject(`${data} is not here.`)
            resolve([id, trimSoul(data)])
        })
    })
}

/**
 * retrieve all items from entry graph
 * @param {Array} id 
 */
async function getItems(id) {
    let results = []
    await gun.get('Items').get(id).map().on((data, key) => {
        new Promise((resolve, reject) => {
            if (!data) reject(`${data} is not here.`)
            resolve(results.push(trimSoul(data)))
        })
    })
    return Promise.all(results)
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
        gun.get('Items').get(key).set(null, (ack) => {
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
 * @todo could run this within gun.map() filter 
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
 * Get all Keys from Gun Store
 * @param {boolean} [validator] (key, value) critera for each item to pass
 */
const getKeys = async () => {
    let keys = []
    await gun.get('Items').map().on((value, key) => {
        new Promise(async (resolve, reject) => {
            if (!key) reject('no key')
            resolve(keys.push(key))
        })
    })
    return Promise.all(keys)
}

/**
 * Get all Items from Gun Store, including immutable sets
 * @param {boolean} [validator] (key, value) critera for each item to pass
 */
const getAll = async () => {
    let results = []
    let keys = await getKeys()
    if (!Array.isArray(keys)) return ('invalid keys')
    await keys.map(key => {
        results.push(getItem(key))
    })
    return Promise.all(results)
}


/**
 * `DANGER!`
 * Nullifies entire Item Store.
 */
const removeAll = async () => {
    let keys = await getKeys()
    let results = []
    if (!Array.isArray(keys)) return ('invalid keys')
    await keys.map(key => results.push(storeItem([key, null])))
    return Promise.all(results)
}

module.exports = {
    getAll: getAll,
    removeAll : removeAll,
    storeItem: storeItem,
    removeItem : removeItem,
    getItem: getItem,
    getItems: getItems,
    getKeys: getKeys
}