// LocalStorage Management Module

const Storage = {
    // Accounts Storage
    saveAccounts: function(accounts) {
        const accountsToSave = accounts.map(account => ({
            email: account.email,
            accessToken: account.accessToken,
            currentFolder: account.currentFolder || 'INBOX'
        }));
        localStorage.setItem('gmail_accounts', JSON.stringify(accountsToSave));
        console.log('Accounts saved to localStorage:', accountsToSave.length);
    },

    loadAccounts: function() {
        const savedAccounts = localStorage.getItem('gmail_accounts');
        if (savedAccounts) {
            try {
                const parsedAccounts = JSON.parse(savedAccounts);
                console.log('Loaded accounts from storage:', parsedAccounts);
                return parsedAccounts;
            } catch (error) {
                console.error('Error parsing saved accounts:', error);
                return [];
            }
        }
        return [];
    },

    // Credentials Storage
    saveClientId: function(clientId) {
        localStorage.setItem('gmail_client_id', clientId);
    },

    loadClientId: function() {
        return localStorage.getItem('gmail_client_id');
    },

    saveCredentials: function(credentials) {
        localStorage.setItem('gmail_credentials', credentials);
    },

    clearCredentials: function() {
        localStorage.removeItem('gmail_client_id');
        localStorage.removeItem('gmail_credentials');
        localStorage.removeItem('gmail_accounts');
    },

    // File Info Storage
    saveFileInfo: function(fileName) {
        if (fileName) {
            const fileInfo = { fileName: fileName };
            localStorage.setItem('notes_file_info', JSON.stringify(fileInfo));
        }
    },

    loadFileInfo: function() {
        const savedFileInfo = localStorage.getItem('notes_file_info');
        if (savedFileInfo) {
            try {
                return JSON.parse(savedFileInfo);
            } catch (error) {
                console.error('Error parsing file info:', error);
            }
        }
        return null;
    },

    clearFileInfo: function() {
        localStorage.removeItem('notes_file_info');
    },

    // API Key Storage
    saveAPIKey: function(apiKey) {
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
        }
    },

    loadAPIKey: function() {
        return localStorage.getItem('openai_api_key');
    },

    clearAPIKey: function() {
        localStorage.removeItem('openai_api_key');
    },

    // Chat History Storage
    saveChatHistory: function(history) {
        localStorage.setItem('chat_history', JSON.stringify(history));
    },

    loadChatHistory: function() {
        const savedHistory = localStorage.getItem('chat_history');
        if (savedHistory) {
            try {
                return JSON.parse(savedHistory);
            } catch (error) {
                console.error('Error parsing chat history:', error);
            }
        }
        return null;
    },

    clearChatHistory: function() {
        localStorage.removeItem('chat_history');
    },

    // Clear All Storage
    clearAll: function() {
        localStorage.clear();
        console.log('All localStorage cleared');
    }
};

// Export to global scope
window.Storage = Storage;