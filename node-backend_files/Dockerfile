# Use an official Node.js runtime as a base image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY app_back.js ./

# Install app dependencies in /app
RUN npm ci --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3001

# Command to run your application
CMD ["node", "app_back.js"]
