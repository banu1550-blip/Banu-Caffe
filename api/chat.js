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
    
    İşte Banu Cafe'nin güncel menüsü ve ürün özellikleri:
    - Banu Signature Blend (Sıcak/Filtre/Espresso): Çikolata ve tarçın notaları içerir. Orta-koyu kavurmadır. En popüler harmanımızdır. Fiyat: 349 TL.
    - Colombia Supremo (Sıcak): Karamel ve fındık notaları. Tek kökenli, yüksek gövdeli. Sadece yıkanmış çekirdekler. Fiyat: 329 TL.
    - Etiyopya Yirgacheffe (Sıcak/Hafif): Çiçeksi, narenciye, meyvemsi asidite. Parlak ve ferahlatıcı sıcak kahve. Fiyat: 289 TL.
    - Cold Brew Konsantre (Soğuk): Vanilya ve meşe notaları. Enfes soğuk kahve deneyimi, süt ve buz ile harika olur. Fiyat: 199 TL.
    - Sütlü İçecekler (Latte, Cappuccino, Flat White): Tam yağlı günlük inek sütüyle klasik signature blend espresso harmanından hazırlanır. İsteğe göre Yulaf, Badem ve Soya sütü (vegan) seçeneklerimiz mevcuttur.
    
    Müşterinin kararsız kalması veya "Ne önerirsin?" diye sorması durumunda isteklerine (sıcak, soğuk, yoğun, meyvemsi vb.) uygun tavsiyelerde bulun.
    Ürünlerin içerikleri sorulursa yukarıdaki detayları kullanarak anlat.
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
