FROM node:18-alpine

WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Install dependencies (npm ci yerine npm install)
RUN npm install --production && npm cache clean --force

# App files kopyala
COPY . .

# Port expose
EXPOSE 3000

# Start command
CMD ["npm", "start"]
