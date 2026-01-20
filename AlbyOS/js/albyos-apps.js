/**
 * AlbyOS Applications
 * Register all available apps here
 */

// ============================================
// MEMORIES APP
// Photo and video gallery connected to Raspberry Pi server
// ============================================

const MemoriesApp = {
    id: 'memories',
    name: 'Memories',
    description: 'Photos & Videos from your server',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
    </svg>`,
    showOnDesktop: true,
    defaultWidth: 1000,
    defaultHeight: 700,

    // App state
    state: {
        albums: [],
        currentAlbum: null,
        media: [],
        selectedMedia: null,
        viewMode: 'grid', // grid or single
        loading: false
    },

    render() {
        return `
            <div class="memories-app">
                <div class="memories-sidebar">
                    <div class="memories-sidebar-header">
                        <h3>Albums</h3>
                        <button class="memories-refresh-btn" title="Refresh">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6M1 20v-6h6"/>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                            </svg>
                        </button>
                    </div>
                    <div class="memories-albums-list">
                        <div class="memories-loading">
                            <div class="spinner"></div>
                            <span>Loading albums...</span>
                        </div>
                    </div>
                </div>
                <div class="memories-main">
                    <div class="memories-toolbar">
                        <div class="memories-breadcrumb">
                            <span class="memories-home-btn">All Albums</span>
                            <span class="memories-current-album"></span>
                        </div>
                        <div class="memories-view-controls">
                            <button class="memories-view-btn active" data-view="grid" title="Grid View">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                                </svg>
                            </button>
                            <button class="memories-view-btn" data-view="list" title="List View">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <rect x="3" y="4" width="18" height="4" rx="1"/>
                                    <rect x="3" y="10" width="18" height="4" rx="1"/>
                                    <rect x="3" y="16" width="18" height="4" rx="1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="memories-content">
                        <div class="memories-empty">
                            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                            </svg>
                            <p>Select an album to view memories</p>
                        </div>
                    </div>
                </div>

                <!-- Media Viewer Overlay -->
                <div class="memories-viewer hidden">
                    <div class="memories-viewer-backdrop"></div>
                    <div class="memories-viewer-content">
                        <button class="memories-viewer-close">&times;</button>
                        <button class="memories-viewer-prev">&lt;</button>
                        <button class="memories-viewer-next">&gt;</button>
                        <div class="memories-viewer-media"></div>
                        <div class="memories-viewer-info">
                            <span class="memories-viewer-name"></span>
                            <span class="memories-viewer-date"></span>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .memories-app {
                    display: flex;
                    height: 100%;
                    background: var(--bg-secondary);
                    font-family: var(--font-sans);
                }

                /* Sidebar */
                .memories-sidebar {
                    width: 240px;
                    background: var(--bg-tertiary);
                    border-right: 1px solid var(--border-subtle);
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                }

                .memories-sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .memories-sidebar-header h3 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .memories-refresh-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                }

                .memories-refresh-btn:hover {
                    background: var(--bg-glass-light);
                    color: var(--accent-primary);
                }

                .memories-albums-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .memories-album-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    margin-bottom: 4px;
                }

                .memories-album-item:hover {
                    background: var(--bg-glass-light);
                }

                .memories-album-item.active {
                    background: rgba(0, 245, 212, 0.15);
                    border: 1px solid var(--border-accent);
                }

                .memories-album-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-sm);
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .memories-album-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .memories-album-thumb svg {
                    width: 24px;
                    height: 24px;
                    color: var(--text-muted);
                }

                .memories-album-info {
                    flex: 1;
                    min-width: 0;
                }

                .memories-album-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .memories-album-count {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                /* Main Content */
                .memories-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .memories-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-tertiary);
                }

                .memories-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                }

                .memories-home-btn {
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: color var(--transition-fast);
                }

                .memories-home-btn:hover {
                    color: var(--accent-primary);
                }

                .memories-current-album {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .memories-current-album::before {
                    content: '›';
                    margin-right: 8px;
                    color: var(--text-muted);
                }

                .memories-current-album:empty::before {
                    display: none;
                }

                .memories-view-controls {
                    display: flex;
                    gap: 4px;
                }

                .memories-view-btn {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                }

                .memories-view-btn:hover {
                    background: var(--bg-glass-light);
                }

                .memories-view-btn.active {
                    background: rgba(0, 245, 212, 0.1);
                    border-color: var(--border-accent);
                    color: var(--accent-primary);
                }

                .memories-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                /* Empty State */
                .memories-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-muted);
                    gap: 16px;
                }

                .memories-empty svg {
                    opacity: 0.3;
                }

                .memories-empty p {
                    font-size: 14px;
                }

                /* Loading State */
                .memories-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: var(--text-muted);
                    gap: 16px;
                }

                .memories-loading span {
                    font-size: 12px;
                }

                /* Media Grid */
                .memories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }

                .memories-grid-item {
                    aspect-ratio: 1;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    position: relative;
                    background: var(--bg-tertiary);
                    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
                }

                .memories-grid-item:hover {
                    transform: scale(1.02);
                    box-shadow: var(--shadow-glow);
                }

                .memories-grid-item img,
                .memories-grid-item video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .memories-grid-item .video-indicator {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* Media Viewer */
                .memories-viewer {
                    position: absolute;
                    inset: 0;
                    z-index: 1000;
                }

                .memories-viewer.hidden {
                    display: none;
                }

                .memories-viewer-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                }

                .memories-viewer-content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .memories-viewer-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    font-size: 32px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background var(--transition-fast);
                    z-index: 10;
                }

                .memories-viewer-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .memories-viewer-prev,
                .memories-viewer-next {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background var(--transition-fast);
                    z-index: 10;
                }

                .memories-viewer-prev { left: 16px; }
                .memories-viewer-next { right: 16px; }

                .memories-viewer-prev:hover,
                .memories-viewer-next:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .memories-viewer-media {
                    max-width: 90%;
                    max-height: 80%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .memories-viewer-media img,
                .memories-viewer-media video {
                    max-width: 100%;
                    max-height: 80vh;
                    border-radius: var(--radius-md);
                }

                .memories-viewer-info {
                    position: absolute;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                    color: white;
                }

                .memories-viewer-name {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .memories-viewer-date {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }

                /* Server Error */
                .memories-server-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .memories-server-error svg {
                    margin-bottom: 16px;
                    color: var(--accent-tertiary);
                }

                .memories-server-error h4 {
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .memories-server-error p {
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                .memories-server-error code {
                    font-family: var(--font-mono);
                    font-size: 11px;
                    background: var(--bg-tertiary);
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    display: block;
                }
            </style>
        `;
    },

    onMount(windowEl) {
        const app = windowEl.querySelector('.memories-app');
        this.elements = {
            app,
            albumsList: app.querySelector('.memories-albums-list'),
            content: app.querySelector('.memories-content'),
            currentAlbum: app.querySelector('.memories-current-album'),
            viewer: app.querySelector('.memories-viewer'),
            viewerMedia: app.querySelector('.memories-viewer-media'),
            viewerName: app.querySelector('.memories-viewer-name'),
            viewerDate: app.querySelector('.memories-viewer-date'),
            refreshBtn: app.querySelector('.memories-refresh-btn'),
            homeBtn: app.querySelector('.memories-home-btn'),
            viewBtns: app.querySelectorAll('.memories-view-btn'),
            closeBtn: app.querySelector('.memories-viewer-close'),
            prevBtn: app.querySelector('.memories-viewer-prev'),
            nextBtn: app.querySelector('.memories-viewer-next'),
            backdrop: app.querySelector('.memories-viewer-backdrop')
        };

        // Event listeners
        this.elements.refreshBtn.addEventListener('click', () => this.loadAlbums());
        this.elements.homeBtn.addEventListener('click', () => this.showAlbumsView());
        this.elements.closeBtn.addEventListener('click', () => this.closeViewer());
        this.elements.backdrop.addEventListener('click', () => this.closeViewer());
        this.elements.prevBtn.addEventListener('click', () => this.navigateMedia(-1));
        this.elements.nextBtn.addEventListener('click', () => this.navigateMedia(1));

        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.viewMode = btn.dataset.view;
                if (this.state.currentAlbum) {
                    this.renderMedia();
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Load albums
        this.loadAlbums();
    },

    onUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    },

    handleKeyDown(e) {
        if (!this.elements.viewer.classList.contains('hidden')) {
            if (e.key === 'Escape') this.closeViewer();
            if (e.key === 'ArrowLeft') this.navigateMedia(-1);
            if (e.key === 'ArrowRight') this.navigateMedia(1);
        }
    },

    async loadAlbums() {
        this.elements.albumsList.innerHTML = `
            <div class="memories-loading">
                <div class="spinner"></div>
                <span>Loading albums...</span>
            </div>
        `;

        try {
            const serverUrl = AlbyOS.getServerUrl();
            const response = await fetch(`${serverUrl}/api/albums`);
            
            if (!response.ok) throw new Error('Failed to fetch albums');
            
            const albums = await response.json();
            this.state.albums = albums;
            this.renderAlbums();
        } catch (error) {
            console.error('[Memories] Error loading albums:', error);
            this.elements.albumsList.innerHTML = `
                <div class="memories-server-error">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                    </svg>
                    <h4>Server Offline</h4>
                    <p>Cannot connect to media server</p>
                    <code>${AlbyOS.getServerUrl()}</code>
                </div>
            `;
        }
    },

    renderAlbums() {
        if (this.state.albums.length === 0) {
            this.elements.albumsList.innerHTML = `
                <div class="memories-empty">
                    <p>No albums found</p>
                </div>
            `;
            return;
        }

        const serverUrl = AlbyOS.getServerUrl();
        
        this.elements.albumsList.innerHTML = this.state.albums.map(album => `
            <div class="memories-album-item" data-album="${album.id}">
                <div class="memories-album-thumb">
                    ${album.thumbnail 
                        ? `<img src="${serverUrl}${album.thumbnail}" alt="${album.name}" loading="lazy">`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                           </svg>`
                    }
                </div>
                <div class="memories-album-info">
                    <div class="memories-album-name">${album.name}</div>
                    <div class="memories-album-count">${album.count} items</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.elements.albumsList.querySelectorAll('.memories-album-item').forEach(item => {
            item.addEventListener('click', () => {
                const albumId = item.dataset.album;
                this.selectAlbum(albumId);
            });
        });
    },

    async selectAlbum(albumId) {
        // Update UI
        this.elements.albumsList.querySelectorAll('.memories-album-item').forEach(item => {
            item.classList.toggle('active', item.dataset.album === albumId);
        });

        const album = this.state.albums.find(a => a.id === albumId);
        if (!album) return;

        this.state.currentAlbum = album;
        this.elements.currentAlbum.textContent = album.name;

        // Show loading
        this.elements.content.innerHTML = `
            <div class="memories-loading">
                <div class="spinner"></div>
                <span>Loading media...</span>
            </div>
        `;

        try {
            const serverUrl = AlbyOS.getServerUrl();
            const response = await fetch(`${serverUrl}/api/albums/${albumId}/media`);
            
            if (!response.ok) throw new Error('Failed to fetch media');
            
            const media = await response.json();
            this.state.media = media;
            this.renderMedia();
        } catch (error) {
            console.error('[Memories] Error loading media:', error);
            this.elements.content.innerHTML = `
                <div class="memories-server-error">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                    </svg>
                    <h4>Error Loading Media</h4>
                    <p>Could not load media from this album</p>
                </div>
            `;
        }
    },

    renderMedia() {
        if (this.state.media.length === 0) {
            this.elements.content.innerHTML = `
                <div class="memories-empty">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <p>This album is empty</p>
                </div>
            `;
            return;
        }

        const serverUrl = AlbyOS.getServerUrl();

        this.elements.content.innerHTML = `
            <div class="memories-grid">
                ${this.state.media.map((item, index) => `
                    <div class="memories-grid-item" data-index="${index}">
                        ${item.type === 'video' 
                            ? `<video src="${serverUrl}${item.thumbnail || item.path}" muted></video>
                               <span class="video-indicator">
                                   <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                       <polygon points="5 3 19 12 5 21 5 3"/>
                                   </svg>
                                   ${item.duration || ''}
                               </span>`
                            : `<img src="${serverUrl}${item.thumbnail || item.path}" alt="${item.name}" loading="lazy">`
                        }
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers
        this.elements.content.querySelectorAll('.memories-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openViewer(index);
            });
        });
    },

    showAlbumsView() {
        this.state.currentAlbum = null;
        this.state.media = [];
        this.elements.currentAlbum.textContent = '';
        this.elements.albumsList.querySelectorAll('.memories-album-item').forEach(item => {
            item.classList.remove('active');
        });
        this.elements.content.innerHTML = `
            <div class="memories-empty">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p>Select an album to view memories</p>
            </div>
        `;
    },

    openViewer(index) {
        this.state.selectedMedia = index;
        this.updateViewer();
        this.elements.viewer.classList.remove('hidden');
    },

    closeViewer() {
        this.elements.viewer.classList.add('hidden');
        // Pause any playing video
        const video = this.elements.viewerMedia.querySelector('video');
        if (video) video.pause();
    },

    navigateMedia(direction) {
        let newIndex = this.state.selectedMedia + direction;
        if (newIndex < 0) newIndex = this.state.media.length - 1;
        if (newIndex >= this.state.media.length) newIndex = 0;
        this.state.selectedMedia = newIndex;
        this.updateViewer();
    },

    updateViewer() {
        const media = this.state.media[this.state.selectedMedia];
        if (!media) return;

        const serverUrl = AlbyOS.getServerUrl();

        if (media.type === 'video') {
            this.elements.viewerMedia.innerHTML = `
                <video src="${serverUrl}${media.path}" controls autoplay></video>
            `;
        } else {
            this.elements.viewerMedia.innerHTML = `
                <img src="${serverUrl}${media.path}" alt="${media.name}">
            `;
        }

        this.elements.viewerName.textContent = media.name;
        this.elements.viewerDate.textContent = media.date || '';
    }
};


// ============================================
// SETTINGS APP
// ============================================

const SettingsApp = {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>`,
    showOnDesktop: true,
    defaultWidth: 600,
    defaultHeight: 500,

    render() {
        const currentServer = AlbyOS.getServerUrl();
        return `
            <div class="settings-app">
                <div class="settings-section">
                    <h3>Server Configuration</h3>
                    <div class="settings-field">
                        <label>Raspberry Pi Server URL</label>
                        <input type="text" id="server-url-input" value="${currentServer}" placeholder="http://192.168.1.x:3000">
                        <small>Enter your Raspberry Pi's IP address and port</small>
                    </div>
                    <button class="settings-btn" id="save-server-btn">Save & Test Connection</button>
                    <div id="connection-status"></div>
                </div>

                <div class="settings-section">
                    <h3>About AlbyOS</h3>
                    <p>Version ${AlbyOS.config.version}</p>
                    <p>A personal web-based operating system</p>
                </div>
            </div>
            <style>
                .settings-app {
                    padding: 24px;
                    font-family: var(--font-sans);
                }

                .settings-section {
                    margin-bottom: 32px;
                }

                .settings-section h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }

                .settings-field {
                    margin-bottom: 16px;
                }

                .settings-field label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .settings-field input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-family: var(--font-mono);
                    font-size: 13px;
                }

                .settings-field input:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                }

                .settings-field small {
                    display: block;
                    margin-top: 6px;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .settings-btn {
                    padding: 10px 20px;
                    background: var(--accent-primary);
                    color: var(--bg-primary);
                    border: none;
                    border-radius: var(--radius-md);
                    font-family: var(--font-sans);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .settings-btn:hover {
                    filter: brightness(1.1);
                }

                #connection-status {
                    margin-top: 16px;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    font-size: 13px;
                }

                #connection-status.success {
                    background: rgba(0, 245, 212, 0.1);
                    color: var(--accent-primary);
                    border: 1px solid var(--accent-primary);
                }

                #connection-status.error {
                    background: rgba(255, 107, 107, 0.1);
                    color: var(--accent-tertiary);
                    border: 1px solid var(--accent-tertiary);
                }

                .settings-section p {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
            </style>
        `;
    },

    onMount(windowEl) {
        const saveBtn = windowEl.querySelector('#save-server-btn');
        const input = windowEl.querySelector('#server-url-input');
        const status = windowEl.querySelector('#connection-status');

        saveBtn.addEventListener('click', async () => {
            const url = input.value.trim();
            if (!url) return;

            status.textContent = 'Testing connection...';
            status.className = '';

            AlbyOS.setServerUrl(url);

            try {
                const response = await fetch(`${url}/api/health`, {
                    method: 'GET',
                    mode: 'cors'
                });

                if (response.ok) {
                    status.textContent = '✓ Connected successfully!';
                    status.className = 'success';
                } else {
                    throw new Error('Server returned an error');
                }
            } catch (error) {
                status.textContent = '✗ Could not connect to server. Make sure it is running.';
                status.className = 'error';
            }
        });
    }
};


// ============================================
// FILE MANAGER APP (Placeholder)
// ============================================

const FileManagerApp = {
    id: 'files',
    name: 'Files',
    description: 'Browse your files',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>`,
    showOnDesktop: true,
    defaultWidth: 700,
    defaultHeight: 500,

    render() {
        return `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                <div style="text-align: center;">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.5;">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    <p>File Manager - Coming Soon</p>
                </div>
            </div>
        `;
    }
};


// ============================================
// REGISTER ALL APPS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    AlbyOS.registerApp(MemoriesApp);
    AlbyOS.registerApp(SettingsApp);
    AlbyOS.registerApp(FileManagerApp);
});
