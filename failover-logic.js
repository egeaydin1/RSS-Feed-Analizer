// Multiple RSSHub instances (failover)
const RSSHUB_INSTANCES = [
  'https://rsshub-production-82c7.up.railway.app', // Your primary instance
  'https://rsshub.app',                             // Official instance
  'https://rss.shab.fun',                          // Alternative instance
  'https://rsshub.rssforever.com',                 // Another alternative
  'https://rsshub.liunian.moe'                     // Community instance
];

// Yardımcı fonksiyon: Failover ile RSSHub'dan veri çekme
async function fetchFromRSSHubWithFailover(route, timeout = 15000) {
  for (const baseUrl of RSSHUB_INSTANCES) {
    try {
      const url = `${baseUrl}${route}`;
      console.log(`Trying: ${url}`);
      
      const response = await axios.get(url, {
        timeout,
        headers: { 
          'User-Agent': 'Portfolio-Tracker-API/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      console.log(`✅ Success with: ${baseUrl}`);
      return { success: true, data: response.data, usedInstance: baseUrl };
      
    } catch (error) {
      console.log(`❌ Failed with ${baseUrl}: ${error.message}`);
      
      // 503 veya 502 ise diğer instance'ı dene
      if (error.response?.status === 503 || error.response?.status === 502) {
        continue;
      }
      
      // Diğer hatalar için de devam et ama biraz bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
  }
  
  return { 
    success: false, 
    error: 'All RSSHub instances failed',
    status: 503,
    triedInstances: RSSHUB_INSTANCES.length
  };
}
