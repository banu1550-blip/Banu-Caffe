import fetch from 'node-fetch';

export default async function handler(req, res) {
    console.log("API İstek Aldı:", req.method);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Hata: GEMINI_API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Gemini API anahtarı Vercel üzerinde tanımlı değil (Settings -> Environment Variables).' });
        }

        const systemPrompt = `Sen Banu Cafe'nin resmi dijital barista asistanısın. Adın "Banu Asistan". Çok kısa, samimi, kibar ve profesyonel cevaplar ver. Asla rakip markalardan (Starbucks vb.) bahsetme. 
        Müşterilere sanki lüks bir butik kahve dükkanındaymış gibi hissettir. İşte ürünlerimiz: Signature Blend (349 TL), Colombia Supremo (329 TL), Etiyopya Yirgacheffe (289 TL), Cold Brew (199 TL).
        Sade metin olarak cevap ver, markdown kullanma.`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [
                    ...(history || []).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    })),
                    { role: 'user', parts: [{ text: message }] }
                ]
            })
        });

        const data = await geminiResponse.json();
        
        if (!geminiResponse.ok) {
            console.error("Gemini API Hatası:", data);
            return res.status(geminiResponse.status).json({ error: data.error?.message || 'Gemini API bağlantı hatası' });
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply });
        } else {
            console.error("Geçersiz API Yanıtı:", data);
            return res.status(500).json({ error: 'Gemini geçerli bir yanıt oluşturamadı.' });
        }

    } catch (error) {
        console.error("Sunucu Hatası:", error);
        return res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu: ' + error.message });
    }
}
