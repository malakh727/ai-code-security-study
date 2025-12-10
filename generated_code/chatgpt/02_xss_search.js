function displaySearchResults(results, searchTerm, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear previous results

  if (!searchTerm) {
    container.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightRegex = new RegExp(`(${escapedTerm})`, "gi");

  results.forEach(text => {
    const highlightedText = text.replace(
      highlightRegex,
      '<span class="highlight">$1</span>'
    );

    const div = document.createElement("div");
    div.innerHTML = highlightedText;
    container.appendChild(div);
  });
}


// ✅ Example Usage
// <input type="text" id="searchInput" placeholder="Search..." />
// <button onclick="search()">Search</button>
// <div id="results"></div>
//
// <script>
//   const data = [
//     "JavaScript is amazing",
//     "Learn HTML, CSS and JavaScript",
//     "Search functionality with highlight",
//     "Frontend development basics"
//   ];

//   function search() {
//     const term = document.getElementById("searchInput").value;
//     displaySearchResults(data, term, "results");
//   }
// </script>

// ✅ CSS for Highlighting
// .highlight {
//   background-color: yellow;
//   font-weight: bold;
// }