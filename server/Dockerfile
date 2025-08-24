FROM node:18

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Install Node deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app
COPY . .

# Install Python deps
RUN pip3 install -r requirements.txt

CMD ["npm", "start"]