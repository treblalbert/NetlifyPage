// cursor-trail.js
// Global cursor trail functionality

(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCursor);
    } else {
        initCursor();
    }

    function initCursor() {
        // Create cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);

        // Create trail elements
        const trails = [];
        for (let i = 0; i < 4; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.id = `custom-trail-${i}`;
            document.body.appendChild(trail);
            trails.push(trail);
        }

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        // Store trail positions
        const trailPositions = trails.map(() => ({ x: 0, y: 0 }));

        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation
        function updateCursor() {
            // Smooth cursor movement
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            // Update trail positions with delay
            trailPositions.forEach((pos, index) => {
                const prevPos = index === 0 ? { x: cursorX, y: cursorY } : trailPositions[index - 1];
                pos.x += (prevPos.x - pos.x) * (0.15 - index * 0.02);
                pos.y += (prevPos.y - pos.y) * (0.15 - index * 0.02);
                
                trails[index].style.left = pos.x + 'px';
                trails[index].style.top = pos.y + 'px';
            });

            requestAnimationFrame(updateCursor);
        }

        // Start the animation
        updateCursor();

        // Add click effect
        document.addEventListener('click', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            setTimeout(() => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 150);
        });

        // Optional: Enhanced hover effects for elements with 'cursor-glow' class
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('cursor-glow')) {
                cursor.style.boxShadow = `
                    0 0 15px rgba(255, 255, 255, 1),
                    0 0 30px rgba(255, 255, 255, 0.8),
                    0 0 45px rgba(255, 255, 255, 0.6)
                `;
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('cursor-glow')) {
                cursor.style.boxShadow = `
                    0 0 10px rgba(255, 255, 255, 0.8),
                    0 0 20px rgba(255, 255, 255, 0.6),
                    0 0 30px rgba(255, 255, 255, 0.4)
                `;
            }
        }, true);

        // Hide cursor when mouse leaves window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            trails.forEach(trail => trail.style.opacity = '0');
        });

        // Show cursor when mouse enters window
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            trails.forEach(trail => trail.style.opacity = '1');
        });
    }
})();