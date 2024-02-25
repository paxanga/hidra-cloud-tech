# Use an official Node.js runtime as a base image
FROM node:20

WORKDIR /install
COPY package*.json ./
COPY app_front.js ./
RUN npm install --verbose
ENV NODE_PATH=/install/node_modules

# Set the working directory to /app
WORKDIR /app

COPY public ./public

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3002

# Command to run your application
CMD ["node", "app_front.js"]
