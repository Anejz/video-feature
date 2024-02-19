// script.js

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    // Function to add a message to the chat window
    function addMessageToChat(sender, message) {
        if (sender == 'video') {
                const videoDiv = document.createElement('div');
                const video = document.createElement('iframe');
                const modifiedUrl = message.replace(/watch\?v=/, "embed/");
                video.src = modifiedUrl;
                video.width = 500;
                video.height = 315;
                videoDiv.appendChild(video);
                chatWindow.appendChild(videoDiv);
            }
        if (sender == 'assistant') {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${sender}: ${message}`;
            chatWindow.appendChild(messageDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
        }
        }
        
        

    async function getAIResponse(message) {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
    
            const data = await response.json();
    
            // Get the last message from the response array
            if (data.length > 0) {
                const lastMessage = data[data.length - 1];
                addMessageToChat(lastMessage.role, lastMessage.content);
            }
            
        } catch (error) {
            console.error('Error fetching AI response:', error);
            addMessageToChat('AI', 'Error fetching response.');
        }
    }
    
    // Handle sending of message
    sendButton.addEventListener('click', () => {
        const message = inputField.value.trim();
        if (message) {
            addMessageToChat('You', message);
            inputField.value = ''; // Clear the input field

            // Placeholder for AI response (to be implemented)
            // Here we will later integrate the Azure OpenAI API call 
            getAIResponse(message);
        }
    });

    // Allow sending message with Enter key
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });
});
