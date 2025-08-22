#!/bin/bash

echo "🐳 Docker Build Test Script"
echo "=========================="

# Renklendirme
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Docker build test ediliyor...${NC}"

# Ana Dockerfile test
echo "1. Ana Dockerfile test..."
docker build -t rss-feed-analyzer:main . > build.log 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ana Dockerfile başarılı${NC}"
    MAIN_BUILD=true
else
    echo -e "${RED}❌ Ana Dockerfile başarısız${NC}"
    MAIN_BUILD=false
fi

# Simple Dockerfile test
echo "2. Simple Dockerfile test..."
docker build -f Dockerfile.simple -t rss-feed-analyzer:simple . > build_simple.log 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Simple Dockerfile başarılı${NC}"
    SIMPLE_BUILD=true
else
    echo -e "${RED}❌ Simple Dockerfile başarısız${NC}"
    SIMPLE_BUILD=false
fi

echo ""
echo "📊 Build Results:"
if [ "$MAIN_BUILD" = true ]; then
    echo -e "${GREEN}✅ Ana Dockerfile: BAŞARILI${NC}"
else
    echo -e "${RED}❌ Ana Dockerfile: BAŞARISIZ${NC}"
    echo "   Log: build.log"
fi

if [ "$SIMPLE_BUILD" = true ]; then
    echo -e "${GREEN}✅ Simple Dockerfile: BAŞARILI${NC}"
else
    echo -e "${RED}❌ Simple Dockerfile: BAŞARISIZ${NC}"
    echo "   Log: build_simple.log"
fi

echo ""
echo "🚀 Railway deploy önerisi:"
if [ "$SIMPLE_BUILD" = true ]; then
    echo "   Simple Dockerfile kullanın (daha güvenilir)"
    echo "   mv Dockerfile.simple Dockerfile"
else
    echo "   NIXPACKS builder kullanın (railway.json'da ayarlı)"
    echo "   Docker yerine Node.js runtime kullanacak"
fi

# Cleanup
if [ "$MAIN_BUILD" = true ]; then
    docker rmi rss-feed-analyzer:main 2>/dev/null
fi
if [ "$SIMPLE_BUILD" = true ]; then
    docker rmi rss-feed-analyzer:simple 2>/dev/null
fi

echo -e "${YELLOW}📝 Railway deploy için hazır!${NC}"
