FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set workdir
WORKDIR /app

# Copy code
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]