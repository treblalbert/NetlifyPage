// Animation effects for AlbertOS
(function() {
  'use strict';

  // Turbulence filter animation for liquid glass effects
  const turb = document.getElementById('turb');
  const turbSmall = document.getElementById('turb-small');
  
  let t = 0;

  function animateTurbulence() {
    t += 0.008;
    
    if (turb) {
      const bf1 = 0.005 + Math.sin(t * 0.7) * 0.002;
      const bf2 = 0.008 + Math.cos(t * 0.5) * 0.003;
      turb.setAttribute('baseFrequency', bf1 + ' ' + bf2);
    }
    
    if (turbSmall) {
      const smallBf1 = 0.012 + Math.sin(t * 1.1) * 0.003;
      const smallBf2 = 0.016 + Math.cos(t * 0.8) * 0.003;
      turbSmall.setAttribute('baseFrequency', smallBf1 + ' ' + smallBf2);
    }
    
    requestAnimationFrame(animateTurbulence);
  }

  // Start turbulence animation
  if (turb || turbSmall) {
    requestAnimationFrame(animateTurbulence);
  }

  // Parallax effect for wallpaper based on mouse movement
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  // Track global mouse position for window glow effect
  let globalMouseX = 0;
  let globalMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    
    // Store global mouse position for window glow tracking
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });

  function animateParallax() {
    // Smooth interpolation
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    const waves = document.querySelectorAll('.wave');
    waves.forEach((wave, index) => {
      const factor = (index + 1) * 0.3;
      wave.style.transform = `translateX(${currentX * factor}px) translateY(${currentY * factor}px)`;
    });
    
    const gradient = document.querySelector('.wallpaper-gradient');
    if (gradient) {
      gradient.style.transform = `translate(${currentX * 0.5}px, ${currentY * 0.5}px)`;
    }
    
    requestAnimationFrame(animateParallax);
  }

  requestAnimationFrame(animateParallax);

  // ==================== WINDOW GLOW MOUSE TRACKING ====================
  // Smooth glow position tracking for each window
  const windowGlowState = new Map();

  function updateWindowGlow() {
    const windows = document.querySelectorAll('.window:not(.maximized):not(.minimized)');
    
    windows.forEach(windowEl => {
      // Get or create state for this window
      let state = windowGlowState.get(windowEl);
      if (!state) {
        state = { currentX: 50, currentY: 50, targetX: 50, targetY: 50 };
        windowGlowState.set(windowEl, state);
      }
      
      const rect = windowEl.getBoundingClientRect();
      
      // Check if mouse is near or over the window (with some padding for the glow)
      const padding = 100;
      const isNear = globalMouseX >= rect.left - padding && 
                     globalMouseX <= rect.right + padding &&
                     globalMouseY >= rect.top - padding && 
                     globalMouseY <= rect.bottom + padding;
      
      if (isNear) {
        // Calculate mouse position as percentage relative to window
        state.targetX = ((globalMouseX - rect.left) / rect.width) * 100;
        state.targetY = ((globalMouseY - rect.top) / rect.height) * 100;
        
        // Clamp values but allow some overflow for edge effects
        state.targetX = Math.max(-20, Math.min(120, state.targetX));
        state.targetY = Math.max(-20, Math.min(120, state.targetY));
      } else {
        // Slowly return to center when mouse is far away
        state.targetX = 50;
        state.targetY = 50;
      }
      
      // Smooth interpolation for glow position
      const smoothFactor = isNear ? 0.15 : 0.05;
      state.currentX += (state.targetX - state.currentX) * smoothFactor;
      state.currentY += (state.targetY - state.currentY) * smoothFactor;
      
      // Apply the glow position via CSS custom properties
      windowEl.style.setProperty('--glow-x', `${state.currentX}%`);
      windowEl.style.setProperty('--glow-y', `${state.currentY}%`);
    });
    
    // Clean up state for removed windows
    windowGlowState.forEach((state, windowEl) => {
      if (!document.body.contains(windowEl)) {
        windowGlowState.delete(windowEl);
      }
    });
    
    requestAnimationFrame(updateWindowGlow);
  }

  // Start window glow animation
  requestAnimationFrame(updateWindowGlow);

  // Reduce motion for users who prefer it
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    // Disable or slow down animations
    document.querySelectorAll('.wave').forEach(wave => {
      wave.style.animationDuration = '60s';
    });
  }

  // Touch device optimization
  if ('ontouchstart' in window) {
    // Slower animations for better performance on mobile
    document.querySelectorAll('.wave').forEach(wave => {
      wave.style.animationDuration = '40s';
    });
  }

})();