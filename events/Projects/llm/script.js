// DOM Elements
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');

// Load custom responses
let customResponses = {};
fetch('responses.json')
  .then(response => response.json())
  .then(data => customResponses = data)
  .catch(error => console.error('Error loading responses:', error));

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Send Message Function
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Voice Input Functionality
voiceBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = languageSelect.value;
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };
});

// Send Message
async function sendMessage() {
  const userMessage = userInput.value.trim().toLowerCase();
  if (!userMessage) return;

  // Add user message to chat window
  appendMessage(userMessage, 'user');

  // Show typing animation
  const typingIndicator = appendTypingIndicator();

  // Check for custom response
  const botMessage = customResponses[userMessage] || await fetchOpenRouterResponse(userMessage);

  // Remove typing indicator and add bot message
  chatWindow.removeChild(typingIndicator);
  appendMessage(botMessage, 'bot');

  // Clear input
  userInput.value = '';
}

// Fetch response from OpenRouter API
async function fetchOpenRouterResponse(userMessage) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_OPENROUTER_API_KEY`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching response:', error);
    return 'Sorry, something went wrong. Please try again.';
  }
}

// Append Message to Chat Window
function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${sender}-message`);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
}

// Append Typing Indicator
function appendTypingIndicator() {
  const typingElement = document.createElement('div');
  typingElement.classList.add('message', 'bot-message', 'typing-indicator');
  typingElement.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatWindow.appendChild(typingElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
  return typingElement;
}