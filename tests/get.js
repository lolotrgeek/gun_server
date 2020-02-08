const store = require('../store')

const validator = value => value.type === 'mine' ? true : false;

(async () => {
    try {
        let all = await store.getAll()
        console.log(all)
        process.exit()
    } catch(err) {
        console.error(err)
        process.exit()
    }
})()