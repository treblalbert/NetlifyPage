// AI-related functionality
let apiKey = '';

// Handle API key file
async function handleApiKeyFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    apiKey = text.trim();
    const apiKeyPath = file.name;
    
    // Save the file path/name for reference
    localStorage.setItem('apiKeyPath', file.name);
    
    addChatMessage('system', '✓ API Key loaded successfully!');
    apiSetup.classList.add('hidden');
    mainApp.classList.remove('hidden');
    updateButtonStates();
}

// Handle AI request - FIXED: Properly handles the AI request
async function handleAiRequest() {
    const prompt = aiPrompt.value.trim();
    if (!prompt) {
        showStatus('Please enter a command', 'error');
        return;
    }

    if (!apiKey) {
        showStatus('Please load your API key first', 'error');
        return;
    }

    saveState();
    addChatMessage('user', prompt);
    aiPrompt.value = '';
    aiButton.disabled = true;

    addChatMessage('ai', '🤔 Processing your request...');

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that modifies spreadsheet data. Return ONLY valid JSON with the modified data. The JSON should have this structure: {"headers": [...], "data": [[...], [...]]}'
                    },
                    {
                        role: 'user',
                        content: `Here is spreadsheet data with headers: ${JSON.stringify(window.headers)} and rows: ${JSON.stringify(window.workbookData)}. ${prompt}. Return the complete modified data as JSON with "headers" and "data" fields.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices[0].message.content.trim();
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid response format');
        
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.headers && parsed.data) {
            window.headers = parsed.headers;
            window.workbookData = parsed.data;
            renderTable();
            addChatMessage('ai', '✓ Changes applied successfully!');
        } else {
            throw new Error('Invalid data structure');
        }
    } catch (error) {
        addChatMessage('ai', `❌ Error: ${error.message}`);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        aiButton.disabled = false;
        updateButtonStates();
    }
}

// Handle undo
function handleUndo() {
    if (window.history.length === 0) return;
    
    const previous = window.history.pop();
    window.headers = previous.headers;
    window.workbookData = previous.data;
    cellColors = previous.colors;
    renderTable();
    addChatMessage('system', '↶ Undid last change');
    updateButtonStates();
}