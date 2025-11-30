# Deploying to Oracle Cloud Ubuntu Server

This guide walks you through deploying the Chakula API to an Oracle Cloud Ubuntu instance using Docker and Docker Compose.

## Prerequisites

1.  **Oracle Cloud Account**: An active account with a running Ubuntu instance (e.g., Ubuntu 22.04 or 24.04).
2.  **SSH Access**: You should be able to SSH into your server: `ssh ubuntu@your-server-ip`.
3.  **Domain Name (Optional but Recommended)**: For SSL/HTTPS (e.g., `api.yourdomain.com`).

---

## Step 1: Server Preparation

SSH into your server and update the system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker & Docker Compose

Run the following commands to install Docker:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Verify installation:
sudo docker run hello-world
```

---

## Step 2: Project Setup

### Clone the Repository

Clone your project repository to the server (you may need to generate an SSH key on the server and add it to GitHub first).

```bash
git clone https://github.com/derrickmugabwa/kenya-food-database-api.git
cd kenya-food-database-api
```

### Configure Environment Variables

Create a production `.env` file. **Crucial**: Ensure you use strong passwords and your production API keys.

```bash
cp .env.example .env
nano .env
```

Update the following variables in `.env` with your **Neon DB credentials**:

```env
# Database (Neon)
DATABASE_HOST=ep-shiny-river-123456.us-east-1.aws.neon.tech # Your Neon Host
DATABASE_PORT=5432
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your_neon_password
DATABASE_NAME=neondb
DATABASE_SSL_ENABLED=true # Neon requires SSL
DATABASE_REJECT_UNAUTHORIZED=false

# App
APP_PORT=3000
NODE_ENV=production
BACKEND_DOMAIN=http://your-server-ip:3000 # Or https://api.yourdomain.com

# Email (Choose Inbound or SMTP)
EMAIL_PROVIDER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=your_resend_api_key
MAIL_SECURE=true
MAIL_DEFAULT_EMAIL=noreply@yourdomain.com

# Auth Secrets (Generate new random strings)
AUTH_JWT_SECRET=LONG_RANDOM_STRING
AUTH_REFRESH_SECRET=ANOTHER_LONG_RANDOM_STRING
```

---

## Step 3: Deployment

We have prepared a production-ready Docker setup.

### Files Created
- `Dockerfile.prod`: Optimized multi-stage build.
- `docker-compose.prod.yaml`: Orchestrates the API service.
- `startup.prod.sh`: Runs migrations and starts the app.

### Start the Application

Run the following command to build and start the container in the background:

```bash
sudo docker compose -f docker-compose.prod.yaml up -d --build
```

### Check Logs

To verify everything is running correctly:

```bash
sudo docker compose -f docker-compose.prod.yaml logs -f
```

You should see "Running migrations..." followed by "Starting application..." and finally "Nest application successfully started".

---

## Step 4: Nginx & SSL (Recommended)

To serve your API securely over HTTPS, set up Nginx as a reverse proxy.

### Install Nginx & Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Configure Nginx

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/chakula-api
```

Paste the following (replace `api.yourdomain.com` with your domain):

```nginx
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chakula-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Enable SSL (HTTPS)

Run Certbot to automatically obtain and configure an SSL certificate:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx config to use HTTPS.

---

## Maintenance

### Updating the App

To deploy changes:

1.  Pull the latest code:
    ```bash
    git pull
    ```
2.  Rebuild and restart containers:
    ```bash
    sudo docker compose -f docker-compose.prod.yaml up -d --build
    ```

### Database Backups

Since you are using Neon, use the **Neon Console** to manage backups and point-in-time recovery.

