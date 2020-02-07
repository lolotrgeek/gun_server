const Gun = require('gun')
const unset = require('gun/lib/unset.js')
const gun = Gun(['http://localhost:8765/gun'])

let tabs = gun.get('tabGroups')
tabs.map().on((data, key) => {
    console.log(data)
    gun.get('tabGroups').get(key).put(null)
    
})
