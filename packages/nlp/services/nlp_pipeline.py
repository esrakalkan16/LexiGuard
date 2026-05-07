"""
LexiGuard NLP Pipeline — Faz 5: Legal-BERT (LEDGAR) Entegrasyonu

Bu sürüm, packages/nlp/lexiguard_model/ klasöründeki ince-ayarlı Legal-BERT
modelini kullanarak sözleşme metnini analiz eder.

Model: LEDGAR veri seti üzerinde BertForSequenceClassification (100 sınıf)
Giriş: Sözleşme metni (str)
Çıkış: Risk skoru, risk seviyesi, tespit edilen maddeler
"""

import os
import re
import logging
from typing import Any

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model dizini (bu dosyanın iki üst klasöründeki lexiguard_model/)
# ---------------------------------------------------------------------------
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(_BASE_DIR, "lexiguard_model")

# ---------------------------------------------------------------------------
# LEDGAR 100-sınıf etiket haritası  (LABEL_X → gerçek kategori adı)
# Kaynak: LexGLUE / LEDGAR benchmark sınıf sırası
# ---------------------------------------------------------------------------
LEDGAR_LABELS: dict[int, str] = {
    0:  "Adjustments",
    1:  "Agreements",
    2:  "Amendments",
    3:  "Anti-Corruption Laws",
    4:  "Applicable Laws",
    5:  "Approvals",
    6:  "Arbitration",
    7:  "Assignments",
    8:  "Assigns",
    9:  "Authority",
    10: "Authorizations",
    11: "Base Salary",
    12: "Benefits",
    13: "Binding Effects",
    14: "Books",
    15: "Brokers",
    16: "Capitalization",
    17: "Change In Control",
    18: "Closings",
    19: "Compliance With Laws",
    20: "Confidentiality",
    21: "Consent To Jurisdiction",
    22: "Consents",
    23: "Construction",
    24: "Cooperation",
    25: "Costs",
    26: "Counterparts",
    27: "Death",
    28: "Defined Terms",
    29: "Definitions",
    30: "Disability",
    31: "Disclosures",
    32: "Duties",
    33: "Effective Dates",
    34: "Effectiveness",
    35: "Employment",
    36: "Enforceability",
    37: "Enforcements",
    38: "Entire Agreement",
    39: "Equity",
    40: "Evidence",
    41: "Expenses",
    42: "Expiration",
    43: "Extensions",
    44: "Fees",
    45: "Financial Statements",
    46: "Force Majeure",
    47: "Foreign Corrupt Practices",
    48: "Further Assurances",
    49: "General Provisions",
    50: "Governing Law",
    51: "Grants",
    52: "Guarantees",
    53: "Indemnification",
    54: "Independent Contractors",
    55: "Information",
    56: "Insurance",
    57: "Intellectual Property",
    58: "Interest",
    59: "Investments",
    60: "Jurisdiction",
    61: "Late Payments",
    62: "Liability",
    63: "Licenses",
    64: "Liens",
    65: "Limitation Of Liability",
    66: "Liquidation",
    67: "Loans",
    68: "Loss",
    69: "Maintenance",
    70: "Management",
    71: "Merger",
    72: "Miscellaneous",
    73: "Notices",
    74: "Payments",
    75: "Prepayment",
    76: "Price",
    77: "Privacy",
    78: "Pro Rata",
    79: "Publicity",
    80: "Purpose",
    81: "Qualification",
    82: "Quorum",
    83: "Records",
    84: "Redemption",
    85: "Registration",
    86: "Reimbursements",
    87: "Remedies",
    88: "Representations",
    89: "Restrictive Covenants",
    90: "Retention",
    91: "Rights",
    92: "Royalty",
    93: "Severability",
    94: "Signatures",
    95: "Solvency",
    96: "Successors",
    97: "Survival",
    98: "Taxes",
    99: "Termination",
}

