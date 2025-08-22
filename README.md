# RSS Feed Analyzer

🚀 **RSSHub tabanlı portföy şirketleri haber takip API'si**

Bu proje, portföyünüzdeki şirketlerin haberlerini otomatik olarak takip etmek için geliştirilmiş bir REST API'sidir.

## 🚀 Hızlı Başlangıç

### Otomatik Kurulum
```bash
# Mac/Linux
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat

# Veya npm ile
npm run setup
```

### Manuel Kurulum
```bash
git clone https://github.com/egeaydin1/RSS-Feed-Analizer.git
cd RSS-Feed-Analizer
npm install
npm start
```

## 🌟 Özellikler

- ✅ **8 farklı şirketin** haberlerini takip
- ✅ **5 sektörel** kategori desteği  
- ✅ **RSSHub entegrasyonu** ile güvenilir veri kaynağı
- ✅ **Rate limiting** ve güvenlik önlemleri
- ✅ **JSON/XML** çıktı formatları
- ✅ **Paralel veri çekme** ile hızlı response
- ✅ **Railway/Vercel** deploy desteği

## 📊 Takip Edilen Şirketler

| Şirket | Symbol | Sektör |
|--------|--------|--------|
| NVIDIA Corporation | NVDA | Semiconductor |
| Taiwan Semiconductor | TSM | Semiconductor |
| IonQ Inc | IONQ | Quantum Computing |
| XPeng Inc | XPEV | Automotive |
| Quantum Computing Inc | QUBT | Quantum Computing |
| D-Wave Quantum Inc | QBTS | Quantum Computing |
| Rigetti Computing | RGTI | Quantum Computing |
| Pony AI Inc | PONY | Automotive |

## 📡 API Endpoints

### Temel Kullanım
```bash
# API dokümantasyonu
curl http://localhost:3000/

# Tüm şirketlerin haberleri  
curl http://localhost:3000/api/news/all?limit=10

# NVIDIA haberleri
curl http://localhost:3000/api/news/nvidia?limit=5

# Quantum sektörü haberleri
curl http://localhost:3000/api/sectors/quantum

# RSS feed formatında
curl http://localhost:3000/api/feed/nvidia
```

### JavaScript Örneği
```javascript
// Tüm şirketlerin son haberlerini çek
async function getLatestNews() {
  const response = await fetch('http://localhost:3000/api/news/all?limit=5');
  const data = await response.json();
  
  console.log(`📰 ${data.totalNews} haber bulundu`);
  
  data.news.forEach(news => {
    console.log(`🏢 ${news.companySymbol}: ${news.title}`);
    console.log(`🔗 ${news.link}\n`);
  });
}

getLatestNews();
```

## 🌐 Deploy

### Railway (1-Click Deploy)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/RSS-Feed-Analyzer)

### Manuel Deploy
```bash
# Railway
railway login
railway new
railway up

# Vercel  
vercel --prod

# Docker
docker build -t rss-feed-analyzer .
docker run -p 3000:3000 rss-feed-analyzer
```

## 🧪 Test

```bash
# Test suite çalıştır
npm test

# Tek endpoint test
curl http://localhost:3000/api/health
```

## 🔒 Güvenlik & Rate Limiting

- **Rate Limit**: 100 request/15 dakika/IP
- **CORS**: Cross-origin koruması
- **Helmet**: Güvenlik headers
- **Input Validation**: Parametre doğrulama

## 📊 Response Örneği

```json
{
  "success": true,
  "company": {
    "name": "NVIDIA Corporation", 
    "symbol": "NVDA",
    "sector": "semiconductor"
  },
  "totalItems": 5,
  "news": [
    {
      "title": "NVIDIA Q3 Earnings Exceed Expectations",
      "link": "https://example.com/nvidia-earnings",
      "description": "NVIDIA reported strong quarterly results...",
      "pubDate": "2025-08-23T10:00:00Z"
    }
  ]
}
```

## 🔗 N8N Entegrasyonu

Bu API N8N workflow'larında kullanılabilir:

```javascript
// N8N HTTP Request Node
{
  "method": "GET",
  "url": "https://your-app.railway.app/api/news/all?limit=20"
}
```

## 📈 Monitoring

Health check endpoint'i ile API durumunu izleyin:
```bash
curl http://localhost:3000/api/health
```

## 🤝 Katkıda Bulunma

1. Fork edin: [RSS-Feed-Analizer](https://github.com/egeaydin1/RSS-Feed-Analizer/fork)
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek & İletişim

- 🐛 **Bug Report**: [Issues](https://github.com/egeaydin1/RSS-Feed-Analizer/issues/new?template=bug_report.md)
- 💡 **Feature Request**: [Issues](https://github.com/egeaydin1/RSS-Feed-Analizer/issues/new?template=feature_request.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/egeaydin1/RSS-Feed-Analizer/discussions)
- 📧 **Email**: Repo sahibi ile iletişim

## 🏆 Contributors

<a href="https://github.com/egeaydin1/RSS-Feed-Analizer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=egeaydin1/RSS-Feed-Analizer" />
</a>

## 📄 Lisans

MIT License - [LICENSE](https://github.com/egeaydin1/RSS-Feed-Analizer/blob/main/LICENSE) dosyasına bakın.

---

⭐ **Projeyi beğendiyseniz yıldız vermeyi unutmayın!** [⭐ Star on GitHub](https://github.com/egeaydin1/RSS-Feed-Analizer)

🚀 **RSS Feed Analyzer** - Built with ❤️ for portfolio tracking
