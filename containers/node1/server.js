const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
    res.sendFile("access.html", { root: "./webpage" });

  })
  app.get('/casa', (req, res) => {
    res.send("reti di calcolatori");

  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })