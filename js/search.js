let searchTimeout = null;
let currentPage = 1;
let isLoading = false;
let lastSearchTerm = '';

function debounceSearch(searchTerm) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (searchTerm.trim()) {
            if (lastSearchTerm !== searchTerm) {
                currentPage = 1;
                document.getElementById('searchResults').innerHTML = '';
            }
            lastSearchTerm = searchTerm;
            performSearch(searchTerm, currentPage);
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    }, 300);
}

async function performSearch(searchTerm, page) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        const response = await chrome.runtime.sendMessage({
            type: 'performSearch',
            searchTerm: searchTerm,
            sort: 'score',
            period: 'all',
            page: page,
            size: 10
        });

        if (!response || !response?.success) {
            throw new Error(response?.error || '검색에 실패했습니다.');
        }

        if (page === 1) {
            document.getElementById('searchResults').innerHTML = '';
        }

        displayResults(response?.data);

        const loadMoreButton = document.getElementById('loadMoreButton');
        if (loadMoreButton) {
            loadMoreButton.remove();
        }

        if (response?.data?.hasNextPage) {
            addLoadMoreButton();
        }

    } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error);
        document.getElementById('searchResults').innerHTML = 
            '<div class="error-message">검색 중 오류가 발생했습니다.</div>';
    } finally {
        isLoading = false;
    }
}

function addLoadMoreButton() {
    const resultsDiv = document.getElementById('searchResults');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.id = 'loadMoreButton';
    loadMoreButton.className = 'load-more-button';
    loadMoreButton.textContent = '더보기';
    loadMoreButton.onclick = () => {
        loadMoreButton.classList.add('loading');
        loadMoreButton.textContent = '불러오는 중...';
        currentPage++;
        performSearch(lastSearchTerm, currentPage);
    };
    resultsDiv.appendChild(loadMoreButton);
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
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            debounceSearch(this.value);
        });
    }
}); 