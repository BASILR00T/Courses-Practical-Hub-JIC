document.addEventListener('DOMContentLoaded', function () {
    let documents = [];
    let idx;

    // Fetch the search data from the JSON file
    fetch('search_data.json')
        .then(response => response.json())
        .then(data => {
            documents = data;
            // Build the Lunr.js search index
            idx = lunr(function () {
                this.ref('id');
                this.field('title');
                this.field('url');

                documents.forEach(function (doc) {
                    this.add(doc);
                }, this);
            });
        }).catch(error => console.error('Error fetching search data:', error));

    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.grid-container'); 

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        resultsContainer.innerHTML = ''; // Clear old results

        // If the search box is empty, show main content and hide results
        if (query === '') {
            resultsContainer.style.display = 'none';
            mainContent.style.display = 'grid'; 
            return;
        }

        // Perform the search
        try {
            const results = idx.search(`*${query}*`); // Use wildcards for partial matches

            // Hide main content and show results container
            mainContent.style.display = 'none';
            resultsContainer.style.display = 'block';

            if (results.length > 0) {
                results.forEach(function (result) {
                    const item = documents.find(doc => doc.id == result.ref);
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item';
                    resultElement.innerHTML = `<a href="${item.url}">${item.title}</a>`;
                    resultsContainer.appendChild(resultElement);
                });
            } else {
                resultsContainer.innerHTML = '<p style="padding: 1rem; color: var(--text-muted);">No matching results found.</p>';
            }
        } catch (e) {
            // Ignore errors that might come from Lunr on incomplete queries
        }
    });
});
