let messageHistory = [];

// Escuta a tecla Enter no campo de texto para enviar a mensagem
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function appendMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
    document.getElementById('chatBox').innerHTML = '<div class="message bot">Histórico limpo. Como posso ajudar você agora?</div>';
    messageHistory = [];
}

async function sendMessage() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const modelId = document.getElementById('modelId').value.trim();
    const userInput = document.getElementById('userInput');
    const systemPrompt = document.getElementById('systemPrompt').value.trim();
    const text = userInput.value.trim();

    if (!text) return;
    if (!apiKey) {
        alert('Por favor, insira sua API Key do OpenRouter na barra lateral.');
        return;
    }

    appendMessage(text, 'user');
    userInput.value = '';

    if (messageHistory.length === 0) {
        messageHistory.push({ role: "system", content: systemPrompt });
    }
    messageHistory.push({ role: "user", content: text });

    appendMessage("Pensando...", "bot");
    const chatBox = document.getElementById('chatBox');
    const loadingMsg = chatBox.lastChild;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Hospital Agent Demo'
            },
            body: JSON.stringify({
                model: modelId,
                messages: messageHistory,
                temperature: 0.5
            })
        });

        const data = await response.json();
        loadingMsg.remove();

        if (data.choices && data.choices[0]) {
            const reply = data.choices[0].message.content;
            appendMessage(reply, 'bot');
            messageHistory.push({ role: "assistant", content: reply });
        } else {
            appendMessage("Erro ao obter resposta. Verifique sua chave do OpenRouter ou saldo.", 'bot');
        }
    } catch (error) {
        if (loadingMsg) loadingMsg.remove();
        appendMessage("Erro de conexão com o servidor do OpenRouter.", 'bot');
        console.error(error);
    }
}