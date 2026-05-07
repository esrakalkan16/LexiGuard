import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeLegalDocument(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content,
    config: {
      systemInstruction: `Sen LexiGuard adlı yapay zeka hukuk asistanısın. Görevin, sana gönderilen hukuki metni (sözleşme, belge vb.) analiz etmek ve kullanıcıyı gizli risklere karşı uyarmaktır.
      
      Yanıtını mutlaka şu JSON formatında ver:
      {
        "summary": "Metnin kısa bir özeti (2-3 cümle)",
        "risk_score": 0 ile 100 arasında bir puan (100 en riskli),
        "risks": [
          {
            "clause": "Riskli bulunan madde başlığı veya kısa metni",
            "level": "Düşük" | "Orta" | "Yüksek",
            "description": "Riskin neden riskli olduğuna dair açıklama",
            "suggestion": "Bu madde için öneri"
          }
        ],
        "strengths": ["Belge içindeki avantajlı veya standart dışı iyi maddeler"],
        "classification": "Sözleşme tipi (örneğin: Kira Sözleşmesi, Gizlilik Sözleşmesi, Hizmet Sözleşmesi)"
      }`,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
