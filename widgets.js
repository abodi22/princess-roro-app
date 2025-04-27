document.addEventListener('DOMContentLoaded', () => {
    // Widget data that will be shared with iOS widgets
    const widgetData = {
        messageCount: 0,
        currentMood: 'happy',
        lastMessage: '',
        lastMessageTime: '',
        quickMessages: [
            'وحشتني بوبو',
            'احبك بوبو',
            'ابيك بوبو',
            'ماحبك بوبو'
        ]
    };

    // Update widget data
    function updateWidgetData() {
        // Get total message count
        const counters = JSON.parse(localStorage.getItem('buttonCounters')) || {
            miss: 0,
            love: 0,
            need: 0,
            hate: 0
        };
        widgetData.messageCount = counters.miss + counters.love + counters.need + counters.hate;

        // Get last message
        const lastMessage = localStorage.getItem('lastMessage');
        if (lastMessage) {
            widgetData.lastMessage = lastMessage;
            widgetData.lastMessageTime = new Date().toLocaleTimeString();
        }

        // Get current mood
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        if (moodHistory.length > 0) {
            widgetData.currentMood = moodHistory[0].mood;
        }

        // Save widget data to localStorage
        localStorage.setItem('widgetData', JSON.stringify(widgetData));
    }

    // Update widget data when sending messages
    document.querySelectorAll('.sentiment-btn').forEach(button => {
        button.addEventListener('click', () => {
            localStorage.setItem('lastMessage', button.dataset.message);
            updateWidgetData();
        });
    });

    // Update widget data when sending custom message
    document.getElementById('sendCustom').addEventListener('click', () => {
        const message = document.getElementById('customMessage').value.trim();
        if (message) {
            localStorage.setItem('lastMessage', message);
            updateWidgetData();
        }
    });

    // Update widget data when changing mood
    document.querySelectorAll('.mood-btn').forEach(button => {
        button.addEventListener('click', () => {
            updateWidgetData();
        });
    });

    // Initial widget data update
    updateWidgetData();

    // Helper functions for widget display
    function getMoodIcon(mood) {
        switch(mood) {
            case 'happy': return 'grin-stars';
            case 'love': return 'heart';
            case 'sad': return 'sad-tear';
            case 'angry': return 'angry';
            default: return 'smile';
        }
    }

    function getMoodText(mood) {
        switch(mood) {
            case 'happy': return 'Happy';
            case 'love': return 'In Love';
            case 'sad': return 'Sad';
            case 'angry': return 'Angry';
            default: return 'Neutral';
        }
    }
}); 