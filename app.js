const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
let db = null
const dbpath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())
const initializeDbAndServer = async () => {
  try {
    db = await open({filename: dbpath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('the db server is running at http://localhost/3000')
    })
  } catch (error) {
    console.log(`the db is server is not running properly ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()
const convertCamelCase = eachplayer => {
  return {
    playerId: eachplayer.player_id,
    playerName: eachplayer.player_name,
    jerseryNumber: eachplayer.jersey_number,
    role: eachplayer.role,
  }
}
// GET API 1
app.get('/players/', async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team;`
  const dbresponse = await db.all(playersQuery)
  const answer = dbresponse.map(eachPlayer => {
    return convertCamelCase(eachPlayer)
  })
  response.send(answer)
})

// POST API 2
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postDetailsQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) 
  VALUES ('${playerName}' , ${jerseyNumber}, '${role}');`
  const player = await db.run(postDetailsQuery)
  response.send('Player Added to Team')
})
// GET one player API 3
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getDetailsQuery = `SELECT * FROM 
  cricket_team 
  WHERE 
  player_id = ${playerId};`
  const playerDetails = await db.get(getDetailsQuery)
  response.send(convertCamelCase(playerDetails))
})

// PUT API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const putDetailsQuery = `UPDATE 
  cricket_team
   SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE player_id = ${playerId};`
  await db.run(putDetailsQuery)
  response.send('Player Details Updated')
})


// DELETE API 5
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteDetailsQuery = `
  DELETE FROM 
    cricket_team
   WHERE 
    player_id = ${playerId};`
  await db.run(deleteDetailsQuery)
  response.send('Player Removed')
})

module.exports = app
