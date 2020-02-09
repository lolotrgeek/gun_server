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
        let key = item[0]
        let value = item[1]
        gun.get('Items').get(key).set(value, ack => {
            ack.err ? reject(ack.err) : resolve([key, value])
        })


    })
}
/**
 * retrieve last item from entry graph
 * @param {Array} id 
 */
function getItem(id) {
    return new Promise((resolve, reject) => {
        gun.get('Items').get(id).map().once((data, key) => {
            if (!data) reject(`${data} is not here.`)
            resolve([key, data])
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
            resolve(results.push(data))
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
 * Get all Items from Gun Store, including immutable sets
 * @param {boolean} [validator] (key, value) critera for each item to pass
 */
const getAll = async () => {
    let results = []
    await gun.get('Items').map().once((value, key) => {
        console.log(key)
        new Promise((resolve, reject) => {
            resolve(results.push([key, value]))
        })
    })
    return Promise.all(results)
}

/**
 * Delete entire Gun Store
 */
exports.removeAll = async () => {
    return new Promise(async (resolve, reject) => {
        await gun.get('Items').map().once(async (value, key) => {
            return new Promise((resolve, reject) => {
                resolve(gun.get('Item').get(key).put(null))
            })
        })
    })
}

module.exports = {
    getAll: getAll,
    storeItem: storeItem,
    getItem: getItem,
    getItems: getItems,
}