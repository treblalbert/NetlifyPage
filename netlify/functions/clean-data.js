// netlify/functions/clean-data.js
const https = require('https');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { data, fileName, options } = JSON.parse(event.body);
    
    // Determine file type
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let parsedData;
    
    // Parse data based on file type
    if (fileExtension === 'csv') {
      parsedData = parseCSV(data);
    } else if (fileExtension === 'json') {
      parsedData = JSON.parse(data);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      // For Excel files, we'd need additional parsing
      // For now, we'll treat it as CSV
      parsedData = parseCSV(data);
    }

    // Create prompt for OpenAI
    const prompt = createCleaningPrompt(parsedData, options);
    
    // Call OpenAI API
    const openAIResponse = await callOpenAI(prompt, process.env.OPENAI_API_KEY);
    
    // Process the AI response
    const cleaningInstructions = JSON.parse(openAIResponse);
    
    // Apply cleaning operations
    const cleanedResult = applyCleaningOperations(parsedData, cleaningInstructions, options);
    
    // Convert back to original format
    let cleanedData;
    let mimeType;
    
    if (fileExtension === 'csv') {
      cleanedData = convertToCSV(cleanedResult.data);
      mimeType = 'text/csv';
    } else if (fileExtension === 'json') {
      cleanedData = JSON.stringify(cleanedResult.data, null, 2);
      mimeType = 'application/json';
    } else {
      cleanedData = convertToCSV(cleanedResult.data);
      mimeType = 'text/csv';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        cleanedData,
        mimeType,
        stats: cleanedResult.stats
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process data' })
    };
  }
};

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return { headers, data };
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvLines = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Handle values containing commas
      return value.toString().includes(',') ? `"${value}"` : value;
    });
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n');
}

function createCleaningPrompt(parsedData, options) {
  const sampleData = parsedData.data.slice(0, 5);
  
  return `Analyze this dataset sample and provide specific cleaning instructions in JSON format.

Dataset sample:
${JSON.stringify(sampleData, null, 2)}

Headers: ${parsedData.headers.join(', ')}

Required cleaning operations:
${options.missingValues ? '- Handle missing values intelligently' : ''}
${options.duplicates ? '- Identify duplicate rows' : ''}
${options.dataTypes ? '- Correct data types for each column' : ''}
${options.standardize ? '- Standardize formats (dates, phone numbers, etc.)' : ''}
${options.outliers ? '- Identify statistical outliers' : ''}
${options.normalize ? '- Suggest normalization/scaling for numeric columns' : ''}

Return a JSON object with this exact structure:
{
  "columnTypes": {
    "columnName": "type" // numeric, date, category, text, etc.
  },
  "missingValueStrategy": {
    "columnName": "strategy" // mean, median, mode, forward_fill, drop, or specific value
  },
  "outlierThresholds": {
    "columnName": {"min": number, "max": number}
  },
  "standardFormats": {
    "columnName": "format" // e.g., "YYYY-MM-DD" for dates
  },
  "normalizationNeeded": ["column1", "column2"],
  "duplicateCheckColumns": ["column1", "column2"]
}`;
}

function callOpenAI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data cleaning expert. Analyze datasets and provide specific cleaning instructions in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed.choices[0].message.content);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function applyCleaningOperations(parsedData, instructions, options) {
  let data = [...parsedData.data];
  const stats = {
    rowsProcessed: data.length,
    issuesFixed: 0,
    duplicatesRemoved: 0
  };

  try {
    const cleaningInstructions = typeof instructions === 'string' 
      ? JSON.parse(instructions) 
      : instructions;

    // Handle missing values
    if (options.missingValues && cleaningInstructions.missingValueStrategy) {
      data = data.map(row => {
        const newRow = { ...row };
        Object.entries(cleaningInstructions.missingValueStrategy).forEach(([column, strategy]) => {
          if (!newRow[column] || newRow[column] === '') {
            stats.issuesFixed++;
            switch (strategy) {
              case 'mean':
                const numValues = data
                  .map(r => parseFloat(r[column]))
                  .filter(v => !isNaN(v));
                newRow[column] = numValues.length > 0 
                  ? (numValues.reduce((a, b) => a + b, 0) / numValues.length).toFixed(2)
                  : 0;
                break;
              case 'mode':
                const counts = {};
                data.forEach(r => {
                  if (r[column]) counts[r[column]] = (counts[r[column]] || 0) + 1;
                });
                const mode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                newRow[column] = mode ? mode[0] : '';
                break;
              case 'drop':
                // Mark for removal
                newRow._remove = true;
                break;
              default:
                newRow[column] = strategy;
            }
          }
        });
        return newRow;
      }).filter(row => !row._remove);
    }

    // Remove duplicates
    if (options.duplicates) {
      const seen = new Set();
      const originalLength = data.length;
      
      data = data.filter(row => {
        const key = cleaningInstructions.duplicateCheckColumns
          ? cleaningInstructions.duplicateCheckColumns.map(col => row[col]).join('|')
          : JSON.stringify(row);
        
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      stats.duplicatesRemoved = originalLength - data.length;
    }

    // Correct data types
    if (options.dataTypes && cleaningInstructions.columnTypes) {
      data = data.map(row => {
        const newRow = { ...row };
        Object.entries(cleaningInstructions.columnTypes).forEach(([column, type]) => {
          if (newRow[column]) {
            switch (type) {
              case 'numeric':
                const num = parseFloat(newRow[column]);
                if (!isNaN(num)) {
                  newRow[column] = num;
                  stats.issuesFixed++;
                }
                break;
              case 'date':
                // Simple date parsing
                const date = new Date(newRow[column]);
                if (!isNaN(date.getTime())) {
                  newRow[column] = date.toISOString().split('T')[0];
                  stats.issuesFixed++;
                }
                break;
            }
          }
        });
        return newRow;
      });
    }

    // Filter outliers
    if (options.outliers && cleaningInstructions.outlierThresholds) {
      data = data.filter(row => {
        for (const [column, thresholds] of Object.entries(cleaningInstructions.outlierThresholds)) {
          const value = parseFloat(row[column]);
          if (!isNaN(value)) {
            if (value < thresholds.min || value > thresholds.max) {
              stats.issuesFixed++;
              return false;
            }
          }
        }
        return true;
      });
    }

  } catch (error) {
    console.error('Error applying cleaning operations:', error);
  }

  return { data, stats };
}