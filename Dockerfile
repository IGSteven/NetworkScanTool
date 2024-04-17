FROM node:10-alpine

WORKDIR /app

# Install git and other dependencies
RUN apt-get update && \
    apt-get install -y git

RUN git clone github.com/IGSteven/NetworkScanTool.git

WORKDIR /app/NetworkScanTool/src/

RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
CMD [ "node", "index.js" ]
