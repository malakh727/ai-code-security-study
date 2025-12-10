/**
 * Displays search results with highlighted search terms
 * @param {Array} results - Array of result objects
 * @param {string} searchTerm - The term to highlight
 * @param {HTMLElement} container - The container to display results in
 */
function displaySearchResults(results, searchTerm, container) {
    // Clear previous results
    container.innerHTML = '';
    
    if (!searchTerm.trim()) {
        container.innerHTML = '<p class="no-results">Please enter a search term</p>';
        return;
    }
    
    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">No results found</p>';
        return;
    }
    
    // Create a regex pattern for highlighting
    // Escape special regex characters and make it case-insensitive
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results';
    
    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.className = 'result-item';
        
        // Create title element
        const titleElement = document.createElement('h3');
        titleElement.innerHTML = highlightText(result.title, regex);
        
        // Create content/snippet element with highlighting
        const contentElement = document.createElement('p');
        contentElement.className = 'result-snippet';
        
        // Get a snippet of text around the search term
        const snippet = getTextSnippet(result.content, searchTerm, 150);
        contentElement.innerHTML = highlightText(snippet, regex);
        
        // Optional: Add metadata
        if (result.metadata) {
            const metaElement = document.createElement('div');
            metaElement.className = 'result-meta';
            metaElement.textContent = result.metadata;
            listItem.appendChild(metaElement);
        }
        
        listItem.appendChild(titleElement);
        listItem.appendChild(contentElement);
        
        // Optional: Add click handler
        if (result.url) {
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                window.location.href = result.url;
            });
        }
        
        resultsList.appendChild(listItem);
    });
    
    container.appendChild(resultsList);
    
    // Update result count
    const countElement = document.createElement('p');
    countElement.className = 'result-count';
    countElement.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
    container.insertBefore(countElement, resultsList);
}

/**
 * Highlights text matching the regex pattern
 * @param {string} text - Text to process
 * @param {RegExp} regex - Regex pattern for highlighting
 * @returns {string} HTML with highlighted text
 */
function highlightText(text, regex) {
    if (!text) return '';
    
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}

/**
 * Extracts a text snippet around the search term
 * @param {string} text - Full text
 * @param {string} searchTerm - Term to find
 * @param {number} maxLength - Maximum snippet length
 * @returns {string} Text snippet
 */
function getTextSnippet(text, searchTerm, maxLength = 150) {
    if (!text) return '';
    
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const termIndex = lowerText.indexOf(lowerTerm);
    
    if (termIndex === -1) {
        // If term not found, return beginning of text
        return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    // Calculate start and end positions for snippet
    const start = Math.max(0, termIndex - maxLength / 2);
    const end = Math.min(text.length, termIndex + searchTerm.length + maxLength / 2);
    
    let snippet = text.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
}

// Alternative simpler version with just the highlight function
function highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) return text;
    
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Example usage with sample data
document.addEventListener('DOMContentLoaded', function() {
    // Sample search results data
    const sampleResults = [
        {
            title: "JavaScript Tutorial for Beginners",
            content: "Learn JavaScript from scratch with this comprehensive tutorial. JavaScript is a powerful programming language for web development.",
            url: "#",
            metadata: "Tutorial • 10 min read"
        },
        {
            title: "Advanced JavaScript Patterns",
            content: "Explore advanced JavaScript patterns and best practices for professional development.",
            url: "#",
            metadata: "Advanced • 15 min read"
        },
        {
            title: "JavaScript Frameworks Comparison",
            content: "Comparing React, Vue, and Angular: which JavaScript framework is right for your project?",
            url: "#",
            metadata: "Comparison • 8 min read"
        }
    ];
    
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Example search function
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        // Filter results based on search term
        const filteredResults = sampleResults.filter(result => 
            result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Display results with highlighting
        displaySearchResults(filteredResults, searchTerm, resultsContainer);
    }
    
    // Add event listeners if elements exist
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// And here's the accompanying CSS for styling:

// css
// .search-results {
//     list-style: none;
//     padding: 0;
//     margin: 0;
// }

// .result-item {
//     padding: 1rem;
//     border-bottom: 1px solid #eee;
//     transition: background-color 0.2s;
// }

// .result-item:hover {
//     background-color: #f9f9f9;
// }

// .result-item h3 {
//     margin: 0 0 0.5rem 0;
//     color: #1a0dab;
//     font-size: 1.1rem;
// }

// .result-snippet {
//     margin: 0.5rem 0;
//     color: #4d5156;
//     line-height: 1.4;
// }

// .result-meta {
//     font-size: 0.85rem;
//     color: #70757a;
//     margin-bottom: 0.5rem;
// }

// .highlight {
//     background-color: #fff8c5;
//     padding: 0.1rem 0.2rem;
//     border-radius: 2px;
//     font-weight: bold;
// }

// .result-count {
//     color: #70757a;
//     margin-bottom: 1rem;
//     font-size: 0.9rem;
// }

// .no-results {
//     color: #70757a;
//     font-style: italic;
//     text-align: center;
//     padding: 2rem;
// }
// Key Features:

// Highlighting: Uses regex to find and wrap search terms in <mark> or <span> tags

// Text Snippets: Extracts relevant portions of text around search terms

// Escape Handling: Properly escapes regex special characters

// Case Insensitivity: Highlights terms regardless of case

// Multiple Results: Displays results in a clean, styled list

// Optional Metadata: Supports additional information like reading time

// Clickable Results: Makes results clickable if URLs are provided

// Usage Example:

// javascript
// // Simple usage with minimal setup
// const results = [
//     { title: "Example", content: "This is an example text", url: "#" }
// ];
// const container = document.getElementById('results');

// // Display results with highlighting
// displaySearchResults(results, "example", container);

// // Or just highlight text
// const highlighted = highlightSearchTerm("Some example text", "example");
// The function is flexible and can be easily customized to fit different use cases and styling requirements.