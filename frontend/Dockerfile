FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js development server
# (Using 'dev' here so your friend can easily make live changes if needed)
CMD ["npm", "run", "dev"]