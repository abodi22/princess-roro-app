document.addEventListener('DOMContentLoaded', () => {
    const sentimentButtons = document.querySelectorAll('.sentiment-btn');
    const notification = document.getElementById('notification');
    const BOT_TOKEN = '7709367373:AAE9dNtr-u23L0WwKLXXC4VSYPccu6XyiQg';
    const CHAT_ID = '1162147507';  // Your chat ID
    
    // Create message sent sound
    const messageSound = new Audio('button.mp3');
    messageSound.volume = 0.15; // Lower volume for message sound
    
    // Debounce for message sound
    let lastMessageSound = 0;
    function playMessageSound() {
        const now = Date.now();
        if (now - lastMessageSound > 200) { // 200ms debounce
            messageSound.currentTime = 0;
            messageSound.play().catch(() => {});
            lastMessageSound = now;
        }
    }

    // Initialize counters from localStorage
    let counters = JSON.parse(localStorage.getItem('buttonCounters')) || {
        miss: 0,
        love: 0,
        need: 0,
        hate: 0,
        lastReset: new Date().toDateString()
    };

    // Initialize mood history from localStorage
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const today = new Date().toDateString();

    // Check if we need to reset counters (new day)
    if (counters.lastReset !== today) {
        counters = {
            miss: 0,
            love: 0,
            need: 0,
            hate: 0,
            lastReset: today
        };
        localStorage.setItem('buttonCounters', JSON.stringify(counters));
    }

    // Update counter display
    function updateCounterDisplay() {
        // Update total counter
        const totalClicks = counters.miss + counters.love + counters.need + counters.hate;
        const daysCounter = document.getElementById('daysCounter');
        const missCounter = document.getElementById('missCounter');
        const loveCounter = document.getElementById('loveCounter');
        const needCounter = document.getElementById('needCounter');
        const hateCounter = document.getElementById('hateCounter');

        if (daysCounter) daysCounter.textContent = totalClicks;
        if (missCounter) missCounter.textContent = counters.miss;
        if (loveCounter) loveCounter.textContent = counters.love;
        if (needCounter) needCounter.textContent = counters.need;
        if (hateCounter) hateCounter.textContent = counters.hate;

        // Check for milestones and trigger confetti
        const milestones = [10, 25, 50, 100, 110, 200, 500, 1000];
        if (milestones.includes(totalClicks)) {
            // Check if confetti function exists before calling it
            if (typeof window.createConfetti === 'function') {
                window.createConfetti();
            }
            showNotification(`Congratulations! You've sent ${totalClicks} messages! 🎉`, 'success');
        }
    }

    // Initial counter update
    updateCounterDisplay();
    
    // Handle sentiment button clicks
    sentimentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            console.log('Button clicked:', button.classList[1]); // Debug log
            
            const message = button.dataset.message;
            const buttonType = button.classList[1]; // miss, love, need, or hate
            
            // Increment counter
            counters[buttonType]++;
            localStorage.setItem('buttonCounters', JSON.stringify(counters));
            
            // Update display immediately
            updateCounterDisplay();

            try {
                console.log('Sending message:', message);
                const response = await sendTelegramMessage(message);
                console.log('Telegram Response:', response);
                
                if (response.ok) {
                    playMessageSound(); // Play sound on successful send
                    showNotification('Message sent successfully!', 'success');
                } else {
                    throw new Error(response.description || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            }
        });
    });

    // Handle custom message
    const customInput = document.getElementById('customMessage');
    const sendCustomBtn = document.getElementById('sendCustom');

    if (sendCustomBtn) {
        sendCustomBtn.addEventListener('click', async () => {
            const message = customInput.value.trim();
            if (!message) {
                showNotification('Please type a message first!', 'error');
                return;
            }

            try {
                const response = await sendTelegramMessage(message);
                if (response.ok) {
                    playMessageSound(); // Play sound on successful send
                    showNotification('Message sent successfully!', 'success');
                    customInput.value = ''; // Clear input after sending
                } else {
                    throw new Error(response.description || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            }
        });
    }

    // Also send on Enter key
    if (customInput) {
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendCustomBtn.click();
            }
        });
    }

    // Handle background music
    const bgMusic = document.getElementById('bgMusic');
    const toggleMusicBtn = document.getElementById('toggleMusic');
    
    // Try to play music automatically
    function playMusic() {
        if (bgMusic) {
            bgMusic.play().catch(() => {
                // If autoplay fails, show a message
                showNotification('Click the music button to play the song', 'info');
            });
        }
    }

    // Play music when the page loads
    playMusic();

    // Toggle music play/pause
    if (toggleMusicBtn && bgMusic) {
        toggleMusicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                toggleMusicBtn.classList.add('playing');
            } else {
                bgMusic.pause();
                toggleMusicBtn.classList.remove('playing');
            }
        });

        // Update button state when music ends
        bgMusic.addEventListener('ended', () => {
            toggleMusicBtn.classList.remove('playing');
        });
    }

    // Handle mood tracking
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const mood = button.dataset.mood;
            const moodIcon = button.querySelector('i').className;
            
            // Get mood text based on mood type
            let moodText;
            switch(mood) {
                case 'happy': moodText = 'Happy'; break;
                case 'love': moodText = 'In Love'; break;
                case 'sad': moodText = 'Sad'; break;
                case 'angry': moodText = 'Angry'; break;
                default: moodText = mood;
            }
            
            // Add to mood history
            moodHistory.unshift({
                mood,
                icon: moodIcon,
                text: moodText,
                date: new Date().toLocaleString()
            });
            
            // Keep only last 7 days of mood history
            if (moodHistory.length > 7) {
                moodHistory.pop();
            }
            
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));

            // Send mood update to Telegram
            try {
                const moodMessage = `Princess Roro is feeling ${moodText} ${getMoodEmoji(mood)}`;
                console.log('Sending mood:', moodMessage);
                const response = await sendTelegramMessage(moodMessage);
                console.log('Mood Response:', response);
                
                if (response.ok) {
                    showNotification(`Mood updated: ${moodText}`, 'success');
                } else {
                    throw new Error(response.description || 'Failed to send mood update');
                }
            } catch (error) {
                console.error('Error sending mood:', error);
                showNotification('Failed to send mood update. Please try again.', 'error');
            }
        });
    });

    // Function to get mood emoji
    function getMoodEmoji(mood) {
        switch(mood) {
            case 'happy': return '😊';
            case 'love': return '❤️';
            case 'sad': return '😢';
            case 'angry': return '😠';
            default: return '';
        }
    }

    // Function to send Telegram message
    async function sendTelegramMessage(message) {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        return await response.json();
    }

    // Function to show notifications
    function showNotification(message, type) {
        if (!notification) return; // Guard against missing notification element
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Make showNotification available globally
    window.showNotification = showNotification;
}); 
