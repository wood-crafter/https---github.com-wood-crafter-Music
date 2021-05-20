const db = require('./db')
const connection = db.getConnection()

const findAbsolute = findingText => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM songs WHERE name = ?', findingText, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const getLastest = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM songs ORDER BY id DESC LIMIT 1', (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const get = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM songs WHERE id = ?', id, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const addOne = songName => {
  let song = {
    name: songName
  }

  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO songs SET ?', song, (e, results, fields) => {
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
  addOne,
  getLastest,
  get,
  
}