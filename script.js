document.addEventListener('DOMContentLoaded', () => {
    const sentimentButtons = document.querySelectorAll('.sentiment-btn');
    const notification = document.getElementById('notification');
    const BOT_TOKEN = '7709367373:AAE9dNtr-u23L0WwKLXXC4VSYPccu6XyiQg';
    const CHAT_ID = '1162147507';  // Your chat ID
    
    // Handle sentiment button clicks
    sentimentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const message = button.dataset.message;
            try {
                console.log('Sending message:', message);
                const response = await sendTelegramMessage(message);
                console.log('Telegram Response:', response);
                
                if (response.ok) {
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
        notification.textContent = message;
        notification.className = `notification ${type}`;
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}); 