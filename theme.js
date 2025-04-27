document.addEventListener('DOMContentLoaded', () => {
    // Create theme switcher button
    const themeSwitcher = document.createElement('button');
    themeSwitcher.className = 'theme-switcher';
    themeSwitcher.innerHTML = '🎨';
    themeSwitcher.setAttribute('aria-label', 'Change theme');
    document.body.appendChild(themeSwitcher);

    // Create theme menu
    const themeMenu = document.createElement('div');
    themeMenu.className = 'theme-menu';
    themeMenu.innerHTML = `
        <button class="theme-option" data-theme="pink">
            <div class="theme-color" style="background-color: #ff69b4;"></div>
            Pink Hello Kitty
        </button>
        <button class="theme-option" data-theme="blue">
            <div class="theme-color" style="background-color: #4a90e2;"></div>
            Blue Hello Kitty
        </button>
        <button class="theme-option" data-theme="purple">
            <div class="theme-color" style="background-color: #9b51e0;"></div>
            Purple Hello Kitty
        </button>
        <button class="theme-option" data-theme="mint">
            <div class="theme-color" style="background-color: #48bb78;"></div>
            Mint Hello Kitty
        </button>
        <button class="theme-option" data-theme="cherry">
            <div class="theme-color" style="background-color: #e91e63;"></div>
            Cherry Hello Kitty
        </button>
        <button class="theme-option" data-theme="lavender">
            <div class="theme-color" style="background-color: #9c27b0;"></div>
            Lavender Hello Kitty
        </button>
        <button class="theme-option" data-theme="peach">
            <div class="theme-color" style="background-color: #ff9800;"></div>
            Peach Hello Kitty
        </button>
        <button class="theme-option" data-theme="ocean">
            <div class="theme-color" style="background-color: #00bcd4;"></div>
            Ocean Hello Kitty
        </button>
        <button class="theme-option" data-theme="spring">
            <div class="theme-color" style="background-color: #4caf50;"></div>
            Spring Hello Kitty
        </button>
        <button class="theme-option" data-theme="summer">
            <div class="theme-color" style="background-color: #ffc107;"></div>
            Summer Hello Kitty
        </button>
        <button class="theme-option" data-theme="autumn">
            <div class="theme-color" style="background-color: #795548;"></div>
            Autumn Hello Kitty
        </button>
        <button class="theme-option" data-theme="winter">
            <div class="theme-color" style="background-color: #90caf9;"></div>
            Winter Hello Kitty
        </button>
        <button class="theme-option" id="customThemeBtn">
            <div class="theme-color" style="background: linear-gradient(45deg, #ff69b4, #4a90e2);"></div>
            Custom Theme
        </button>
    `;
    document.body.appendChild(themeMenu);

    // Create custom theme creator
    const themeCreator = document.createElement('div');
    themeCreator.className = 'theme-creator';
    themeCreator.innerHTML = `
        <input type="color" id="primaryColor" value="#ff69b4">
        <input type="color" id="secondaryColor" value="#ff1493">
        <input type="color" id="backgroundColor" value="#fff0f5">
        <button id="saveCustomTheme">Save Custom Theme</button>
    `;
    document.body.appendChild(themeCreator);

    // Create button sound with lower volume
    const buttonSound = new Audio('button.mp3');
    buttonSound.volume = 0.2;

    // Play sound on button click with debounce
    let lastPlayTime = 0;
    function playButtonSound() {
        const now = Date.now();
        if (now - lastPlayTime > 100) {
            buttonSound.currentTime = 0;
            buttonSound.play().catch(() => {});
            lastPlayTime = now;
        }
    }

    // Add click sound only to theme buttons
    themeSwitcher.addEventListener('click', playButtonSound);
    themeMenu.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', playButtonSound);
    });

    // Theme switching functionality
    const savedTheme = localStorage.getItem('theme') || 'pink';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeSwitcher.addEventListener('click', () => {
        themeMenu.classList.toggle('active');
    });

    themeMenu.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            if (theme) {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                themeMenu.classList.remove('active');
            }
        });
    });

    // Custom theme functionality
    document.getElementById('customThemeBtn').addEventListener('click', () => {
        themeMenu.classList.remove('active');
        themeCreator.classList.add('active');
    });

    document.getElementById('saveCustomTheme').addEventListener('click', () => {
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;

        // Create custom theme style
        const style = document.createElement('style');
        style.textContent = `
            [data-theme="custom"] {
                --primary-color: ${primaryColor};
                --secondary-color: ${secondaryColor};
                --background-color: ${backgroundColor};
                --button-hover: ${secondaryColor};
                --text-color: #2d3748;
            }
        `;
        document.head.appendChild(style);

        // Apply custom theme
        document.documentElement.setAttribute('data-theme', 'custom');
        localStorage.setItem('theme', 'custom');
        themeCreator.classList.remove('active');
    });

    // Close theme menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeSwitcher.contains(e.target) && !themeMenu.contains(e.target) && !themeCreator.contains(e.target)) {
            themeMenu.classList.remove('active');
            themeCreator.classList.remove('active');
        }
    });

    // Confetti function
    function createConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        // Hello Kitty/Kuromi themed shapes and colors
        const shapes = ['🎀', '🌸', '⭐', '💖', '🖤', '💝', '💕', '💗'];
        const colors = [
            '#ff69b4', // Pink
            '#ff1493', // Deep Pink
            '#ff69b4', // Light Pink
            '#ffb6c1', // Light Pink
            '#ffc0cb', // Pink
            '#ff69b4', // Hot Pink
            '#ff1493', // Deep Pink
            '#ff69b4'  // Pink
        ];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            
            // Randomly choose between emoji and colored shape
            if (Math.random() > 0.5) {
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.fontSize = (Math.random() * 10 + 15) + 'px';
                confetti.style.background = 'none';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            } else {
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            }

            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.remove();
        }, 3000);
    }

    // Export confetti function
    window.createConfetti = createConfetti;
}); 