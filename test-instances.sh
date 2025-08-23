#!/bin/bash

echo "🧪 RSSHub Instance Testi"
echo "======================="

# Test edilecek instance'lar
instances=(
  "https://rsshub-production-82c7.up.railway.app"
  "https://rsshub.app"
  "https://rss.shab.fun"
  "https://rsshub.rssforever.com"
  "https://rsshub.liunian.moe"
)

# Test route
test_route="/google/news/NVIDIA"

echo "Test Route: $test_route"
echo "========================"

for i in "${!instances[@]}"; do
  instance="${instances[$i]}"
  url="${instance}${test_route}"
  
  echo -n "[$((i+1))/5] Testing $instance ... "
  
  # Timeout ile test
  response=$(curl -s -w "%{http_code}" --max-time 10 --connect-timeout 5 "$url" -o /dev/null 2>/dev/null)
  
  if [ "$response" = "200" ]; then
    echo "✅ OK (HTTP $response)"
  elif [ "$response" = "503" ]; then
    echo "⚠️  Service Unavailable (HTTP $response)"
  elif [ "$response" = "000" ]; then
    echo "❌ Connection Failed (Timeout/Network Error)"
  else
    echo "⚠️  HTTP $response"
  fi
  
  # Kısa bekle
  sleep 1
done

echo ""
echo "🚀 API Test:"
echo "curl 'http://localhost:3000/api/news/nvidia?limit=3'"
echo ""
echo "💡 Öneriler:"
echo "- 503 hatası alıyorsanız alternatif instance'lar kullanılacak"
echo "- Network timeout'u varsa VPN deneyin"
echo "- Tüm instance'lar down ise cache mekanizması eklenebilir"
