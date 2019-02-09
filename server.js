const express = require('express')
const app = express()
const port = 3000

app.get('/people', (req, res) => {
    res.send('got the peoples')
})

app.get('/planets', (req, res) => {
    res.send('Gustav Holst - Jupiter')
})

app.listen(port, () => console.log(`Server running on port ${port}`))