require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// ─── Sağlık kontrolü ───────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LexiGuard Backend' });
});

// ─── Test endpoint (eski) ──────────────────────────────────────────
app.get('/api/message', (req, res) => {
    res.json({ message: 'LexiGuard Backend çalışıyor!' });
});

// ─── Analiz endpointi (NLP servisine proxy) ────────────────────────
app.post('/api/analyze', async (req, res) => {
    const { text, source_url, company_name } = req.body;

    if (!text || text.trim().length < 50) {
        return res.status(400).json({
            error: 'Analiz için en az 50 karakter uzunluğunda metin gereklidir.',
        });
    }

    try {
        const { default: fetch } = await import('node-fetch');
        const nlpResponse = await fetch(`${NLP_SERVICE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, source_url, company_name }),
        });

        if (!nlpResponse.ok) {
            throw new Error(`NLP servisi hata döndürdü: ${nlpResponse.status}`);
        }

        const data = await nlpResponse.json();
        res.json(data);
    } catch (err) {
        console.error('NLP servisi hatası:', err.message);
        res.status(503).json({
            error: 'NLP analiz servisi şu anda kullanılamıyor.',
            detail: err.message,
        });
    }
});

// ─── Sunucu ───────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend API → http://localhost:${PORT}`);
    console.log(`🔗 NLP Servisi  → ${NLP_SERVICE_URL}`);
});
