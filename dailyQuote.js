// dailyQuote.js

$(document).ready(function() {
    var category = 'happiness'; // You can change the category if needed

    $.ajax({
        method: 'GET',
        url: 'https://api.api-ninjas.com/v1/quotes?category=' + category,
        headers: { 'X-Api-Key': '' }, // Replace with your actual API key
        contentType: 'application/json',
        success: function(result) {
            // Check if result has quotes
            if (result && result.length > 0) {
                // Get the first quote
                const quote = result[0];
                // Display the quote and author in the designated elements
                $('#quote-text').text(`"${quote.quote}"`);
                $('#quote-author').text(`- ${quote.author}`);
            } else {
                console.error('No quotes found');
            }
        },
        error: function ajaxError(jqXHR) {
            console.error('Error: ', jqXHR.responseText);
        }
    });
});

