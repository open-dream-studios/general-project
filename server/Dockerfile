FROM node:18

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy requirements and install Python deps
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the app
COPY . .

CMD ["npm", "start"]