document.addEventListener('DOMContentLoaded', function () {
    let documents = [];
    let idx;
    // Determine the base path for fetching the JSON file
    let pathPrefix = '.';
    const path = window.location.pathname;

    // Check for nested depth first (e.g. Programming/Python)
    if (path.includes('/Programming/Python/')) {
        pathPrefix = '../..';
    }
    // Check for standard depth
    else if (path.includes('/PCCT/') ||
        path.includes('/NOSs/') ||
        path.includes('/Network1/') ||
        path.includes('/Network2/') ||
        path.includes('/Intro_to_web_design/') ||
        path.includes('/Programming/')) {
        pathPrefix = '..';
    }

    // Fetch the search data
    fetch(`${pathPrefix}/search_data.json`)
        .then(response => response.json())
        .then(data => {
            documents = data;
            // Build the Lunr.js index
            idx = lunr(function () {
                this.ref('id');
                this.field('title', { boost: 10 }); // Boost title matches
                this.field('content');

                documents.forEach(function (doc) {
                    this.add(doc);
                }, this);
            });
        }).catch(error => console.error('Error fetching search data:', error));

    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.getElementById('main-content');

    searchInput.addEventListener('keyup', function () {
        const query = this.value.trim();
        resultsContainer.innerHTML = '';

        if (query === '') {
            resultsContainer.style.display = 'none';
            if (mainContent) mainContent.style.display = 'grid';
            return;
        }

        try {
            const results = idx.search(`*${query}*`); // Use wildcards for partial matches

            if (mainContent) mainContent.style.display = 'none';
            resultsContainer.style.display = 'block';

            if (results.length > 0) {
                results.forEach(function (result) {
                    const item = documents.find(doc => doc.id == result.ref);
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item';

                    // Construct the correct relative URL
                    const resultUrl = `${pathPrefix}/${item.url}`;

                    resultElement.innerHTML = `<a href="${resultUrl}">${item.title}</a>`;
                    resultsContainer.appendChild(resultElement);
                });
            } else {
                resultsContainer.innerHTML = '<p style="color: var(--text-muted);">No matching results found.</p>';
            }
        } catch (e) {
            // Ignore errors from incomplete search queries
        }
    });
});