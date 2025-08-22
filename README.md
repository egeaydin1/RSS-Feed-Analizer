# RSS Feed Analyzer

🚀 **RSSHub tabanlı portföy şirketleri haber takip API'si**

Bu proje, portföyünüzdeki şirketlerin haberlerini otomatik olarak takip etmek için geliştirilmiş bir REST API'sidir.

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

## 🚀 Kurulum

### Yerel Geliştirme

```bash
# Projeyi klonla
git clone https://github.com/your-username/RSS-Feed-Analizer.git
cd RSS-Feed-Analizer

# Dependencies yükle
npm install

# Geliştirme modunda başlat
npm run dev

# Veya production modunda
npm start
```

### Docker ile Çalıştırma

```bash
# Docker image build et
docker build -t rss-feed-analyzer .

# Container çalıştır
docker run -p 3000:3000 rss-feed-analyzer
```

## 📡 API Endpoints

### Temel Endpoint'ler

```http
GET /                           # API dokümantasyonu
GET /api/health                 # Sistem durumu
GET /api/companies              # Şirket listesi
GET /api/sectors                # Sektör listesi
```

### Haber Endpoint'leri

```http
GET /api/news/:company          # Şirket haberleri
GET /api/news/all               # Tüm şirket haberleri
GET /api/sectors/:sector        # Sektör haberleri
GET /api/search/:query          # Özel arama
GET /api/feed/:company          # RSS XML feed
```

### Parametreler

| Parametre | Açıklama | Default | Max |
|-----------|----------|---------|-----|
| `limit` | Haber sayısı | 10 | 50 |
| `format` | Çıktı formatı (json/xml) | json | - |
| `lang` | Dil tercihi | tr | - |

## 🔧 Kullanım Örnekleri

### JavaScript/Node.js

```javascript
// NVIDIA haberlerini çek
const response = await fetch('http://localhost:3000/api/news/nvidia?limit=5');
const data = await response.json();

console.log(data.news);
```

### cURL

```bash
# Tüm şirket haberleri
curl "http://localhost:3000/api/news/all?limit=10"

# Quantum sektörü haberleri
curl "http://localhost:3000/api/sectors/quantum"

# RSS feed formatında
curl "http://localhost:3000/api/feed/nvidia"
```

### Python

```python
import requests

# API'dan veri çek
response = requests.get('http://localhost:3000/api/news/nvidia')
data = response.json()

for news in data['news']:
    print(f"📰 {news['title']}")
    print(f"🔗 {news['link']}\n")
```

## 🌐 Deploy

### Railway

1. [Railway](https://railway.app) hesabı oluşturun
2. GitHub repository'yi bağlayın
3. Otomatik deploy başlayacaktır

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Heroku

```bash
# Heroku CLI yükle ve login ol
heroku login

# Uygulama oluştur
heroku create rss-feed-analyzer

# Deploy et
git push heroku main
```

## 🔗 N8N Entegrasyonu

Bu API N8N iş akışları ile entegre edilebilir:

```json
{
  "method": "GET",
  "url": "https://your-api.railway.app/api/news/all?limit=20"
}
```

## 📊 Response Formatları

### Başarılı Response

```json
{
  "success": true,
  "company": {
    "name": "NVIDIA Corporation",
    "symbol": "NVDA",
    "sector": "semiconductor"
  },
  "totalItems": 10,
  "lastUpdated": "2025-08-23T10:30:00.000Z",
  "news": [
    {
      "title": "NVIDIA Q2 Earnings Beat Expectations",
      "link": "https://example.com/news/nvidia-earnings",
      "description": "NVIDIA reported strong Q2 results...",
      "pubDate": "2025-08-23T09:00:00.000Z"
    }
  ]
}
```

### Hata Response

```json
{
  "success": false,
  "error": "Şirket bulunamadı",
  "availableCompanies": ["nvidia", "tsmc", "ionq", "xpeng"]
}
```

## 🔒 Güvenlik

- **Rate Limiting**: 100 request/15 dakika
- **Helmet.js**: Güvenlik headers
- **CORS**: Cross-origin koruması
- **Input Validation**: Parametre doğrulama

## 🚨 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 400 | Geçersiz parametre |
| 404 | Endpoint/şirket bulunamadı |
| 429 | Rate limit aşıldı |
| 500 | Sunucu hatası |

## 📈 Performans

- **Response Time**: ~2-5 saniye (tüm şirketler)
- **Rate Limit**: 100 req/15 dakika
- **Caching**: Browser cache headers
- **Compression**: Gzip aktif

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 Changelog

### v1.0.0 (2025-08-23)
- ✅ İlk sürüm
- ✅ 8 şirket desteği
- ✅ 5 sektör kategorisi
- ✅ RSSHub entegrasyonu
- ✅ Docker desteği

## 📞 Destek

Sorularınız için:
- 📧 Issue açın
- 💬 Discussions kullanın
- 📱 Telegram: @portfolio_tracker

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

⭐ **Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
