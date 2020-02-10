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
populate();

(async () => {
    try {
        let last_item = await dag.getItem('mOBA8B9xO')
        console.log(last_item)
        let history = await dag.getItems('mOBA8B9xO')
        console.log(history)
        let all = await dag.getAll()
        console.log(all)

        process.exit()
    } catch (error) {
        console.error(error)
        process.exit()
    }

})()