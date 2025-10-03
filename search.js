document.addEventListener('DOMContentLoaded', function () {
    let documents = [];
    let idx;

    // Fetch the search data
    fetch('search_data.json')
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
            if(mainContent) mainContent.style.display = 'grid'; 
            return;
        }

        try {
            const results = idx.search(query);

            if(mainContent) mainContent.style.display = 'none';
            resultsContainer.style.display = 'block';

            if (results.length > 0) {
                results.forEach(function (result) {
                    const item = documents.find(doc => doc.id == result.ref);
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item';
                    
                    // Create a relative URL from the current page
                    let currentPath = window.location.pathname;
                    let basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                    let relativeUrl = item.url;
                    
                    // Adjust URL if searching from a subdirectory
                    if (!currentPath.endsWith('/') && !currentPath.endsWith('.html')) {
                         basePath = currentPath;
                    }
                    if(basePath.includes('/PCCT') || basePath.includes('/NOS') || basePath.includes('/Network2') || basePath.includes('/Programming')) {
                       // We are in a subfolder, need to go up one level
                       relativeUrl = '../' + item.url;
                    }


                    resultElement.innerHTML = `<a href="${relativeUrl}">${item.title}</a>`;
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