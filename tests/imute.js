const Hashids = require('hashids/cjs')
const hashids = new Hashids()
const dag = require('../dag')

const key = hashids.encode(Date.now())
const value = {
    name: 'try_mutable',
    time: Date.now(),
    created: new Date().toDateString(),
    type: 'yours'
}
const first = {
    name: 'first thing',
    time: Date.now(),
    created: new Date().toDateString(),
    type: 'mine'
}
const middle = {
    name: 'second thing',
    time: Date.now(),
    created: new Date().toDateString(),
    type: 'mine'
}
const last = {
    name: 'last thing',
    time: Date.now(),
    created: new Date().toDateString(),
    type: 'mine'
}
const items = [[key, value], ['mOBA8B9xO', first], ['mOBA8B9xO', middle], ['mOBA8B9xO', last]];

const populate = async () => {
    await items.map(async item => {
        try { await dag.storeItem(item) }
        catch (error) { console.error(error) }
    })
}
// populate()

const check = (stored, declared) => {
    let checked = {}
    checked.name = stored.name === declared.name ? true : false
    checked.time = stored.time === declared.time ? true : false
    checked.created = stored.created === declared.created ? true : false
    checked.type = stored.type === declared.type ? true : false
}

const testRunner = async (tests) => {
    try {
        for (const test of tests) {
            let result = await test()
            console.log(result)
        }
        process.exit()
    } catch (error) {
        console.error(error)
        process.exit()
    }
}

const storeItemTest = async () => dag.storeItem([key, value])
const getItemTest = async () => dag.getItem('mOBA8B9xO')
const getItemsTest = async () => dag.getItems('mOBA8B9xO')
const removeItemTest = async () => dag.removeItem('mOBA8B9xO')
const removeAllTest = async () => dag.removeAll()
const getAllTest = async () => dag.getAll()
const getKeysTest = async () => dag.getKeys()


// testRunner([getKeysTest])
// testRunner([getItemTest])
// testRunner([removeItemTest])
// testRunner([getItemTest])
// testRunner([removeAllTest])
testRunner([getAllTest])
// testRunner([getItemsTest])
// testRunner([storeItemTest])