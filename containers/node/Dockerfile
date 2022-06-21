FROM node:latest
ENV NODE_ENV=production
COPY ./package.json ./
COPY ./package-lock.json ./
EXPOSE 3000
CMD ["node", "server.js"]