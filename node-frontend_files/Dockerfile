# Use an official Node.js runtime as a base image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY app_front.js ./
COPY public ./public

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3002

# Command to run your application
CMD ["node", "app_front.js"]
