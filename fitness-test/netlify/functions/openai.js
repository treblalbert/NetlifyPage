const { OpenAI } = require('openai');

exports.handler = async (event, context) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { prompt, user_id } = JSON.parse(event.body);

        if (!prompt || !user_id) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Missing required fields: prompt and user_id' })
            };
        }

        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY environment variable not set');
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'OpenAI API key not configured' })
            };
        }

        // Initialize OpenAI with the new v4+ syntax
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log('Making OpenAI API call...');

        // Make the API call with the new v4+ syntax
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful fitness AI assistant. Provide clear, safe, and actionable fitness advice. When creating workout plans, always respond with valid JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.7,
        });

        console.log('OpenAI API call successful');

        // TODO: Log usage to Supabase for tracking
        // You can add usage tracking here later

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: JSON.stringify({
                content: completion.choices[0].message.content
            })
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // More specific error handling
        let errorMessage = 'Failed to process request';
        let statusCode = 500;

        if (error.code === 'insufficient_quota') {
            errorMessage = 'OpenAI API quota exceeded';
            statusCode = 429;
        } else if (error.code === 'invalid_api_key') {
            errorMessage = 'Invalid OpenAI API key';
            statusCode = 401;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};