# ---------------------------------------------------------------------------
# Kategori → Risk seviyesi + açıklama eşlemesi
# ---------------------------------------------------------------------------
CATEGORY_RISK_META: dict[str, dict[str, str]] = {
    # Yüksek Risk
    "Indemnification":          {"risk_level": "high",   "description": "Tazminat yükümlülükleri — kullanıcı önemli mali risk altında olabilir."},
    "Limitation Of Liability":  {"risk_level": "high",   "description": "Sorumluluk sınırlaması — hizmet sağlayıcının sorumluluğu kısıtlanmış."},
    "Liability":                {"risk_level": "high",   "description": "Genel sorumluluk maddeleri içeriyor."},
    "Termination":              {"risk_level": "high",   "description": "Sözleşme feshi koşulları — tek taraflı fesih hakkı olabilir."},
    "Governing Law":            {"risk_level": "high",   "description": "Yargı yetkisi — yabancı hukuka tabi olabilir."},
    "Jurisdiction":             {"risk_level": "high",   "description": "Dava yetkisi — uzak bir mahkemede yargılanma riski."},
    "Consent To Jurisdiction":  {"risk_level": "high",   "description": "Belirli bir yargı bölgesine rıza veriliyor."},
    "Arbitration":              {"risk_level": "high",   "description": "Uyuşmazlıklar mahkeme yerine tahkime götürülüyor."},
    "Restrictive Covenants":    {"risk_level": "high",   "description": "Rekabet yasağı veya kısıtlayıcı hükümler içeriyor."},
    "Assignments":              {"risk_level": "high",   "description": "Sözleşme devir hakkı — üçüncü kişilere devredilebilir."},
    "Change In Control":        {"risk_level": "high",   "description": "Şirket el değiştirmesi durumunda sözleşme otomatik değişebilir."},
    "Anti-Corruption Laws":     {"risk_level": "high",   "description": "Yolsuzlukla mücadele yükümlülükleri içeriyor."},
    "Foreign Corrupt Practices":{"risk_level": "high",   "description": "FCPA kapsamında uluslararası uyum yükümlülüğü."},
    "Loss":                     {"risk_level": "high",   "description": "Zarar ve kayıp sorumlulukları tanımlanmış."},
    "Liens":                    {"risk_level": "high",   "description": "Haciz veya rehin hakkı içeriyor."},
    "Liquidation":              {"risk_level": "high",   "description": "Tasfiye koşulları — ciddi finansal risk."},
    # Orta Risk
    "Confidentiality":          {"risk_level": "medium", "description": "Gizlilik yükümlülükleri — bilgi paylaşımı kısıtlı."},
    "Intellectual Property":    {"risk_level": "medium", "description": "Fikri mülkiyet hakları — içerik sahipliği tartışmalı olabilir."},
    "Privacy":                  {"risk_level": "medium", "description": "Kişisel verilerin işlenmesine dair maddeler var."},
    "Disclosures":              {"risk_level": "medium", "description": "Açıklama yükümlülükleri mevcut."},
    "Fees":                     {"risk_level": "medium", "description": "Ücret yapısı ve gizli masraflar içerebilir."},
    "Expenses":                 {"risk_level": "medium", "description": "Gider yükümlülükleri tanımlanmış."},
    "Payments":                 {"risk_level": "medium", "description": "Ödeme koşulları ve takvimi belirlenmiş."},
    "Late Payments":            {"risk_level": "medium", "description": "Gecikme faizi veya cezaları içeriyor."},
    "Insurance":                {"risk_level": "medium", "description": "Sigorta yükümlülükleri belirlenmiş."},
    "Guarantees":               {"risk_level": "medium", "description": "Kefalet veya garanti yükümlülükleri içeriyor."},
    "Compliance With Laws":     {"risk_level": "medium", "description": "Yasal uyum yükümlülükleri — çok sayıda mevzuata tabi."},
    "Applicable Laws":          {"risk_level": "medium", "description": "Uygulanacak hukuk belirsiz veya yabancı olabilir."},
    "Amendments":               {"risk_level": "medium", "description": "Sözleşme değişikliği hakkı tek taraflı olabilir."},
    "Force Majeure":            {"risk_level": "medium", "description": "Mücbir sebep tanımı geniş tutulmuş olabilir."},
    "Waiver":                   {"risk_level": "medium", "description": "Feragat hükümleri — hakların kaybedilmesi riski."},
    "Survival":                 {"risk_level": "medium", "description": "Sözleşme sona erdikten sonra geçerliliğini koruyan maddeler."},
    "Royalty":                  {"risk_level": "medium", "description": "Telif hakkı veya lisans ücreti yükümlülükleri."},
    "Loans":                    {"risk_level": "medium", "description": "Borç ve kredi koşulları içeriyor."},
    "Interest":                 {"risk_level": "medium", "description": "Faiz oranları ve hesaplama yöntemleri tanımlanmış."},
    "Taxes":                    {"risk_level": "medium", "description": "Vergi yükümlülükleri — ek mali yük oluşturabilir."},
    "Reimbursements":           {"risk_level": "medium", "description": "Geri ödeme koşulları belirlenmiş."},
    "Retention":                {"risk_level": "medium", "description": "Veri veya içerik saklama politikaları."},
    "Equity":                   {"risk_level": "medium", "description": "Hisse veya ortaklık hakları düzenlenmiş."},
    # Düşük Risk (bilgilendirme amaçlı)
    "Definitions":              {"risk_level": "low",    "description": "Terim tanımları — standart bir bölüm."},
    "Defined Terms":            {"risk_level": "low",    "description": "Tanımlı kavramlar — standart bir bölüm."},
    "General Provisions":       {"risk_level": "low",    "description": "Genel hükümler — standart maddeler."},
    "Miscellaneous":            {"risk_level": "low",    "description": "Çeşitli hükümler — standart maddeler."},
    "Notices":                  {"risk_level": "low",    "description": "Bildirim yükümlülükleri tanımlanmış."},
    "Severability":             {"risk_level": "low",    "description": "Bölünebilirlik — geçersiz madde diğerlerini etkilemez."},
    "Counterparts":             {"risk_level": "low",    "description": "Sözleşme birden fazla nüshada imzalanabilir."},
    "Entire Agreement":         {"risk_level": "low",    "description": "Bütünleşik sözleşme — önceki anlaşmaları geçersiz kılar."},
    "Further Assurances":       {"risk_level": "low",    "description": "Ek güvenceler — standart bir uygulama."},
    "Governing Law":            {"risk_level": "high",   "description": "Yargı yetkisi — yabancı hukuka tabi olabilir."},  # Tekrar yok, yukarıda
    "Effective Dates":          {"risk_level": "low",    "description": "Yürürlük tarihleri belirtilmiş."},
    "Signatures":               {"risk_level": "low",    "description": "İmza gereksinimleri tanımlanmış."},
    "Successors":               {"risk_level": "low",    "description": "Halef ve devir hükümleri — standart."},
    "Records":                  {"risk_level": "low",    "description": "Kayıt tutma yükümlülükleri."},
    "Purpose":                  {"risk_level": "low",    "description": "Sözleşmenin amacı tanımlanmış."},
    "Cooperation":              {"risk_level": "low",    "description": "İşbirliği yükümlülükleri — standart."},
    "Agreements":               {"risk_level": "low",    "description": "Genel sözleşme maddeleri."},
    "Authority":                {"risk_level": "low",    "description": "Yetki ve temsil hükümleri."},
    "Authorizations":           {"risk_level": "low",    "description": "İzin ve yetkilendirme gereksinimleri."},
    "Approvals":                {"risk_level": "low",    "description": "Onay prosedürleri tanımlanmış."},
    "Representations":          {"risk_level": "low",    "description": "Beyan ve taahhütler içeriyor."},
    "Enforceability":           {"risk_level": "low",    "description": "İcra edilebilirlik hükümleri."},
    "Enforcements":             {"risk_level": "low",    "description": "İcra mekanizmaları tanımlanmış."},
    "Remedies":                 {"risk_level": "low",    "description": "Başvuru yolları ve çözüm mekanizmaları."},
    "Rights":                   {"risk_level": "low",    "description": "Tarafların hakları belirtilmiş."},
    "Construction":             {"risk_level": "low",    "description": "Yorum kuralları — maddelerin nasıl okunacağı."},
    "Binding Effects":          {"risk_level": "low",    "description": "Bağlayıcılık hükümleri."},
    "Closings":                 {"risk_level": "low",    "description": "Kapanış koşulları tanımlanmış."},
    "Consents":                 {"risk_level": "low",    "description": "Rıza gereksinimleri belirlenmiş."},
    "Qualification":            {"risk_level": "low",    "description": "Nitelik ve şart gereksinimleri."},
    "Management":               {"risk_level": "low",    "description": "Yönetim yapısı ve sorumlulukları."},
    "Information":              {"risk_level": "low",    "description": "Bilgi sağlama yükümlülükleri."},
    "Registration":             {"risk_level": "low",    "description": "Kayıt ve tescil gereksinimleri."},
    "Publicity":                {"risk_level": "low",    "description": "Kamuoyuna duyuru hükümleri."},
    "Maintenance":              {"risk_level": "low",    "description": "Bakım yükümlülükleri tanımlanmış."},
    "Adjustments":              {"risk_level": "low",    "description": "Düzeltme ve ayarlama mekanizmaları."},
    "Extensions":               {"risk_level": "low",    "description": "Uzatma koşulları tanımlanmış."},
    "Expiration":               {"risk_level": "low",    "description": "Süre sonu koşulları belirtilmiş."},
    "Financial Statements":     {"risk_level": "low",    "description": "Mali tablo gereksinimleri."},
    "Books":                    {"risk_level": "low",    "description": "Muhasebe kayıt yükümlülükleri."},
    "Base Salary":              {"risk_level": "low",    "description": "Temel maaş ve ücret düzenlemeleri."},
    "Benefits":                 {"risk_level": "low",    "description": "Sosyal haklar ve yan ödemeler."},
    "Employment":               {"risk_level": "low",    "description": "İş ilişkisi ve istihdam koşulları."},
    "Independent Contractors":  {"risk_level": "low",    "description": "Bağımsız yüklenici statüsü tanımlanmış."},
    "Duties":                   {"risk_level": "low",    "description": "Tarafların görev ve yükümlülükleri."},
    "Grants":                   {"risk_level": "low",    "description": "Hak ve lisans devirleri."},
    "Licenses":                 {"risk_level": "low",    "description": "Lisans koşulları ve kapsamı."},
    "Investments":              {"risk_level": "low",    "description": "Yatırım koşulları ve kısıtlamaları."},
    "Capitalization":           {"risk_level": "low",    "description": "Sermaye yapısı ve hisse dağılımı."},
    "Merger":                   {"risk_level": "low",    "description": "Birleşme ve devralma düzenlemeleri."},
    "Redemption":               {"risk_level": "low",    "description": "Geri alım hakkı ve koşulları."},
    "Prepayment":               {"risk_level": "low",    "description": "Erken ödeme koşulları."},
    "Price":                    {"risk_level": "low",    "description": "Fiyatlandırma mekanizmaları."},
    "Pro Rata":                 {"risk_level": "low",    "description": "Orantılı dağılım hesaplamaları."},
    "Quorum":                   {"risk_level": "low",    "description": "Toplantı yeter sayısı gereksinimleri."},
    "Solvency":                 {"risk_level": "low",    "description": "Ödeme gücü beyan ve koşulları."},
    "Brokers":                  {"risk_level": "low",    "description": "Aracı ve komisyon düzenlemeleri."},
    "Assigns":                  {"risk_level": "low",    "description": "Devir ve temlik hükümleri."},
    "Evidence":                 {"risk_level": "low",    "description": "Kanıt ve belgeleme gereksinimleri."},
    "Effectiveness":            {"risk_level": "low",    "description": "Yürürlük koşulları."},
    "Disability":               {"risk_level": "low",    "description": "Engellilik ve iş göremezlik hükümleri."},
    "Death":                    {"risk_level": "low",    "description": "Ölüm durumuna ilişkin düzenlemeler."},
    "Costs":                    {"risk_level": "low",    "description": "Masraf paylaşımı ve maliyet düzenlemeleri."},
}

