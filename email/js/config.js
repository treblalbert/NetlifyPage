// Configuration and Constants
const CONFIG = {
    SCOPES: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    GMAIL_API_BASE: 'https://gmail.googleapis.com/gmail/v1',
    OAUTH2_API_BASE: 'https://www.googleapis.com/oauth2',
    OPENAI_API_BASE: 'https://api.openai.com/v1',
    MAX_EMAILS_PER_LOAD: 20,
    AUTO_SAVE_DELAY: 1000, // milliseconds
    OPENAI_MODEL: 'gpt-3.5-turbo',
    OPENAI_MAX_TOKENS: 500,
    OPENAI_TEMPERATURE: 0.7
};

// Folder names mapping
const FOLDER_NAMES = {
    'SPAM': 'Spam',
    'CATEGORY_PROMOTIONS': 'Promotions',
    'CATEGORY_SOCIAL': 'Social',
    'CATEGORY_UPDATES': 'Updates',
    'INBOX': 'Inbox'
};

// System prompt for AI Assistant
const AI_SYSTEM_PROMPT = "You are Albert's Assistant, a helpful AI assistant. Always address the user as 'Sir Albert' and maintain a respectful, professional tone. You are integrated into Albert's Workspace and can help with various tasks including email management, note-taking, and general assistance.";

// Export configuration
window.APP_CONFIG = CONFIG;
window.FOLDER_NAMES = FOLDER_NAMES;
window.AI_SYSTEM_PROMPT = AI_SYSTEM_PROMPT;