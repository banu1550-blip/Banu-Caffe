(function() {
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            font-family: 'Montserrat', sans-serif;
        }
        .chat-btn {
            width: 60px;
            height: 60px;
            background: #1d3c34;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(29, 60, 52, 0.4);
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            border: 2px solid #d4a373;
        }
        .chat-btn:hover {
            transform: scale(1.1);
            background: #2d5c4c;
        }
        .chat-btn svg {
            width: 30px;
            height: 30px;
            fill: #d4a373;
        }
        .chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            border: 1px solid rgba(212, 163, 115, 0.3);
        }
        .chat-window.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }
        .chat-header {
            background: #1d3c34;
            color: #d4a373;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #d4a373;
        }
        .chat-header h3 {
            margin: 0;
            font-family: 'Playfair Display', serif;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chat-header h3 svg {
            stroke: #d4a373;
        }
        .chat-header .close-btn {
            background: none;
            border: none;
            color: #d4a373;
            cursor: pointer;
            font-size: 1.8rem;
            padding: 0;
            display: flex;
            align-items: center;
            transition: color 0.3s;
        }
        .chat-header .close-btn:hover {
            color: white;
        }
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #faf7f2;
        }
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
            background: #d4a373;
            border-radius: 3px;
        }
        .chat-msg {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 15px;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        .chat-msg.bot {
            background: white;
            color: #1d3c34;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            border: 1px solid rgba(212, 163, 115, 0.2);
        }
        .chat-msg.user {
            background: #1d3c34;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
            box-shadow: 0 4px 10px rgba(29, 60, 52, 0.2);
        }
        .chat-options {
            padding: 15px;
            background: white;
            border-top: 1px solid rgba(212, 163, 115, 0.2);
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 180px;
            overflow-y: auto;
        }
        .chat-option-btn {
            background: transparent;
            border: 1px solid #d4a373;
            color: #d4a373;
            padding: 10px 15px;
            border-radius: 20px;
            text-align: left;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s;
            font-family: inherit;
        }
        .chat-option-btn:hover {
            background: #d4a373;
            color: white;
        }
        .chat-product {
            display: flex;
            gap: 12px;
            align-items: center;
            background: #f5f0eb;
            padding: 10px;
            border-radius: 10px;
            margin-top: 12px;
            text-decoration: none;
            color: #1d3c34;
            transition: all 0.3s;
            border: 1px solid transparent;
        }
        .chat-product:hover {
            background: white;
            border-color: #d4a373;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(212, 163, 115, 0.2);
        }
        .chat-product img {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #d4a373;
        }
        .chat-product-info h4 {
            margin: 0;
            font-size: 0.85rem;
            font-weight: 700;
            color: #1d3c34;
        }
        .chat-product-info p {
            margin: 0;
            font-size: 0.75rem;
            color: #b07240;
            margin-top: 2px;
        }
        @media (max-width: 480px) {
            .chat-window {
                width: 300px;
                right: -10px;
                bottom: 75px;
                height: 450px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Widget Container
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    
    widget.innerHTML = `
        <div class="chat-window" id="banu-chat-window">
            <div class="chat-header">
                <h3>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    Banu Asistan
                </h3>
                <button class="close-btn" id="close-chat">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-msg bot">Merhaba! Banu Cafe'ye hoş geldiniz, size nasıl yardımcı olabilirim? ☕ Lütfen bir seçenek belirleyin.</div>
            </div>
            <div class="chat-options" id="chat-options">
                <button class="chat-option-btn" data-action="kararsiz">İçmek istediğim şeye karar veremiyorum</button>
                <button class="chat-option-btn" data-action="icerik">Mevcut kahvelerin içeriğini öğrenmek istiyorum</button>
                <button class="chat-option-btn" data-action="populer">En popüler kahveniz hangisi?</button>
            </div>
        </div>
        <div class="chat-btn" id="open-chat">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.03 2 11c0 2.85 1.455 5.39 3.738 7.02l-1.46 3.19a.5.5 0 00.672.637l3.66-1.57c1.07.31 2.22.49 3.42.49 5.523 0 10-4.03 10-9s-4.477-9-10-9zm0 17c-1.12 0-2.2-.17-3.2-.47a.5.5 0 00-.36.03l-2.6 1.11 1.04-2.27a.5.5 0 00-.06-.52C4.54 15.35 3 13.28 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8-4.03 8-9 8z"/>
            </svg>
        </div>
    `;

    document.body.appendChild(widget);

    const chatBtn = widget.querySelector('#open-chat');
    const chatWindow = widget.querySelector('#banu-chat-window');
    const closeBtn = widget.querySelector('#close-chat');
    const messagesContainer = widget.querySelector('#chat-messages');
    const optionsContainer = widget.querySelector('#chat-options');

    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    const addMessage = (text, type = 'bot') => {
        const msg = document.createElement('div');
        msg.className = \`chat-msg \${type}\`;
        msg.innerHTML = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const updateOptions = (htmlContent) => {
        if(htmlContent) {
            optionsContainer.innerHTML = htmlContent;
        } else {
            optionsContainer.innerHTML = \`
                <button class="chat-option-btn" data-action="reset">Farklı bir şey sormak istiyorum</button>
            \`;
        }
        attachOptionListeners();
    };

    const handleAction = (action, elementText) => {
        // Add user selected text
        addMessage(elementText, 'user');

        setTimeout(() => {
            if (action === 'kararsiz') {
                addMessage("Anlıyorum! Bugün nasıl bir tat aradığınızı söylerseniz, mükemmel kahveyi bulmanıza yardımcı olayım.");
                updateOptions(\`
                    <button class="chat-option-btn" data-action="sicak_yogun">Sıcak, yoğun ve uyandırıcı bir şeyler</button>
                    <button class="chat-option-btn" data-action="soguk_ferah">Soğuk, serinletici ve tatlı bir şeyler</button>
                    <button class="chat-option-btn" data-action="hafif_meyve">Hafif, yumuşak veya meyvemsi tatlar</button>
                \`);
            } 
            else if (action === 'sicak_yogun') {
                let html = "Sıcak ve yoğun bir deneyim için altın oran <strong>Banu Signature Blend</strong> filtre kahvemiz ya da yoğun <strong>Colombia Supremo</strong> önerebilirim.<br>";
                html += \`
                    <a href="menu.html" class="chat-product">
                        <img src="https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=100&q=80" alt="Banu Blend">
                        <div class="chat-product-info">
                            <h4>Banu Signature Blend</h4>
                            <p>Çikolata, Tarçın Notaları (₺349)</p>
                        </div>
                    </a>
                \`;
                addMessage(html);
                updateOptions();
            }
            else if (action === 'soguk_ferah') {
                 let html = "Sıcak havaların veya ferahlamak isteyenlerin tercihi <strong>Cold Brew Konsantre</strong>! Üzerine buz ve süt ekleyerek harika olur.<br>";
                html += \`
                    <a href="menu.html" class="chat-product">
                        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&q=80" alt="Cold Brew">
                        <div class="chat-product-info">
                            <h4>Cold Brew Konsantre</h4>
                            <p>Vanilya, Meşe Notaları (₺199)</p>
                        </div>
                    </a>
                \`;
                addMessage(html);
                 updateOptions();
            }
            else if (action === 'hafif_meyve') {
                let html = "Çiçeksi aromalar ve taze meyve asiditesi arıyorsanız, tek kökenli <strong>Etiyopya Yirgacheffe</strong> çekirdekleri damağınızı şenlendirecektir.<br>";
                html += \`
                    <a href="menu.html" class="chat-product">
                        <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&q=80" alt="Etiyopya">
                        <div class="chat-product-info">
                            <h4>Etiyopya Yirgacheffe</h4>
                            <p>Çiçeksi, Narenciye (₺289)</p>
                        </div>
                    </a>
                \`;
                addMessage(html);
                updateOptions();
            }
            else if (action === 'icerik') {
                 addMessage("Tabii ki! Hangi kahvemizin içerik detayını öğrenmek istersiniz?");
                 updateOptions(\`
                    <button class="chat-option-btn" data-action="icerik_blend">Banu Signature Blend</button>
                    <button class="chat-option-btn" data-action="icerik_colombia">Colombia Supremo</button>
                    <button class="chat-option-btn" data-action="icerik_sutlu">Sütlü İçecekler (Latte vb.)</button>
                \`);
            }
             else if (action === 'icerik_blend') {
                 addMessage("<strong>Banu Signature Blend</strong>: Evimizin incisi olan bu harman; %60 Brezilya (Cerrado), %40 Guatemala (Antigua) arabica çekirdeklerinden oluşur. İlave bir aroma maddesi <b>içermez</b>, tadını tamamen orta-koyu kavurma profilindeki bitter çikolata ve doğal tarçın notalarından alır.");
                 updateOptions();
             }
              else if (action === 'icerik_colombia') {
                 addMessage("<strong>Colombia Supremo</strong>: Sadece yıkanmış saf Kolombiya Supremo 17/18 elek arabica çekirdekleri kullanılır. Tamamen vegan ve doğal olup, yüksek rakımdan dolayı karamelize ve kuruyemiş (fındık) profili barındırır. Hiçbir katkı maddesi yoktur.");
                 updateOptions();
             }
              else if (action === 'icerik_sutlu') {
                 addMessage("<strong>Sütlü İçecekler (Latte, Flat White)</strong>: Standart olarak %3 tam yağlı taze inek sütü ile klasik yoğun espressomuzdan hazırlanır. Dilerseniz <i>Badem, Yulaf, veya Soya sütü</i> ile laktozsuz ve vegan olarak da talep edebilirsiniz.");
                 updateOptions();
             }
            else if (action === 'populer') {
                let html = "Müşterilerimizin vazgeçilmezi ve en çok sipariş edilen ürünümüz <strong>Banu Signature Blend</strong>! Günün her saati için ideal ve çok dengeli bir içime sahiptir.<br>";
                html += \`
                    <a href="menu.html" class="chat-product">
                        <img src="https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=100&q=80" alt="Banu Blend">
                        <div class="chat-product-info">
                            <h4>Banu Signature Blend</h4>
                            <p>En Çok Satan - Klasik (₺349)</p>
                        </div>
                    </a>
                \`;
                addMessage(html);
                updateOptions();
            }
            else if (action === 'reset') {
                updateOptions(\`
                    <button class="chat-option-btn" data-action="kararsiz">İçmek istediğim şeye karar veremiyorum</button>
                    <button class="chat-option-btn" data-action="icerik">Mevcut kahvelerin içeriğini öğrenmek istiyorum</button>
                    <button class="chat-option-btn" data-action="populer">En popüler kahveniz hangisi?</button>
                \`);
            }
        }, 500); // 0.5 sec delay for natural reading
    };

    function attachOptionListeners() {
        const buttons = optionsContainer.querySelectorAll('.chat-option-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                handleAction(e.target.dataset.action, e.target.textContent);
            });
        });
    }

    attachOptionListeners();
})();
