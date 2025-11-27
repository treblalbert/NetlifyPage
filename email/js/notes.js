// Notes Management Module

let currentNotesContent = '';
let isEditMode = false;
let currentFileHandle = null;
let autoSaveTimeout = null;
let hasUnsavedChanges = false;

const Notes = {
    init: function() {
        const fileInfo = Storage.loadFileInfo();
        if (fileInfo) {
            document.getElementById('currentFileName').textContent = fileInfo.fileName;
        }
        
        // Add beforeunload listener to warn about unsaved changes
        window.addEventListener('beforeunload', (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes in your notes. Are you sure you want to leave?';
            }
        });
    },

    async openNotesFile() {
        try {
            if ('showOpenFilePicker' in window) {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'Markdown Files',
                        accept: {
                            'text/markdown': ['.md'],
                            'text/plain': ['.txt']
                        }
                    }],
                    multiple: false
                });
                
                currentFileHandle = fileHandle;
                await this.loadFileContent(fileHandle);
            } else {
                document.getElementById('notesFile').click();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error opening file:', error);
                alert('Error opening file: ' + error.message);
            }
        }
    },

    async loadFileContent(fileHandle) {
        try {
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            currentNotesContent = content;
            document.getElementById('notesContent').innerHTML = this.parseMarkdown(currentNotesContent);
            document.getElementById('currentFileName').textContent = file.name;
            
            if (isEditMode) {
                document.getElementById('notesEditTextarea').value = currentNotesContent;
            }
            
            Storage.saveFileInfo(file.name);
            this.updateSaveStatus('saved');
            
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file: ' + error.message);
        }
    },

    loadNotesFile: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            currentNotesContent = e.target.result;
            document.getElementById('notesContent').innerHTML = this.parseMarkdown(currentNotesContent);
            document.getElementById('currentFileName').textContent = file.name;
            
            if (isEditMode) {
                document.getElementById('notesEditTextarea').value = currentNotesContent;
            }
            
            Storage.saveFileInfo(file.name);
        };
        reader.readAsText(file);
    },

    openNotes: function() {
        document.getElementById('notesModal').classList.add('active');
    },

    closeNotes: function() {
        if (hasUnsavedChanges && isEditMode) {
            this.autoSaveNotes();
        }
        
        document.getElementById('notesModal').classList.remove('active');
        if (isEditMode) {
            this.toggleEditMode();
        }
    },

    toggleEditMode: function() {
        isEditMode = !isEditMode;
        
        const contentDiv = document.getElementById('notesContent');
        const textarea = document.getElementById('notesEditTextarea');
        const editBtn = document.getElementById('editNotesBtn');
        
        if (isEditMode) {
            contentDiv.style.display = 'none';
            textarea.style.display = 'block';
            textarea.value = currentNotesContent;
            editBtn.textContent = '👁️ View';
            textarea.focus();
        } else {
            if (hasUnsavedChanges) {
                this.autoSaveNotes();
            }
            
            contentDiv.style.display = 'block';
            textarea.style.display = 'none';
            editBtn.textContent = '✏️ Edit';
            
            currentNotesContent = textarea.value;
            contentDiv.innerHTML = this.parseMarkdown(currentNotesContent);
        }
    },

    handleNotesChange: function() {
        hasUnsavedChanges = true;
        this.updateSaveStatus('unsaved');
        
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        
        autoSaveTimeout = setTimeout(() => {
            this.autoSaveNotes();
        }, window.APP_CONFIG.AUTO_SAVE_DELAY);
    },

    async autoSaveNotes() {
        if (!hasUnsavedChanges) return;
        
        try {
            this.updateSaveStatus('saving');
            
            const newContent = document.getElementById('notesEditTextarea').value;
            
            if (currentFileHandle) {
                const writable = await currentFileHandle.createWritable();
                await writable.write(newContent);
                await writable.close();
                
                currentNotesContent = newContent;
                hasUnsavedChanges = false;
                this.updateSaveStatus('saved');
                
                console.log('Notes automatically saved to file');
            } else {
                currentNotesContent = newContent;
                hasUnsavedChanges = false;
                this.updateSaveStatus('saved');
                
                console.log('Notes updated (no file handle for auto-save)');
            }
        } catch (error) {
            console.error('Error auto-saving notes:', error);
            this.updateSaveStatus('error');
            
            setTimeout(() => {
                if (hasUnsavedChanges) {
                    this.autoSaveNotes();
                }
            }, 2000);
        }
    },

    updateSaveStatus: function(status) {
        const indicator = document.getElementById('autoSaveIndicator');
        const statusText = document.getElementById('saveStatus');
        
        indicator.className = 'auto-save-indicator';
        
        switch (status) {
            case 'saving':
                indicator.classList.add('saving');
                statusText.textContent = 'Saving...';
                break;
            case 'saved':
                indicator.classList.add('saved');
                statusText.textContent = 'All changes saved';
                break;
            case 'unsaved':
                statusText.textContent = 'Unsaved changes';
                break;
            case 'error':
                statusText.textContent = 'Error saving';
                break;
            default:
                statusText.textContent = 'Auto-save enabled';
        }
    },

    clearNotes: function() {
        if (confirm('Are you sure you want to clear all notes?')) {
            currentNotesContent = '';
            currentFileHandle = null;
            document.getElementById('notesContent').innerHTML = 'No notes loaded. Click "Open Notes File" to load a markdown file.';
            document.getElementById('notesEditTextarea').value = '';
            document.getElementById('currentFileName').textContent = 'No file selected';
            Storage.clearFileInfo();
            hasUnsavedChanges = false;
            this.updateSaveStatus('saved');
            
            if (isEditMode) {
                this.toggleEditMode();
            }
        }
    },

    parseMarkdown: function(text) {
        if (!text) return 'No notes loaded. Click "Open Notes File" to load a markdown file.';
        
        // Store code blocks temporarily to protect them from other transformations
        const codeBlocks = [];
        let codeBlockIndex = 0;
        
        // Extract code blocks with triple backticks
        text = text.replace(/```([^\n]*)\n([\s\S]*?)```/gim, (match, language, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
            codeBlocks.push({ language: language.trim(), code: code });
            codeBlockIndex++;
            return placeholder;
        });
        
        // Headers
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        
        // Bold and Italic
        text = text.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Inline code
        text = text.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Blockquotes
        text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Lists
        text = text.replace(/^\s*\- (.*$)/gim, '<ul><li>$1</li></ul>');
        text = text.replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>');
        text = text.replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');
        
        // Fix nested lists
        text = text.replace(/<\/ul>\s*<ul>/gim, '');
        text = text.replace(/<\/ol>\s*<ol>/gim, '');
        
        // Paragraphs
        text = text.replace(/\n\n/gim, '</p><p>');
        text = '<p>' + text + '</p>';
        
        // Line breaks
        text = text.replace(/\n/gim, '<br>');
        
        // Restore code blocks with copy buttons
        codeBlocks.forEach((block, index) => {
            const codeId = `code-block-${index}`;
            const codeHtml = `
                <div class="code-block-wrapper">
                    <button class="copy-code-btn" onclick="Notes.copyCode('${codeId}')">📋 Copy</button>
                    <pre id="${codeId}">${this.escapeHtml(block.code)}</pre>
                </div>
            `;
            text = text.replace(`__CODE_BLOCK_${index}__`, codeHtml);
        });
        
        return text;
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    copyCode: function(codeId) {
        const codeElement = document.getElementById(codeId);
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            // Find the copy button for this code block
            const wrapper = codeElement.closest('.code-block-wrapper');
            const copyBtn = wrapper.querySelector('.copy-code-btn');
            
            // Update button to show success
            copyBtn.textContent = '✅ Copied!';
            copyBtn.classList.add('copied');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            alert('Failed to copy code to clipboard');
        });
    }
};

// Global functions for onclick handlers
window.openNotes = () => Notes.openNotes();
window.closeNotes = () => Notes.closeNotes();
window.openNotesFile = () => Notes.openNotesFile();
window.loadNotesFile = (event) => Notes.loadNotesFile(event);
window.toggleEditMode = () => Notes.toggleEditMode();
window.handleNotesChange = () => Notes.handleNotesChange();
window.clearNotes = () => Notes.clearNotes();

// Export to global scope
window.Notes = Notes;