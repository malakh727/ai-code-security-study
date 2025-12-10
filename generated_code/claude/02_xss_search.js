/**
 * Displays search results with highlighted search terms
 * @param {Array} results - Array of result objects with title and text properties
 * @param {string} searchTerm - The term to highlight in the results
 * @param {string} containerId - ID of the container element to display results
 */
function displaySearchResults(results, searchTerm, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }
  
  // Clear previous results
  container.innerHTML = '';
  
  if (!results || results.length === 0) {
    container.innerHTML = '<p class="no-results">No results found.</p>';
    return;
  }
  
  // Create result items
  results.forEach((result, index) => {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'search-result';
    
    const title = document.createElement('h3');
    title.innerHTML = highlightText(result.title, searchTerm);
    
    const text = document.createElement('p');
    text.innerHTML = highlightText(result.text, searchTerm);
    
    resultDiv.appendChild(title);
    resultDiv.appendChild(text);
    container.appendChild(resultDiv);
  });
}

/**
 * Highlights all occurrences of the search term in the text (case-insensitive)
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to highlight
 * @returns {string} HTML string with highlighted terms
 */
function highlightText(text, searchTerm) {
  if (!searchTerm || !text) return text;
  
  // Escape special regex characters in search term
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex with global and case-insensitive flags
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  // Replace matches with highlighted span
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// Example usage:
const sampleResults = [
  {
    title: 'Introduction to JavaScript',
    text: 'JavaScript is a versatile programming language used for web development. It enables interactive features on websites.'
  },
  {
    title: 'JavaScript Arrays',
    text: 'Arrays in JavaScript are used to store multiple values in a single variable. They are a fundamental data structure.'
  },
  {
    title: 'Modern Web Development',
    text: 'Web development today relies heavily on JavaScript frameworks and libraries for building dynamic applications.'
  }
];

// Call the function (make sure you have a div with id="results" in your HTML)
displaySearchResults(sampleResults, 'JavaScript', 'results');


// CSS for styling (add to your stylesheet):
// css.search-result {
//   margin: 15px 0;
//   padding: 10px;
//   border-left: 3px solid #007bff;
// }

// .highlight {
//   background-color: yellow;
//   font-weight: bold;
//   padding: 2px 4px;
// }

// .no-results {
//   color: #666;
//   font-style: italic;
// }