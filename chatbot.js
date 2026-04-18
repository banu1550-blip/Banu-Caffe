(function() {
    console.log("Banu Chatbot: Başlatılıyor...");
    
    const initChatbot = () => {
        if (document.getElementById('banu-chat-widget')) return;
        console.log("Banu Chatbot: DOM'a enjekte ediliyor...");

    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 2147483647;
            font-family: 'Montserrat', sans-serif;
            display: flex !important;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: none;
        }
        .chat-widget > * {
            pointer-events: auto;
        }
        .chat-btn {
            width: 70px;
            height: 70px;
            background: #d4a373;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 3px solid #1d3c34;
            position: relative;
        }
        .chat-btn::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #d4a373;
            animation: pulse-border 2s infinite;
            opacity: 0;
        }
        @keyframes pulse-border {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .chat-btn:hover {
            transform: scale(1.1) rotate(5deg);
            background: #2d5c4c;
            box-shadow: 0 15px 35px rgba(29, 60, 52, 0.5);
        }
        .chat-btn svg {
            width: 35px;
            height: 35px;
            fill: #1d3c34;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        .chat-window {
            width: 380px;
            height: 580px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(30px) scale(0.9);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(212, 163, 115, 0.3);
            margin-bottom: 15px;
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
            font-size: 1.1rem;
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
            padding: 14px 18px;
            border-radius: 18px;
            font-size: 0.9rem;
            line-height: 1.5;
            word-wrap: break-word;
            position: relative;
            animation: msg-appear 0.4s ease-out forwards;
        }
        @keyframes msg-appear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
        .chat-msg.typing {
            font-style: italic;
            opacity: 0.7;
        }
        .chat-options {
            padding: 12px 15px 5px;
            background: white;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .chat-option-btn {
            background: transparent;
            border: 1px solid #d4a373;
            color: #d4a373;
            padding: 8px 12px;
            border-radius: 15px;
            text-align: left;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s;
            font-family: inherit;
        }
        .chat-option-btn:hover {
            background: #d4a373;
            color: white;
        }
        .chat-input-area {
            display: flex;
            padding: 10px 15px 15px;
            background: white;
            border-top: none;
            gap: 10px;
        }
        .chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            outline: none;
            font-family: inherit;
            font-size: 0.9rem;
            transition: border-color 0.3s;
        }
        .chat-input:focus {
            border-color: #d4a373;
        }
        .chat-send-btn {
            background: #d4a373;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        }
        .chat-send-btn:hover {
            background: #c48a55;
        }
        @media (max-width: 480px) {
            .chat-window {
                width: 300px;
                right: -10px;
                bottom: 75px;
                height: 480px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Widget Container
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    widget.id = 'banu-chat-widget';
    
    widget.innerHTML = `
        <div class="chat-window" id="banu-chat-window">
            <div class="chat-header">
                <h3>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Banu Al Asistan (Gemini)
                </h3>
                <button class="close-btn" id="close-chat">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-msg bot">Merhaba! Banu Cafe yapay zeka asistanıyım. Size en uygun kahveyi bulmamda yardımcı olabilirim. Menümüzdeki özel çekirdekler hakkında bilgi almak veya tavsiye istemek için aşağıdaki seçenekleri kullanabilir ya da dilediğinizi yazabilirsiniz. ☕</div>
            </div>
            <div class="chat-options" id="chat-options">
                <button class="chat-option-btn">İçmek istediğim şeye karar veremiyorum</button>
                <button class="chat-option-btn">Ürünlerinizin içeriği ve detayları nelerdir?</button>
                <button class="chat-option-btn">En popüler kahveniz hangisi?</button>
                <button class="chat-option-btn">Kış ayları için sıcak bir tavsiye alabilir miyim?</button>
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chat-input" placeholder="Bana bir şey sorun..." />
                <button class="chat-send-btn" id="chat-send-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
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
    const inputField = widget.querySelector('#chat-input');
    const sendBtn = widget.querySelector('#chat-send-btn');

    let chatHistory = [];

    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    const addMessage = (text, type = 'bot') => {
        const msg = document.createElement('div');
        msg.className = \`chat-msg \${type}\`;
        msg.innerText = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return msg;
    };

    const sendMessageToGemini = async (text) => {
        addMessage(text, 'user');
        optionsContainer.style.display = 'none'; // Hide template buttons on first chat
        
        chatHistory.push({ role: 'user', content: text });
        
        const typingMsg = addMessage("Asistan yazıyor...", 'bot typing');
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: chatHistory.slice(0, -1) }) // Pass history excluding current
            });
            
            const data = await response.json();
            
            typingMsg.remove();
            
            if (response.ok && data.reply) {
                addMessage(data.reply, 'bot');
                chatHistory.push({ role: 'model', content: data.reply });
            } else {
                addMessage("Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.", 'bot');
                console.error("Gemini Hatası:", data.error);
            }
        } catch (error) {
            typingMsg.remove();
            addMessage("Sunucuya ulaşılamadı.", 'bot');
            console.error("İstek Hatası:", error);
        }
    };

    // Template Button Listeners
    const optionButtons = optionsContainer.querySelectorAll('.chat-option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.innerText;
            sendMessageToGemini(text);
        });
    });

    // Input Listeners
    sendBtn.addEventListener('click', () => {
        const text = inputField.value.trim();
        if (text) {
            inputField.value = '';
            sendMessageToGemini(text);
        }
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = inputField.value.trim();
            if (text) {
                inputField.value = '';
                sendMessageToGemini(text);
            }
        }
    });

    console.log("Banu Chatbot: Başarıyla yüklendi.");
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initChatbot();
    } else {
        window.addEventListener('DOMContentLoaded', initChatbot);
    }
})();
