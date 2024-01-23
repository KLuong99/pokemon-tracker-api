const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const uri = process.env.MONGODB_URI
const PORT = 8000
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'mons'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',(request, response)=>{
    db.collection('pokemons').find().sort({likes: -1}).toArray()
    .then(data => {
        response.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/addPokemon', (request, response) => {
    db.collection('pokemons').insertOne({pokemonName: request.body.pokemonName,
    heldItem: request.body.heldItem, likes: 0})
    .then(result => {
        console.log('Pokemon Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('pokemons').updateOne({pokemonName: request.body.pokemonNameS, heldItem: request.body.hItemS,likes: request.body.likesS},{
        $set: {
            likes:request.body.likesS + 1
          }
    },{
        sort: {_id: -1},
        upsert: true
    })
    .then(result => {
        console.log('Added One Like')
        response.json('Like Added')
    })
    .catch(error => console.error(error))

})

app.delete('/deletePokemon', (request, response) => {
    db.collection('pokemons').deleteOne({pokemonName: request.body.pokemonNameS})
    .then(result => {
        console.log('Pokemon Deleted')
        response.json('Pokemon Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.MONGODB_URI || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})