# Risk skoru ağırlıkları (seviyeye göre)
_RISK_WEIGHTS = {"high": 30, "medium": 15, "low": 2}

RISK_LEVEL_LABELS = {
    "low":    "Düşük Risk",
    "medium": "Orta Risk",
    "high":   "Yüksek Risk",
}

# ---------------------------------------------------------------------------
# Model yükleme — uygulama başladığında bir kez yapılır
# ---------------------------------------------------------------------------
_tokenizer = None
_model = None
_device = None


def _load_model():
    """Modeli ve tokenizer'ı gerektiğinde yükler (lazy loading)."""
    global _tokenizer, _model, _device
    if _model is not None:
        return

    logger.info(f"Legal-BERT modeli yükleniyor: {MODEL_DIR}")
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    _model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    _model.to(_device)
    _model.eval()
    logger.info(f"Model başarıyla yüklendi. Cihaz: {_device}")


# ---------------------------------------------------------------------------
# Yardımcı: uzun metni örtüşen parçalara böl (BERT 512 token sınırı)
# ---------------------------------------------------------------------------
MAX_TOKENS = 512
STRIDE = 128


def _chunk_text(text: str, tokenizer) -> list[str]:
    """
    Metni BERT'in 512-token sınırına sığacak şekilde böler.
    Parçalar arasında STRIDE kadar token örtüşme bırakır.
    """
    tokens = tokenizer.encode(text, add_special_tokens=False)
    window = MAX_TOKENS - 2  # [CLS] ve [SEP] için yer bırak
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + window, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
        chunks.append(chunk_text)
        if end == len(tokens):
            break
        start += window - STRIDE
    return chunks if chunks else [text]


