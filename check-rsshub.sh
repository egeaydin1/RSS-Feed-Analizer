#!/bin/bash

echo "🔍 RSSHub Instance Durumu Kontrolü"
echo "================================="
echo "URL: https://rsshub-production-82c7.up.railway.app"
echo ""

# Ana sayfa kontrolü
echo "1. Ana sayfa kontrolü..."
main_status=$(curl -s -w "%{http_code}" -o /tmp/rsshub_main.html "https://rsshub-production-82c7.up.railway.app" --connect-timeout 10 --max-time 15)
echo "   Ana sayfa HTTP Status: $main_status"

if [ "$main_status" = "200" ]; then
    echo "   ✅ Ana sayfa erişilebilir"
elif [ "$main_status" = "503" ]; then
    echo "   ⚠️  503 Service Unavailable - RSSHub muhtemelen down"
elif [ "$main_status" = "000" ]; then
    echo "   ❌ Bağlantı hatası - Network/DNS problemi olabilir"
else
    echo "   ⚠️  Beklenmeyen HTTP kodu: $main_status"
fi

echo ""

# Test route'u dene
echo "2. Test route kontrolü..."
echo "   Route: /google/news/test"
test_route_status=$(curl -s -w "%{http_code}" -o /tmp/rsshub_test.xml "https://rsshub-production-82c7.up.railway.app/google/news/test" --connect-timeout 10 --max-time 20)
echo "   Test route HTTP Status: $test_route_status"

if [ "$test_route_status" = "200" ]; then
    echo "   ✅ Test route çalışıyor"
    # XML içeriğini kontrol et
    if grep -q "<rss" /tmp/rsshub_test.xml 2>/dev/null; then
        echo "   ✅ Valid RSS XML response"
    else
        echo "   ⚠️  Response XML değil"
    fi
elif [ "$test_route_status" = "503" ]; then
    echo "   ❌ 503 Service Unavailable"
elif [ "$test_route_status" = "000" ]; then
    echo "   ❌ Timeout/Network error"
else
    echo "   ⚠️  HTTP Status: $test_route_status"
fi

echo ""

# NVIDIA route'u dene (gerçek test)
echo "3. NVIDIA route kontrolü..."
echo "   Route: /google/news/NVIDIA+stock+earnings"
nvidia_status=$(curl -s -w "%{http_code}" -o /tmp/rsshub_nvidia.xml "https://rsshub-production-82c7.up.railway.app/google/news/NVIDIA+stock+earnings" --connect-timeout 15 --max-time 30)
echo "   NVIDIA route HTTP Status: $nvidia_status"

if [ "$nvidia_status" = "200" ]; then
    echo "   ✅ NVIDIA route çalışıyor"
    # Item sayısını kontrol et
    item_count=$(grep -c "<item>" /tmp/rsshub_nvidia.xml 2>/dev/null || echo "0")
    echo "   📊 RSS item count: $item_count"
elif [ "$nvidia_status" = "503" ]; then
    echo "   ❌ 503 Service Unavailable"
elif [ "$nvidia_status" = "429" ]; then
    echo "   ⚠️  429 Rate Limited"
elif [ "$nvidia_status" = "000" ]; then
    echo "   ❌ Timeout (30s)"
else
    echo "   ⚠️  HTTP Status: $nvidia_status"
fi

echo ""
echo "📊 Özet:"
echo "======="

if [ "$main_status" = "200" ] && [ "$nvidia_status" = "200" ]; then
    echo "✅ RSSHub instance tamamen çalışır durumda"
    echo "   Problemin kaynağı API'nizde olabilir"
    echo ""
    echo "🔧 Öneriler:"
    echo "   - API timeout'unu artırın (30+ saniye)"
    echo "   - Retry logic ekleyin"
    echo "   - Rate limiting kontrol edin"
elif [ "$main_status" = "200" ] && [ "$nvidia_status" = "503" ]; then
    echo "⚠️  RSSHub ana sayfa OK, ama route'lar 503 veriyor"
    echo "   Muhtemelen Google News rate limiting"
    echo ""
    echo "🔧 Öneriler:"
    echo "   - Farklı arama terimleri deneyin"
    echo "   - Request frequency'sini azaltın"
    echo "   - Alternative RSSHub instance kullanın"
elif [ "$main_status" = "503" ]; then
    echo "❌ RSSHub instance tamamen down"
    echo "   Railway container problemi olabilir"
    echo ""
    echo "🔧 Çözümler:"
    echo "   - Railway dashboard'dan redeploy yapın"
    echo "   - Alternative RSSHub instance kullanın"
    echo "   - Kendi RSSHub'ı yeniden deploy edin"
else
    echo "❌ Network veya DNS problemi"
    echo ""
    echo "🔧 Kontrol edin:"
    echo "   - Internet bağlantınız"
    echo "   - VPN kullanıyorsanız kapatın/değiştirin"
    echo "   - DNS ayarları (8.8.8.8 deneyin)"
fi

echo ""
echo "💡 Alternatif çözümler:"
echo "   1. Official RSSHub: https://rsshub.app"
echo "   2. Alternative instance: https://rss.shab.fun"
echo "   3. Yeni RSSHub deploy edin Railway'de"

# Cleanup
rm -f /tmp/rsshub_*.html /tmp/rsshub_*.xml 2>/dev/null
