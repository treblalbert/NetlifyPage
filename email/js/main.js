// Main Application Initialization

// Global accounts array
window.accounts = [];

// Initialize application when DOM is loaded
window.onload = async function() {
    console.log('Albert\'s Workspace initializing...');
    
    try {
        // Initialize authentication
        await Auth.checkSavedCredentials();
        Auth.init();
        
        // Initialize notes
        Notes.init();
        
        // Initialize chat
        Chat.init();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};

// Log application version
console.log('%cAlbert\'s Workspace v2.0', 'color: #3498db; font-size: 16px; font-weight: bold;');
console.log('%cMulti-file architecture with improved performance', 'color: #2ecc71; font-size: 12px;');