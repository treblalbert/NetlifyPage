// Main application logic
let currentLang = 'en';
let activePanel = null;

// Update content based on selected language
function updateContent(lang) {
  currentLang = lang;
  const trans = translations[lang];
  
  // Update description
  document.getElementById('description').innerHTML = trans.description;
  
  // Update panel descriptions with innerHTML to render HTML tags
  document.getElementById('pdfDescription').innerHTML = trans.pdfDescription;
  document.getElementById('twitterFilterDescription').innerHTML = trans.twitterFilterDescription;
  document.getElementById('twitterFilterInstructions').innerHTML = trans.twitterFilterInstructions;
  
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (trans[key]) {
      el.textContent = trans[key];
    }
  });
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// Close all side panels
function closeAllPanels() {
  document.querySelectorAll('.side-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById('glass').style.transform = 'translateX(0)';
  activePanel = null;
}

// Open a specific panel
function openPanel(panelId) {
  if (activePanel === panelId) {
    closeAllPanels();
    return;
  }
  
  closeAllPanels();
  const panel = document.getElementById(panelId);
  panel.classList.add('active');
  document.getElementById('glass').style.transform = 'translateX(-40px)';
  activePanel = panelId;
}

// Initialize event listeners
function initializeEventListeners() {
  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      updateContent(lang);
    });
  });

  // Theme toggle functionality
  document.getElementById('profilePic').addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
  });

  // PDF Reader Panel Toggle
  document.getElementById('pdfButton').addEventListener('click', function(e) {
    e.preventDefault();
    openPanel('pdfPanel');
  });

  // Twitter Filter Panel Toggle
  document.getElementById('twitterFilterButton').addEventListener('click', function(e) {
    e.preventDefault();
    openPanel('twitterFilterPanel');
  });

  // Close panels when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.side-panel') && 
        !e.target.closest('#pdfButton') && 
        !e.target.closest('#twitterFilterButton')) {
      closeAllPanels();
    }
  });
}

// Initialize page on load
window.addEventListener('load', function() {
  // Initialize with English
  updateContent('en');
  
  // Fade in effect
  document.body.style.opacity = '1';
  
  // Set up event listeners
  initializeEventListeners();
});