// AI request handler - FIXED AND SIMPLIFIED
async function handleAiRequest() {
    console.log('AI Button clicked'); // Debug log
    
    if (!apiKey) {
        showStatus('Please load your API key first', 'error');
        return;
    }
    
    const prompt = aiPrompt.value.trim();
    if (!prompt) {
        showStatus('Please enter a command', 'error');
        return;
    }

    if (workbookData.length === 0) {
        showStatus('Please load an Excel file first', 'error');
        return;
    }

    saveState();
    addChatMessage('user', prompt);
    aiPrompt.value = '';
    aiButton.disabled = true;

    addChatMessage('ai', '🤔 Processing your request...');

    try {
        console.log('Sending request to OpenAI...'); // Debug log
        
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
                        content: `Here is spreadsheet data with headers: ${JSON.stringify(headers)} and rows: ${JSON.stringify(workbookData)}. ${prompt}. Return the complete modified data as JSON with "headers" and "data" fields.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('OpenAI Response:', result); // Debug log
        
        const content = result.choices[0].message.content.trim();
        
        // Try to extract JSON from the response
        let jsonMatch;
        try {
            // First try to parse the whole content as JSON
            const parsed = JSON.parse(content);
            jsonMatch = content;
        } catch {
            // If that fails, try to extract JSON from the text
            jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No valid JSON found in response');
        }
        
        const parsed = JSON.parse(jsonMatch);
        
        if (parsed.headers && parsed.data) {
            headers = parsed.headers;
            workbookData = parsed.data;
            renderTable();
            addChatMessage('ai', '✓ Changes applied successfully!');
            showStatus('AI modifications applied successfully', 'success');
        } else {
            throw new Error('Invalid data structure in response');
        }
    } catch (error) {
        console.error('AI Request Error:', error); // Debug log
        addChatMessage('ai', `❌ Error: ${error.message}`);
        showStatus(`Error: ${error.message}`, 'error');
        
        // Try to undo if the AI request failed
        if (history.length > 0) {
            const previous = history.pop();
            headers = previous.headers;
            workbookData = previous.data;
            cellColors = previous.colors;
            renderTable();
        }
    } finally {
        aiButton.disabled = false;
        updateButtonStates();
    }
}

// Handle undo
function handleUndo() {
    if (history.length === 0) return;
    
    const previous = history.pop();
    headers = previous.headers;
    workbookData = previous.data;
    cellColors = previous.colors;
    renderTable();
    addChatMessage('system', '↶ Undid last change');
    updateButtonStates();
}