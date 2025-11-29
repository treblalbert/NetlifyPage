// Animation effects for the glass morphism elements
(function() {
  const turb = document.getElementById('turb');
  const turbSmall = document.getElementById('turb-small');
  const glass = document.getElementById('glass');
  const distortLayer = document.getElementById('distortLayer');

  let t = 0;

  // Continuous animation loop for distortion effects
  function animate() {
    t += 0.01;
    const bf1 = 0.005 + Math.sin(t * 0.9) * 0.002;
    const bf2 = 0.009 + Math.cos(t * 0.7) * 0.003;
    
    if (turb) {
      turb.setAttribute('baseFrequency', bf1 + ' ' + bf2);
    }
    
    if (turbSmall) {
      const smallBf1 = 0.012 + Math.sin(t * 1.3) * 0.004;
      const smallBf2 = 0.018 + Math.cos(t * 0.9) * 0.004;
      turbSmall.setAttribute('baseFrequency', smallBf1 + ' ' + smallBf2);
    }
    
    requestAnimationFrame(animate);
  }

  // Start animation
  requestAnimationFrame(animate);

  // Mouse movement parallax effect
  window.addEventListener('mousemove', (e) => {
    const rect = glass.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    
    // Calculate movement offset
    const moveX = (rx - 0.5) * 30;
    const moveY = (ry - 0.5) * 20;
    
    // Apply parallax to distortion layer
    distortLayer.style.transform = `translate(${moveX * 0.18}px, ${moveY * 0.18}px)`;
    
    // Adjust opacity based on mouse position
    const op = 0.45 + Math.abs((rx - 0.5)) * 0.14 + Math.abs((ry - 0.5)) * 0.06;
    distortLayer.style.opacity = op;
    
    // Apply 3D rotation effect
    glass.style.transform = `perspective(800px) rotateX(${(ry - 0.5) * 2}deg) rotateY(${(0.5 - rx) * 2}deg)`;
  });

  // Slower animation for touch devices (performance optimization)
  if ('ontouchstart' in window) {
    t = 0;
    
    function slowAnimate() {
      t += 0.005;
      const bf1 = 0.005 + Math.sin(t * 0.5) * 0.001;
      const bf2 = 0.009 + Math.cos(t * 0.4) * 0.002;
      
      if (turb) {
        turb.setAttribute('baseFrequency', bf1 + ' ' + bf2);
      }
      
      if (turbSmall) {
        const smallBf1 = 0.012 + Math.sin(t * 0.7) * 0.002;
        const smallBf2 = 0.018 + Math.cos(t * 0.5) * 0.002;
        turbSmall.setAttribute('baseFrequency', smallBf1 + ' ' + smallBf2);
      }
      
      setTimeout(() => requestAnimationFrame(slowAnimate), 100);
    }
    
    requestAnimationFrame(slowAnimate);
  }
})();