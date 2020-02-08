const store = require('../store');

(async () => {
    try {
        let remove = await store.removeItem('r8KPXg0w2')
        console.log(remove)
        let removed = await store.removeAll()
        console.log(removed)
        let all = await store.getAll()
        console.log(all)
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }
})()