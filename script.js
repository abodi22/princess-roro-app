document.addEventListener('DOMContentLoaded', () => {
    const sentimentButtons = document.querySelectorAll('.sentiment-btn');
    const notification = document.getElementById('notification');
    const BOT_TOKEN = '7709367373:AAE9dNtr-u23L0WwKLXXC4VSYPccu6XyiQg';
    const CHAT_ID = '1162147507';  // Your chat ID
    
    // Create message sent sound
    const messageSound = new Audio('button.mp3');
    messageSound.volume = 0.15; // Lower volume for message sound
    
    // Create Hello Kitty sound effect
    const kittySound = new Audio('kitty-sound.mp3');
    kittySound.volume = 0.3; // Adjust volume for Hello Kitty sound
    
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

    // Play Hello Kitty sound
    function playKittySound() {
        kittySound.currentTime = 0;
        kittySound.play().catch(() => {});
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
    
    // Quick Send Mode
    const quickSendToggle = document.getElementById('quickSendToggle');
    let isQuickSendMode = false;

    quickSendToggle.addEventListener('click', () => {
        isQuickSendMode = !isQuickSendMode;
        document.body.classList.toggle('quick-send-mode');
        quickSendToggle.classList.toggle('active');
        
        if (isQuickSendMode) {
            quickSendToggle.innerHTML = '<i class="fas fa-bolt"></i> Quick Send Mode: ON';
            showNotification('Quick Send Mode: ON - Press buttons rapidly!', 'success');
        } else {
            quickSendToggle.innerHTML = '<i class="fas fa-bolt"></i> Quick Send Mode: OFF';
            showNotification('Quick Send Mode: OFF', 'info');
        }
    });

    // Message Queue System
    const messageQueue = [];
    let isProcessingQueue = false;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    async function processMessageQueue() {
        if (isProcessingQueue || messageQueue.length === 0) return;
        
        isProcessingQueue = true;
        const { message, button, retryCount = 0 } = messageQueue[0];
        
        try {
            // Add loading state to button
            if (button) {
                button.classList.add('loading');
                button.disabled = true;
            }

            const response = await sendTelegramMessage(message);
            
            if (response.ok) {
                playMessageSound();
                if (!isQuickSendMode) {
                    showNotification('Message sent successfully!', 'success');
                }
                messageQueue.shift(); // Remove sent message from queue
            } else {
                throw new Error(response.description || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            if (retryCount < MAX_RETRIES) {
                // Retry the message
                messageQueue[0].retryCount = retryCount + 1;
                setTimeout(() => {
                    isProcessingQueue = false;
                    processMessageQueue();
                }, RETRY_DELAY);
            } else {
                // Max retries reached, show error and remove from queue
                showNotification('Failed to send message after multiple attempts. Please try again.', 'error');
                messageQueue.shift();
            }
        } finally {
            // Remove loading state from button
            if (button) {
                button.classList.remove('loading');
                button.disabled = false;
            }
            isProcessingQueue = false;
            
            // Process next message if any
            if (messageQueue.length > 0) {
                setTimeout(processMessageQueue, 100);
            }
        }
    }

    // Modify sentiment button click handler
    sentimentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const message = button.dataset.message;
            const buttonType = button.classList[1];
            
            // Increment counter
            counters[buttonType]++;
            localStorage.setItem('buttonCounters', JSON.stringify(counters));
            updateCounterDisplay();

            // Add message to queue
            messageQueue.push({ message, button });
            processMessageQueue();
            
            // Play Hello Kitty sound
            playKittySound();
        });
    });

    // Handle custom message
    const customInput = document.getElementById('customMessage');
    const sendCustomBtn = document.getElementById('sendCustom');

    if (sendCustomBtn) {
        sendCustomBtn.addEventListener('click', () => {
            const message = customInput.value.trim();
            if (!message) {
                showNotification('Please type a message first!', 'error');
                return;
            }

            // Add message to queue
            messageQueue.push({ message, button: sendCustomBtn });
            processMessageQueue();
            customInput.value = ''; // Clear input after adding to queue
            
            // Play Hello Kitty sound
            playKittySound();
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
        button.addEventListener('click', () => {
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

            // Add mood message to queue
            const moodMessage = `Princess Roro is feeling ${moodText} ${getMoodEmoji(mood)}`;
            messageQueue.push({ message: moodMessage, button });
            processMessageQueue();
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

    // Message Inbox System
    const inboxMessages = document.getElementById('inboxMessages');
    const refreshInbox = document.getElementById('refreshInbox');
    let lastUpdateId = 0;

    // Function to fetch new messages
    async function fetchNewMessages() {
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
            const data = await response.json();
            
            if (data.ok && data.result.length > 0) {
                data.result.forEach(update => {
                    if (update.message && update.message.chat.id.toString() === CHAT_ID) {
                        // Update lastUpdateId
                        lastUpdateId = update.update_id;
                        
                        // Add message to inbox
                        addMessageToInbox(update.message);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showNotification('Failed to fetch new messages', 'error');
        }
    }

    // Function to add message to inbox
    function addMessageToInbox(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        
        const date = new Date(message.date * 1000);
        const timeString = date.toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${message.text}
            </div>
            <div class="message-footer">
                <div class="message-time">
                    <i class="fas fa-clock"></i>
                    ${timeString}
                </div>
                <button class="reply-btn" data-message-id="${message.message_id}">
                    <i class="fas fa-reply"></i>
                </button>
            </div>
        `;
        
        // Add reply button functionality
        const replyBtn = messageElement.querySelector('.reply-btn');
        replyBtn.addEventListener('click', () => {
            const customInput = document.getElementById('customMessage');
            customInput.value = ''; // Clear the input
            customInput.focus();
            customInput.scrollIntoView({ behavior: 'smooth' });
        });
        
        inboxMessages.insertBefore(messageElement, inboxMessages.firstChild);
        
        // Play notification sound for new messages
        playMessageSound();
        
        // Show notification
        showNotification('New message from Roro!', 'success');
    }

    // Set up periodic message checking
    setInterval(fetchNewMessages, 5000); // Check every 5 seconds

    // Handle manual refresh
    if (refreshInbox) {
        refreshInbox.addEventListener('click', () => {
            refreshInbox.classList.add('loading');
            fetchNewMessages().finally(() => {
                refreshInbox.classList.remove('loading');
            });
        });
    }

    // Initial message fetch
    fetchNewMessages();
}); 
