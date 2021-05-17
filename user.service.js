const db = require('./db')
const connection = db.getConnection()

const idExists = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM user WHERE id = ?', id, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results.length > 0)
      }
    })
  })
}

const findAll = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM user', (e, results, fileds) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const findOne = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM user WHERE id = ?', id, (e, result, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(result)
      }
    })
  })
}

const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM user WHERE username = ?', username, (e, result, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(result[0])
      }
    })
  })
}

const addOne = (username, password) => {
  let user = {
    username: username,
    password: password
  }

  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO user SET ?', user, (e, result, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  findAll,
  findOne,
  idExists,
  findByUsername,
  addOne,
}