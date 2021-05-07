const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const usersService = require('./user.service')
const { resolve } = require('path')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const readFileName = () => {
  return new Promise((resolve, reject) => {
    fs.readdir('public', (e, files) => {
      if (e) {
        console.error(e)
        reject(500)
      } else {
        resolve(files)
      }
    })
  })
}

app.get('/public', (req, res) => {

  readFileName()
    .then(files => {
      console.info(files)
      res.send(files)
    })
    .catch(statusCode => {
      console.error(statusCode)
      res.sendStatus(500)
    })
})

app.get('/login', (req, res) => {

  readFileName()
    .then(files => {
      console.info(files)
      res.send(files)
    })
    .catch(statusCode => {
      console.error(statusCode)
      res.sendStatus(500)
    })
})

app.get('/public/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'public', filename)

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error(err)
      return res.sendStatus(err.code === 'ENOENT' ? 404 : 400)
    }

    res.download(filePath)  
  })
})

const PORT = 8082
app.listen(PORT, () => {
  console.info(`Server started: http://localhost:${PORT}`)
})