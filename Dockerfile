FROM node:18-alpine

WORKDIR /app

# Dependency dosyalarını kopyala
COPY package*.json ./

# Dependencies yükle
RUN npm ci --only=production && npm cache clean --force

# Uygulama dosyalarını kopyala
COPY . .

# Port expose et
EXPOSE 3000

# Healthcheck ekle
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Uygulamayı başlat
CMD ["npm", "start"]
