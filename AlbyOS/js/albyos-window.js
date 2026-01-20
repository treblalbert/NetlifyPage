/**
 * AlbyOS Window Manager
 * Handles window creation, dragging, resizing
 */

const WindowManager = {
    /**
     * Create a new window
     */
    createWindow(options) {
        const { id, title, icon, width, height, content } = options;
        
        const container = document.getElementById('windows-container');
        
        // Calculate initial position (centered with offset for multiple windows)
        const windowCount = document.querySelectorAll('.window').length;
        const offset = windowCount * 30;
        const x = Math.max(50, (window.innerWidth - width) / 2 + offset);
        const y = Math.max(50, (window.innerHeight - height - 48) / 2 + offset);

        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.id = `window-${id}`;
        windowEl.dataset.appId = id;
        windowEl.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
        `;

        windowEl.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">
                    <span class="window-title-icon">${icon}</span>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn window-btn-minimize" title="Minimize">
                        <svg viewBox="0 0 10 10"><line x1="2" y1="5" x2="8" y2="5" stroke="#000" stroke-width="1.5"/></svg>
                    </button>
                    <button class="window-btn window-btn-maximize" title="Maximize">
                        <svg viewBox="0 0 10 10"><rect x="2" y="2" width="6" height="6" fill="none" stroke="#000" stroke-width="1.2"/></svg>
                    </button>
                    <button class="window-btn window-btn-close" title="Close">
                        <svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8" stroke="#000" stroke-width="1.5"/><line x1="8" y1="2" x2="2" y2="8" stroke="#000" stroke-width="1.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="window-content">${content}</div>
            <div class="window-resize window-resize-e"></div>
            <div class="window-resize window-resize-w"></div>
            <div class="window-resize window-resize-n"></div>
            <div class="window-resize window-resize-s"></div>
            <div class="window-resize window-resize-ne"></div>
            <div class="window-resize window-resize-nw"></div>
            <div class="window-resize window-resize-se"></div>
            <div class="window-resize window-resize-sw"></div>
        `;

        container.appendChild(windowEl);

        // Setup window interactions
        this.setupWindowControls(windowEl, id);
        this.setupDragging(windowEl);
        this.setupResizing(windowEl);

        return windowEl;
    },

    /**
     * Setup window control buttons
     */
    setupWindowControls(windowEl, appId) {
        const titlebar = windowEl.querySelector('.window-titlebar');
        const minimizeBtn = windowEl.querySelector('.window-btn-minimize');
        const maximizeBtn = windowEl.querySelector('.window-btn-maximize');
        const closeBtn = windowEl.querySelector('.window-btn-close');

        // Focus on click
        windowEl.addEventListener('mousedown', () => {
            AlbyOS.focusWindow(windowEl);
        });

        // Double-click titlebar to maximize
        titlebar.addEventListener('dblclick', (e) => {
            if (e.target === titlebar || e.target.closest('.window-title')) {
                AlbyOS.toggleMaximize(windowEl);
            }
        });

        // Control buttons
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            AlbyOS.minimizeWindow(windowEl);
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            AlbyOS.toggleMaximize(windowEl);
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            AlbyOS.closeApp(appId);
        });
    },

    /**
     * Setup window dragging
     */
    setupDragging(windowEl) {
        const titlebar = windowEl.querySelector('.window-titlebar');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        titlebar.addEventListener('mousedown', (e) => {
            // Ignore if clicking controls
            if (e.target.closest('.window-controls')) return;
            // Ignore if maximized
            if (windowEl.classList.contains('maximized')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = windowEl.offsetLeft;
            startTop = windowEl.offsetTop;

            document.body.style.cursor = 'move';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Keep window within bounds
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100));

            windowEl.style.left = `${newLeft}px`;
            windowEl.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    },

    /**
     * Setup window resizing
     */
    setupResizing(windowEl) {
        const resizeHandles = windowEl.querySelectorAll('.window-resize');
        let isResizing = false;
        let currentHandle = null;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                if (windowEl.classList.contains('maximized')) return;

                isResizing = true;
                currentHandle = handle;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = windowEl.offsetWidth;
                startHeight = windowEl.offsetHeight;
                startLeft = windowEl.offsetLeft;
                startTop = windowEl.offsetTop;

                document.body.style.userSelect = 'none';
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const minWidth = 400;
            const minHeight = 300;

            const handleClass = currentHandle.className;

            // East resize
            if (handleClass.includes('-e') || handleClass.includes('-se') || handleClass.includes('-ne')) {
                const newWidth = Math.max(minWidth, startWidth + dx);
                windowEl.style.width = `${newWidth}px`;
            }

            // West resize
            if (handleClass.includes('-w') || handleClass.includes('-sw') || handleClass.includes('-nw')) {
                const newWidth = Math.max(minWidth, startWidth - dx);
                if (newWidth > minWidth) {
                    windowEl.style.width = `${newWidth}px`;
                    windowEl.style.left = `${startLeft + dx}px`;
                }
            }

            // South resize
            if (handleClass.includes('-s') || handleClass.includes('-se') || handleClass.includes('-sw')) {
                const newHeight = Math.max(minHeight, startHeight + dy);
                windowEl.style.height = `${newHeight}px`;
            }

            // North resize
            if (handleClass.includes('-n') || handleClass.includes('-ne') || handleClass.includes('-nw')) {
                const newHeight = Math.max(minHeight, startHeight - dy);
                if (newHeight > minHeight) {
                    windowEl.style.height = `${newHeight}px`;
                    windowEl.style.top = `${startTop + dy}px`;
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                currentHandle = null;
                document.body.style.userSelect = '';
            }
        });
    }
};

// Export
window.WindowManager = WindowManager;
