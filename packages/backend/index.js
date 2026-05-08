require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const supabase = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 3000;
// NLP URL usually runs on 8000
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Setup multer for memory storage (we don't need to save to disk to parse)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// ─── Sağlık kontrolü ───────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LexiGuard Backend' });
});

// ─── Analiz endpointi (Multer ile dosya yükleme ve NLP'ye proxy) ───
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        let text = '';

        // If file is provided, parse it
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const ext = originalname.toLowerCase().split('.').pop();

            if (ext === 'pdf' || mimetype === 'application/pdf') {
                const pdfData = await pdfParse(buffer);
                text = pdfData.text;
            } else if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer: buffer });
                text = result.value;
            } else if (ext === 'txt' || mimetype === 'text/plain') {
                text = buffer.toString('utf-8');
            } else {
                return res.status(400).json({ error: 'Desteklenmeyen dosya formatı. Sadece .pdf, .docx, .txt kabul edilir.' });
            }
        } else if (req.body.text) {
            // Fallback for direct text input
            text = req.body.text;
        } else {
            return res.status(400).json({ error: 'Lütfen analiz edilecek bir dosya yükleyin veya metin sağlayın.' });
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                error: 'Analiz için belgeden yeterli uzunlukta (en az 50 karakter) metin çıkarılamadı.',
            });
        }

        // Send extracted text to NLP service
        const { default: fetch } = await import('node-fetch');
        // We use the JSON endpoint of our FastAPI NLP service (since we updated it to support both, JSON is easier here)
        // Wait, the FastAPI route we wrote earlier expects UploadFile OR we can just use the form data.
        // Actually, our updated FastAPI expects an UploadFile. Let's send it as FormData to NLP, or rewrite FastAPI to accept JSON text again.
        // Wait! In the previous prompt, I wrote: `def analyze_contract(file: UploadFile = File(...), company_name: str | None = Form(None)):`
        // So the NLP service *only* accepts UploadFile now! 
        // If Express is doing the parsing (as requested by user), then Express should send JSON. But NLP expects a file. 
        // To fix this cleanly, I'll send the extracted text as a dummy text file to FastAPI, OR I'll modify Express to send it properly.
        // Let's create a FormData in Express to send to FastAPI as a .txt file.
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', Buffer.from(text, 'utf-8'), { filename: 'extracted.txt', contentType: 'text/plain' });
        if (req.body.company_name) {
            formData.append('company_name', req.body.company_name);
        }

        const nlpResponse = await fetch(`${NLP_SERVICE_URL}/api/analyze`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!nlpResponse.ok) {
            const errorText = await nlpResponse.text();
            throw new Error(`NLP servisi hata döndürdü: ${nlpResponse.status} - ${errorText}`);
        }

        const data = await nlpResponse.json();
        const filename = req.file ? req.file.originalname : 'Metin Analizi';
        
        // ─── Supabase'e Kaydetme (Giriş yapılmışsa) ─────────────────────
        let savedData = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            
            if (!authError && user) {
                const { data: contract, error: dbError } = await supabase
                    .from('contracts')
                    .insert({
                        user_id: user.id,
                        filename: filename,
                        content_text: text.substring(0, 5000), // Sadece ilk 5000 karakteri saklayalım
                        analysis_results: data,
                        risk_score: data.overall_risk_score || 0
                    })
                    .select()
                    .single();
                
                if (dbError) {
                    console.error('DB Kayıt Hatası:', dbError.message);
                } else {
                    savedData = contract;
                }
            }
        }

        // Return to frontend with original filename and DB record if exists
        res.json({
            ...data,
            filename: filename,
            db_record: savedData
        });

    } catch (err) {
        console.error('Analiz hatası:', err.message);
        res.status(500).json({
            error: 'Analiz sırasında bir hata oluştu.',
            detail: err.message,
        });
    }
});

// ─── Sunucu ───────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend API → http://localhost:${PORT}`);
    console.log(`🔗 NLP Servisi  → ${NLP_SERVICE_URL}`);
});
