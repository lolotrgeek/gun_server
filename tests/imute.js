const Hashids = require('hashids/cjs')
const hashids = new Hashids()
const dag = require('../dag')

const key = hashids.encode(Date.now())
const value = {
    important: 'last thing',
    created: new Date().toDateString(),
    type: 'yours'
}
const staticItem = [
    'findme',
    { created: new Date().toDateString(), type: 'mine' }
]
const item = ['mOBA8B9xO', value];

(async () => {
    try {
        let store = await dag.storeItem(item)
        console.log(store)
        let retrieve = await dag.getItem('mOBA8B9xO')
        console.log(retrieve)
        // let all = await dag.getAll()
        // console.log(all)
        process.exit()
    } catch (error) {
        console.error(error)
        process.exit()
    }

})()