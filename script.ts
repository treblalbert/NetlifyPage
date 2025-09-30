const config = {
    width: 700,
    height: 800,
    radius: 24,
    border: 0.07,
    lightness: 50,
    alpha: 0.93,
    blur: 11,
    scale: -180,
    blend: 'difference',
    x: 'R',
    y: 'G',
    r: 0,
    g: 10,
    b: 20,
    displace: 0.7
};

function buildDisplacementImage() {
    const border = Math.min(config.width, config.height) * (config.border * 0.5);
    
    const svgContent = `
        <svg viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#000"/>
                    <stop offset="100%" stop-color="red"/>
                </linearGradient>
                <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#000"/>
                    <stop offset="100%" stop-color="blue"/>
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="black"></rect>
            <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#red)" />
            <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#blue)" style="mix-blend-mode: ${config.blend}" />
            <rect x="${border}" y="${border}" width="${config.width - border * 2}" height="${config.height - border * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha})" style="filter:blur(${config.blur}px)" />
        </svg>
    `;
    
    const encoded = encodeURIComponent(svgContent);
    const dataUri = `data:image/svg+xml,${encoded}`;
    
    const feImage = document.querySelector('feImage');
    feImage.setAttribute('href', dataUri);
    
    document.querySelector('#redchannel').setAttribute('scale', config.scale + config.r);
    document.querySelector('#greenchannel').setAttribute('scale', config.scale + config.g);
    document.querySelector('#bluechannel').setAttribute('scale', config.scale + config.b);
    
    document.querySelectorAll('feDisplacementMap').forEach(el => {
        el.setAttribute('xChannelSelector', config.x);
        el.setAttribute('yChannelSelector', config.y);
    });
    
    document.querySelector('feGaussianBlur').setAttribute('stdDeviation', config.displace);
}

buildDisplacementImage();