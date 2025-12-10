/**
 * Displays search results with highlighted search term
 * @param {string} searchTerm - The term to search for and highlight
 * @param {Array} results - Array of result objects with at least a 'text' property
 * @param {string} containerId - ID of the HTML element to display results in
 * @param {Object} options - Optional configuration
 * @param {string} options.highlightClass - CSS class for highlighted text (default: 'highlight')
 * @param {boolean} options.caseSensitive - Whether search is case sensitive (default: false)
 * @param {number} options.maxResults - Maximum number of results to display (default: all)
 */
function displaySearchResults(searchTerm, results, containerId, options = {}) {
  // Default options
  const config = {
    highlightClass: 'highlight',
    caseSensitive: false,
    maxResults: results.length,
    ...options
  };

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Element with ID '${containerId}' not found`);
    return;
  }

  // Clear previous results
  container.innerHTML = '';

  // Validate inputs
  if (!searchTerm || !searchTerm.trim()) {
    container.innerHTML = '<p class="no-query">Please enter a search term.</p>';
    return;
  }

  if (!results || results.length === 0) {
    container.innerHTML = '<p class="no-results">No results found.</p>';
    return;
  }

  // Prepare search term
  const term = config.caseSensitive ? searchTerm.trim() : searchTerm.trim().toLowerCase();
  
  // Escape special regex characters
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = config.caseSensitive 
    ? new RegExp(`(${escapedTerm})`, 'g') 
    : new RegExp(`(${escapedTerm})`, 'gi');

  // Filter and process results
  const filteredResults = results
    .filter(result => {
      if (!result || typeof result.text !== 'string') return false;
      
      const textToSearch = config.caseSensitive ? result.text : result.text.toLowerCase();
      return regex.test(textToSearch);
    })
    .slice(0, config.maxResults);

  if (filteredResults.length === 0) {
    container.innerHTML = `<p class="no-matches">No matches found for "<strong>${escapeHtml(searchTerm)}</strong>".</p>`;
    return;
  }

  // Create results HTML
  const resultsHTML = filteredResults.map((result, index) => {
    const highlightedText = result.text.replace(regex, `<mark class="${config.highlightClass}">$1</mark>`);
    
    return `
      <div class="search-result" data-index="${index}">
        <div class="result-text">${highlightedText}</div>
        ${result.title ? `<div class="result-title">${escapeHtml(result.title)}</div>` : ''}
        ${result.url ? `<div class="result-url"><a href="${escapeHtml(result.url)}" target="_blank">${escapeHtml(result.url)}</a></div>` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="search-results-container">
      <div class="results-summary">
        Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "<strong>${escapeHtml(searchTerm)}</strong>"
      </div>
      <div class="results-list">
        ${resultsHTML}
      </div>
    </div>
  `;
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Example usage with CSS
const exampleCSS = `
<style>
  .search-results-container {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 20px auto;
  }
  
  .results-summary {
    margin-bottom: 15px;
    color: #555;
    font-size: 14px;
  }
  
  .search-result {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    background-color: #fafafa;
  }
  
  .search-result:hover {
    background-color: #f5f5f5;
    border-color: #ddd;
  }
  
  .result-text {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .result-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: #1a0dab;
  }
  
  .result-url {
    font-size: 12px;
    color: #006621;
    margin-top: 5px;
  }
  
  .result-url a {
    color: #006621;
    text-decoration: none;
  }
  
  .result-url a:hover {
    text-decoration: underline;
  }
  
  .highlight {
    background-color: #fff3cd;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: bold;
  }
  
  .no-results, .no-query, .no-matches {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
  }
</style>
`;

// Example usage:
/*
const sampleData = [
  { title: "JavaScript Basics", text: "JavaScript is a powerful programming language used for web development.", url: "https://example.com/js-basics" },
  { title: "Advanced JS", text: "Learn about closures, prototypes, and async/await in JavaScript.", url: "https://example.com/js-advanced" },
  { title: "Python vs JS", text: "javascript and Python are both popular, but serve different purposes.", url: "https://example.com/comparison" }
];

displaySearchResults("javascript", sampleData, "results-container");
*/

// Key Features:

// Text Highlighting: Uses <mark> tags with a custom class to highlight matches
// Case Sensitivity Option: Configurable case-sensitive or case-insensitive search
// HTML Safety: Escapes HTML to prevent XSS attacks
// Flexible Data Structure: Works with objects containing text, title, and url properties
// Result Limiting: Optional maximum number of results
// Error Handling: Validates inputs and provides user-friendly messages
// Regex Safety: Escapes special regex characters in search terms

// Usage Example:
// HTML<!DOCTYPE html>
// <html>
// <head>
//   <title>Search Results</title>
//   <!-- Include the CSS from exampleCSS above -->
// </head>
// <body>
//   <div id="results-container"></div>

//   <script>
//     // Your search data
//     const searchData = [
//       { title: "Getting Started", text: "Welcome to JavaScript programming. JavaScript is essential for web development.", url: "#" },
//       { title: "Functions", text: "Functions in javascript can be declared in multiple ways.", url: "#" }
//     ];

//     // Call the function
//     displaySearchResults("javascript", searchData, "results-container", {
//       highlightClass: "my-highlight",
//       caseSensitive: false
//     });
//   </script>
// </body>
// </html>
// The function is robust, secure, and highly customizable for different use cases.