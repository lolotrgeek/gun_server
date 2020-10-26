const Gun = require('gun')
const gun = Gun()
const fs = require("fs")
const process = require("process")
const testdata = require("./tests/testdata.json")

/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}

const parse = data => {
    console.log(typeof data)
    if (typeof data === 'object') {
        return data
    }
    else if (typeof data === 'string') {
        const jsonobj = JSON.parse(data)
        if (jsonobj) return jsonobj
        else{
            console.log('Invalid JSON')
            return false
        }
    } else {
        console.log('invalid Data')
        return false
    }
}

function Import(data) {
    data = parse(data)
    if (data) {
        for (key in data) {
            let entry = trimSoul(data[key])
            console.log(key)
            gun.get(key).put(entry)
        }
    }
}

Import(testdata)
