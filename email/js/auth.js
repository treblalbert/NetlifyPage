// Google Authentication Module

let tokenClient = null;
let CLIENT_ID = null;

const Auth = {
    init: function() {
        if (!CLIENT_ID) return;
        
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            auto_select: false,
            callback: this.handleAuthResponse.bind(this)
        });
        
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: window.APP_CONFIG.SCOPES,
            callback: this.handleAuthResponse.bind(this),
            hint: ''
        });
    },

    async validateToken(accessToken) {
        try {
            const response = await fetch(`${window.APP_CONFIG.OAUTH2_API_BASE}/v1/tokeninfo?access_token=${accessToken}`);
            const data = await response.json();
            return !data.error;
        } catch (error) {
            return false;
        }
    },

    async checkSavedCredentials() {
        const savedClientId = Storage.loadClientId();
        if (savedClientId) {
            CLIENT_ID = savedClientId;
            
            const savedAccounts = Storage.loadAccounts();
            if (savedAccounts.length > 0) {
                console.log('Found saved accounts, validating tokens...');
                
                for (const savedAccount of savedAccounts) {
                    const isValid = await this.validateToken(savedAccount.accessToken);
                    if (isValid) {
                        console.log('Token valid for:', savedAccount.email);
                        window.accounts.push({
                            email: savedAccount.email,
                            accessToken: savedAccount.accessToken,
                            currentFolder: savedAccount.currentFolder || 'INBOX',
                            selectedEmails: []
                        });
                    } else {
                        console.log('Token expired for:', savedAccount.email);
                    }
                }
                
                if (window.accounts.length > 0) {
                    console.log('Loading saved accounts:', window.accounts.length);
                    Gmail.updateAccountsDisplay();
                    return;
                }
            }
            
            this.showSignInButton();
            this.init();
        }
    },

    loadCredentials: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const credentials = JSON.parse(e.target.result);
                CLIENT_ID = credentials.web.client_id;
                
                Storage.saveClientId(CLIENT_ID);
                Storage.saveCredentials(e.target.result);
                
                document.getElementById('credentialsStatus').innerHTML = 
                    '✅ Credentials loaded successfully!<br>Now you can sign in with your accounts.';
                
                setTimeout(() => {
                    this.showSignInButton();
                }, 1000);
                
                this.init();
            } catch (error) {
                document.getElementById('credentialsStatus').innerHTML = 
                    '❌ Error loading credentials. Please check the JSON file.';
                console.error('Error parsing credentials:', error);
            }
        };
        reader.readAsText(file);
    },

    showSignInButton: function() {
        const authPrompt = document.getElementById('authPrompt');
        authPrompt.innerHTML = `
            <h2>Ready to Sign In!</h2>
            <p style="margin-top: 10px; color: rgba(255,255,255,0.8);">Click below to sign in with your Gmail accounts</p>
            <button class="auth-btn" onclick="authenticate()">Sign in with Google</button>
            <button class="auth-btn" style="background: rgba(102,102,102,0.2); margin-top: 10px;" onclick="resetCredentials()">🔄 Change Credentials</button>
        `;
    },

    authenticate: function() {
        if (!CLIENT_ID) {
            alert('Please upload your credentials file first.');
            return;
        }
        
        console.log('Starting authentication...');
        console.log('CLIENT_ID:', CLIENT_ID);
        console.log('Current origin:', window.location.origin);
        
        tokenClient.requestAccessToken();
    },

    async handleAuthResponse(response) {
        if (response.error) {
            console.error('Auth error:', response);
            alert('Authentication failed: ' + response.error);
            return;
        }
        
        if (response.access_token) {
            try {
                const userInfo = await this.getUserInfo(response.access_token);
                console.log('User authenticated:', userInfo.email);
                
                const existingAccountIndex = window.accounts.findIndex(acc => acc.email === userInfo.email);
                if (existingAccountIndex !== -1) {
                    window.accounts[existingAccountIndex].accessToken = response.access_token;
                    console.log('Updated token for existing account:', userInfo.email);
                } else {
                    Gmail.addAccountPanel(userInfo.email, response.access_token);
                }
                
                Storage.saveAccounts(window.accounts);
                
            } catch (error) {
                console.error('Error in auth response:', error);
                alert('Error loading account: ' + error.message);
            }
        }
    },

    async getUserInfo(accessToken) {
        try {
            const response = await fetch(`${window.APP_CONFIG.OAUTH2_API_BASE}/v2/userinfo`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get user info');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting user info:', error);
            throw error;
        }
    },

    resetCredentials: function() {
        Storage.clearCredentials();
        CLIENT_ID = null;
        window.accounts = [];
        location.reload();
    }
};

// Global functions for onclick handlers
window.loadCredentials = (event) => Auth.loadCredentials(event);
window.authenticate = () => Auth.authenticate();
window.resetCredentials = () => Auth.resetCredentials();

// Export to global scope
window.Auth = Auth;