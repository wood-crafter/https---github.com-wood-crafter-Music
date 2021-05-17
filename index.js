const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const usersService = require('./user.service')
const songsService = require('./song.service')
const { resolve } = require('path')
const jwt = require('jsonwebtoken')
const Busboy = require('busboy')
const mime = require('mime-types')

const SECRET_KEY = 'HuckFitler'
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

app.post('/signup', (req, res) => {
  const body = req.body

  usersService.findByUsername(body.username)
    .then(result => {
      if (result) {
        console.info('User name exist!')
        res.send(400)
        return
      }

      console.log("OK!")
      return usersService.addOne(body.username, body.password)
        .then((result) => {
          res.send(200)
          return
        })
    })
    .catch((e) => {
      console.error(e)
      res.send(401)
    })
})

app.post('/login', (req, res) => {
  const user = req.body

  usersService.findByUsername(user.username)
    .then(result => {
      if (!result) {
        console.info('user not found')
        res.send(404)
        return
      }

      if (user.password === result.password) {
        const token = jwt.sign({ username: user.username }, SECRET_KEY)
        res.send(token)
        return
      }

      console.info('Wrong password!')
      res.sendStatus(401)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(e.statusCode)
    })
})

app.head('/auth', (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.sendStatus(401)
    return
  }

  const token = authHeader.substring('Bearer '.length)

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) {
      console.error(err)
      res.sendStatus(401)
      return
    }
    console.log(payload)
    res.sendStatus(200)
  })
})

// app.post('/upload', (req, res) => {
//   req.pipe(fs.createWriteStream('public/1.mp3'))
//     .once('close', () => {
//       console.info('Upload ok babe!')
//       res.sendStatus(200)
//     })
// })

app.post('/upload', (req, res) => {
  let songName = ''
  let type = ''
  let busboy = new Busboy({ headers: req.headers })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
    if (fieldname === 'songName') {
      songName = val
    }
  })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    type = mime.extension(mimetype)
    if(!songName){
      res.sendStatus(400)
    }
    file.pipe(fs.createWriteStream(`public/${songName}.${type}`))
    console.log(`File [${fieldname}]: filename:  ${filename} - encoding: ${encoding} - mimetype: ${mime.extension(mimetype)}`)
    file.on('data', function (data) {
      console.log(`File [${fieldname}] got  ${data.length} bytes`)
    })
    file.on('end', function () {
      console.log(`File [${fieldname}] Finished`)
    })
  })

  busboy.on('finish', function () {
    res.sendStatus(200)
  })

  req.pipe(busboy)
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

