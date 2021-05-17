const db = require('./db')
const connection = db.getConnection()

const findAbsolute = findingText => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM files WHERE filename = ?', findingText, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

module.exports = {
  findAbsolute,

}