# ---------------------------------------------------------------------------
# Ana analiz fonksiyonu
# ---------------------------------------------------------------------------
def analyze_text(text: str) -> dict[str, Any]:
    """
    Verilen sözleşme metnini Legal-BERT modeliyle analiz eder.
    Modelden gelen LEDGAR etiketlerini gerçek kategori isimlerine eşleştirir
    ve risk skoru ile risk maddelerini döndürür.
    """
    _load_model()

    # --- Metni parçalara böl ve her parça için skor al ---
    chunks = _chunk_text(text, _tokenizer)
    all_probs: list[torch.Tensor] = []

    with torch.no_grad():
        for chunk in chunks:
            inputs = _tokenizer(
                chunk,
                return_tensors="pt",
                truncation=True,
                max_length=MAX_TOKENS,
                padding=True,
            )
            inputs = {k: v.to(_device) for k, v in inputs.items()}
            outputs = _model(**inputs)
            probs = torch.sigmoid(outputs.logits).squeeze(0)  # Multi-label benzeri yaklaşım
            all_probs.append(probs)

    # Parçaların olasılık ortalamasını al
    avg_probs = torch.stack(all_probs).mean(dim=0)  # shape: (100,)

    # Top-10 kategoriyi al (eşik: 0.10 üzeri veya en az top-5)
    THRESHOLD = 0.10
    TOP_N = 10

    sorted_indices = avg_probs.argsort(descending=True).tolist()
    detected_risks: list[dict[str, Any]] = []

    for idx in sorted_indices[:TOP_N]:
        confidence = float(avg_probs[idx])
        if confidence < THRESHOLD and len(detected_risks) >= 5:
            break

        label_name = LEDGAR_LABELS.get(idx, f"LABEL_{idx}")
        meta = CATEGORY_RISK_META.get(
            label_name,
            {"risk_level": "low", "description": f"{label_name} hükümleri tespit edildi."},
        )

        detected_risks.append({
            "category":    label_name,
            "risk_level":  meta["risk_level"],
            "description": meta["description"],
            "confidence":  round(confidence, 4),
        })

    # --- Risk skoru hesapla ---
    total_score = 0
    for item in detected_risks:
        weight = _RISK_WEIGHTS.get(item["risk_level"], 2)
        # Confidence ile ağırlıklandır
        total_score += weight * item["confidence"]

    # 0–100 arasına normalize et (max teorik skor ~300, makul üst sınır 100)
    risk_score = int(min(100, max(0, total_score)))

    # --- Risk seviyesi ---
    if risk_score < 30:
        risk_level = "low"
    elif risk_score < 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # --- Özet ---
    word_count = len(text.split())
    sentence_count = len(re.findall(r"[.!?]", text))
    high_medium_count = sum(
        1 for r in detected_risks if r["risk_level"] in ("high", "medium")
    )
    top_cat = detected_risks[0]["category"] if detected_risks else "—"

    summary = (
        f"Bu sözleşme yaklaşık {word_count} kelime ve {sentence_count} cümle içermektedir. "
        f"AI modeli {len(detected_risks)} hukuki madde kategorisi tespit etti"
        + (
            f"; bunlardan {high_medium_count} tanesi orta veya yüksek risk taşımaktadır. "
            f"Baskın kategori: {top_cat}."
            if high_medium_count
            else f". Baskın kategori: {top_cat}."
        )
    )

    return {
        "risk_score":       risk_score,
        "risk_level":       risk_level,
        "risk_level_label": RISK_LEVEL_LABELS[risk_level],
        "summary":          summary,
        "risk_items":       detected_risks,
        "model":            "Legal-BERT (LEDGAR)",
    }
