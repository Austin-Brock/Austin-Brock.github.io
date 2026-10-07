// dailyQuote.js

// Array of quotes
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "The day the soldiers stop bringing you their problems is the day you stopped leading them. They have either lost confidence that you can help them or concluded that you do not care. Either case is a failure of leadership.", author: "Colin Powell" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
    { text: "Limit your 'always' and your 'nevers.'", author: "Amy Poehler" },
    { text: "We become what we think about.", author: "Earl Nightingale" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston S. Churchill" },
    { text: "You have to be at your strongest when you're feeling at your weakest.", author: "Zachary Scott" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
    { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
    { text: "Let the young man in his desperation go out and hunt. If he kills the elephant, his poverty ends. If the elephant kills him, his poverty ends.", author: "African Proverb" },
    { text: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" },
    { text: "There are no solutions only trade offs. But you trade to get the best trade off you can, and thats all you can hope for.", author: "Thomas Sowell" },
    { text: "The only man who never makes mistakes is the man who never does anything.", author: "Theodore Roosevelt" },
    { text: "It’s only a dream if you leave it in the pillow", author: "Chuck Demmings" },
    
];

// Function to get today's quote based on the current date
function getDailyQuote() {
    const today = new Date();
    // Day of the year, not day of the month: getDate() only ever returns 1-31,
    // which is less than quotes.length, so the modulo never wrapped and every
    // quote past index 31 (plus index 0) could never be picked.
    // Counted via Date.UTC so a daylight-saving shift can't make two
    // consecutive days resolve to the same quote.
    const dayOfYear = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
         Date.UTC(today.getFullYear(), 0, 0)) / 86400000
    );
    const index = dayOfYear % quotes.length;
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
