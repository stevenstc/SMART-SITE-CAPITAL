FROM node:23-slim
WORKDIR /app

COPY . .
WORKDIR /app
RUN npm install && npm run build

EXPOSE 3000
CMD ["npm", "start"]
