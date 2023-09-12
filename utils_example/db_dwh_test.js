const mysql = require('mysql2');


//  db ambiente di test
 const db = mysql.createPool({
    host: "xxx.xxx.xx.xx",
    user: "xxxxx",
    password: "xxxx",
    database: "xxxx",
    timezone: "Z"
})  


module.exports = db.promise();