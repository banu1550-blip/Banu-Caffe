export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API anahtarı sunucuda yapılandırılmamış.' });
    }

    const systemPrompt = `Sen Banu Cafe'nin resmi dijital barista asistanısın. Adın "Banu Asistan". Çok kısa, samimi, kibar ve profesyonel cevaplar ver. Asla rakip markalardan (Starbucks vb.) bahsetme. 
    Müşterilere sanki lüks bir butik kahve dükkanındaymış gibi hissettir. Eğer anlamadığın bir şey sorulursa sadece kahve menünüzle ilgili yardımcı olabileceğini belirt.
    
    İşte Banu Cafe'nin güncel ürünleri ve detaylı içerikleri:
    - Banu Signature Blend (Özel Harman): Çikolata ve tarçın notaları içeren, yoğun gövdeli ve zengin aromalı en çok satan harmanımızdır. Fiyat: 349 TL (250g).
    - Colombia Supremo (Karışım/Tek Köken): Karamel ve fındık notalarıyla dengelenmiş, dolgun ve pürüzsüz bir içim sunar. Müşterilerimizin favorisidir. Fiyat: 329 TL (250g).
    - Etiyopya Yirgacheffe (Tek Köken): Çiçeksi ve narenciye notaları içeren, hafif içimli ve ferahlatıcı bir asiditeye sahip yüksek rakım kahvesidir. Fiyat: 289 TL (250g).
    - Cold Brew Konsantre (Soğuk): Vanilya ve meşe notaları içeren, 24 saat soğuk demlenmiş, pürüzsüz ve canlandırıcı bir deneyim. Fiyat: 199 TL (500ml).
    - Sütlü İçecekler (Latte, Cappuccino, Flat White): Espresso bazlı, tam yağlı günlük inek sütüyle veya isteğe bağlı vegan sütlerle (Yulaf, Badem, Soya) hazırlanır.
    
    Görevlerin:
    1. Müşteri kararsızsa ("Karar veremiyorum" vb.), onlara damak tadına göre (yoğun, hafif, meyvemsi, tatlımsı) yukarıdaki listeden en uygun kahveyi tavsiye et.
    2. Ürünlerin içeriği sorulursa, o ürünün tadım notalarını, kavurma karakterini ve fiyatını detaylıca anlat.
    3. Her zaman "Banu Cafe" atmosferini yansıtacak şekilde nazik ve yardımcı ol.
    
    (Cevaplarında lütfen HTML etiketleri KULLANMA, markdown KULLANMA. Sade metin olarak yaz.)`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                  parts: [{text: systemPrompt}]
                },
                contents: [
                    ...(history || []).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    })),
                    { role: 'user', parts: [{ text: message }] }
                ]
            })
        });

        const data = await response.json();
        
        if(data.error) {
             return res.status(500).json({ error: data.error.message });
        }

        const reply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'API Bağlantı Hatası: ' + error.message });
    }
}
