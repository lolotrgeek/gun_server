const dag = require('../dag')
const Hashids = require('hashids/cjs')
const hashids = new Hashids()

const key = hashids.encode(Date.now())
const value = {
    important: 'new thing',
    created: new Date().toDateString(),
    type: 'yours'
}
const item = [key, value];

(async () => {
    try {
        // await dag.storeItem(item)
        let validator = value => value.type === 'mine' ? true : false
        let all = await dag.getAll(validator)
        console.log(all)
        const one = await dag.getItem('q7JOD2JMy')
        console.log(one)
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }
})()

dag._getAll()