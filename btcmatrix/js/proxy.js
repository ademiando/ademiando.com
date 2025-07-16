// js/proxy.js
export async function fetchWithProxy(url) {
  try {
    // Gunakan proxy CORS
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(url), {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return response.json();
  } catch (error) {
    console.error('Proxy fetch error:', error);
    throw error;
  }
}