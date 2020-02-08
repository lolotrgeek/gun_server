const store = require('../store')
const Hashids = require('hashids/cjs')
const hashids = new Hashids()

const key = hashids.encode(Date.now())
const value = {
    important: 'new thing',
    created: new Date().toDateString(),
    type: 'yours'
}
const staticItem = ['findme', {created: new Date().toDateString(), type: 'mine'}]
const item = [key, value];

(async () => {
    try {
        await store.storeItem(item)
        await store.storeItem(staticItem)
        let validator = value => value.type === 'yours' ? true : false
        let all = await store.getAll(validator)
        console.log(all)
        const one = await store.getItem('findme')
        console.log(one)
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }
})()