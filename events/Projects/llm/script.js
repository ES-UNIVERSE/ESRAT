// Nav Bar Toggle
const navIcon = document.getElementById("nav-icon");
const navMenu = document.getElementById("nav-menu");

navIcon.addEventListener("click", () => {
    navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
    navIcon.classList.toggle("open");
});

// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.innerHTML = document.body.classList.contains("dark-mode") ? '<i class="fas fa-sun"></i> Theme' : '<i class="fas fa-moon"></i> Theme';
});

// Replace with your OpenRouter API key
const OPENROUTER_API_KEY = "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";

// Load custom responses from responses.json
let customResponses = {};

async function loadCustomResponses() {
    try {
        const response = await fetch("responses.json");
        customResponses = await response.json();
    } catch (error) {
        console.error("Failed to load custom responses: ", error);
    }
}

// Function to get a response (custom or from OpenRouter)
async function getResponse(userInput) {
    userInput = userInput.toLowerCase().trim();

    // Check for custom responses
    for (const [question, response] of Object.entries(customResponses)) {
        if (userInput.includes(question)) {
            return response;
        }
    }

    // If no custom response, use OpenRouter API
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.href, // Optional: Your site URL
            "X-Title": "My Chatbot" // Optional: Your site name
        },
        body: JSON.stringify({
            model: "qwen/qwen2.5-vl-72b-instruct:free", // Replace with your preferred model
            messages: [
                {
                    role: "user",
                    content: userInput
                }
            ]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Chatbot Functionality
async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    const chatOutput = document.getElementById("chat-output");

    // Add user message
    chatOutput.innerHTML += `
        <div class="chat-message user">
            <div class="message">${userInput}</div>
        </div>
    `;

    // Clear input
    document.getElementById("user-input").value = "";

    // Add typing animation
    chatOutput.innerHTML += `
        <div class="chat-message bot">
            <div class="message typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    // Scroll to bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;

    // Get bot response
    try {
        const botResponse = await getResponse(userInput);
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.innerHTML = `
            ${botResponse}
            <button class="copy-button"><i class="fas fa-copy"></i></button>
        `;
        document.querySelector(".typing").replaceWith(messageDiv);

        // Add click event to the new copy button
        const copyButton = messageDiv.querySelector(".copy-button");
        copyButton.addEventListener("click", () => {
            copyToClipboard(botResponse);
        });

        // Scroll to top when new message is sent
        chatOutput.scrollTop = 0;
    } catch (error) {
        console.error("Error fetching response: ", error);
    }
}

// Send message on Enter key press
document.getElementById("user-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior
        sendMessage(); // Call the sendMessage function
    }
});

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard: " + text);
    }).catch((err) => {
        console.error("Failed to copy: ", err);
    });
}

// Load custom responses when the page loads
loadCustomResponses();