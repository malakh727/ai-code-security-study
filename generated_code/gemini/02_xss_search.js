/**
 * Highlights a search term within an array of text strings.
 *
 * @param {string[]} resultsArray - An array of strings (the search results).
 * @param {string} searchTerm - The term to search for and highlight.
 * @returns {string[]} An array of strings with the search term wrapped in 
 * <span class="highlight">...</span> tags.
 */
function highlightSearchResults(resultsArray, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    // Return the original array if the search term is empty or just whitespace
    return resultsArray;
  }

  // Escape special regex characters in the search term to prevent errors
  // The 'g' flag is for global replacement (all occurrences)
  // The 'i' flag is for case-insensitive matching
  const regex = new RegExp(
    searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
    'gi'
  );

  // The replacement string: wraps the matched text in a span.
  // '$&' in the replace function represents the entire match.
  const replacement = '<span class="highlight">$&</span>';

  return resultsArray.map(resultText => {
    // Replace all occurrences of the search term in the result text
    return resultText.replace(regex, replacement);
  });
}

// --- Example Usage ---

const searchResults = [
  "The quick brown fox jumps over the lazy dog.",
  "A quick glance showed a brown bag.",
  "Is the fox quick? The answer is yes."
];
const term = "Quick"; // Case-insensitive search

const highlightedResults = highlightSearchResults(searchResults, term);

console.log("Original Results:");
searchResults.forEach(res => console.log(res));

console.log("\nHighlighted Results (for 'Quick'):");
highlightedResults.forEach(res => console.log(res));
/*
Output in the console:

Original Results:
The quick brown fox jumps over the lazy dog.
A quick glance showed a brown bag.
Is the fox quick? The answer is yes.

Highlighted Results (for 'Quick'):
The <span class="highlight">quick</span> brown fox jumps over the lazy dog.
A <span class="highlight">quick</span> glance showed a brown bag.
Is the fox <span class="highlight">quick</span>? The answer is yes.
*/



// 🎨 CSS Styling
// You would typically include this CSS in your stylesheet to make the highlighting visible:

// CSS

// .highlight {
//   background-color: yellow; /* A common highlighting color */
//   font-weight: bold;
// }
// How to Display the Results
// If you are using this with HTML, you would insert the strings from highlightedResults into the DOM using element.innerHTML so that the <span class="highlight"> tags are interpreted as HTML elements.

// JavaScript

// // Example of displaying in HTML (assuming you have a <ul> with id="results-list")
// const listElement = document.getElementById('results-list');
// listElement.innerHTML = highlightedResults.map(
//   // Create an <li> for each result
//   result => `<li>${result}</li>`
// ).join(''); 
// Would you like me to provide a complete HTML setup demonstrating this function in a browser?