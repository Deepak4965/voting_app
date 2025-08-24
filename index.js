const express = require('express')
const app = express()
const db = require('./db')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')

require('dotenv').config();

const PORT = process.env.PORT || 4000

//Use the routers
app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)

app.get("/", (req, res) => {
    res.send("hey")
})

app.listen(PORT, () => {
    console.log('Listening on port 4000');

})