# LexiGuard — Kullanım Kılavuzu

## Proje Yapısı

```
LexiGuard/
├── packages/
│   ├── web/        → Next.js 14 Web Arayüzü        (port: 3001)
│   ├── backend/    → Express.js API Gateway         (port: 3000)
│   ├── nlp/        → FastAPI Python NLP Servisi     (port: 8000)
│   └── mobile/     → React Native Mobil Uygulama
```

---

## Kurulum

### 1. Node bağımlılıkları
```bash
npm install
```

### 2. Python NLP servisi bağımlılıkları
```bash
cd packages/nlp
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Servisleri Başlatma

### Web + Backend (Önerilen — Mobil hata vermez)
```bash
npm run dev
```

### Tümünü birden (Mobile dahil — Android emülatör gerektirir)
```bash
npm run dev:all
```

### Ayrı ayrı
```bash
# Web (Next.js) → http://localhost:3001
npm run dev:web

# Backend (Express) → http://localhost:3000
npm run dev:backend

# NLP Mikroservisi (Python/FastAPI) → http://localhost:8000
npm run dev:nlp
# veya direkt:
cd packages/nlp && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Mobil (React Native) — Metro + Emülatör
npm run dev:mobile      # Android
npm run dev:ios         # iOS
```

---

## API Dokümantasyonu

| Servis | URL |
|--------|-----|
| Backend API | http://localhost:3000 |
| NLP Servisi | http://localhost:8000 |
| NLP Swagger Docs | http://localhost:8000/docs |
| Web Arayüzü | http://localhost:3001 |

### Analiz Endpoint Örneği
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We share your data with third parties and advertising partners. Auto-renew unless cancelled.",
    "company_name": "Örnek Şirket",
    "source_url": "https://example.com/terms"
  }'
```

### Beklenen Yanıt
```json
{
  "company_name": "Örnek Şirket",
  "source_url": "https://example.com/terms",
  "risk_score": 55,
  "risk_level": "medium",
  "summary": "Bu sözleşme ... 2 risk maddesi içermektedir.",
  "risk_items": [
    {
      "category": "Üçüncü Taraflarla Veri Paylaşımı",
      "risk_level": "high",
      "matched_keywords": ["third parties", "advertising partners"]
    }
  ]
}
```
