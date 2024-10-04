// dailyQuote.js

// Array of quotes
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
];

// Function to get today's quote based on the current date
function getDailyQuote() {
    const today = new Date();
    const index = today.getDate() % quotes.length; // Use the day of the month to select a quote
    return quotes[index];
}

// Function to display the quote
function displayQuote() {
    const quote = getDailyQuote();
    document.getElementById("quote-text").innerText = `"${quote.text}"`;
    document.getElementById("quote-author").innerText = `- ${quote.author}`;
}

// Call displayQuote when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", displayQuote);
