// AI request handler - IMPROVED with better spreadsheet context
async function handleAiRequest() {
    console.log('AI Button clicked');
    
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
        console.log('Sending request to OpenAI...');
        
        // Create a better representation of the spreadsheet
        const spreadsheetInfo = {
            dimensions: {
                rows: workbookData.length,
                columns: headers.length
            },
            headers: headers.map((h, i) => ({index: i, name: h || `Column ${i + 1}`})),
            sampleData: {
                firstFewRows: workbookData.slice(0, 3),
                lastFewRows: workbookData.slice(-2)
            }
        };
        
        // Create cell reference examples
        const cellExamples = {};
        for (let r = 0; r < Math.min(3, workbookData.length); r++) {
            for (let c = 0; c < Math.min(3, headers.length); c++) {
                const cellRef = `${String.fromCharCode(65 + c)}${r + 2}`; // A2, B2, etc.
                cellExamples[cellRef] = workbookData[r][c] || '(empty)';
            }
        }

        const systemPrompt = `You are an Excel/Spreadsheet AI Assistant. You understand spreadsheet structure with rows and columns.

SPREADSHEET STRUCTURE:
- The spreadsheet has ${workbookData.length} rows (excluding header row) and ${headers.length} columns.
- Row numbers start at 1 (for data rows, header is row 0).
- Column letters: A=${headers[0] || "Column 1"}, B=${headers[1] || "Column 2"}, C=${headers[2] || "Column 3"}, etc.

COLUMN HEADERS (with indices):
${headers.map((h, i) => `${i + 1}. ${h || `Column ${i + 1}`} (Column ${String.fromCharCode(65 + i)})`).join('\n')}

CELL REFERENCE EXAMPLES:
${Object.entries(cellExamples).map(([ref, value]) => `${ref} = "${value}"`).join('\n')}

FIRST FEW ROWS OF DATA (for context):
Row 1: [${workbookData[0]?.map(v => `"${v}"`).join(', ') || 'empty'}]
${workbookData[1] ? `Row 2: [${workbookData[1]?.map(v => `"${v}"`).join(', ')}]` : ''}
${workbookData[2] ? `Row 3: [${workbookData[2]?.map(v => `"${v}"`).join(', ')}]` : ''}

RESPONSE FORMAT:
You MUST return ONLY valid JSON with this exact structure:
{
  "headers": ["Header1", "Header2", ...],
  "data": [
    ["cell1", "cell2", ...],
    ["cell3", "cell4", ...],
    ...
  ],
  "explanation": "Brief explanation of what you changed"
}

CHANGE EXAMPLES:
1. If asked to "change row 3 column B to 100":
   - Find row index 2 (since rows are 0-indexed in data array)
   - Find column index 1 (B = index 1)
   - Set data[2][1] = "100"

2. If asked to "swap rows 1 and 2":
   - Swap data[0] and data[1]

3. If asked to "add a new column called 'Total'":
   - Add "Total" to headers array
   - Add empty string to each row in data

4. If asked to "delete rows where column A is empty":
   - Filter out rows where data[row][0] is empty

5. If asked to "sort by column B ascending":
   - Sort data based on values in column index 1

IMPORTANT: Preserve all existing data unless explicitly told to remove it.
Return the COMPLETE modified dataset.`;

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
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `SPREADSHEET DATA:
Headers: ${JSON.stringify(headers)}
Data (${workbookData.length} rows): ${JSON.stringify(workbookData)}

REQUEST: ${prompt}

Please modify the spreadsheet according to the request. Return the complete modified data as JSON.`
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent results
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('OpenAI Response:', result);
        
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
            
            // Show explanation if provided
            if (parsed.explanation) {
                addChatMessage('ai', `✓ ${parsed.explanation}`);
            } else {
                addChatMessage('ai', '✓ Changes applied successfully!');
            }
            showStatus('AI modifications applied successfully', 'success');
        } else {
            throw new Error('Invalid data structure in response');
        }
    } catch (error) {
        console.error('AI Request Error:', error);
        
        // Show more helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('No valid JSON')) {
            errorMessage = 'The AI returned an invalid format. Try rephrasing your request.';
        } else if (error.message.includes('API error: 429')) {
            errorMessage = 'API rate limit exceeded. Please wait a moment before trying again.';
        } else if (error.message.includes('API error: 401')) {
            errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        }
        
        addChatMessage('ai', `❌ Error: ${errorMessage}`);
        showStatus(`Error: ${errorMessage}`, 'error');
        
        // Try to undo if the AI request failed
        if (history.length > 0) {
            const previous = history.pop();
            headers = previous.headers;
            workbookData = previous.data;
            cellColors = previous.colors;
            renderTable();
            addChatMessage('system', '↶ Restored previous version due to error');
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

// Add helper function to parse Excel-style references
function parseCellReference(ref) {
    // Parse references like "A1", "B2", etc.
    const match = ref.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return null;
    
    const colLetters = match[1].toUpperCase();
    const rowNum = parseInt(match[2]);
    
    // Convert column letters to index (A=0, B=1, etc.)
    let colIndex = 0;
    for (let i = 0; i < colLetters.length; i++) {
        colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
    }
    colIndex--; // Convert to 0-indexed
    
    return {
        row: rowNum - 2, // Convert to data array index (row 2 = index 0)
        col: colIndex
    };
}