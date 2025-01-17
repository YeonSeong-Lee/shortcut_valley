/**
 * @param request {{
 *   type: 'performSearch',
 *   searchTerm: string,
 *   sort: string | 'score' | 'date',
 *   period: string,
 *   page: number,
 *   size: number
 * }}
 * @param sender {tab: {id: number}}
 * @param sendResponse {function(response: {success: boolean, data: any, error: string})}
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'performSearch') {
    const { searchTerm, sort = 'score', period = 'all', page = 1, size = 10 } = request;
    
    const url = new URL('https://api.valley.town/blog-posts');
    url.searchParams.set('query', searchTerm);
    url.searchParams.set('sort', sort);
    url.searchParams.set('period', period);
    url.searchParams.set('page', page);
    url.searchParams.set('size', size);

    fetch(url.toString())
      .then(response => response.json())
      .then(data => {
        sendResponse({ 
          success: true, 
          data: data,
          from: 'blog-posts',
          hasNextPage: data.hasNextPage
        });
      })
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error.message,
          from: 'blog-posts',
          hasNextPage: false
        });
      });
    return true;
  }
}); 