let currentSearchTerm = '';

async function performSearch(searchTerm) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'performSearch',
            searchTerm: searchTerm
        });

        if (!response.success) {
            throw new Error(response.error);
        }

        document.getElementById('searchResults').innerHTML = '';
        displayResults(response.data);
        currentSearchTerm = searchTerm;
    } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error);
        document.getElementById('searchResults').innerHTML = 
            '<div class="error-message">검색 중 오류가 발생했습니다.</div>';
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    
    const items = results.items || [];
    
    if (!items || items.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }

    items.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const sourceTag = document.createElement('span');
        sourceTag.className = 'source-tag';
        sourceTag.textContent = result.blog.name;
        
        const title = document.createElement('a');
        title.className = 'result-title';
        title.href = result.url;
        title.target = '_blank';
        title.textContent = result.title;
        
        const meta = document.createElement('div');
        meta.className = 'result-meta';
        
        const writer = document.createElement('span');
        writer.className = 'result-writer';
        writer.textContent = result.writer.nickname;
        
        const date = document.createElement('span');
        date.className = 'result-date';
        date.textContent = new Date(result.createdAt).toLocaleDateString();
        
        meta.appendChild(writer);
        meta.appendChild(date);
        
        const description = document.createElement('p');
        description.className = 'result-description';
        description.textContent = result.content.replace(/\s+/g, ' ').trim().slice(0, 200) + '...';
        
        resultItem.appendChild(sourceTag);
        resultItem.appendChild(title);
        resultItem.appendChild(meta);
        resultItem.appendChild(description);
        resultsDiv.appendChild(resultItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value;
            if (searchTerm) {
                performSearch(searchTerm);
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}); 