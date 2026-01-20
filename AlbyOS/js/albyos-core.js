/**
 * AlbyOS Core System
 * Main operating system functionality
 */

const AlbyOS = {
    // Configuration
    config: {
        serverUrl: 'http://localhost:3000', // Raspberry Pi server URL - change this!
        bootDuration: 3000,
        version: '1.0.0'
    },

    // System state
    state: {
        booted: false,
        serverOnline: false,
        activeWindow: null,
        windows: new Map(),
        windowZIndex: 100,
        selectedIcon: null
    },

    // Registered applications
    apps: {},

    /**
     * Initialize the OS
     */
    init() {
        console.log('[AlbyOS] Initializing...');
        
        // Start boot sequence
        this.boot();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start clock
        this.startClock();
        
        // Check server status
        this.checkServerStatus();
        setInterval(() => this.checkServerStatus(), 30000);
    },

    /**
     * Boot sequence
     */
    boot() {
        const bootScreen = document.getElementById('boot-screen');
        const desktop = document.getElementById('desktop');
        const bootStatus = document.querySelector('.boot-status');
        
        const bootMessages = [
            'Initializing system...',
            'Loading kernel modules...',
            'Starting services...',
            'Connecting to server...',
            'Loading desktop...'
        ];
        
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            if (msgIndex < bootMessages.length) {
                bootStatus.textContent = bootMessages[msgIndex];
                msgIndex++;
            }
        }, this.config.bootDuration / bootMessages.length);
        
        setTimeout(() => {
            clearInterval(msgInterval);
            bootScreen.classList.add('hidden');
            desktop.classList.remove('hidden');
            this.state.booted = true;
            this.renderDesktopIcons();
            this.renderStartMenu();
            console.log('[AlbyOS] Boot complete');
        }, this.config.bootDuration);
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        });

        // Desktop click - close menus and deselect icons
        document.querySelector('.wallpaper').addEventListener('click', () => {
            this.closeStartMenu();
            this.closeContextMenu();
            this.deselectIcon();
        });

        // Context menu
        document.querySelector('.wallpaper').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });

        // Context menu actions
        document.getElementById('context-menu').addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action);
                this.closeContextMenu();
            }
        });

        // Close menus on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeStartMenu();
                this.closeContextMenu();
            }
        });

        // Click outside to close menus
        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('start-menu');
            const startBtn = document.getElementById('start-btn');
            if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
                this.closeStartMenu();
            }
        });
    },

    /**
     * Register an application
     */
    registerApp(appConfig) {
        this.apps[appConfig.id] = appConfig;
        console.log(`[AlbyOS] Registered app: ${appConfig.name}`);
    },

    /**
     * Launch an application
     */
    launchApp(appId) {
        const app = this.apps[appId];
        if (!app) {
            console.error(`[AlbyOS] App not found: ${appId}`);
            return;
        }

        // Check if already open
        if (this.state.windows.has(appId)) {
            const existingWindow = this.state.windows.get(appId);
            this.focusWindow(existingWindow);
            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(existingWindow);
            }
            return;
        }

        console.log(`[AlbyOS] Launching: ${app.name}`);
        this.closeStartMenu();

        // Create window
        const windowEl = WindowManager.createWindow({
            id: appId,
            title: app.name,
            icon: app.icon,
            width: app.defaultWidth || 800,
            height: app.defaultHeight || 600,
            content: app.render ? app.render() : ''
        });

        this.state.windows.set(appId, windowEl);
        this.focusWindow(windowEl);
        this.updateTaskbar();

        // Call app's onMount if exists
        if (app.onMount) {
            setTimeout(() => app.onMount(windowEl), 50);
        }
    },

    /**
     * Close an application
     */
    closeApp(appId) {
        const windowEl = this.state.windows.get(appId);
        if (!windowEl) return;

        const app = this.apps[appId];
        if (app && app.onUnmount) {
            app.onUnmount(windowEl);
        }

        windowEl.remove();
        this.state.windows.delete(appId);
        this.updateTaskbar();

        // Focus next window
        const windows = Array.from(this.state.windows.values());
        if (windows.length > 0) {
            this.focusWindow(windows[windows.length - 1]);
        }
    },

    /**
     * Focus a window
     */
    focusWindow(windowEl) {
        // Remove active state from all windows
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        
        // Set this window as active
        windowEl.classList.add('active');
        windowEl.style.zIndex = ++this.state.windowZIndex;
        this.state.activeWindow = windowEl;
        
        this.updateTaskbar();
    },

    /**
     * Minimize a window
     */
    minimizeWindow(windowEl) {
        windowEl.classList.add('minimized');
        windowEl.classList.remove('active');
        this.updateTaskbar();
    },

    /**
     * Restore a window
     */
    restoreWindow(windowEl) {
        windowEl.classList.remove('minimized');
        this.focusWindow(windowEl);
    },

    /**
     * Maximize/restore a window
     */
    toggleMaximize(windowEl) {
        windowEl.classList.toggle('maximized');
    },

    /**
     * Update taskbar with open windows
     */
    updateTaskbar() {
        const taskbarApps = document.getElementById('taskbar-apps');
        taskbarApps.innerHTML = '';

        this.state.windows.forEach((windowEl, appId) => {
            const app = this.apps[appId];
            const btn = document.createElement('button');
            btn.className = 'taskbar-app';
            if (windowEl.classList.contains('active') && !windowEl.classList.contains('minimized')) {
                btn.classList.add('active');
            }
            btn.innerHTML = `
                <span class="taskbar-app-icon">${app.icon}</span>
                <span>${app.name}</span>
            `;
            btn.addEventListener('click', () => {
                if (windowEl.classList.contains('minimized')) {
                    this.restoreWindow(windowEl);
                } else if (windowEl.classList.contains('active')) {
                    this.minimizeWindow(windowEl);
                } else {
                    this.focusWindow(windowEl);
                }
            });
            taskbarApps.appendChild(btn);
        });
    },

    /**
     * Render desktop icons
     */
    renderDesktopIcons() {
        const container = document.getElementById('desktop-icons');
        container.innerHTML = '';

        Object.values(this.apps).forEach(app => {
            if (app.showOnDesktop !== false) {
                const icon = document.createElement('div');
                icon.className = 'desktop-icon';
                icon.dataset.appId = app.id;
                icon.innerHTML = `
                    <div class="desktop-icon-img">${app.icon}</div>
                    <span class="desktop-icon-label">${app.name}</span>
                `;
                
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectIcon(icon);
                });
                
                icon.addEventListener('dblclick', () => {
                    this.launchApp(app.id);
                });

                container.appendChild(icon);
            }
        });
    },

    /**
     * Select a desktop icon
     */
    selectIcon(iconEl) {
        this.deselectIcon();
        iconEl.classList.add('selected');
        this.state.selectedIcon = iconEl;
    },

    /**
     * Deselect current icon
     */
    deselectIcon() {
        if (this.state.selectedIcon) {
            this.state.selectedIcon.classList.remove('selected');
            this.state.selectedIcon = null;
        }
    },

    /**
     * Render start menu
     */
    renderStartMenu() {
        const container = document.getElementById('start-menu-apps');
        container.innerHTML = '';

        Object.values(this.apps).forEach(app => {
            const item = document.createElement('div');
            item.className = 'start-menu-app';
            item.innerHTML = `
                <div class="start-menu-app-icon">${app.icon}</div>
                <div class="start-menu-app-info">
                    <div class="start-menu-app-name">${app.name}</div>
                    <div class="start-menu-app-desc">${app.description || ''}</div>
                </div>
            `;
            item.addEventListener('click', () => this.launchApp(app.id));
            container.appendChild(item);
        });
    },

    /**
     * Toggle start menu
     */
    toggleStartMenu() {
        const menu = document.getElementById('start-menu');
        const btn = document.getElementById('start-btn');
        menu.classList.toggle('hidden');
        btn.classList.toggle('active');
    },

    /**
     * Close start menu
     */
    closeStartMenu() {
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('start-btn').classList.remove('active');
    },

    /**
     * Show context menu
     */
    showContextMenu(x, y) {
        const menu = document.getElementById('context-menu');
        menu.classList.remove('hidden');
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        // Keep menu in viewport
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }
    },

    /**
     * Close context menu
     */
    closeContextMenu() {
        document.getElementById('context-menu').classList.add('hidden');
    },

    /**
     * Handle context menu action
     */
    handleContextAction(action) {
        switch (action) {
            case 'refresh':
                this.renderDesktopIcons();
                break;
            case 'settings':
                // TODO: Open settings
                break;
            case 'about':
                alert(`AlbyOS v${this.config.version}\nA personal web-based operating system`);
                break;
        }
    },

    /**
     * Start the clock
     */
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            document.getElementById('tray-time').textContent = time;
        };
        updateClock();
        setInterval(updateClock, 1000);
    },

    /**
     * Check server status
     */
    async checkServerStatus() {
        const indicator = document.getElementById('server-status');
        try {
            const response = await fetch(`${this.config.serverUrl}/api/health`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            this.state.serverOnline = response.ok;
            indicator.classList.remove('server-offline');
            indicator.classList.add('server-online');
            indicator.title = 'Server: Online';
        } catch (error) {
            this.state.serverOnline = false;
            indicator.classList.remove('server-online');
            indicator.classList.add('server-offline');
            indicator.title = 'Server: Offline';
        }
    },

    /**
     * Shutdown animation
     */
    shutdown() {
        const desktop = document.getElementById('desktop');
        desktop.style.transition = 'opacity 1s ease';
        desktop.style.opacity = '0';
        setTimeout(() => {
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #0a0a0f;">
                    <div style="text-align: center; font-family: 'JetBrains Mono', monospace; color: #606078;">
                        <div style="font-size: 14px; margin-bottom: 8px;">AlbyOS</div>
                        <div style="font-size: 12px;">System halted. Refresh to restart.</div>
                    </div>
                </div>
            `;
        }, 1000);
    },

    /**
     * Get server URL
     */
    getServerUrl() {
        return this.config.serverUrl;
    },

    /**
     * Set server URL
     */
    setServerUrl(url) {
        this.config.serverUrl = url;
        this.checkServerStatus();
    }
};

// Export for use in other modules
window.AlbyOS = AlbyOS;
