// Updated server.js with better RSSHub handling
// RSSHub instance with fallback support
const RSSHUB_PRIMARY = 'https://rsshub-production-82c7.up.railway.app';
const RSSHUB_FALLBACKS = [
  'https://rsshub.app',
  'https://rss.shab.fun',
  'https://rsshub.rssforever.com'
];

// Improved RSSHub fetch with better error handling
async function fetchFromRSSHub(route, timeout = 30000) {
  const instances = [RSSHUB_PRIMARY, ...RSSHUB_FALLBACKS];
  const errors = [];
  
  for (let i = 0; i < instances.length; i++) {
    const baseUrl = instances[i];
    const isPrimary = (i === 0);
    
    try {
      const url = `${baseUrl}${route}`;
      console.log(`[Attempt ${i+1}/${instances.length}] ${isPrimary ? '(PRIMARY)' : '(FALLBACK)'} ${baseUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await axios.get(url, {
        signal: controller.signal,
        timeout: timeout - 1000, // Axios timeout slightly less than AbortController
        headers: { 
          'User-Agent': 'Portfolio-RSS-API/1.0 (https://github.com/egeaydin1/RSS-Feed-Analizer)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Only accept 2xx status codes
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`✅ Success with ${baseUrl} (${response.status})`);
      console.log(`📊 Response size: ${response.data.length} chars`);
      
      return { 
        success: true, 
        data: response.data,
        usedInstance: baseUrl,
        isPrimary: isPrimary,
        attempt: i + 1,
        responseSize: response.data.length
      };
      
    } catch (error) {
      clearTimeout && clearTimeout(timeoutId);
      
      const errorInfo = {
        instance: baseUrl,
        status: error.response?.status || 'NETWORK_ERROR',
        message: error.message,
        code: error.code || 'UNKNOWN',
        attempt: i + 1,
        isPrimary: isPrimary
      };
      
      errors.push(errorInfo);
      
      // Log different error types
      if (error.response?.status === 503) {
        console.log(`❌ [${i+1}] Service Unavailable (503): ${baseUrl}`);
      } else if (error.response?.status === 429) {
        console.log(`⚠️  [${i+1}] Rate Limited (429): ${baseUrl}`);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏰ [${i+1}] Timeout: ${baseUrl}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`🚫 [${i+1}] Connection Refused: ${baseUrl}`);
      } else {
        console.log(`❌ [${i+1}] ${errorInfo.status} - ${error.message}: ${baseUrl}`);
      }
      
      // For primary instance, wait a bit longer before trying fallback
      if (isPrimary && i < instances.length - 1) {
        console.log(`⏳ Waiting 3s before trying fallback...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else if (i < instances.length - 1) {
        // Quick retry for fallbacks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // All instances failed
  console.error(`💥 All ${instances.length} RSSHub instances failed:`, errors);
  
  // Determine the most common error
  const errorCounts = {};
  errors.forEach(err => {
    const key = err.status;
    errorCounts[key] = (errorCounts[key] || 0) + 1;
  });
  
  const mostCommonError = Object.entries(errorCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '503';
  
  return { 
    success: false, 
    error: `All RSSHub instances unavailable`,
    primaryError: errors[0]?.message || 'Primary instance failed',
    mostCommonStatus: mostCommonError,
    errors: errors,
    totalAttempts: instances.length,
    suggestion: mostCommonError === '503' ? 
      'Service temporarily unavailable. Try again in a few minutes.' :
      mostCommonError === '429' ?
      'Rate limited. Please reduce request frequency.' :
      'Network or configuration issue. Check your connection.'
  };
}

// Enhanced error response helper
function createErrorResponse(baseError, route, companyData = null) {
  const response = {
    success: false,
    error: baseError.error || 'RSSHub fetch failed',
    details: baseError.primaryError || baseError.error,
    route: route,
    timestamp: new Date().toISOString()
  };
  
  if (companyData) {
    response.company = companyData;
  }
  
  if (baseError.suggestion) {
    response.suggestion = baseError.suggestion;
  }
  
  if (baseError.totalAttempts) {
    response.meta = {
      instancesAttempted: baseError.totalAttempts,
      mostCommonStatus: baseError.mostCommonStatus,
      canRetry: baseError.mostCommonStatus !== '404'
    };
  }
  
  return response;
}

// Update the news endpoint to use better error handling
app.get('/api/news/:company', async (req, res) => {
  const { company } = req.params;
  const { limit = 10, format = 'json', lang = 'tr' } = req.query;
  
  const companyData = PORTFOLIO_COMPANIES[company.toLowerCase()];
  if (!companyData) {
    return res.status(404).json({
      success: false,
      error: 'Şirket bulunamadı',
      availableCompanies: Object.keys(PORTFOLIO_COMPANIES)
    });
  }

  try {
    const route = `/google/news/${companyData.keywords}`;
    console.log(`🔄 Fetching news for ${companyData.name} (${companyData.symbol})`);
    
    const result = await fetchFromRSSHub(route, 30000); // 30 second timeout

    if (!result.success) {
      const errorResponse = createErrorResponse(result, route, companyData);
      
      // Return appropriate HTTP status based on error type
      const httpStatus = result.mostCommonStatus === '429' ? 429 :
                        result.mostCommonStatus === '503' ? 503 : 500;
      
      return res.status(httpStatus).json(errorResponse);
    }

    if (format === 'xml') {
      return res.set('Content-Type', 'application/rss+xml').send(result.data);
    }

    const newsData = await parseRSSFeed(result.data);
    if (newsData.error) {
      return res.status(500).json({
        success: false,
        error: 'RSS verisi işlenemedi',
        details: newsData.error,
        company: companyData
      });
    }

    newsData.items = newsData.items.slice(0, Math.min(parseInt(limit), 50));

    res.json({
      success: true,
      company: companyData,
      totalItems: newsData.items.length,
      lastUpdated: newsData.lastUpdated,
      news: newsData.items,
      meta: {
        rssHubRoute: route,
        usedInstance: result.usedInstance,
        isPrimaryInstance: result.isPrimary,
        responseSize: result.responseSize,
        fetchedAt: new Date().toISOString(),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error(`Unexpected error for ${company}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Beklenmeyen hata',
      details: error.message,
      company: companyData,
      timestamp: new Date().toISOString()
    });
  }
});
