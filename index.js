const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const usersService = require('./user.service')
const songsService = require('./song.service')
const playlistService = require('./playlist.service')
const jwt = require('jsonwebtoken')
const Busboy = require('busboy')
const mime = require('mime-types')

const SECRET_KEY = 'HuckFitler'
const app = express()
app.use(cors())
app.use(express.json())

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
    res.sendStatus(200)
  })
})


app.post('/upload', (req, res) => {
  let songName = ''
  let type = ''
  let busboy = new Busboy({ headers: req.headers })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
    if (fieldname === 'songName') {
      songName = val
      console.info(songName)
    }
  })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    type = mime.extension(mimetype)
    console.info(type)
    if (!songName) {
      res.sendStatus(400)
      // return
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
    songsService.addOne(songName)
      .then(results => {
        return songsService.getLastest()
      })
      .then(result => {
        fs.renameSync(`public/${songName}.${type}`, `public/${result[0].id}.${type}`)
        res.sendStatus(200)
      })
      .catch(e => {
        console.error(e)
        res.sendStatus(400)
      })

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

app.get('/public/songName/:songId', (req, res) => {
  const songId = req.params.songId

  songsService.get(songId)
    .then(result => {
      res.send(result[0].name)
    })
})

app.post('/playlist/song', (req, res) => {
  const song = req.body

  playlistService.addSong(song.song_id, song.playlist_id)
    .then(status => {
      res.sendStatus(200)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})


app.post('/playlist/thisSong', (req, res) => {
  const body = req.body
  const authHeader = req.headers.authorization
  const token = authHeader.substring('Bearer '.length)

  if (!token) {
    res.sendStatus(401)
  }

  verifyJwt(token)
    .then(payload => {
      return usersService.findByUsername(payload.username)
    })
    .then(result => {
      return playlistService.addOne(result.id, body.title)
    })
    .then(result => {
      return playlistService.getLastest()
    })
    .then(result => {
      playlistService.addSong(body.songId, result)
      res.sendStatus(200)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.delete('/playlist/song', (req, res) => {
  const song = req.body

  playlistService.removeSong(song.song_id, song.playlist_id)
    .then(status => {
      res.sendStatus(200)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.get('/playlist/getAllSong', (req, res) => {
  const body = req.body

  playlistService.getAllSong(body.playlistId)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.post('/playlist_containSong', (req, res) => {
  const body = req.body

  playlistService.isPlaylistContainSong(body.songId, body.playlistId)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.get('/playlist_getAll', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader.substring('Bearer '.length)

  if (!token) {
    res.sendStatus(401)
  }

  verifyJwt(token)
    .then(payload => {
      return findAllPlaylist(payload.username)
    })
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

function verifyJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
}

function findAllPlaylist(username) {
  return usersService.findByUsername(username).then(res => {
    const userId = res.id
    return playlistService.getAll(userId)
  })
}

const PORT = 8082
app.listen(PORT, () => {
  console.info(`Server started: http://localhost:${PORT}`)
})

