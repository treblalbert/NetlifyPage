// AlbertOS - Desktop Operating System Interface
(function() {
  'use strict';

  // ==================== STATE ====================
  let currentLang = localStorage.getItem('albertos-lang') || 'en';
  let isDarkTheme = localStorage.getItem('albertos-theme') !== 'light';
  let windows = [];
  let windowZIndex = 100;
  let activeWindow = null;
  let iconPositions = JSON.parse(localStorage.getItem('albertos-icons') || '{}');

  // ==================== DESKTOP ICONS DATA ====================
  const desktopIcons = [
    { id: 'about', icon: 'resources/Albert.jpg', labelKey: 'aboutMeFile', action: 'openAbout', isImage: true },
    { id: 'projects', icon: 'resources/projects.png', labelKey: 'projects', action: 'openProjects' },
    { id: 'github', icon: 'resources/github-icon.png', labelKey: 'github', action: 'openExternal', url: 'https://github.com/treblalbert' },
    { id: 'itchio', icon: 'resources/itch-icon.png', labelKey: 'itchio', action: 'openExternal', url: 'https://albertfreeman.itch.io/' },
    { id: 'baldball', icon: 'resources/baldball.png', labelKey: 'baldBall', action: 'openExternal', url: 'https://albertfreeman.org/bald-ball/' },
    { id: 'contact', icon: 'resources/contact.png', labelKey: 'contact', action: 'openContact' }
  ];

  const projectFolders = [
    { id: 'main-games', icon: 'resources/maingames.png', labelKey: 'mainGames', type: 'folder', items: [
      { id: 'baldball-project', icon: 'resources/baldball.png', label: 'Bald Ball', action: 'openExternal', url: 'https://albertfreeman.org/bald-ball/' }
    ]},
    { id: 'personal-projects', icon: 'resources/personalprojects.png', labelKey: 'personalProjects', type: 'folder', items: [
      { id: 'github-link', icon: 'resources/github-icon.png', label: 'GitHub', action: 'openExternal', url: 'https://github.com/treblalbert' },
      { id: 'itchio-link', icon: 'resources/itch-icon.png', label: 'Itch.io', action: 'openExternal', url: 'https://albertfreeman.itch.io/' }
    ]},
    { id: 'side-projects', icon: 'resources/sideprojects.png', labelKey: 'sideProjects', type: 'folder', items: [
      { id: 'pdf-viewer', icon: 'resources/pdf.png', labelKey: 'pdfViewer', action: 'openProject', projectId: 'pdf' },
      { id: 'twitter-filter', icon: 'resources/ATCF.png', labelKey: 'twitterFilter', action: 'openProject', projectId: 'twitter' },
      { id: 'excel-editor', icon: 'resources/excel.png', labelKey: 'excelEditor', action: 'openProject', projectId: 'excel' }
    ]}
  ];

  // ==================== INITIALIZATION ====================
  window.addEventListener('DOMContentLoaded', init);

  function init() {
    // Show boot screen for a moment
    setTimeout(() => {
      const bootScreen = document.getElementById('bootScreen');
      bootScreen.classList.add('hidden');
      
      // Remove from DOM after animation
      setTimeout(() => {
        bootScreen.remove();
      }, 800);
    }, 2500); // Boot screen shows for 2.5 seconds
    
    applyTheme();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderDesktopIcons();
    setupEventListeners();
    updateLanguage();
  }

  // ==================== THEME ====================
  function applyTheme() {
    document.body.classList.toggle('light-theme', !isDarkTheme);
  }

  function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('albertos-theme', isDarkTheme ? 'dark' : 'light');
    applyTheme();
  }

  // ==================== DATE/TIME ====================
  function updateDateTime() {
    const now = new Date();
    const trans = translations[currentLang];
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    const dayName = trans.daysShort[now.getDay()];
    const monthName = trans.monthsShort[now.getMonth()];
    const date = now.getDate();
    document.getElementById('date').textContent = `${dayName}, ${monthName} ${date}`;
  }

  // ==================== LANGUAGE ====================
  function updateLanguage() {
    const trans = translations[currentLang];
    document.getElementById('currentLang').textContent = currentLang.toUpperCase();
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (trans[key]) {
        el.textContent = trans[key];
      }
    });
    
    renderDesktopIcons();
    renderStartMenu();
    updateDateTime();
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('albertos-lang', lang);
    updateLanguage();
    closeAllMenus();
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    // Start button
    document.getElementById('startButton').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });

    // Theme toggle
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);

    // Language button
    document.getElementById('langBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      showLangMenu();
    });

    // Language menu items
    document.querySelectorAll('#langMenu .context-item').forEach(item => {
      item.addEventListener('click', () => {
        setLanguage(item.getAttribute('data-lang'));
      });
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      openSettingsWindow();
      closeStartMenu();
    });

    // About button in start menu
    document.getElementById('aboutBtn').addEventListener('click', () => {
      openAboutWindow();
      closeStartMenu();
    });

    // Desktop right-click context menu
    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    });

    // Context menu actions
    document.getElementById('ctxRefresh').addEventListener('click', () => {
      closeAllMenus();
      location.reload();
    });

    document.getElementById('ctxArrangeIcons').addEventListener('click', () => {
      closeAllMenus();
      arrangeIcons();
    });

    document.getElementById('ctxResetPositions').addEventListener('click', () => {
      closeAllMenus();
      resetIconPositions();
    });

    document.getElementById('ctxToggleTheme').addEventListener('click', () => {
      closeAllMenus();
      toggleTheme();
    });

    // Click outside to close menus
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.start-menu') && !e.target.closest('#startButton')) {
        closeStartMenu();
      }
      if (!e.target.closest('.context-menu') && !e.target.closest('#langBtn')) {
        document.getElementById('contextMenu').classList.remove('open');
        document.getElementById('langMenu').classList.remove('open');
      }
      if (!e.target.closest('.desktop-icon')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllMenus();
      }
    });
  }

  // ==================== DESKTOP ICONS ====================
  function renderDesktopIcons() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';
    
    const trans = translations[currentLang];
    
    desktopIcons.forEach((iconData, index) => {
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.setAttribute('data-id', iconData.id);
      
      const savedPos = iconPositions[iconData.id];
      if (savedPos) {
        icon.style.position = 'absolute';
        icon.style.left = savedPos.x + 'px';
        icon.style.top = savedPos.y + 'px';
      }
      
      const img = document.createElement('img');
      img.className = 'desktop-icon-img';
      img.src = iconData.icon;
      img.alt = trans[iconData.labelKey] || iconData.labelKey;
      if (iconData.isImage) {
        img.style.borderRadius = '50%';
      }
      
      const label = document.createElement('span');
      label.className = 'desktop-icon-label';
      label.textContent = trans[iconData.labelKey] || iconData.labelKey;
      
      icon.appendChild(img);
      icon.appendChild(label);
      
      icon.addEventListener('dblclick', () => handleIconAction(iconData));
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        selectIcon(icon);
      });
      
      setupIconDrag(icon, iconData.id);
      
      desktop.appendChild(icon);
    });
  }

  function selectIcon(icon) {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
  }

  function setupIconDrag(icon, iconId) {
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, iconStartX, iconStartY;
    
    icon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      
      const rect = icon.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      iconStartX = rect.left;
      iconStartY = rect.top;
      
      const onMouseMove = (moveEvent) => {
        const deltaX = Math.abs(moveEvent.clientX - startX);
        const deltaY = Math.abs(moveEvent.clientY - startY);
        
        if (deltaX > 5 || deltaY > 5) {
          if (!isDragging) {
            isDragging = true;
            hasMoved = true;
            icon.classList.add('dragging');
            icon.style.position = 'absolute';
            icon.style.zIndex = '1000';
          }
          
          const desktop = document.getElementById('desktop');
          const desktopRect = desktop.getBoundingClientRect();
          
          let newX = iconStartX + (moveEvent.clientX - startX);
          let newY = iconStartY + (moveEvent.clientY - startY);
          
          newX = Math.max(0, Math.min(newX, desktopRect.width - 80));
          newY = Math.max(0, Math.min(newY, desktopRect.height - 90));
          
          icon.style.left = newX + 'px';
          icon.style.top = newY + 'px';
        }
      };
      
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        if (isDragging) {
          isDragging = false;
          icon.classList.remove('dragging');
          icon.style.zIndex = '';
          
          iconPositions[iconId] = {
            x: parseInt(icon.style.left),
            y: parseInt(icon.style.top)
          };
          localStorage.setItem('albertos-icons', JSON.stringify(iconPositions));
        }
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  function arrangeIcons() {
    iconPositions = {};
    localStorage.removeItem('albertos-icons');
    renderDesktopIcons();
  }

  function resetIconPositions() {
    iconPositions = {};
    localStorage.removeItem('albertos-icons');
    renderDesktopIcons();
  }

  function handleIconAction(iconData) {
    switch (iconData.action) {
      case 'openAbout':
        openAboutWindow();
        break;
      case 'openProjects':
        openProjectsWindow();
        break;
      case 'openContact':
        openContactWindow();
        break;
      case 'openExternal':
        window.open(iconData.url, '_blank');
        break;
      case 'openProject':
        openProjectDetail(iconData.projectId);
        break;
    }
  }

  // ==================== START MENU ====================
  function renderStartMenu() {
    const trans = translations[currentLang];
    const startApps = document.getElementById('startApps');
    const startAllApps = document.getElementById('startAllApps');
    
    startApps.innerHTML = '';
    desktopIcons.slice(0, 4).forEach(iconData => {
      const app = document.createElement('button');
      app.className = 'start-app';
      app.innerHTML = `
        <img class="start-app-icon" src="${iconData.icon}" alt="${trans[iconData.labelKey]}" ${iconData.isImage ? 'style="border-radius:50%"' : ''}>
        <span class="start-app-label">${trans[iconData.labelKey]}</span>
      `;
      app.addEventListener('click', () => {
        handleIconAction(iconData);
        closeStartMenu();
      });
      startApps.appendChild(app);
    });
    
    startAllApps.innerHTML = '';
    const allApps = [...desktopIcons, ...projectFolders[2].items];
    allApps.forEach(iconData => {
      const app = document.createElement('button');
      app.className = 'start-all-app';
      app.innerHTML = `
        <img class="start-all-app-icon" src="${iconData.icon}" alt="${trans[iconData.labelKey] || iconData.label}" ${iconData.isImage ? 'style="border-radius:50%"' : ''}>
        <span class="start-all-app-label">${trans[iconData.labelKey] || iconData.label}</span>
      `;
      app.addEventListener('click', () => {
        handleIconAction(iconData);
        closeStartMenu();
      });
      startAllApps.appendChild(app);
    });
  }

  function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const isOpen = startMenu.classList.contains('open');
    
    closeAllMenus();
    
    if (!isOpen) {
      startMenu.classList.add('open');
      renderStartMenu();
    }
  }

  function closeStartMenu() {
    document.getElementById('startMenu').classList.remove('open');
  }

  // ==================== CONTEXT MENUS ====================
  function closeAllMenus() {
    document.getElementById('startMenu').classList.remove('open');
    document.getElementById('contextMenu').classList.remove('open');
    document.getElementById('langMenu').classList.remove('open');
  }

  function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    closeAllMenus();
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    setTimeout(() => {
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
      }
      if (rect.bottom > window.innerHeight - 48) {
        menu.style.top = (window.innerHeight - 48 - rect.height - 10) + 'px';
      }
    }, 0);
    
    menu.classList.add('open');
  }

  function showLangMenu() {
    const langBtn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    const rect = langBtn.getBoundingClientRect();
    
    closeAllMenus();
    
    menu.style.left = (rect.left - 50) + 'px';
    menu.style.bottom = '56px';
    menu.style.top = 'auto';
    menu.classList.add('open');
  }

  // ==================== WINDOWS ====================
  function createWindow(options) {
    const { id, title, icon, content, width = 600, height = 500 } = options;
    
    const existing = windows.find(w => w.id === id);
    if (existing) {
      focusWindow(existing.element);
      if (existing.element.classList.contains('minimized')) {
        existing.element.classList.remove('minimized');
      }
      return existing.element;
    }
    
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.setAttribute('data-window-id', id);
    windowEl.style.width = width + 'px';
    windowEl.style.height = height + 'px';
    windowEl.style.left = Math.max(50, (window.innerWidth / 2 - width / 2) + Math.random() * 50) + 'px';
    windowEl.style.top = Math.max(20, (window.innerHeight / 2 - height / 2 - 48) + Math.random() * 50) + 'px';
    
    windowEl.innerHTML = `
      <div class="window-titlebar">
        ${icon ? `<img class="window-icon" src="${icon}" alt="" style="${icon.includes('Albert.jpg') ? 'border-radius:50%' : ''}">` : ''}
        <span class="window-title">${title}</span>
        <div class="window-controls">
          <button class="window-btn minimize" title="Minimize">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
          </button>
          <button class="window-btn maximize" title="Maximize">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          </button>
          <button class="window-btn close" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>
      </div>
      <div class="window-content">${content}</div>
      <div class="resize-handle n"></div>
      <div class="resize-handle s"></div>
      <div class="resize-handle e"></div>
      <div class="resize-handle w"></div>
      <div class="resize-handle ne"></div>
      <div class="resize-handle nw"></div>
      <div class="resize-handle se"></div>
      <div class="resize-handle sw"></div>
    `;
    
    document.getElementById('windowsContainer').appendChild(windowEl);
    
    const windowData = { id, element: windowEl, title, icon };
    windows.push(windowData);
    
    setupWindowDrag(windowEl);
    setupWindowResize(windowEl);
    setupWindowControls(windowEl, windowData);
    addToTaskbar(windowData);
    focusWindow(windowEl);
    
    return windowEl;
  }

  function setupWindowDrag(windowEl) {
    const titlebar = windowEl.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, windowStartX, windowStartY;
    
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-btn')) return;
      if (windowEl.classList.contains('maximized')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      windowStartX = windowEl.offsetLeft;
      windowStartY = windowEl.offsetTop;
      
      focusWindow(windowEl);
      
      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        windowEl.style.left = (windowStartX + deltaX) + 'px';
        windowEl.style.top = Math.max(0, windowStartY + deltaY) + 'px';
      };
      
      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-btn')) return;
      toggleMaximize(windowEl);
    });
  }

  function setupWindowResize(windowEl) {
    const handles = windowEl.querySelectorAll('.resize-handle');
    
    handles.forEach(handle => {
      const direction = handle.className.split(' ')[1];
      
      handle.addEventListener('mousedown', (e) => {
        if (windowEl.classList.contains('maximized')) return;
        
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = windowEl.offsetWidth;
        const startHeight = windowEl.offsetHeight;
        const startLeft = windowEl.offsetLeft;
        const startTop = windowEl.offsetTop;
        
        const onMouseMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          
          if (direction.includes('e')) {
            windowEl.style.width = Math.max(400, startWidth + deltaX) + 'px';
          }
          if (direction.includes('w')) {
            const newWidth = Math.max(400, startWidth - deltaX);
            windowEl.style.width = newWidth + 'px';
            windowEl.style.left = (startLeft + startWidth - newWidth) + 'px';
          }
          if (direction.includes('s')) {
            windowEl.style.height = Math.max(300, startHeight + deltaY) + 'px';
          }
          if (direction.includes('n')) {
            const newHeight = Math.max(300, startHeight - deltaY);
            windowEl.style.height = newHeight + 'px';
            windowEl.style.top = Math.max(0, startTop + startHeight - newHeight) + 'px';
          }
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  function setupWindowControls(windowEl, windowData) {
    const minimizeBtn = windowEl.querySelector('.window-btn.minimize');
    const maximizeBtn = windowEl.querySelector('.window-btn.maximize');
    const closeBtn = windowEl.querySelector('.window-btn.close');
    
    minimizeBtn.addEventListener('click', () => minimizeWindow(windowEl));
    maximizeBtn.addEventListener('click', () => toggleMaximize(windowEl));
    closeBtn.addEventListener('click', () => closeWindow(windowData));
    
    windowEl.addEventListener('mousedown', () => focusWindow(windowEl));
  }

  function focusWindow(windowEl) {
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = '');
    windowZIndex++;
    windowEl.style.zIndex = windowZIndex;
    activeWindow = windowEl;
    
    const windowId = windowEl.getAttribute('data-window-id');
    document.querySelectorAll('.taskbar-app').forEach(app => {
      app.classList.toggle('active', app.getAttribute('data-window-id') === windowId);
    });
  }

  function minimizeWindow(windowEl) {
    windowEl.classList.add('minimized');
    const windowId = windowEl.getAttribute('data-window-id');
    document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`)?.classList.remove('active');
  }

  function toggleMaximize(windowEl) {
    windowEl.classList.toggle('maximized');
  }

  function closeWindow(windowData) {
    windowData.element.remove();
    windows = windows.filter(w => w.id !== windowData.id);
    removeFromTaskbar(windowData.id);
  }

  // ==================== TASKBAR ====================
  function addToTaskbar(windowData) {
    const taskbarApps = document.getElementById('taskbarApps');
    
    const app = document.createElement('button');
    app.className = 'taskbar-app active';
    app.setAttribute('data-window-id', windowData.id);
    app.innerHTML = `
      ${windowData.icon ? `<img class="taskbar-app-icon" src="${windowData.icon}" alt="" style="${windowData.icon.includes('Albert.jpg') ? 'border-radius:50%' : ''}">` : ''}
      <span class="taskbar-app-title">${windowData.title}</span>
    `;
    
    app.addEventListener('click', () => {
      const windowEl = windowData.element;
      if (windowEl.classList.contains('minimized')) {
        windowEl.classList.remove('minimized');
        focusWindow(windowEl);
      } else if (activeWindow === windowEl) {
        minimizeWindow(windowEl);
      } else {
        focusWindow(windowEl);
      }
    });
    
    taskbarApps.appendChild(app);
  }

  function removeFromTaskbar(windowId) {
    const app = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
    if (app) app.remove();
  }

  // ==================== WINDOW CONTENT ====================
  function openAboutWindow() {
    const trans = translations[currentLang];
    
    createWindow({
      id: 'about',
      title: trans.aboutMeTitle,
      icon: 'resources/Albert.jpg',
      width: 700,
      height: 550,
      content: `
        <div class="about-content">
          <div class="about-header">
            <img src="resources/Albert.jpg" alt="Albert" class="about-avatar">
            <div class="about-info">
              <h1>Albert Adroer Prats</h1>
              <p>${trans.gameDevTitle}</p>
            </div>
          </div>
          <div class="about-description">
            ${trans.aboutDescription}
          </div>
        </div>
      `
    });
  }

  function openProjectsWindow(folderId = null) {
    const trans = translations[currentLang];
    
    let content = '';
    let windowIcon = 'resources/projects.png';
    let windowTitle = trans.projectsTitle;
    
    if (folderId) {
      const folder = projectFolders.find(f => f.id === folderId);
      if (folder) {
        windowIcon = folder.icon;
        windowTitle = trans[folder.labelKey] || trans.projectsTitle;
        content = '<div class="folder-grid">';
        folder.items.forEach(item => {
          content += `
            <button class="folder-item" data-action="${item.action}" data-url="${item.url || ''}" data-project="${item.projectId || ''}">
              <img class="folder-item-icon" src="${item.icon}" alt="">
              <span class="folder-item-label">${trans[item.labelKey] || item.label}</span>
            </button>
          `;
        });
        content += '</div>';
      }
    } else {
      content = '<div class="folder-grid">';
      projectFolders.forEach(folder => {
        content += `
          <button class="folder-item" data-folder-id="${folder.id}">
            <img class="folder-item-icon" src="${folder.icon}" alt="">
            <span class="folder-item-label">${trans[folder.labelKey]}</span>
          </button>
        `;
      });
      content += '</div>';
    }
    
    const windowEl = createWindow({
      id: folderId ? `projects-${folderId}` : 'projects',
      title: windowTitle,
      icon: windowIcon,
      width: 500,
      height: 400,
      content
    });
    
    // Setup folder click handlers
    windowEl.querySelectorAll('.folder-item').forEach(item => {
      item.addEventListener('click', () => {
        const fId = item.getAttribute('data-folder-id');
        const action = item.getAttribute('data-action');
        const url = item.getAttribute('data-url');
        const projectId = item.getAttribute('data-project');
        
        if (fId) {
          openProjectsWindow(fId);
        } else if (action === 'openExternal' && url) {
          window.open(url, '_blank');
        } else if (action === 'openProject' && projectId) {
          openProjectDetail(projectId);
        }
      });
    });
  }

  function openProjectDetail(projectId) {
    const trans = translations[currentLang];
    
    const projects = {
      pdf: {
        title: 'Albert The Wrench PDF Reader',
        icon: 'resources/pdf.png',
        description: trans.pdfDescription,
        buttons: [
          { label: trans.download, icon: 'resources/pdf.png', href: 'Albert The Wrench PDF Reader.exe', download: true },
          { label: trans.sourceCode, icon: 'resources/github-icon.png', href: 'https://github.com/treblalbert/Albert-s-PDF-Viewer', external: true }
        ]
      },
      twitter: {
        title: "Albert's X/Twitter Filter",
        icon: 'resources/ATCF.png',
        description: trans.twitterFilterDescription,
        instructions: trans.twitterFilterInstructions,
        buttons: [
          { label: trans.sourceCode, icon: 'resources/github-icon.png', href: 'https://github.com/treblalbert/Albert-X-Twitter-Filter', external: true },
          { label: 'Chrome Web Store (Coming Dec 2025)', icon: 'resources/ATCF.png', disabled: true }
        ]
      },
      excel: {
        title: 'Albert AI Excel Editor',
        icon: 'resources/excel.png',
        description: trans.excelEditorDescription,
        instructions: trans.excelEditorInstructions,
        buttons: [
          { label: trans.download, icon: 'resources/excel.png', href: 'resources/AlbertAIExcelEditor.zip', download: true },
          { label: trans.sourceCode, icon: 'resources/github-icon.png', href: 'https://github.com/treblalbert/Albert-AI-Excel-Editor', external: true }
        ]
      }
    };
    
    const project = projects[projectId];
    if (!project) return;
    
    let buttonsHtml = project.buttons.map(btn => {
      if (btn.disabled) {
        return `<span class="project-btn coming-soon"><img src="${btn.icon}" alt="">${btn.label}</span>`;
      }
      if (btn.download) {
        return `<a class="project-btn" href="${btn.href}" download><img src="${btn.icon}" alt="">${btn.label}</a>`;
      }
      return `<a class="project-btn" href="${btn.href}" target="_blank"><img src="${btn.icon}" alt="">${btn.label}</a>`;
    }).join('');
    
    createWindow({
      id: `project-${projectId}`,
      title: project.title,
      icon: project.icon,
      width: 550,
      height: 500,
      content: `
        <div class="project-detail">
          <h2>${project.title}</h2>
          <p>${project.description}</p>
          ${project.instructions ? `<div class="instructions">${project.instructions}</div>` : ''}
          <div class="project-buttons">${buttonsHtml}</div>
        </div>
      `
    });
  }

  function openContactWindow() {
    const trans = translations[currentLang];
    
    createWindow({
      id: 'contact',
      title: trans.contactTitle,
      icon: 'resources/contact.png',
      width: 400,
      height: 250,
      content: `
        <div class="contact-content">
          <h2>${trans.contact}</h2>
          <a href="mailto:albertadroer@gmail.com" class="contact-email">albertadroer@gmail.com</a>
          <p style="margin-top:20px;opacity:0.6">© 2026 Albert Adroer Prats</p>
        </div>
      `
    });
  }

  function openSettingsWindow() {
    const trans = translations[currentLang];
    
    const windowEl = createWindow({
      id: 'settings',
      title: trans.settingsTitle,
      icon: null,
      width: 450,
      height: 350,
      content: `
        <div class="settings-content">
          <div class="settings-section">
            <h3>${trans.appearance}</h3>
            <div class="settings-option">
              <span class="settings-option-label">${trans.darkMode}</span>
              <div class="toggle-switch ${isDarkTheme ? 'active' : ''}" id="darkModeToggle"></div>
            </div>
          </div>
          <div class="settings-section">
            <h3>${trans.language}</h3>
            <div class="settings-option">
              <span class="settings-option-label">English</span>
              <div class="toggle-switch ${currentLang === 'en' ? 'active' : ''}" data-lang="en"></div>
            </div>
            <div class="settings-option">
              <span class="settings-option-label">Español</span>
              <div class="toggle-switch ${currentLang === 'es' ? 'active' : ''}" data-lang="es"></div>
            </div>
            <div class="settings-option">
              <span class="settings-option-label">Català</span>
              <div class="toggle-switch ${currentLang === 'ca' ? 'active' : ''}" data-lang="ca"></div>
            </div>
          </div>
        </div>
      `
    });
    
    // Dark mode toggle
    windowEl.querySelector('#darkModeToggle').addEventListener('click', function() {
      toggleTheme();
      this.classList.toggle('active', isDarkTheme);
    });
    
    // Language toggles
    windowEl.querySelectorAll('[data-lang]').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        setLanguage(lang);
        // Update all language toggles in this window
        windowEl.querySelectorAll('[data-lang]').forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-lang') === lang);
        });
      });
    });
  }

})();