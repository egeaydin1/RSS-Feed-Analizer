// Portfolio RSS API - Complete Express.js Implementation
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { parseStringPromise } = require('xml2js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// RSSHub base URL - Railway deployment
const RSSHUB_BASE = 'https://rsshub-production-82c7.up.railway.app';

// Portfolio şirketleri ve arama terimleri
const PORTFOLIO_COMPANIES = {
  'nvidia': {
    name: 'NVIDIA Corporation',
    symbol: 'NVDA',
    keywords: 'NVIDIA+stock+earnings+AI+chips+semiconductor',
    sector: 'semiconductor'
  },
  'tsmc': {
    name: 'Taiwan Semiconductor Manufacturing',
    symbol: 'TSM', 
    keywords: 'Taiwan+Semiconductor+TSMC+earnings+chips+manufacturing',
    sector: 'semiconductor'
  },
  'ionq': {
    name: 'IonQ Inc',
    symbol: 'IONQ',
    keywords: 'IonQ+quantum+computing+earnings+stock+IONQ',
    sector: 'quantum'
  },
  'xpeng': {
    name: 'XPeng Inc',
    symbol: 'XPEV',
    keywords: 'XPeng+electric+vehicle+earnings+China+EV+autonomous',
    sector: 'automotive'
  },
  'qubt': {
    name: 'Quantum Computing Inc',
    symbol: 'QUBT',
    keywords: 'Quantum+Computing+Inc+QUBT+stock+earnings+quantum',
    sector: 'quantum'
  },
  'dwave': {
    name: 'D-Wave Quantum Inc',
    symbol: 'QBTS',
    keywords: 'D-Wave+Quantum+QBTS+earnings+quantum+computing',
    sector: 'quantum'
  },
  'rigetti': {
    name: 'Rigetti Computing',
    symbol: 'RGTI',
    keywords: 'Rigetti+Computing+RGTI+quantum+computing+stock',
    sector: 'quantum'
  },
  'pony': {
    name: 'Pony AI Inc',
    symbol: 'PONY',
    keywords: 'Pony+AI+autonomous+driving+IPO+China+robotaxi',
    sector: 'automotive'
  }
};

// Sektör tanımlamaları
const SECTORS = {
  'semiconductor': {
    name: 'Semiconductor & AI Chips',
    keywords: 'semiconductor+chip+AI+processor+GPU+CPU+manufacturing+shortage',
    companies: ['nvidia', 'tsmc']
  },
  'quantum': {
    name: 'Quantum Computing',
    keywords: 'quantum+computing+quantum+supremacy+qubit+quantum+algorithm',
    companies: ['ionq', 'qubt', 'dwave', 'rigetti']
  },
  'automotive': {
    name: 'Electric & Autonomous Vehicles',
    keywords: 'electric+vehicle+autonomous+driving+EV+battery+self+driving',
    companies: ['xpeng', 'pony']
  },
  'ai': {
    name: 'Artificial Intelligence',
    keywords: 'artificial+intelligence+machine+learning+AI+chatbot+LLM',
    companies: ['nvidia', 'pony']
  },
  'tech-stocks': {
    name: 'Technology Stocks',
    keywords: 'technology+stocks+earnings+revenue+nasdaq+tech+sector',
    companies: Object.keys(PORTFOLIO_COMPANIES)
  }
};

// Yardımcı fonksiyon: RSS XML'i JSON'a çevir
async function parseRSSFeed(rssData) {
  try {
    const result = await parseStringPromise(rssData);
    const channel = result.rss?.channel?.[0];
    
    if (!channel) {
      return { items: [], error: 'Invalid RSS format' };
    }
    
    return {
      title: channel.title?.[0] || '',
      description: channel.description?.[0] || '',
      link: channel.link?.[0] || '',
      lastUpdated: new Date().toISOString(),
      items: (channel.item || []).map(item => ({
        title: item.title?.[0] || '',
        link: item.link?.[0] || '',
        description: item.description?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        guid: item.guid?.[0]?._ || item.guid?.[0] || '',
        category: item.category?.[0] || ''
      }))
    };
  } catch (error) {
    console.error('RSS parsing error:', error);
    return { items: [], error: 'Failed to parse RSS feed' };
  }
}

// Yardımcı fonksiyon: RSSHub'dan veri çekme
async function fetchFromRSSHub(route, timeout = 15000) {
  try {
    const url = `${RSSHUB_BASE}${route}`;
    console.log(`Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout,
      headers: { 
        'User-Agent': 'Portfolio-Tracker-API/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error(`RSSHub fetch error for ${route}:`, error.message);
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

// Ana route - API dokumentasyonu
app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio Tracker RSS API',
    version: '1.0.0',
    description: 'RSSHub tabanlı portföy şirketleri haber takip API\'si',
    baseUrl: req.protocol + '://' + req.get('host'),
    rssHubBase: RSSHUB_BASE,
    endpoints: {
      'GET /': 'API bilgisi ve dokümantasyon',
      'GET /api/companies': 'Tüm şirket listesi',
      'GET /api/companies/:company': 'Belirli şirket bilgisi',
      'GET /api/news/:company': 'Şirket haberleri',
      'GET /api/news/all': 'Tüm şirket haberlerini birleştir',
      'GET /api/sectors': 'Sektör listesi',
      'GET /api/sectors/:sector': 'Sektör haberleri',
      'GET /api/search/:query': 'Özel arama',
      'GET /api/health': 'API sağlık durumu',
      'GET /api/feed/:company': 'RSS XML formatında şirket haberleri'
    },
    parameters: {
      'limit': 'Haber sayısı limiti (default: 10, max: 50)',
      'format': 'Çıktı formatı (json|xml, default: json)',
      'lang': 'Dil tercihi (tr|en, default: tr)'
    },
    companies: Object.keys(PORTFOLIO_COMPANIES),
    sectors: Object.keys(SECTORS),
    examples: {
      'Nvidia haberleri': '/api/news/nvidia?limit=5',
      'Tüm haberler': '/api/news/all?limit=20',
      'Quantum sektörü': '/api/sectors/quantum',
      'Özel arama': '/api/search/earnings+revenue',
      'RSS feed': '/api/feed/nvidia'
    }
  });
});

// API sağlık durumu
app.get('/api/health', async (req, res) => {
  try {
    // RSSHub bağlantısını test et
    const testResult = await fetchFromRSSHub('/google/news/test', 5000);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      rssHub: {
        status: testResult.success ? 'connected' : 'error',
        baseUrl: RSSHUB_BASE,
        error: testResult.error || null
      },
      api: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Şirket listesi
app.get('/api/companies', (req, res) => {
  res.json({
    success: true,
    totalCompanies: Object.keys(PORTFOLIO_COMPANIES).length,
    companies: PORTFOLIO_COMPANIES
  });
});

// Belirli şirket bilgisi
app.get('/api/companies/:company', (req, res) => {
  const { company } = req.params;
  const companyData = PORTFOLIO_COMPANIES[company.toLowerCase()];
  
  if (!companyData) {
    return res.status(404).json({
      success: false,
      error: 'Şirket bulunamadı',
      availableCompanies: Object.keys(PORTFOLIO_COMPANIES)
    });
  }

  res.json({
    success: true,
    company: {
      id: company.toLowerCase(),
      ...companyData,
      newsEndpoint: `/api/news/${company.toLowerCase()}`,
      feedEndpoint: `/api/feed/${company.toLowerCase()}`
    }
  });
});

// Sektör listesi
app.get('/api/sectors', (req, res) => {
  res.json({
    success: true,
    totalSectors: Object.keys(SECTORS).length,
    sectors: SECTORS
  });
});

// Belirli şirket haberleri
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
    const result = await fetchFromRSSHub(route);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'RSSHub\'dan veri alınamadı',
        details: result.error
      });
    }

    if (format === 'xml') {
      return res.set('Content-Type', 'application/rss+xml').send(result.data);
    }

    const newsData = await parseRSSFeed(result.data);
    if (newsData.error) {
      return res.status(500).json({
        success: false,
        error: 'RSS verisi işlenemedi',
        details: newsData.error
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
        fetchedAt: new Date().toISOString(),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching news for ${company}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Haber verisi alınamadı',
      details: error.message
    });
  }
});

// Tüm şirket haberleri (paralel fetch)
app.get('/api/news/all', async (req, res) => {
  const { limit = 5, format = 'json' } = req.query;
  const maxLimit = Math.min(parseInt(limit), 20); // Her şirketten max 20 haber

  try {
    const companies = Object.entries(PORTFOLIO_COMPANIES);
    const fetchPromises = companies.map(async ([companyId, companyData]) => {
      const route = `/google/news/${companyData.keywords}`;
      const result = await fetchFromRSSHub(route, 10000);
      
      if (!result.success) {
        return {
          companyId,
          company: companyData,
          news: [],
          error: result.error
        };
      }

      const newsData = await parseRSSFeed(result.data);
      return {
        companyId,
        company: companyData,
        news: newsData.items.slice(0, maxLimit),
        error: newsData.error || null
      };
    });

    const results = await Promise.allSettled(fetchPromises);
    const allNews = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        if (data.error) {
          errors.push({ company: data.companyId, error: data.error });
        }
        
        // Her habere şirket bilgisi ekle
        data.news.forEach(newsItem => {
          allNews.push({
            ...newsItem,
            companyId: data.companyId,
            companyName: data.company.name,
            companySymbol: data.company.symbol,
            sector: data.company.sector
          });
        });
      } else {
        const companyId = companies[index][0];
        errors.push({ company: companyId, error: result.reason.message });
      }
    });

    // Tarihe göre sırala (en yeni önce)
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    res.json({
      success: true,
      totalNews: allNews.length,
      companiesProcessed: companies.length,
      errors: errors.length > 0 ? errors : undefined,
      lastUpdated: new Date().toISOString(),
      news: allNews.slice(0, parseInt(req.query.totalLimit) || allNews.length),
      meta: {
        limitPerCompany: maxLimit,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching all news:', error);
    res.status(500).json({
      success: false,
      error: 'Tüm haberler alınamadı',
      details: error.message
    });
  }
});

// Sektör haberleri
app.get('/api/sectors/:sector', async (req, res) => {
  const { sector } = req.params;
  const { limit = 15, format = 'json' } = req.query;
  
  const sectorData = SECTORS[sector.toLowerCase()];
  if (!sectorData) {
    return res.status(404).json({
      success: false,
      error: 'Sektör bulunamadı',
      availableSectors: Object.keys(SECTORS)
    });
  }

  try {
    // Sektör genel haberleri + şirket haberleri
    const route = `/google/news/${sectorData.keywords}`;
    const result = await fetchFromRSSHub(route);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Sektör haberleri alınamadı',
        details: result.error
      });
    }

    const newsData = await parseRSSFeed(result.data);
    newsData.items = newsData.items.slice(0, Math.min(parseInt(limit), 50));

    res.json({
      success: true,
      sector: sectorData,
      totalItems: newsData.items.length,
      lastUpdated: newsData.lastUpdated,
      news: newsData.items,
      relatedCompanies: sectorData.companies,
      meta: {
        rssHubRoute: route,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`Error fetching sector news for ${sector}:`, error);
    res.status(500).json({
      success: false,
      error: 'Sektör haberleri alınamadı',
      details: error.message
    });
  }
});

// Özel arama
app.get('/api/search/:query', async (req, res) => {
  const { query } = req.params;
  const { limit = 20, format = 'json' } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Arama terimi en az 2 karakter olmalıdır'
    });
  }

  try {
    // Arama terimini URL-safe yap
    const searchTerm = query.replace(/\s+/g, '+').replace(/[^a-zA-Z0-9+]/g, '');
    const route = `/google/news/${searchTerm}`;
    const result = await fetchFromRSSHub(route);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Arama yapılamadı',
        details: result.error
      });
    }

    const newsData = await parseRSSFeed(result.data);
    newsData.items = newsData.items.slice(0, Math.min(parseInt(limit), 50));

    res.json({
      success: true,
      searchQuery: query,
      totalItems: newsData.items.length,
      lastUpdated: newsData.lastUpdated,
      news: newsData.items,
      meta: {
        rssHubRoute: route,
        processedQuery: searchTerm,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    res.status(500).json({
      success: false,
      error: 'Arama işlemi başarısız',
      details: error.message
    });
  }
});

// RSS feed formatında şirket haberleri
app.get('/api/feed/:company', async (req, res) => {
  const { company } = req.params;
  const companyData = PORTFOLIO_COMPANIES[company.toLowerCase()];
  
  if (!companyData) {
    return res.status(404).json({
      success: false,
      error: 'Şirket bulunamadı'
    });
  }

  try {
    const route = `/google/news/${companyData.keywords}`;
    const result = await fetchFromRSSHub(route);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'RSS feed alınamadı',
        details: result.error
      });
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(result.data);

  } catch (error) {
    console.error(`Error fetching RSS feed for ${company}:`, error);
    res.status(500).json({
      success: false,
      error: 'RSS feed işlenemedi',
      details: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    availableEndpoints: [
      'GET /',
      'GET /api/companies',
      'GET /api/news/:company',
      'GET /api/news/all',
      'GET /api/sectors/:sector',
      'GET /api/search/:query',
      'GET /api/health'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Sunucu hatası',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Portfolio RSS API running on port ${PORT}`);
  console.log(`📊 RSSHub Base: ${RSSHUB_BASE}`);
  console.log(`🏢 Companies: ${Object.keys(PORTFOLIO_COMPANIES).length}`);
  console.log(`📈 Sectors: ${Object.keys(SECTORS).length}`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
});

module.exports = app;
