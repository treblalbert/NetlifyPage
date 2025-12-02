// Global state
let currentLang = 'en';
let translations = {};

// DOM Elements
const apiSetup = document.getElementById('apiSetup');
const mainApp = document.getElementById('mainApp');
const apiKeyFile = document.getElementById('apiKeyFile');
const excelFile = document.getElementById('excelFile');
const aiPrompt = document.getElementById('aiPrompt');
const aiButton = document.getElementById('aiButton');
const undoBtn = document.getElementById('undoBtn');
const addRowBtn = document.getElementById('addRowBtn');
const addColBtn = document.getElementById('addColBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const chatMessages = document.getElementById('chatMessages');
const langButtons = document.querySelectorAll('.lang-btn');
const dataTable = document.getElementById('dataTable');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

// Initialize app
window.addEventListener('load', async () => {
    // Load translations
    await loadTranslations();
    
    // Set initial language
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    await changeLanguage(savedLang);
    
    // Load saved API key path
    const savedPath = localStorage.getItem('apiKeyPath');
    if (savedPath) {
        addChatMessage('system', translations[currentLang].savedApiKey.replace('{path}', savedPath));
    }
    
    // Set up event listeners
    setupEventListeners();
    updateButtonStates();
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
        translations.es = await esRes.json();
        translations.ca = await caRes.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English
        translations.en = {
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
        translations.es = translations.en;
        translations.ca = translations.en;
    }
}

// Change language
async function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    
    // Update UI text
    document.getElementById('appSubtitle').textContent = translations[lang].appSubtitle;
    document.getElementById('setupTitle').textContent = translations[lang].setupTitle;
    document.getElementById('setupDescription').textContent = translations[lang].setupDescription;
    document.getElementById('securityNote').textContent = translations[lang].securityNote;
    document.getElementById('fileLabel').textContent = translations[lang].fileLabel;
    document.getElementById('aiAssistantLabel').textContent = translations[lang].aiAssistantLabel;
    
    // Update buttons with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update textarea placeholder
    const placeholderKey = `data-placeholder-${lang}`;
    if (aiPrompt.hasAttribute(placeholderKey)) {
        aiPrompt.placeholder = aiPrompt.getAttribute(placeholderKey);
    }
    
    // Update file input labels
    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs[0]) {
        fileInputs[0].setAttribute('title', translations[lang].apiKeyPlaceholder || 'Load API key file');
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
    apiKeyFile.addEventListener('change', handleApiKeyFile);
    
    // Excel file
    excelFile.addEventListener('change', handleExcelFile);
    
    // AI button - FIXED: Now properly calls the AI handler
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
    const hasData = window.workbookData && window.workbookData.length > 0;
    const hasHistory = window.history && window.history.length > 0;
    
    aiButton.disabled = !hasData;
    aiPrompt.disabled = !hasData;
    undoBtn.disabled = !hasHistory;
    addRowBtn.disabled = !hasData;
    addColBtn.disabled = !hasData;
    downloadBtn.disabled = !hasData;
}

// Export functions to window object
window.showStatus = showStatus;
window.addChatMessage = addChatMessage;
window.updateButtonStates = updateButtonStates;
window.renderTable = renderTable;