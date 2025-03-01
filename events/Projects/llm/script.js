// DOM Elements
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const webBtn = document.getElementById('web-btn');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownContent = document.querySelector('.dropdown-content');

// Load custom responses
let customResponses = {};
fetch('responses.json')
  .then(response => response.json())
  .then(data => customResponses = data)
  .catch(error => console.error('Error loading responses:', error));

// Load contacts
let contacts = [];

async function loadContacts() {
  try {
    const response = await fetch('contacts.csv');
    const csvData = await response.text();
    contacts = parseCSV(csvData);
    console.log('Contacts loaded:', contacts);
  } catch (error) {
    console.error('Error loading contacts:', error);
  }
}

function parseCSV(csvData) {
  const rows = csvData.split('\n');
  const headers = rows[0].split(',').map(header => header.trim()); // Extract headers
  return rows.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] ? values[index].trim() : '';
      return obj;
    }, {});
  });
}

// Load contacts when the page loads
loadContacts();

// Fuzzy search for contacts
function searchContacts(query) {
  const options = {
    keys: ['First Name', 'Last Name'], // Search by first and last name
    threshold: 0.3, // Lower threshold for more flexible matching
    includeScore: true, // Include match score in results
    ignoreLocation: true, // Search across the entire string
    minMatchCharLength: 5, // Minimum characters to match
  };

  const fuse = new Fuse(contacts, options);
  const results = fuse.search(query);

  return results.map(result => result.item); // Return the matched contacts
}

// Clean the search query
function cleanQuery(query) {
  return query
    .replace(/number|contact|phone|of|the/gi, '') // Remove common words
    .trim(); // Trim extra spaces
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i> Theme' : '<i class="fas fa-moon"></i> Theme';
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
    dropdownContent.classList.remove('active');
  }
});

// Toggle dropdown on button click
dropdownBtn.addEventListener('click', () => {
  dropdownContent.classList.toggle('active');
});

// Web Search Mode
let isWebSearchMode = false;

webBtn.addEventListener('click', () => {
  isWebSearchMode = !isWebSearchMode;
  webBtn.classList.toggle('active', isWebSearchMode);
  appendMessage(`Web search mode ${isWebSearchMode ? 'enabled' : 'disabled'}.`, 'bot');
});

// Voice Search Mode
let isVoiceSearchMode = false;

voiceBtn.addEventListener('click', () => {
  isVoiceSearchMode = !isVoiceSearchMode;
  voiceBtn.classList.toggle('active', isVoiceSearchMode);
  appendMessage(`Voice search mode ${isVoiceSearchMode ? 'enabled' : 'disabled'}.`, 'bot');
  
  if (isVoiceSearchMode) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = languageSelect.value;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      sendMessage();
    };
  }
});

// Send Message Function
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Chat History
let chatHistory = [];

// Send Message
async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to chat window
  appendMessage(userMessage, 'user');

  // Show typing animation
  const typingIndicator = appendTypingIndicator();

  let botMessage;
  if (userMessage.toLowerCase().includes('number') || userMessage.toLowerCase().includes('contact') || userMessage.toLowerCase().includes('phone')) {
    // Clean the query
    const nameQuery = cleanQuery(userMessage);
    const matchedContacts = searchContacts(nameQuery);

    if (matchedContacts.length > 0) {
      botMessage = matchedContacts.map(contact => 
        `Name: ${contact['First Name']} ${contact['Last Name']}, Phone: ${contact['Phone Number (Mobile)']}`
      ).join('\n'); // Use newline for better readability
    } else {
      botMessage = 'No matching contacts found.';
    }
  } else if (isWebSearchMode) {
    // Check if the user is asking for images
    if (userMessage.toLowerCase().includes('show me') || userMessage.toLowerCase().includes('picture of') || userMessage.toLowerCase().includes('image of')) {
      botMessage = await fetchImageResults(userMessage);
    } else {
      // Fetch a direct answer or web results
      botMessage = await fetchDirectAnswer(userMessage);
    }
  } else {
    // Check for custom response or fetch from OpenRouter
    botMessage = customResponses[userMessage.toLowerCase()] || await fetchOpenRouterResponse(userMessage);
  }

  // Simulate typing delay for all responses
  setTimeout(() => {
    // Remove typing indicator and add bot message
    chatWindow.removeChild(typingIndicator);
    appendMessage(botMessage, 'bot');

    // Add the query and response to chat history
    chatHistory.push({ query: userMessage, response: botMessage });

    // Provide proactive suggestions
    provideProactiveSuggestions(userMessage);

    // Clear input
    userInput.value = '';
  }, 1000); // 1-second typing delay
}

// Fetch response from OpenRouter API
async function fetchOpenRouterResponse(userMessage) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`, // Add 'Bearer' prefix
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href, // Required by OpenRouter
        'X-Title': 'JARVIS Chatbot' // Required by OpenRouter
      },
      body: JSON.stringify({
        model: 'qwen/qwen-vl-plus:free', // Ensure this is the correct model name
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data); // Log the response for debugging
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching response:', error);
    return 'Sorry, something went wrong. Please try again.';
  }
}

// Google Custom Search API Configuration
const GOOGLE_API_KEY = 'AIzaSyBKuGTaol29XXgdGOsZ5Pz001aH3uWJx74'; // Replace with your API key
const GOOGLE_CSE_ID = 'f650ca3150faf4cbc'; // Replace with your CSE ID

// Fetch a direct answer from the web
async function fetchDirectAnswer(query) {
  try {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const firstResult = data.items[0];
      const title = firstResult.title;
      const link = firstResult.link;
      const snippet = firstResult.snippet || 'No snippet available.';

      // Format the response with a direct answer
      return `➡️ ${snippet}\nRead more: ${link}`;
    } else {
      return 'No results found on the web.';
    }
  } catch (error) {
    console.error('Error fetching web response:', error);
    return 'Sorry, I couldn\'t fetch results from the web.';
  }
}

// Fetch image results from the web
async function fetchImageResults(query) {
  try {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&searchType=image`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const images = data.items.slice(0, 3).map(item => `<img src="${item.link}" alt="${item.title}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">`).join('');
      return `Here are some images I found: ${images}`;
    } else {
      return 'No images found on the web.';
    }
  } catch (error) {
    console.error('Error fetching image results:', error);
    return 'Sorry, I couldn\'t fetch images from the web.';
  }
}

// Provide Proactive Suggestions
function provideProactiveSuggestions(userMessage) {
  const suggestions = {
    'what is gravity': 'Would you like to learn about the laws of motion?',
    'who is elon musk': 'Would you like to know more about Tesla or SpaceX?',
    'what is nasa': 'Would you like to explore NASA\'s missions?',
    'what is 2/15': 'Would you like to solve more math problems?',
  };

  const suggestion = suggestions[userMessage.toLowerCase()];
  if (suggestion) {
    setTimeout(() => {
      appendMessage(`💡 ${suggestion}`, 'bot');
    }, 1000); // Show suggestion after 1 second
  }
}

// Append Message to Chat Window
function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${sender}-message`);
  if (sender === 'bot' && (message.includes('<a href="') || message.includes('<img src="'))) {
    messageElement.innerHTML = message; // Allow HTML for links and images
  } else {
    messageElement.textContent = message;
  }
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
