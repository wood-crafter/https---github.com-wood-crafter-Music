const db = require('./db')
const connection = db.getConnection()


const addOne = (userId, title) => {
  let playlist = {
    user_id: userId,
    title: title
  }

  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO playlist SET ?', playlist, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const addSong = (songId, playlistId) => {
  let song = {
    song_id: songId,
    playlist_id: playlistId
  }

  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO playlist_song SET ?', song, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const removeSong = (songId, playlistId) => {

  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM playlist_song WHERE (song_id = ? AND playlist_id = ?)', [songId, playlistId] , (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const isPlaylistContainSong = (songId, playlistId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM playlist_song WHERE song_id = ? AND playlist_id = ?', [songId, playlistId], (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const getAll = (user_id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM playlist WHERE user_id = ?', user_id, (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results)
      }
    })
  })
}

const getAllSong = (playlistId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM playlist_song WHERE playlist_id = ?', playlistId, (e, results, fields) => {
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
    connection.query('SELECT * FROM playlist ORDER BY id DESC LIMIT 1', (e, results, fields) => {
      if (e) {
        reject(e)
      } else {
        resolve(results[0].id)
      }
    })
  })
}

module.exports = {
  addOne,
  addSong,
  getAll,
  getAllSong,
  isPlaylistContainSong,
  removeSong,
  getLastest,

}