const mysql = require('mysql')

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'user',
  password: '321Flash!',
  database: 'music'
})

connection.connect()
connection.once('connect', () => {
  console.info('DB Connected...!')
})
process.once('exit', () => {
  connection.destroy
})

function getConnection(){
  return connection
}

module.exports = {
  getConnection
}