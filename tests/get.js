const dag = require('../dag')

const test = dag.getAll(value => value.type === 'mine' ? true : false)
console.log(test)