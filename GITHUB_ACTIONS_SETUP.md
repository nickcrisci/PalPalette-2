# GitHub Secrets Setup Guide

To enable automated deployment, you need to configure the following secrets in your GitHub repository:

## Setting up GitHub Secrets

1. Go to your GitHub repository: `https://github.com/nickcrisci/PalPalette-2`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Required Secrets

#### `SERVER_SSH_KEY`

- **Description**: Private SSH key for accessing your server
- **Value**: Your private SSH key content (usually from `~/.ssh/id_rsa`)

**To generate a new SSH key pair:**

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/palpalette_deploy_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/palpalette_deploy_key.pub user@cides06.gm.fh-koeln.de

# Copy private key content for GitHub secret
cat ~/.ssh/palpalette_deploy_key
```

#### `SERVER_USER`

- **Description**: Username for SSH access to your server
- **Value**: Your server username (e.g., `ubuntu`, `admin`, `your-username`)

#### `DB_PASSWORD`

- **Description**: PostgreSQL database password for production
- **Value**: A secure password for your production database
- **Example**: `SecurePassword123!`

#### `JWT_SECRET`

- **Description**: JWT secret key for token signing
- **Value**: A long, random string for JWT token security
- **Example**: `your-very-secure-jwt-secret-key-production-2024`

## Server Setup Requirements

### 1. Ensure Docker is installed on your server:

```bash
# SSH to your server
ssh user@cides06.gm.fh-koeln.de

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Create deployment directory:

```bash
sudo mkdir -p /opt/palpalette
sudo chown $USER:$USER /opt/palpalette
```

### 3. Configure firewall:

```bash
# Allow required ports
sudo ufw allow 3000/tcp  # Backend API
sudo ufw allow 3001/tcp  # WebSocket for ESP32
```

## Testing the Setup

After configuring the secrets:

1. **Push to main branch** - This will trigger the deployment workflow
2. **Check Actions tab** - Monitor the deployment progress
3. **Verify deployment** - The workflow will test the endpoints automatically

## Manual Deployment Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy PalPalette to Server** workflow
3. Click **Run workflow** → **Run workflow**

## Workflow Features

### ✅ Automated Backend Deployment

- Tests backend code
- Builds Docker images
- Deploys to production server
- Verifies deployment health

### ✅ Mobile App Building

- Builds Android APK
- Builds iOS app (on macOS runners)
- Uploads build artifacts

### ✅ ESP32 Firmware Building

- Compiles firmware with PlatformIO
- Uploads firmware binaries
- Includes flash instructions

## Troubleshooting

### SSH Connection Issues

- Verify SSH key is correctly formatted (no extra spaces/newlines)
- Ensure public key is in `~/.ssh/authorized_keys` on server
- Test SSH connection manually: `ssh -i ~/.ssh/palpalette_deploy_key user@cides06.gm.fh-koeln.de`

### Docker Issues on Server

- Check Docker is running: `sudo systemctl status docker`
- Verify user is in docker group: `groups $USER`
- Test Docker: `docker run hello-world`

### Deployment Failures

- Check GitHub Actions logs in the **Actions** tab
- Verify all secrets are set correctly
- Ensure server has sufficient disk space and memory
