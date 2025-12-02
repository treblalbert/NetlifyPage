// Global state
let currentLang = 'en';
let translations = {};
let apiKey = '';
let workbookData = [];
let headers = [];
let history = [];
let columnWidths = {};
let activeFilters = {};
let cellColors = {};

// DOM Elements
let apiSetup, mainApp, apiKeyFile, excelFile, aiPrompt, aiButton, undoBtn, addRowBtn, addColBtn;
let downloadBtn, statusDiv, chatMessages, langButtons;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    apiSetup = document.getElementById('apiSetup');
    mainApp = document.getElementById('mainApp');
    apiKeyFile = document.getElementById('apiKeyFile');
    excelFile = document.getElementById('excelFile');
    aiPrompt = document.getElementById('aiPrompt');
    aiButton = document.getElementById('aiButton');
    undoBtn = document.getElementById('undoBtn');
    addRowBtn = document.getElementById('addRowBtn');
    addColBtn = document.getElementById('addColBtn');
    downloadBtn = document.getElementById('downloadBtn');
    statusDiv = document.getElementById('status');
    chatMessages = document.getElementById('chatMessages');
    langButtons = document.querySelectorAll('.lang-btn');

    // Load translations and setup
    loadTranslations().then(() => {
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        changeLanguage(savedLang);
        
        // Load saved API key path
        const savedPath = localStorage.getItem('apiKeyPath');
        if (savedPath) {
            addChatMessage('system', translations[currentLang].savedApiKey.replace('{path}', savedPath));
        }
        
        setupEventListeners();
        updateButtonStates();
    });
});

// Load translation files
async function loadTranslations() {
    try {
        const [enRes, esRes, caRes] = await Promise.all([
            fetch('translations/en.json'),
            fetch('translations/es.json'),
            fetch('translations/ca.json')
        ]);
        
        translations.en = await enRes.json();
        translations.es = await enRes.json();
        translations.ca = await enRes.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback
        translations.en = translations.es = translations.ca = {
            appSubtitle: "Intelligent spreadsheet editing powered by AI",
            setupTitle: "Welcome! Let's Get Started",
            setupDescription: "First, load a text file containing your OpenAI API key to unlock AI-powered features.",
            securityNote: "Your API key is stored securely in your browser and never leaves your device.",
            fileLabel: "Load Excel File (.xlsx, .xls, .csv)",
            addRow: "➕ Add Row",
            addCol: "➕ Add Column",
            download: "⬇️ Download .xlsx",
            aiAssistantLabel: "AI Assistant",
            send: "Send ✨",
            undo: "↶ Undo",
            savedApiKey: "Previously used: {path}. Please load it again."
        };
    }
}

// Change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    
    if (!translations[lang]) return;
    
    // Update text content
    const trans = translations[lang];
    document.getElementById('appSubtitle').textContent = trans.appSubtitle;
    document.getElementById('setupTitle').textContent = trans.setupTitle;
    document.getElementById('setupDescription').textContent = trans.setupDescription;
    document.getElementById('securityNote').textContent = trans.securityNote;
    document.getElementById('fileLabel').textContent = trans.fileLabel;
    document.getElementById('aiAssistantLabel').textContent = trans.aiAssistantLabel;
    
    // Update buttons
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (trans[key]) {
            element.textContent = trans[key];
        }
    });
    
    // Update placeholder
    const placeholderKey = `data-placeholder-${lang}`;
    if (aiPrompt && aiPrompt.hasAttribute(placeholderKey)) {
        aiPrompt.placeholder = aiPrompt.getAttribute(placeholderKey);
    }
    
    // Update active language button
    langButtons.forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Language switcher
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
    });
    
    // API key file
    apiKeyFile.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        apiKey = text.trim();
        
        localStorage.setItem('apiKeyPath', file.name);
        
        addChatMessage('system', '✓ API Key loaded successfully!');
        apiSetup.classList.add('hidden');
        mainApp.classList.remove('hidden');
        updateButtonStates();
    });
    
    // Excel file
    excelFile.addEventListener('change', handleExcelFile);
    
    // AI button - DIRECT EVENT HANDLER
    aiButton.addEventListener('click', handleAiRequest);
    
    // Undo button
    undoBtn.addEventListener('click', handleUndo);
    
    // Add row/column buttons
    addRowBtn.addEventListener('click', handleAddRow);
    addColBtn.addEventListener('click', handleAddColumn);
    
    // Download button
    downloadBtn.addEventListener('click', handleDownload);
    
    // Enter key in AI prompt
    aiPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            aiButton.click();
        }
    });
}

// Status display
function showStatus(message, type = 'info') {
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    setTimeout(() => statusDiv.style.display = 'none', 5000);
}

// Chat message display
function addChatMessage(type, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = content;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Button state management
function updateButtonStates() {
    const hasData = workbookData.length > 0;
    const hasHistory = history.length > 0;
    const hasApiKey = apiKey !== '';
    
    aiButton.disabled = !hasData || !hasApiKey;
    aiPrompt.disabled = !hasData || !hasApiKey;
    undoBtn.disabled = !hasHistory;
    addRowBtn.disabled = !hasData;
    addColBtn.disabled = !hasData;
    downloadBtn.disabled = !hasData;
}