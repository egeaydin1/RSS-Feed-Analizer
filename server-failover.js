// RSSHub base URL - Multiple instances with failover
const RSSHUB_INSTANCES = [
  'https://rsshub-production-82c7.up.railway.app', // Primary instance
  'https://rsshub.app',                             // Official
  'https://rss.shab.fun',                          // Alternative
  'https://rsshub.rssforever.com'                  // Community
];

// Yardımcı fonksiyon: Failover ile RSSHub'dan veri çekme
async function fetchFromRSSHub(route, timeout = 20000) {
  const errors = [];
  
  for (let i = 0; i < RSSHUB_INSTANCES.length; i++) {
    const baseUrl = RSSHUB_INSTANCES[i];
    
    try {
      const url = `${baseUrl}${route}`;
      console.log(`[${i+1}/${RSSHUB_INSTANCES.length}] Trying: ${baseUrl}`);
      
      const response = await axios.get(url, {
        timeout,
        headers: { 
          'User-Agent': 'Portfolio-RSS-API/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`✅ Success with: ${baseUrl}`);
      return { 
        success: true, 
        data: response.data,
        usedInstance: baseUrl,
        attempt: i + 1
      };
      
    } catch (error) {
      const errorInfo = {
        instance: baseUrl,
        status: error.response?.status || 'NETWORK_ERROR',
        message: error.message,
        attempt: i + 1
      };
      
      errors.push(errorInfo);
      console.log(`❌ [${i+1}] Failed ${baseUrl}: ${errorInfo.status} - ${error.message}`);
      
      // Son deneme değilse kısa bir bekle
      if (i < RSSHUB_INSTANCES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
  
  // Tüm instance'lar başarısız
  console.error('All RSSHub instances failed:', errors);
  return { 
    success: false, 
    error: 'All RSSHub instances unavailable',
    status: 503,
    errors: errors,
    totalAttempts: RSSHUB_INSTANCES.length
  };
}
