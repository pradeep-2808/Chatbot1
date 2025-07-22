let dashboard, worksheets;

// Initialize when page loads
$(document).ready(function() {
    // Initialize Tableau Extension
    tableau.extensions.initializeAsync().then(function() {
        dashboard = tableau.extensions.dashboardContent.dashboard;
        worksheets = dashboard.worksheets;
        
        console.log('Tableau Extension initialized successfully');
        addBotMessage('Hello! I can help you explore your Tableau data. What would you like to know?');
    });
    
    // Handle send button click
    $('#send-button').click(sendMessage);
    
    // Handle Enter key in input
    $('#chat-input').keypress(function(e) {
        if (e.which === 13) {
            sendMessage();
        }
    });
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addUserMessage(message);
    input.value = '';
    
    // Process the message
    processUserMessage(message);
}

function addUserMessage(message) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addBotMessage(message) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function processUserMessage(message) {
    try {
        // Show typing indicator
        addBotMessage('Thinking...');
        
        // Simple command processing
        if (message.toLowerCase().includes('filter')) {
            await handleFilterCommand(message);
        } else if (message.toLowerCase().includes('data') || message.toLowerCase().includes('show')) {
            await handleDataCommand(message);
        } else {
            // Send to your external chatbot API
            const response = await callExternalChatbot(message);
            
            // Remove thinking message
            removeLastBotMessage();
            addBotMessage(response);
        }
    } catch (error) {
        console.error('Error processing message:', error);
        removeLastBotMessage();
        addBotMessage('Sorry, I encountered an error. Please try again.');
    }
}

async function callExternalChatbot(message) {
    // Replace with your actual chatbot API endpoint
    const response = await fetch('https://your-chatbot-api.com/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            context: 'tableau'
        })
    });
    
    const data = await response.json();
    return data.response || 'I received your message but could not process it.';
}

async function handleFilterCommand(message) {
    try {
        // Example: Apply filter based on chat message
        const worksheet = worksheets[0]; // Use first worksheet
        
        // Extract filter value from message (you can make this more sophisticated)
        const filterMatch = message.match(/filter (\w+) to (.+)/i);
        
        if (filterMatch) {
            const fieldName = filterMatch[1];
            const filterValue = filterMatch[2];
            
            await worksheet.applyFilterAsync(fieldName, [filterValue], 'replace');
            
            removeLastBotMessage();
            addBotMessage(`Applied filter: ${fieldName} = ${filterValue}`);
        } else {
            removeLastBotMessage();
            addBotMessage('Please specify the filter in format: "filter [field] to [value]"');
        }
    } catch (error) {
        removeLastBotMessage();
        addBotMessage('Could not apply filter. Please check the field name.');
    }
}

async function handleDataCommand(message) {
    try {
        const worksheet = worksheets[0];
        const dataTable = await worksheet.getSummaryDataAsync();
        
        const rowCount = dataTable.data.length;
        const columnCount = dataTable.columns.length;
        
        removeLastBotMessage();
        addBotMessage(`Your data has ${rowCount} rows and ${columnCount} columns. Columns: ${dataTable.columns.map(col => col.fieldName).join(', ')}`);
    } catch (error) {
        removeLastBotMessage();
        addBotMessage('Could not retrieve data information.');
    }
}

function removeLastBotMessage() {
    const messages = document.querySelectorAll('.bot-message');
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }
}