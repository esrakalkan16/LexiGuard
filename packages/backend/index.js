const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

let counter = 0;

app.get('/api/message', (req, res) => {
    counter++;
    const z = new Date().toLocaleTimeString('tr-TR');
    res.json({ message: `Merhaba deneme :) Bu mesaj dinamik! (Sayaç: ${counter} - Saat: ${z})` });
});

app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
