#!/bin/bash

echo "🚀 RSS Feed Analyzer - Başlangıç Script'i"
echo "========================================="

# Renklendirme için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Dependencies kontrolü...${NC}"

# Node.js kontrol
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js yüklü değil!${NC}"
    echo "Node.js'i yüklemek için: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} bulundu${NC}"
fi

# npm kontrol
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm yüklü değil!${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} bulundu${NC}"
fi

# package.json kontrol
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json bulunamadı!${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔧 Dependencies yükleniyor...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies başarıyla yüklendi${NC}"
else
    echo -e "${RED}❌ Dependencies yüklenemedi!${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🧪 API test ediliyor...${NC}"
echo "Server başlatılıyor (test için)..."

# Test server'ı background'da başlat
npm start &
SERVER_PID=$!

# Server'ın başlamasını bekle
sleep 5

# Health check test
echo "Health check testi yapılıyor..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ API health check başarılı${NC}"
else
    echo -e "${YELLOW}⚠️  Health check response: ${HEALTH_CHECK}${NC}"
fi

# Test server'ı durdur
kill $SERVER_PID 2>/dev/null

echo -e "\n${GREEN}🎉 Kurulum tamamlandı!${NC}"
echo "=============================="
echo -e "${BLUE}📖 Kullanım:${NC}"
echo "  npm start     - Production modunda başlat"
echo "  npm run dev   - Development modunda başlat"
echo "  npm test      - Test suite çalıştır"
echo ""
echo -e "${BLUE}🌐 API Endpoints:${NC}"
echo "  http://localhost:3000/                    - Dokümantasyon"
echo "  http://localhost:3000/api/companies       - Şirket listesi"
echo "  http://localhost:3000/api/news/nvidia     - NVIDIA haberleri"
echo "  http://localhost:3000/api/news/all        - Tüm haberler"
echo ""
echo -e "${YELLOW}🚀 Server başlatmak için: npm start${NC}"
