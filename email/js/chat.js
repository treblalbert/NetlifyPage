// AI Chat Module

let openAIKey = null;
let chatHistory = [
    {
        role: "assistant",
        content: "Good day, Sir Albert! I'm at your service. How may I assist you today?"
    }
];

const Chat = {
    init: function() {
        const savedKey = Storage.loadAPIKey();
        if (savedKey) {
            openAIKey = savedKey;
            this.updateAPIKeyStatus();
        }
        
        const savedHistory = Storage.loadChatHistory();
        if (savedHistory) {
            chatHistory = savedHistory;
            this.renderChatHistory();
        }
    },

    openAIChat: function() {
        document.getElementById('aiChatModal').classList.add('active');
    },

    closeAIChat: function() {
        document.getElementById('aiChatModal').classList.remove('active');
    },

    loadAPIKey: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            openAIKey = e.target.result.trim();
            Storage.saveAPIKey(openAIKey);
            this.updateAPIKeyStatus();
            alert('OpenAI API Key loaded successfully!');
        };
        reader.readAsText(file);
    },

    updateAPIKeyStatus: function() {
        const statusElement = document.getElementById('apiKeyStatus');
        if (openAIKey) {
            statusElement.textContent = 'API Key: Loaded';
            statusElement.style.color = '#2ecc71';
        } else {
            statusElement.textContent = 'API Key: Not Loaded';
            statusElement.style.color = '#e74c3c';
        }
    },

    renderChatHistory: function() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        chatHistory.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.role}`;
            
            const senderElement = document.createElement('div');
            senderElement.className = 'sender';
            senderElement.textContent = message.role === 'user' ? 'Sir Albert' : 'Albert\'s Assistant';
            
            const contentElement = document.createElement('div');
            contentElement.className = 'content';
            contentElement.textContent = message.content;
            
            messageElement.appendChild(senderElement);
            messageElement.appendChild(contentElement);
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    handleChatInput: function(event) {
        if (event.key === 'Enter') {
            this.sendChatMessage();
        }
    },

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!openAIKey) {
            alert('Please load your OpenAI API key first!');
            return;
        }
        
        // Add user message to chat
        chatHistory.push({
            role: "user",
            content: message
        });
        
        // Clear input
        input.value = '';
        
        // Render updated chat
        this.renderChatHistory();
        
        // Show typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.classList.add('active');
        
        try {
            // Prepare messages for OpenAI API
            const messages = [
                {
                    role: "system",
                    content: window.AI_SYSTEM_PROMPT
                },
                ...chatHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];
            
            const response = await fetch(`${window.APP_CONFIG.OPENAI_API_BASE}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIKey}`
                },
                body: JSON.stringify({
                    model: window.APP_CONFIG.OPENAI_MODEL,
                    messages: messages,
                    max_tokens: window.APP_CONFIG.OPENAI_MAX_TOKENS,
                    temperature: window.APP_CONFIG.OPENAI_TEMPERATURE
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;
            
            // Add assistant message to chat history
            chatHistory.push({
                role: "assistant",
                content: assistantMessage
            });
            
            // Save chat history
            Storage.saveChatHistory(chatHistory);
            
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            
            // Add error message to chat
            chatHistory.push({
                role: "assistant",
                content: "I apologize, Sir Albert, but I'm experiencing technical difficulties at the moment. Please ensure your API key is valid and try again."
            });
        } finally {
            // Hide typing indicator and render updated chat
            typingIndicator.classList.remove('active');
            this.renderChatHistory();
        }
    },

    clearChat: function() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            chatHistory = [
                {
                    role: "assistant",
                    content: "Good day, Sir Albert! I'm at your service. How may I assist you today?"
                }
            ];
            Storage.saveChatHistory(chatHistory);
            this.renderChatHistory();
        }
    }
};

// Global functions for onclick handlers
window.openAIChat = () => Chat.openAIChat();
window.closeAIChat = () => Chat.closeAIChat();
window.loadAPIKey = (event) => Chat.loadAPIKey(event);
window.handleChatInput = (event) => Chat.handleChatInput(event);
window.sendChatMessage = () => Chat.sendChatMessage();
window.clearChat = () => Chat.clearChat();

// Export to global scope
window.Chat = Chat;