const express = require('express')
const app = express()
const port = 3000
const name = process.env.NAME_OF_NODE || "uno"

app.get('/', (req, res) => {
    res.send(`Hello ${name} !`)
})

app.listen(port, () => {
    console.log(`Server Started on Port  ${port}`)
})