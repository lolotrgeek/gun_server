const util = require('util')
const fs = require('fs')

const Gun = require('gun');
const port = '8765';
const address = '192.168.1.109';
const gun = Gun([`http://${address}:${port}`]);

const diagnose = () => {
    gun.get('Items').map().once((value, key) => {
        console.log(key, value)
        gun.get('Items').get(key, ack =>{
            let name = `./logs/${key}.json`
            let data = JSON.stringify(ack)
            console.log(data)
           fs.appendFile(name, data, (err) => {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
          });
        })
        console.log('Done.')
    })
};

diagnose()
process.exit()