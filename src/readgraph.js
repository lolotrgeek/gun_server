'use strict';

const Gun = require('gun')
const gun = Gun()
const { iskeyset, log, trimSoul, printProgress, save } = require('./functions')


// TODO see if it works as an explict export function
// based on readdir.js
/**
- `ExportRecursive()` is called with a starting key and returns a Promise.


- Internally `readGraph()` is called and passed `startKey` to read from.


- A list of items is returned by `getItemList()` as a Promise, which in turn is chained to `getItemKeys()` to determine if each item is a keyset or entry.


- Finalised list then passed to `processItemList()`:
    - Entries are added to accumulating `entryList` array.
    - Keysets are added to `readGraphQueue`.
    - If keysets exist on `readGraphQueue`, next key is shifted off to another `readGraph()` call and returned to parent Promise (this is the recursion).


- Process continues until `readGraphQueue` is exhausted at which point the final Promise will resolve by returning accumulated `entryList` from `readGraphRecursive()`.
 */
function readGraphRecursive(startKey) {
    const
        readGraphQueue = [],
        entryList = [];

    function readGraph(nextkey) {
        printProgress(`${entryList.length}/${readGraphQueue.length} - ${nextkey} `)
        function getItemList(nextkey) {
            return new Promise((resolve, reject) => {
                if (!nextkey) {
                    return reject('no key')
                }
                gun.get(nextkey).once((data, key) => {
                    if (typeof data === 'object') resolve({ key, data: trimSoul(data) })
                })
            });
        }
        function getItemKeys(item) {
            function getStat(item) {
                return new Promise((resolve, reject) => {
                    // console.log(item.key)
                    if (!item || !item.data) return reject('no item')
                    resolve({ iskeyset: iskeyset(Object.values(item.data)), item })
                })
            }
            return getStat(item)
        }
        function processItemList(itemList) {
            if (itemList.iskeyset) {
                // Object.values(itemList.item.data).map(value => console.log(value['#']))
                Object.values(itemList.item.data).map(value => readGraphQueue.push(value['#']))
            }
            entryList.push(itemList.item)
            // TODO: eventually stops and does not continue processing...
            if (readGraphQueue.length > 0) {
                return readGraph(readGraphQueue.shift())
            }
            return entryList;
        }
        return getItemList(nextkey)
            .then(getItemKeys)
            .then(processItemList)
    }
    return readGraph(startKey)
}

readGraphRecursive('app')
    .then(itemList => console.log('ItemList:', itemList))
    .catch(err => console.log(err))