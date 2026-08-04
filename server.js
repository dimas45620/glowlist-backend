const express = require('express')
const app = express()
const PORT = 3001

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Selamat Datang diGlowlist API 🔥DIMAS')
})

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`)
})