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
                        ? `<img src="${serverUrl}${album.thumbnail}" alt="${album.name}" loading="lazy" crossorigin="anonymous">`
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
        console.log('[Memories] Rendering media, server:', serverUrl);
        console.log('[Memories] Media items:', this.state.media);

        this.elements.content.innerHTML = `
            <div class="memories-grid">
                ${this.state.media.map((item, index) => `
                    <div class="memories-grid-item" data-index="${index}">
                        ${item.type === 'video' 
                            ? `<video src="${serverUrl}${item.thumbnail || item.path}" muted crossorigin="anonymous" preload="metadata"></video>
                               <span class="video-indicator">
                                   <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                       <polygon points="5 3 19 12 5 21 5 3"/>
                                   </svg>
                                   ${item.duration || ''}
                               </span>`
                            : `<img src="${serverUrl}${item.thumbnail || item.path}" alt="${item.name}" loading="lazy" crossorigin="anonymous" onerror="this.style.display='none'; console.error('Failed to load:', this.src)">`
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
                <video src="${serverUrl}${media.path}" controls autoplay crossorigin="anonymous"></video>
            `;
        } else {
            this.elements.viewerMedia.innerHTML = `
                <img src="${serverUrl}${media.path}" alt="${media.name}" crossorigin="anonymous">
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
                        <input type="text" id="server-url-input" value="${currentServer}" placeholder="http://192.168.1.223:3001">
                        <small>Default: http://192.168.1.223:3001 — Change to connect to a different server</small>
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
// LENIMKI APP
// Game management portal with database, controls, and tasks
// ============================================

const LenimkiApp = {
    id: 'lenimki',
    name: 'Lenimki',
    description: 'Game Database & Management Portal',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </svg>`,
    showOnDesktop: true,
    defaultWidth: 1100,
    defaultHeight: 750,

    render() {
        // Get the server URL from AlbyOS settings (use port 3000 for Lenimki)
        const serverUrl = AlbyOS.getServerUrl().replace(':3001', ':3000');
        
        return `
            <div class="lenimki-app">
                <div class="lenimki-toolbar">
                    <div class="lenimki-server-info">
                        <span class="lenimki-server-label">Server:</span>
                        <span class="lenimki-server-url">${serverUrl}</span>
                        <span class="lenimki-server-status" id="lenimki-status">Connecting...</span>
                    </div>
                    <button class="lenimki-refresh-btn" title="Refresh">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </svg>
                    </button>
                </div>
                <iframe 
                    class="lenimki-frame" 
                    id="lenimki-iframe"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                ></iframe>
            </div>
            <style>
                .lenimki-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #0c0c0c;
                }

                .lenimki-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(22, 22, 22, 0.95);
                    border-bottom: 1px solid #2a2a2a;
                    flex-shrink: 0;
                }

                .lenimki-server-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                }

                .lenimki-server-label {
                    color: #737373;
                }

                .lenimki-server-url {
                    color: #f59e0b;
                }

                .lenimki-server-status {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .lenimki-server-status.online {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                }

                .lenimki-server-status.offline {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .lenimki-refresh-btn {
                    background: transparent;
                    border: 1px solid #2a2a2a;
                    color: #737373;
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .lenimki-refresh-btn:hover {
                    border-color: #f59e0b;
                    color: #f59e0b;
                }

                .lenimki-frame {
                    flex: 1;
                    width: 100%;
                    border: none;
                    background: #0c0c0c;
                }
            </style>
        `;
    },

    onMount(windowEl) {
        const iframe = windowEl.querySelector('#lenimki-iframe');
        const statusEl = windowEl.querySelector('#lenimki-status');
        const refreshBtn = windowEl.querySelector('.lenimki-refresh-btn');
        const serverUrl = AlbyOS.getServerUrl().replace(':3001', ':3000');

        // Load the Lenimki HTML content into the iframe
        this.loadContent(iframe, statusEl, serverUrl);

        // Refresh button
        refreshBtn.addEventListener('click', () => {
            this.loadContent(iframe, statusEl, serverUrl);
        });
    },

    loadContent(iframe, statusEl, serverUrl) {
        statusEl.textContent = 'Loading...';
        statusEl.className = 'lenimki-server-status';

        // Create the Lenimki HTML with the dynamic server URL
        const lenimkiHTML = this.generateHTML(serverUrl);
        
        // Load content into iframe
        iframe.srcdoc = lenimkiHTML;

        // Check server status
        this.checkServer(serverUrl, statusEl);
    },

    async checkServer(serverUrl, statusEl) {
        try {
            const response = await fetch(`${serverUrl}/items.json`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            if (response.ok) {
                statusEl.textContent = 'Online';
                statusEl.className = 'lenimki-server-status online';
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            statusEl.textContent = 'Offline';
            statusEl.className = 'lenimki-server-status offline';
        }
    },

    generateHTML(serverUrl) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LENIMKI | Management Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #f59e0b;
            --primary-hover: #d97706;
            --bg-body: #0c0c0c;
            --bg-card: #161616;
            --bg-elevated: #1f1f1f;
            --text-main: #e5e5e5;
            --text-muted: #737373;
            --border: #2a2a2a;
            --weapon-red: #ef4444;
            --food-green: #22c55e;
            --ammo-amber: #f59e0b;
            --misc-blue: #3b82f6;
            --accent-glow: rgba(245, 158, 11, 0.15);
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            margin: 0;
            padding: 15px;
            min-height: 100vh;
        }
        .dashboard-container {
            max-width: 100%;
            background: var(--bg-card);
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border);
            overflow: hidden;
        }
        .tabs-header {
            display: flex;
            background: var(--bg-elevated);
            border-bottom: 1px solid var(--border);
            padding: 0 15px;
            gap: 5px;
            overflow-x: auto;
        }
        .tab-btn {
            padding: 14px 22px;
            border: none;
            background: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            color: var(--text-muted);
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
            background: linear-gradient(to top, var(--accent-glow), transparent);
        }
        .tab-content { display: none; padding: 20px; }
        .tab-content.active { display: block; }
        h1 { font-size: 1.3rem; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; color: var(--primary); }
        h1 span { color: var(--text-main); font-weight: 400; }
        .subtitle { color: var(--text-muted); font-size: 0.8rem; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; }
        .search-bar { margin-bottom: 15px; padding: 12px 15px; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; gap: 10px; background: var(--bg-elevated); transition: border-color 0.2s; }
        .search-bar:focus-within { border-color: var(--primary); }
        .search-bar input { border: none; outline: none; width: 100%; font-size: 0.95rem; background: transparent; color: var(--text-main); font-family: 'Space Grotesk', sans-serif; }
        .search-bar input::placeholder { color: var(--text-muted); }
        .toolbar { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
        .filter-btn { padding: 8px 14px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-elevated); color: var(--text-muted); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; text-transform: uppercase; transition: all 0.2s; }
        .filter-btn:hover { border-color: var(--text-muted); color: var(--text-main); }
        .filter-btn.active { border-color: var(--primary); color: var(--primary); background: var(--accent-glow); }
        .btn-add { padding: 8px 16px; border: 2px dashed var(--primary); border-radius: 6px; background: transparent; color: var(--primary); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; margin-left: auto; }
        .btn-add:hover { background: var(--accent-glow); }
        input, select, button { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-family: inherit; background: var(--bg-elevated); color: var(--text-main); }
        input:focus, select:focus { outline: none; border-color: var(--primary); }
        .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
        .btn-save-pi { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px; cursor: pointer; font-weight: 700; border: none; border-radius: 8px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-save-pi:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3); }
        .btn-export { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 14px; cursor: pointer; font-weight: 700; border: none; border-radius: 8px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-export:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 12px 14px; background: var(--bg-elevated); border-bottom: 2px solid var(--border); color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; }
        td { padding: 12px 14px; border-bottom: 1px solid var(--border); transition: background 0.2s; }
        tr:hover td { background: var(--bg-elevated); }
        .editable { cursor: text; border-radius: 4px; padding: 3px 6px; margin: -3px -6px; transition: all 0.2s; }
        .editable:hover { background: rgba(245, 158, 11, 0.1); }
        .editable:focus { outline: none; background: rgba(245, 158, 11, 0.15); box-shadow: 0 0 0 2px var(--primary); }
        .status-tag { padding: 5px 10px; border-radius: 5px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px; }
        .tag-yes { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .tag-no { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .expand-btn { background: none; border: 1px solid var(--border); color: var(--text-muted); width: 26px; height: 26px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; padding: 0; }
        .expand-btn:hover { border-color: var(--primary); color: var(--primary); }
        .expand-btn.expanded { background: var(--primary); border-color: var(--primary); color: var(--bg-body); }
        .details-row { display: none; }
        .details-row.visible { display: table-row; }
        .details-row td { background: var(--bg-elevated) !important; padding: 0; border-bottom: 2px solid var(--primary); }
        .details-panel { padding: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        .stat-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; transition: border-color 0.2s; }
        .stat-item:hover { border-color: var(--text-muted); }
        .stat-label { font-size: 0.6rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; }
        .stat-val { font-weight: 700; font-size: 1rem; font-family: 'JetBrains Mono', monospace; }
        .stat-val.editable-stat { background: transparent; border: none; color: inherit; font-weight: 700; font-size: 1rem; font-family: 'JetBrains Mono', monospace; width: 100%; padding: 0; }
        .stat-val.editable-stat:focus { outline: none; color: var(--primary); }
        .val-weapon { color: var(--weapon-red); }
        .val-food { color: var(--food-green); }
        .val-ammo { color: var(--ammo-amber); }
        .delete-btn { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; margin-top: 12px; transition: all 0.2s; }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.2); }
        .controls-container { display: flex; flex-direction: column; gap: 25px; }
        .controls-section { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
        .controls-section h2 { color: var(--primary); font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .controls-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
        .key-row { display: flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; transition: border-color 0.2s; }
        .key-row:hover { border-color: var(--text-muted); }
        .key-cap { background: var(--bg-body); border: 1px solid var(--border); border-radius: 5px; padding: 6px 12px; min-width: 55px; text-align: center; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--primary); margin-right: 12px; box-shadow: 0 2px 0 var(--border); }
        .key-desc { color: var(--text-main); font-size: 0.85rem; flex: 1; }
        .key-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; opacity: 0; transition: opacity 0.2s, color 0.2s; }
        .key-row:hover .key-delete { opacity: 1; }
        .key-delete:hover { color: #ef4444; }
        .add-control-row { display: flex; gap: 8px; margin-top: 12px; }
        .add-control-row input { flex: 1; }
        .add-control-row input:first-child { max-width: 100px; }
        .btn-add-control { background: var(--primary); border: none; color: var(--bg-body); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-weight: 600; transition: background 0.2s; }
        .btn-add-control:hover { background: var(--primary-hover); }
        .kanban-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; min-height: 400px; }
        .kanban-column { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; }
        .kanban-header { padding: 14px 16px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .kanban-header .count { background: var(--bg-card); padding: 3px 8px; border-radius: 15px; font-size: 0.7rem; color: var(--text-muted); }
        .column-todo .kanban-header { color: var(--ammo-amber); border-bottom-color: rgba(245, 158, 11, 0.3); }
        .column-doing .kanban-header { color: var(--misc-blue); border-bottom-color: rgba(59, 130, 246, 0.3); }
        .column-done .kanban-header { color: var(--food-green); border-bottom-color: rgba(34, 197, 94, 0.3); }
        .kanban-cards { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; min-height: 150px; }
        .kanban-cards.drag-over { background: rgba(245, 158, 11, 0.05); }
        .kanban-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; cursor: grab; transition: all 0.2s; }
        .kanban-card:hover { border-color: var(--text-muted); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .kanban-card.dragging { opacity: 0.5; cursor: grabbing; }
        .kanban-card-title { font-weight: 600; margin-bottom: 6px; color: var(--text-main); font-size: 0.9rem; }
        .kanban-card-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
        .kanban-card-actions { display: flex; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
        .kanban-card-btn { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; }
        .kanban-card-btn:hover { border-color: var(--text-main); color: var(--text-main); }
        .kanban-card-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
        .add-card-form { padding: 12px; border-top: 1px solid var(--border); }
        .add-card-form input, .add-card-form textarea { width: 100%; margin-bottom: 8px; background: var(--bg-card); }
        .add-card-form textarea { resize: vertical; min-height: 50px; font-family: inherit; }
        .btn-add-card { width: 100%; background: transparent; border: 2px dashed var(--border); color: var(--text-muted); padding: 10px; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; transition: all 0.2s; }
        .btn-add-card:hover { border-color: var(--primary); color: var(--primary); }
        .status-msg { margin-top: 15px; font-size: 0.8rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; padding: 12px 15px; background: var(--bg-elevated); border-radius: 6px; border: 1px solid var(--border); }
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-overlay.visible { display: flex; }
        .modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 25px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
        .modal h2 { font-family: 'JetBrains Mono', monospace; color: var(--primary); margin: 0 0 18px 0; font-size: 1.1rem; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px; }
        .form-group input, .form-group select { width: 100%; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-modal-save { flex: 1; background: var(--primary); border: none; color: var(--bg-body); padding: 12px; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .btn-modal-cancel { flex: 1; background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 12px; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
        .type-specific-fields { display: none; }
        .type-specific-fields.visible { display: block; }
        @media (max-width: 900px) { .kanban-container { grid-template-columns: 1fr; } .action-buttons { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
    </style>
</head>
<body>
<div class="dashboard-container">
    <div class="tabs-header">
        <button class="tab-btn active" onclick="openTab(event, 'database')">📦 Database</button>
        <button class="tab-btn" onclick="openTab(event, 'controls')">🎮 Controls</button>
        <button class="tab-btn" onclick="openTab(event, 'todo')">📋 To Do</button>
    </div>
    <div id="database" class="tab-content active">
        <h1>LENIMKI <span>Database Portal</span></h1>
        <p class="subtitle">// Click cells to edit • Expand rows for detailed stats</p>
        <div class="search-bar">
            <span style="color: var(--primary); font-family: 'JetBrains Mono', monospace;">▸</span>
            <input type="text" id="searchInput" placeholder="Search items..." onkeyup="renderTable()">
        </div>
        <div class="toolbar">
            <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
            <button class="filter-btn" onclick="setFilter('Food', this)">Food</button>
            <button class="filter-btn" onclick="setFilter('Weapon', this)">Weapons</button>
            <button class="filter-btn" onclick="setFilter('Ammo', this)">Ammo</button>
            <button class="filter-btn" onclick="setFilter('Misc', this)">Misc</button>
            <button class="btn-add" onclick="openAddItemModal()">+ Add Item</button>
        </div>
        <table id="itemTable"><thead><tr><th style="width: 45px;"></th><th>ID</th><th>Name</th><th>Type</th><th>Weight</th><th>Price</th><th>Status</th></tr></thead><tbody id="tableBody"></tbody></table>
        <div id="status" class="status-msg">▸ System initializing...</div>
        <div class="action-buttons">
            <button class="btn-save-pi" onclick="saveAllToPi()">⬆ Save to Raspberry Pi</button>
            <button class="btn-export" onclick="downloadJSON()">⬇ Export Backup</button>
        </div>
    </div>
    <div id="controls" class="tab-content">
        <h1>GAME <span>Controls Reference</span></h1>
        <p class="subtitle">// Player input bindings • Click to edit</p>
        <div class="controls-container" id="controlsContainer"></div>
        <div class="action-buttons" style="margin-top: 25px;">
            <button class="btn-save-pi" onclick="saveAllToPi()">⬆ Save Controls to Pi</button>
            <button class="btn-export" onclick="downloadControlsJSON()">⬇ Export Controls</button>
        </div>
    </div>
    <div id="todo" class="tab-content">
        <h1>PROJECT <span>Task Board</span></h1>
        <p class="subtitle">// Drag cards between columns • Track your progress</p>
        <div class="kanban-container">
            <div class="kanban-column column-todo">
                <div class="kanban-header">To Do <span class="count" id="count-todo">0</span></div>
                <div class="kanban-cards" id="cards-todo" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'todo')" ondragleave="handleDragLeave(event)"></div>
                <div class="add-card-form">
                    <input type="text" id="new-card-title-todo" placeholder="Card title...">
                    <textarea id="new-card-desc-todo" placeholder="Description (optional)..."></textarea>
                    <button class="btn-add-card" onclick="addCard('todo')">+ Add Card</button>
                </div>
            </div>
            <div class="kanban-column column-doing">
                <div class="kanban-header">Doing <span class="count" id="count-doing">0</span></div>
                <div class="kanban-cards" id="cards-doing" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'doing')" ondragleave="handleDragLeave(event)"></div>
                <div class="add-card-form">
                    <input type="text" id="new-card-title-doing" placeholder="Card title...">
                    <textarea id="new-card-desc-doing" placeholder="Description (optional)..."></textarea>
                    <button class="btn-add-card" onclick="addCard('doing')">+ Add Card</button>
                </div>
            </div>
            <div class="kanban-column column-done">
                <div class="kanban-header">Done <span class="count" id="count-done">0</span></div>
                <div class="kanban-cards" id="cards-done" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'done')" ondragleave="handleDragLeave(event)"></div>
                <div class="add-card-form">
                    <input type="text" id="new-card-title-done" placeholder="Card title...">
                    <textarea id="new-card-desc-done" placeholder="Description (optional)..."></textarea>
                    <button class="btn-add-card" onclick="addCard('done')">+ Add Card</button>
                </div>
            </div>
        </div>
        <div class="action-buttons" style="margin-top: 25px;">
            <button class="btn-save-pi" onclick="saveAllToPi()">⬆ Save Tasks to Pi</button>
            <button class="btn-export" onclick="downloadTodosJSON()">⬇ Export Tasks</button>
        </div>
    </div>
</div>
<div class="modal-overlay" id="addItemModal">
    <div class="modal">
        <h2>+ Add New Item</h2>
        <div class="form-group"><label>Item Name</label><input type="text" id="newItemName" placeholder="e.g., Vodka Bottle"></div>
        <div class="form-row">
            <div class="form-group"><label>Type</label><select id="newItemType" onchange="toggleTypeFields()"><option value="Food">Food</option><option value="Weapon">Weapon</option><option value="Ammo">Ammo</option><option value="Misc">Misc</option></select></div>
            <div class="form-group"><label>Price (Larks)</label><input type="number" id="newItemPrice" placeholder="0"></div>
        </div>
        <div class="form-group"><label>Weight</label><input type="text" id="newItemWeight" placeholder="e.g., 0.50KG"></div>
        <div class="type-specific-fields" id="foodFields">
            <h3 style="color: var(--food-green); font-size: 0.8rem; margin: 18px 0 12px; font-family: 'JetBrains Mono', monospace;">CONSUMABLE STATS</h3>
            <div class="form-row"><div class="form-group"><label>Hunger Restore</label><input type="number" id="newFoodHunger" placeholder="0" min="0" max="100"></div><div class="form-group"><label>Stamina Restore</label><input type="number" id="newFoodStamina" placeholder="0" min="0" max="100"></div></div>
            <div class="form-group"><label>Health Restore</label><input type="number" id="newFoodHealth" placeholder="0" min="0" max="100"></div>
        </div>
        <div class="type-specific-fields" id="weaponFields">
            <h3 style="color: var(--weapon-red); font-size: 0.8rem; margin: 18px 0 12px; font-family: 'JetBrains Mono', monospace;">WEAPON STATS</h3>
            <div class="form-row"><div class="form-group"><label>Ammo Type</label><input type="text" id="newWeaponAmmo" placeholder="e.g., 9x18mm"></div><div class="form-group"><label>Ammo ID</label><input type="number" id="newWeaponAmmoId" placeholder="0"></div></div>
            <div class="form-row"><div class="form-group"><label>Magazine Size</label><input type="number" id="newWeaponMagSize" placeholder="0"></div><div class="form-group"><label>Fire Rate (s)</label><input type="number" id="newWeaponFireRate" placeholder="0" step="0.01"></div></div>
            <div class="form-row"><div class="form-group"><label>Damage</label><input type="number" id="newWeaponDamage" placeholder="0"></div><div class="form-group"><label>Range (m)</label><input type="number" id="newWeaponRange" placeholder="0"></div></div>
            <div class="form-row"><div class="form-group"><label>Spread</label><input type="number" id="newWeaponSpread" placeholder="0" step="0.1"></div><div class="form-group"><label>Pellets</label><input type="number" id="newWeaponPellets" placeholder="1"></div></div>
            <div class="form-group"><label>Reload Time (s)</label><input type="number" id="newWeaponReload" placeholder="0" step="0.1"></div>
        </div>
        <div class="modal-actions"><button class="btn-modal-cancel" onclick="closeAddItemModal()">Cancel</button><button class="btn-modal-save" onclick="saveNewItem()">Add Item</button></div>
    </div>
</div>
<script>
    const PI_URL = '${serverUrl}';
    let items = [];
    let controls = { movement: [{key:'W A S D',action:'Movement'},{key:'SHIFT',action:'Run / Sprint'},{key:'CTRL',action:'Crouch'},{key:'SPACE',action:'Jump'}], combat: [{key:'LMB',action:'Fire / Attack'},{key:'RMB',action:'Aim Down Sights'},{key:'R',action:'Reload'},{key:'1-4',action:'Weapon Slots'}], ui: [{key:'TAB',action:'Inventory'},{key:'M',action:'Map'},{key:'ESC',action:'Pause Menu'},{key:'F',action:'Interact'}] };
    let todos = { todo: [], doing: [], done: [] };
    let currentFilter = 'all';
    let expandedRows = new Set();
    let draggedCard = null;

    function openTab(evt, tabName) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        evt.currentTarget.classList.add('active');
    }
    function setFilter(filter, btn) {
        currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable();
    }
    async function loadData() {
        const status = document.getElementById('status');
        try {
            const [itemsRes, controlsRes, todosRes] = await Promise.all([
                fetch(PI_URL + '/items.json').catch(() => null),
                fetch(PI_URL + '/controls.json').catch(() => null),
                fetch(PI_URL + '/todos.json').catch(() => null)
            ]);
            if (itemsRes && itemsRes.ok) items = await itemsRes.json();
            if (controlsRes && controlsRes.ok) controls = await controlsRes.json();
            if (todosRes && todosRes.ok) todos = await todosRes.json();
            status.innerHTML = "▸ <span style='color:#22c55e'>Connected to Raspberry Pi</span> — Data loaded";
            renderTable(); renderControls(); renderTodos();
        } catch (err) {
            status.innerHTML = "▸ <span style='color:#ef4444'>Error:</span> Could not connect to Pi server";
        }
    }
    function renderTable() {
        const tbody = document.getElementById('tableBody');
        const filter = document.getElementById('searchInput').value.toLowerCase();
        tbody.innerHTML = '';
        items.sort((a, b) => a.id - b.id);
        items.forEach((item) => {
            if (!item.name.toLowerCase().includes(filter) && !item.type.toLowerCase().includes(filter)) return;
            if (currentFilter !== 'all' && item.type !== currentFilter) return;
            const hasDetails = (item.type === 'Weapon' && item.stats) || (item.type === 'Food' && item.consumable);
            const isExpanded = expandedRows.has(item.id);
            const statusLabel = item.implemented ? '<span class="status-tag tag-yes">Done</span>' : '<span class="status-tag tag-no">Pending</span>';
            const tr = document.createElement('tr');
            tr.innerHTML = '<td>' + (hasDetails ? '<button class="expand-btn ' + (isExpanded ? 'expanded' : '') + '" onclick="toggleExpand(' + item.id + ')">' + (isExpanded ? '−' : '+') + '</button>' : '') + '</td><td><strong style="color:var(--text-muted);">#' + item.id + '</strong></td><td><span class="editable" contenteditable="true" onblur="updateData(' + item.id + ", 'name', this.innerText)\">" + item.name + '</span></td><td><span style="color:' + getTypeColor(item.type) + ';font-weight:600;">' + item.type + '</span></td><td><span class="editable" contenteditable="true" onblur="updateData(' + item.id + ", 'weight', this.innerText)\">" + (item.weight || '0.00KG') + '</span></td><td><span class="editable" style="color:var(--ammo-amber);" contenteditable="true" onblur="updateData(' + item.id + ", 'price', this.innerText)\">" + (item.price || 0) + ' ₺</span></td><td style="cursor:pointer" onclick="toggleImplemented(' + item.id + ')">' + statusLabel + '</td>';
            tbody.appendChild(tr);
            if (hasDetails) {
                const detailsTr = document.createElement('tr');
                detailsTr.className = 'details-row ' + (isExpanded ? 'visible' : '');
                detailsTr.innerHTML = '<td colspan="7">' + renderDetailsPanel(item) + '</td>';
                tbody.appendChild(detailsTr);
            }
        });
    }
    function renderDetailsPanel(item) {
        if (item.type === 'Food' && item.consumable) {
            return '<div class="details-panel"><div class="stats-grid"><div class="stat-item"><div class="stat-label">Hunger Restore</div><input class="stat-val val-food editable-stat" type="number" value="' + (item.consumable.hunger || 0) + '" onchange="updateConsumable(' + item.id + ", 'hunger', this.value)\" min=\"0\" max=\"100\"> <span style=\"color:var(--text-muted)\">/100</span></div><div class=\"stat-item\"><div class=\"stat-label\">Stamina Restore</div><input class=\"stat-val val-food editable-stat\" type=\"number\" value=\"" + (item.consumable.stamina || 0) + '" onchange="updateConsumable(' + item.id + ", 'stamina', this.value)\" min=\"0\" max=\"100\"> <span style=\"color:var(--text-muted)\">/100</span></div><div class=\"stat-item\"><div class=\"stat-label\">Health Restore</div><input class=\"stat-val val-food editable-stat\" type=\"number\" value=\"" + (item.consumable.health || 0) + '" onchange="updateConsumable(' + item.id + ", 'health', this.value)\" min=\"0\" max=\"100\"> <span style=\"color:var(--text-muted)\">/100</span></div></div><button class=\"delete-btn\" onclick=\"deleteItem(" + item.id + ')\">🗑 Delete Item</button></div>';
        } else if (item.type === 'Weapon' && item.stats) {
            return '<div class="details-panel"><div class="stats-grid"><div class="stat-item"><div class="stat-label">Ammo Type</div><input class="stat-val val-weapon editable-stat" type="text" value="' + (item.stats.ammo || 'N/A') + '" onchange="updateStats(' + item.id + ", 'ammo', this.value)\" style=\"color:var(--weapon-red);\"></div><div class=\"stat-item\"><div class=\"stat-label\">Ammo ID</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" value=\"" + (item.stats.ammoId || 0) + '" onchange="updateStats(' + item.id + ", 'ammoId', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Magazine Size</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" value=\"" + (item.stats.magSize || 0) + '" onchange="updateStats(' + item.id + ", 'magSize', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Fire Rate (s)</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" step=\"0.01\" value=\"" + (item.stats.fireRate || 0) + '" onchange="updateStats(' + item.id + ", 'fireRate', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Damage</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" value=\"" + (item.stats.damage || 0) + '" onchange="updateStats(' + item.id + ", 'damage', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Range (m)</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" value=\"" + (item.stats.range || 0) + '" onchange="updateStats(' + item.id + ", 'range', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Spread</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" step=\"0.1\" value=\"" + (item.stats.spread || 0) + '" onchange="updateStats(' + item.id + ", 'spread', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Pellets</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" value=\"" + (item.stats.pellets || 1) + '" onchange="updateStats(' + item.id + ", 'pellets', this.value)\"></div><div class=\"stat-item\"><div class=\"stat-label\">Reload Time (s)</div><input class=\"stat-val val-weapon editable-stat\" type=\"number\" step=\"0.1\" value=\"" + (item.stats.reloadTime || 0) + '" onchange="updateStats(' + item.id + ", 'reloadTime', this.value)\"></div></div><button class=\"delete-btn\" onclick=\"deleteItem(" + item.id + ')\">🗑 Delete Item</button></div>';
        }
        return '';
    }
    function toggleExpand(id) { if (expandedRows.has(id)) expandedRows.delete(id); else expandedRows.add(id); renderTable(); }
    function updateData(id, field, value) { const item = items.find(i => i.id === id); if (item) { if (field === 'price') item[field] = parseInt(value.replace(/[^0-9]/g, '')) || 0; else item[field] = value; } }
    function updateConsumable(id, field, value) { const item = items.find(i => i.id === id); if (item && item.consumable) item.consumable[field] = parseInt(value) || 0; }
    function updateStats(id, field, value) { const item = items.find(i => i.id === id); if (item && item.stats) { if (field === 'ammo') item.stats[field] = value; else item.stats[field] = parseFloat(value) || 0; } }
    function toggleImplemented(id) { const item = items.find(i => i.id === id); if (item) { item.implemented = !item.implemented; renderTable(); } }
    function deleteItem(id) { if (confirm('Delete this item?')) { items = items.filter(i => i.id !== id); expandedRows.delete(id); renderTable(); } }
    function getTypeColor(type) { switch(type) { case 'Weapon': return 'var(--weapon-red)'; case 'Food': return 'var(--food-green)'; case 'Ammo': return 'var(--ammo-amber)'; case 'Misc': return 'var(--misc-blue)'; default: return 'var(--text-main)'; } }
    function openAddItemModal() { document.getElementById('addItemModal').classList.add('visible'); toggleTypeFields(); }
    function closeAddItemModal() { document.getElementById('addItemModal').classList.remove('visible'); document.getElementById('newItemName').value = ''; document.getElementById('newItemPrice').value = ''; document.getElementById('newItemWeight').value = ''; }
    function toggleTypeFields() { const type = document.getElementById('newItemType').value; document.getElementById('foodFields').classList.toggle('visible', type === 'Food'); document.getElementById('weaponFields').classList.toggle('visible', type === 'Weapon'); }
    function saveNewItem() { const name = document.getElementById('newItemName').value.trim(); if (!name) return alert('Please enter an item name'); const type = document.getElementById('newItemType').value; const newItem = { id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1, name, type, price: parseInt(document.getElementById('newItemPrice').value) || 0, weight: document.getElementById('newItemWeight').value || '0.00KG', implemented: false }; if (type === 'Food') newItem.consumable = { hunger: parseInt(document.getElementById('newFoodHunger').value) || 0, stamina: parseInt(document.getElementById('newFoodStamina').value) || 0, health: parseInt(document.getElementById('newFoodHealth').value) || 0 }; else if (type === 'Weapon') newItem.stats = { ammo: document.getElementById('newWeaponAmmo').value || '', ammoId: parseInt(document.getElementById('newWeaponAmmoId').value) || 0, magSize: parseInt(document.getElementById('newWeaponMagSize').value) || 0, fireRate: parseFloat(document.getElementById('newWeaponFireRate').value) || 0, damage: parseInt(document.getElementById('newWeaponDamage').value) || 0, range: parseInt(document.getElementById('newWeaponRange').value) || 0, spread: parseFloat(document.getElementById('newWeaponSpread').value) || 0, pellets: parseInt(document.getElementById('newWeaponPellets').value) || 1, reloadTime: parseFloat(document.getElementById('newWeaponReload').value) || 0 }; items.push(newItem); closeAddItemModal(); renderTable(); }
    function renderControls() { const container = document.getElementById('controlsContainer'); const sections = [{key:'movement',title:'Movement'},{key:'combat',title:'Combat'},{key:'ui',title:'Interface'}]; container.innerHTML = ''; sections.forEach(section => { const sectionEl = document.createElement('div'); sectionEl.className = 'controls-section'; sectionEl.innerHTML = '<h2>' + section.title + '</h2><div class="controls-grid" id="controls-' + section.key + '">' + (controls[section.key] || []).map((ctrl, idx) => '<div class="key-row"><div class="key-cap" contenteditable="true" onblur="updateControl(\\'' + section.key + '\\',' + idx + ',\\'key\\',this.innerText)">' + ctrl.key + '</div><div class="key-desc" contenteditable="true" onblur="updateControl(\\'' + section.key + '\\',' + idx + ',\\'action\\',this.innerText)">' + ctrl.action + '</div><button class="key-delete" onclick="deleteControl(\\'' + section.key + '\\',' + idx + ')">✕</button></div>').join('') + '</div><div class="add-control-row"><input type="text" id="new-key-' + section.key + '" placeholder="Key"><input type="text" id="new-action-' + section.key + '" placeholder="Action description"><button class="btn-add-control" onclick="addControl(\\'' + section.key + '\\')">+ Add</button></div>'; container.appendChild(sectionEl); }); }
    function updateControl(section, idx, field, value) { if (controls[section] && controls[section][idx]) controls[section][idx][field] = value.trim(); }
    function deleteControl(section, idx) { if (controls[section]) { controls[section].splice(idx, 1); renderControls(); } }
    function addControl(section) { const keyInput = document.getElementById('new-key-' + section); const actionInput = document.getElementById('new-action-' + section); const key = keyInput.value.trim(); const action = actionInput.value.trim(); if (key && action) { if (!controls[section]) controls[section] = []; controls[section].push({key,action}); keyInput.value = ''; actionInput.value = ''; renderControls(); } }
    function renderTodos() { ['todo','doing','done'].forEach(column => { const container = document.getElementById('cards-' + column); const cards = todos[column] || []; container.innerHTML = cards.map((card, idx) => '<div class="kanban-card" draggable="true" ondragstart="handleDragStart(event,\\'' + column + '\\',' + idx + ')" ondragend="handleDragEnd(event)"><div class="kanban-card-title" contenteditable="true" onblur="updateCard(\\'' + column + '\\',' + idx + ',\\'title\\',this.innerText)">' + card.title + '</div>' + (card.description ? '<div class="kanban-card-desc" contenteditable="true" onblur="updateCard(\\'' + column + '\\',' + idx + ',\\'description\\',this.innerText)">' + card.description + '</div>' : '') + '<div class="kanban-card-actions">' + (column !== 'todo' ? '<button class="kanban-card-btn" onclick="moveCard(\\'' + column + '\\',' + idx + ',\\'left\\')">← Move</button>' : '') + (column !== 'done' ? '<button class="kanban-card-btn" onclick="moveCard(\\'' + column + '\\',' + idx + ',\\'right\\')">Move →</button>' : '') + '<button class="kanban-card-btn delete" onclick="deleteCard(\\'' + column + '\\',' + idx + ')">Delete</button></div></div>').join(''); document.getElementById('count-' + column).textContent = cards.length; }); }
    function addCard(column) { const titleInput = document.getElementById('new-card-title-' + column); const descInput = document.getElementById('new-card-desc-' + column); const title = titleInput.value.trim(); const description = descInput.value.trim(); if (title) { if (!todos[column]) todos[column] = []; todos[column].push({title,description,createdAt:Date.now()}); titleInput.value = ''; descInput.value = ''; renderTodos(); } }
    function updateCard(column, idx, field, value) { if (todos[column] && todos[column][idx]) todos[column][idx][field] = value.trim(); }
    function deleteCard(column, idx) { if (todos[column]) { todos[column].splice(idx, 1); renderTodos(); } }
    function moveCard(fromColumn, idx, direction) { const columns = ['todo','doing','done']; const fromIdx = columns.indexOf(fromColumn); const toIdx = direction === 'left' ? fromIdx - 1 : fromIdx + 1; if (toIdx >= 0 && toIdx < columns.length) { const toColumn = columns[toIdx]; const card = todos[fromColumn].splice(idx, 1)[0]; if (!todos[toColumn]) todos[toColumn] = []; todos[toColumn].push(card); renderTodos(); } }
    function handleDragStart(e, column, idx) { draggedCard = {column,idx}; e.target.classList.add('dragging'); }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); document.querySelectorAll('.kanban-cards').forEach(c => c.classList.remove('drag-over')); }
    function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
    function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
    function handleDrop(e, toColumn) { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); if (draggedCard && draggedCard.column !== toColumn) { const card = todos[draggedCard.column].splice(draggedCard.idx, 1)[0]; if (!todos[toColumn]) todos[toColumn] = []; todos[toColumn].push(card); renderTodos(); } draggedCard = null; }
    async function saveAllToPi() { const status = document.getElementById('status'); status.innerHTML = "▸ Saving all data to Raspberry Pi..."; try { const results = await Promise.all([ fetch(PI_URL + '/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'items',data:items})}), fetch(PI_URL + '/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'controls',data:controls})}), fetch(PI_URL + '/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'todos',data:todos})}) ]); if (results.every(r => r.ok)) status.innerHTML = "▸ <span style='color:#22c55e'>SUCCESS!</span> All data saved to Raspberry Pi"; else throw new Error("Some saves failed"); } catch (err) { status.innerHTML = "▸ <span style='color:#ef4444'>Error:</span> Failed to save. Is server.js running?"; } }
    function downloadJSON() { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2)); a.download = "items_backup.json"; a.click(); }
    function downloadControlsJSON() { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(controls, null, 2)); a.download = "controls_backup.json"; a.click(); }
    function downloadTodosJSON() { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2)); a.download = "todos_backup.json"; a.click(); }
    loadData();
<\/script>
</body>
</html>`;
    }
};


// ============================================
// REGISTER ALL APPS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    AlbyOS.registerApp(LenimkiApp);
    AlbyOS.registerApp(MemoriesApp);
    AlbyOS.registerApp(SettingsApp);
    AlbyOS.registerApp(FileManagerApp);
});