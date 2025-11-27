// Gmail Operations Module

let currentOpenEmail = null;
let currentComposeAccount = null;

const Gmail = {
    updateAccountsDisplay: function() {
        const container = document.getElementById('accountsContainer');
        
        if (window.accounts.length === 0) {
            container.innerHTML = `
                <div class="account-panel">
                    <div class="auth-prompt">
                        <h2>Welcome!</h2>
                        <p style="margin-top: 10px; color: rgba(255,255,255,0.8);">Click below to sign in with your Gmail accounts</p>
                        <button class="auth-btn" onclick="authenticate()">Sign in with Google</button>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        window.accounts.forEach((acc, index) => {
            const panel = this.createAccountPanel(acc, index);
            container.appendChild(panel);
            setTimeout(() => {
                this.loadEmails(acc.email, acc.accessToken, acc.currentFolder);
            }, 100);
        });
    },

    createAccountPanel: function(account, index) {
        const panel = document.createElement('div');
        panel.className = 'account-panel';
        panel.id = `account-${index}`;
        
        const initial = account.email.charAt(0).toUpperCase();
        
        panel.innerHTML = `
            <div class="account-header">
                <div class="account-info">
                    <div class="account-avatar">${initial}</div>
                    <div class="account-email">${account.email}</div>
                </div>
                <div class="account-actions">
                    <button class="action-btn" onclick="Gmail.refreshAccount(${index})">🔄 Refresh</button>
                    <button class="action-btn" onclick="Gmail.composeEmail(${index})">📝 Compose</button>
                    <button class="action-btn danger" onclick="Gmail.cleanupAccount(${index})">🗑️ Clean Folder</button>
                    <button class="action-btn danger" onclick="Gmail.removeAccount(${index})">✕ Remove</button>
                </div>
            </div>
            <div class="selection-toolbar" id="selection-toolbar-${index}">
                <span id="selected-count-${index}">0 emails selected</span>
                <button class="delete-selected-btn" onclick="Gmail.deleteSelected(${index})" id="delete-selected-${index}">
                    🗑️ Delete Selected
                </button>
                <button class="action-btn" onclick="Gmail.clearSelection(${index})">✕ Clear</button>
            </div>
            <div class="folders">
                <div class="folder-tab active" onclick="Gmail.switchFolder(${index}, 'INBOX')">Inbox</div>
                <div class="folder-tab" onclick="Gmail.switchFolder(${index}, 'SPAM')">Spam</div>
                <div class="folder-tab" onclick="Gmail.switchFolder(${index}, 'CATEGORY_PROMOTIONS')">Promotions</div>
                <div class="folder-tab" onclick="Gmail.switchFolder(${index}, 'CATEGORY_SOCIAL')">Social</div>
                <div class="folder-tab" onclick="Gmail.switchFolder(${index}, 'CATEGORY_UPDATES')">Updates</div>
            </div>
            <div class="emails-list" id="emails-${index}">
                <div class="loading">Loading emails...</div>
            </div>
        `;
        
        return panel;
    },

    addAccountPanel: function(email, accessToken) {
        console.log('Adding account panel for:', email);
        const account = { 
            email, 
            accessToken, 
            currentFolder: 'INBOX',
            selectedEmails: []
        };
        window.accounts.push(account);
        
        this.updateAccountsDisplay();
    },

    async loadEmails(email, accessToken, folder = 'INBOX') {
        const index = window.accounts.findIndex(acc => acc.email === email);
        const emailsList = document.getElementById(`emails-${index}`);
        
        console.log(`Loading emails for ${email}, folder: ${folder}`);
        
        if (!emailsList) {
            console.error('Emails list element not found for index:', index);
            return;
        }
        
        emailsList.innerHTML = '<div class="loading">Loading emails...</div>';
        
        try {
            const response = await fetch(
                `${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages?labelIds=${folder}&maxResults=${window.APP_CONFIG.MAX_EMAILS_PER_LOAD}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.messages || data.messages.length === 0) {
                emailsList.innerHTML = '<div class="loading">No emails found in this folder</div>';
                return;
            }
            
            emailsList.innerHTML = '';
            
            let loaded = 0;
            for (const message of data.messages) {
                try {
                    const details = await fetch(
                        `${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    
                    if (!details.ok) continue;
                    
                    const emailData = await details.json();
                    
                    const headers = emailData.payload.headers;
                    const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
                    const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
                    const date = new Date(parseInt(emailData.internalDate)).toLocaleDateString();
                    const isUnread = emailData.labelIds?.includes('UNREAD');
                    
                    const emailItem = document.createElement('div');
                    emailItem.className = `email-item ${isUnread ? 'unread' : ''}`;
                    emailItem.innerHTML = `
                        <input type="checkbox" class="email-checkbox" onclick="event.stopPropagation(); Gmail.toggleEmailSelection(${index}, '${message.id}', this)">
                        <div class="email-content" onclick="Gmail.openEmail(${index}, '${message.id}')">
                            <div class="email-sender">${from.split('<')[0].trim()}</div>
                            <div class="email-subject">${subject}</div>
                            <div class="email-preview">${subject}</div>
                            <div class="email-date">${date}</div>
                        </div>
                    `;
                    emailsList.appendChild(emailItem);
                    
                    loaded++;
                    
                } catch (err) {
                    console.error('Error loading individual email:', err);
                }
            }
            
            console.log(`Loaded ${loaded} emails successfully`);
            
        } catch (error) {
            console.error('Error loading emails:', error);
            emailsList.innerHTML = `<div class="error">Error loading emails: ${error.message}<br>Check console for details</div>`;
        }
    },

    openEmail: function(accountIndex, messageId) {
        const account = window.accounts[accountIndex];
        const modal = document.getElementById('emailModal');
        const modalBody = document.getElementById('emailModalBody');
        const modalSubject = document.getElementById('emailModalSubject');
        const modalFrom = document.getElementById('emailModalFrom');
        const modalDate = document.getElementById('emailModalDate');
        const replyBtn = document.getElementById('replyBtn');
        
        currentOpenEmail = { accountIndex, messageId };
        
        modalBody.innerHTML = '<div class="loading">Loading email...</div>';
        modal.classList.add('active');
        
        fetch(`${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`, {
            headers: { Authorization: `Bearer ${account.accessToken}` }
        })
        .then(res => res.json())
        .then(emailData => {
            const headers = emailData.payload.headers;
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
            const date = new Date(parseInt(emailData.internalDate)).toLocaleString();
            
            modalSubject.textContent = subject;
            modalFrom.textContent = 'From: ' + from;
            modalDate.textContent = date;
            
            function getEmailBody(payload) {
                if (payload.body && payload.body.data) {
                    const text = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    return decodeURIComponent(escape(text));
                }
                
                if (payload.parts) {
                    const textPart = findPartByType(payload.parts, 'text/plain');
                    if (textPart && textPart.body && textPart.body.data) {
                        const text = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        return decodeURIComponent(escape(text));
                    }
                    
                    const htmlPart = findPartByType(payload.parts, 'text/html');
                    if (htmlPart && htmlPart.body && htmlPart.body.data) {
                        const html = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        return html;
                    }
                    
                    for (const part of payload.parts) {
                        if (part.parts) {
                            const found = getEmailBody(part);
                            if (found && found !== 'No content available') return found;
                        }
                    }
                }
                
                return 'No content available';
            }
            
            function findPartByType(parts, mimeType) {
                for (const part of parts) {
                    if (part.mimeType === mimeType) return part;
                    if (part.parts) {
                        const found = findPartByType(part.parts, mimeType);
                        if (found) return found;
                    }
                }
                return null;
            }
            
            const body = getEmailBody(emailData.payload);
            
            if (body.includes('</') || body.includes('/>') || body.includes('<br')) {
                modalBody.innerHTML = `
                    <div style="border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 20px; background: rgba(255,255,255,0.05);">
                        ${body}
                    </div>
                    <div style="margin-top: 15px; color: rgba(255,255,255,0.6); font-size: 12px;">
                        📄 Showing HTML content
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="email-modal-content-text" style="white-space: pre-wrap; line-height: 1.6; font-family: inherit;">
                        ${body}
                    </div>
                `;
            }
            
            replyBtn.onclick = () => {
                this.closeEmailModal();
                this.openCompose(accountIndex, { 
                    to: from.match(/<(.+)>/)?.[1] || from,
                    subject: subject.startsWith('Re: ') ? subject : 'Re: ' + subject,
                    inReplyTo: messageId
                });
            };
        })
        .catch(error => {
            console.error('Error loading email:', error);
            modalBody.innerHTML = `<div class="error">Error loading email: ${error.message}</div>`;
        });
    },

    closeEmailModal: function() {
        document.getElementById('emailModal').classList.remove('active');
        currentOpenEmail = null;
    },

    openCompose: function(accountIndex, replyData = null) {
        currentComposeAccount = accountIndex;
        const modal = document.getElementById('composeModal');
        const account = window.accounts[accountIndex];
        
        document.getElementById('composeFrom').textContent = account.email;
        document.getElementById('composeTo').value = replyData?.to || '';
        document.getElementById('composeSubject').value = replyData?.subject || '';
        document.getElementById('composeBody').value = '';
        
        modal.classList.add('active');
        document.getElementById('composeTo').focus();
    },

    closeCompose: function() {
        document.getElementById('composeModal').classList.remove('active');
        currentComposeAccount = null;
    },

    sendEmail: function() {
        if (currentComposeAccount === null) return;
        
        const account = window.accounts[currentComposeAccount];
        const to = document.getElementById('composeTo').value;
        const subject = document.getElementById('composeSubject').value;
        const body = document.getElementById('composeBody').value;
        
        if (!to || !subject) {
            alert('Please fill in recipient and subject');
            return;
        }
        
        const email = [
            'Content-Type: text/plain; charset="UTF-8"\n',
            'MIME-Version: 1.0\n',
            'Content-Transfer-Encoding: 7bit\n',
            'to: ' + to + '\n',
            'subject: ' + subject + '\n\n',
            body
        ].join('');
        
        const encodedEmail = btoa(unescape(encodeURIComponent(email)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        fetch(`${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${account.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw: encodedEmail })
        })
        .then(res => res.json())
        .then(data => {
            alert('Email sent successfully!');
            this.closeCompose();
            this.refreshAccount(currentComposeAccount);
        })
        .catch(error => {
            alert('Error sending email: ' + error.message);
        });
    },

    composeEmail: function(accountIndex) {
        this.openCompose(accountIndex);
    },

    toggleEmailSelection: function(accountIndex, messageId, checkbox) {
        const emailItem = checkbox.closest('.email-item');
        const account = window.accounts[accountIndex];
        
        if (!account.selectedEmails) {
            account.selectedEmails = [];
        }
        
        if (checkbox.checked) {
            emailItem.classList.add('selected');
            if (!account.selectedEmails.includes(messageId)) {
                account.selectedEmails.push(messageId);
            }
        } else {
            emailItem.classList.remove('selected');
            const idx = account.selectedEmails.indexOf(messageId);
            if (idx > -1) account.selectedEmails.splice(idx, 1);
        }
        
        this.updateSelectionToolbar(accountIndex);
    },

    updateSelectionToolbar: function(accountIndex) {
        const account = window.accounts[accountIndex];
        const selectedCount = account.selectedEmails ? account.selectedEmails.length : 0;
        const toolbar = document.getElementById(`selection-toolbar-${accountIndex}`);
        const countElement = document.getElementById(`selected-count-${accountIndex}`);
        const deleteBtn = document.getElementById(`delete-selected-${accountIndex}`);
        
        if (selectedCount > 0) {
            toolbar.classList.add('active');
            countElement.textContent = `${selectedCount} email(s) selected`;
            deleteBtn.style.display = 'block';
        } else {
            toolbar.classList.remove('active');
        }
    },

    clearSelection: function(accountIndex) {
        const account = window.accounts[accountIndex];
        account.selectedEmails = [];
        
        const emailsList = document.getElementById(`emails-${accountIndex}`);
        const checkboxes = emailsList.querySelectorAll('.email-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        
        const emailItems = emailsList.querySelectorAll('.email-item');
        emailItems.forEach(item => item.classList.remove('selected'));
        
        this.updateSelectionToolbar(accountIndex);
    },

    async deleteSelected(accountIndex) {
        const account = window.accounts[accountIndex];
        const selected = account.selectedEmails || [];
        
        if (selected.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${selected.length} selected email(s)?`)) return;
        
        try {
            let deleted = 0;
            for (const messageId of selected) {
                try {
                    await fetch(
                        `${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages/${messageId}/trash`,
                        {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${account.accessToken}` }
                        }
                    );
                    deleted++;
                } catch (error) {
                    console.error('Error deleting email:', error);
                }
            }
            
            alert(`Successfully deleted ${deleted} email(s)!`);
            account.selectedEmails = [];
            this.updateSelectionToolbar(accountIndex);
            this.refreshAccount(accountIndex);
            
        } catch (error) {
            alert('Error deleting emails: ' + error.message);
        }
    },

    switchFolder: function(index, folder) {
        const account = window.accounts[index];
        account.currentFolder = folder;
        
        const tabs = document.querySelectorAll(`#account-${index} .folder-tab`);
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        this.loadEmails(account.email, account.accessToken, folder);
        
        Storage.saveAccounts(window.accounts);
    },

    async cleanupAccount(index) {
        const account = window.accounts[index];
        const currentFolder = account.currentFolder;
        
        if (currentFolder === 'INBOX') {
            alert('Cannot clean Inbox. Please switch to another folder (Spam, Promotions, Social, or Updates).');
            return;
        }
        
        const folderName = window.FOLDER_NAMES[currentFolder] || currentFolder;
        
        if (!confirm(`Delete all emails from ${folderName} for ${account.email}?`)) return;
        
        try {
            const response = await fetch(
                `${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages?labelIds=${currentFolder}`,
                { headers: { Authorization: `Bearer ${account.accessToken}` } }
            );
            const data = await response.json();
            
            if (data.messages) {
                let deleted = 0;
                for (const message of data.messages) {
                    await fetch(
                        `${window.APP_CONFIG.GMAIL_API_BASE}/users/me/messages/${message.id}/trash`,
                        {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${account.accessToken}` }
                        }
                    );
                    deleted++;
                }
                alert(`Cleaned ${deleted} emails from ${folderName}!`);
            } else {
                alert('No emails to clean in this folder.');
            }
        } catch (error) {
            console.error(`Error cleaning ${currentFolder}:`, error);
            alert('Error cleaning folder: ' + error.message);
        }
        
        this.refreshAccount(index);
    },

    refreshAccount: function(index) {
        const account = window.accounts[index];
        if (account.selectedEmails) {
            account.selectedEmails = [];
        }
        this.updateSelectionToolbar(index);
        this.loadEmails(account.email, account.accessToken, account.currentFolder);
    },

    removeAccount: function(index) {
        if (confirm(`Are you sure you want to remove ${window.accounts[index].email}?`)) {
            window.accounts.splice(index, 1);
            Storage.saveAccounts(window.accounts);
            this.updateAccountsDisplay();
        }
    },

    addAccount: function() {
        Auth.authenticate();
    }
};

// Global functions for onclick handlers
window.closeEmailModal = () => Gmail.closeEmailModal();
window.closeCompose = () => Gmail.closeCompose();
window.sendEmail = () => Gmail.sendEmail();
window.composeEmail = (index) => Gmail.composeEmail(index);
window.addAccount = () => Gmail.addAccount();

// Export to global scope
window.Gmail = Gmail;