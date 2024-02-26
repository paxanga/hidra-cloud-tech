# Use an official Node.js runtime as a base image
FROM node:20

WORKDIR /install
COPY package*.json ./

RUN npm install --verbose
ENV NODE_PATH=/install/node_modules

# Set the working directory to /app
WORKDIR /app

COPY app_back.js ./

# Copy the rest of the application code to the working directory
COPY . .

# generate certs beteen node an grafana and save in /etc/hidra_exporter/certs
# ssh-keygen -t rsa -b 4096 -m PEM -f grafana.key -N ""
# openssl rsa -in grafana.key -pubout -outform PEM -out grafana.key.pub
RUN ssh-keygen -t rsa -b 4096 -m PEM -f grafana.key -N "" && \
    openssl rsa -in grafana.key -pubout -outform PEM -out grafana.key.pub && \
    mkdir -p /etc/hidra_exporter/certs && \
    mv grafana.key /etc/hidra_exporter/certs && \
    mv grafana.key.pub /etc/hidra_exporter/certs


# Command to run your application
CMD ["node", "app_back.js"]
