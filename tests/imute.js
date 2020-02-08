const dag = require('../dag');

(async () => {
    let all = await dag.getAll()
    console.log(all)
})()