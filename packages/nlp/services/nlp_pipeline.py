"""
LexiGuard NLP Pipeline — Mock Sürümü (Faz 1)

Bu sürüm kural tabanlı (keyword matching) bir yaklaşım kullanır.
Faz 5'te gerçek BERT/LegalBERT modeli ile değiştirilecektir.
"""

import re
from typing import Any

# Risk kategorileri ve anahtar kelimeler
RISK_RULES: list[dict[str, Any]] = [
    {
        "category": "Üçüncü Taraflarla Veri Paylaşımı",
        "risk_level": "high",
        "score_weight": 25,
        "keywords": [
            "share your data", "third parties", "third-party partners",
            "advertising partners", "verilerinizi paylaşıyoruz",
            "üçüncü taraflarla paylaşılabilir",
        ],
    },
    {
        "category": "Konum Takibi",
        "risk_level": "high",
        "score_weight": 20,
        "keywords": [
            "precise location", "gps data", "location tracking",
            "konum verisi", "konum takibi", "collect your location",
        ],
    },
    {
        "category": "Otomatik Yenileme",
        "risk_level": "medium",
        "score_weight": 15,
        "keywords": [
            "auto-renew", "automatically renewed", "automatic renewal",
            "otomatik yenileme", "automatically charged",
        ],
    },
    {
        "category": "Üyelik İptali Zorluğu",
        "risk_level": "medium",
        "score_weight": 15,
        "keywords": [
            "cancel by phone", "call to cancel", "written notice to cancel",
            "iptal için arayın", "cancellation fee", "cancellation penalty",
        ],
    },
    {
        "category": "İçerik Sahipliği",
        "risk_level": "medium",
        "score_weight": 10,
        "keywords": [
            "license to use your content", "royalty-free license",
            "worldwide license", "içeriğiniz üzerinde lisans",
            "perpetual license",
        ],
    },
    {
        "category": "Üçüncü Taraf Erişimi",
        "risk_level": "medium",
        "score_weight": 10,
        "keywords": [
            "third party access", "partners may access",
            "government request", "law enforcement",
            "üçüncü taraf erişimi",
        ],
    },
    {
        "category": "Veri Silme Hakkı",
        "risk_level": "low",
        "score_weight": -10,  # Kullanıcı lehine madde → skoru düşürür
        "keywords": [
            "right to delete", "data deletion", "right to erasure",
            "delete your account", "verilerinizi silebilirsiniz",
            "gdpr", "ccpa",
        ],
    },
]

RISK_LEVEL_THRESHOLDS = {
    "low": (0, 30),
    "medium": (30, 60),
    "high": (60, 100),
}

RISK_LEVEL_LABELS = {
    "low": "Düşük Risk",
    "medium": "Orta Risk",
    "high": "Yüksek Risk",
}


def analyze_text(text: str) -> dict[str, Any]:
    """
    Verilen metni analiz eder, risk skoru ve maddeleri döndürür.
    """
    text_lower = text.lower()
    detected_risks: list[dict[str, str]] = []
    total_score = 0

    for rule in RISK_RULES:
        matched_keywords = [
            kw for kw in rule["keywords"] if kw.lower() in text_lower
        ]
        if matched_keywords:
            total_score += rule["score_weight"]
            detected_risks.append({
                "category": rule["category"],
                "risk_level": rule["risk_level"],
                "matched_keywords": matched_keywords,
            })

    # Skoru 0–100 arasına normalize et
    risk_score = max(0, min(100, total_score))

    # Risk seviyesi belirle
    if risk_score < 30:
        risk_level = "low"
    elif risk_score < 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # Basit özet oluştur
    sentence_count = len(re.findall(r'[.!?]', text))
    word_count = len(text.split())
    risk_count = len([r for r in detected_risks if r["risk_level"] in ("high", "medium")])
    summary = (
        f"Bu sözleşme yaklaşık {word_count} kelime ve {sentence_count} cümle içermektedir. "
        f"Analizde {len(detected_risks)} risk maddesi tespit edilmiştir"
        + (f"; bunlardan {risk_count} tanesi orta veya yüksek risk taşımaktadır." if risk_count else ".")
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_level_label": RISK_LEVEL_LABELS[risk_level],
        "summary": summary,
        "risk_items": detected_risks,
    }
