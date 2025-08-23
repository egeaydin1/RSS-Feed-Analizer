// Yardımcı fonksiyon: RSSHub'dan veri çekme (retry ile)
async function fetchFromRSSHub(route, timeout = 15000, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${RSSHUB_BASE}${route}`;
      console.log(`Attempt ${attempt}: Fetching ${url}`);
      
      const response = await axios.get(url, {
        timeout,
        headers: { 
          'User-Agent': 'Portfolio-Tracker-API/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${route}:`, error.message);
      
      // Son deneme değilse bekle ve tekrar dene
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Son deneme de başarısız oldu
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        attempt: attempt
      };
    }
  }
}
