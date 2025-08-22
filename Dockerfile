FROM node:18-alpine

WORKDIR /app

# Dependency dosyalarını kopyala
COPY package*.json ./

# Dependencies yükle (yeni npm syntax)
RUN npm ci --omit=dev && npm cache clean --force

# Uygulama dosyalarını kopyala
COPY . .

# Non-root user oluştur (güvenlik için)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Dosya sahipliğini değiştir
RUN chown -R nodejs:nodejs /app
USER nodejs

# Port expose et
EXPOSE 3000

# Healthcheck ekle
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Uygulamayı başlat
CMD ["npm", "start"]
