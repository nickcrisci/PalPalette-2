# GitHub Actions Setup Guide - Manual Deployment

⚠️ **Important**: Since your server requires VPN access for SSH, we've configured **Manual Deployment with Releases** instead of direct SSH deployment from GitHub Actions.

## How It Works

1. **Push to main branch** → GitHub Actions creates a deployment package
2. **Download package** from GitHub Releases
3. **Connect to VPN** and manually deploy to server
4. **Automated building** but **manual control** over deployment

## Required GitHub Secrets

Since we're using manual deployment, you only need **0 secrets** (super simple!):

### No Secrets Required! 🎉

GitHub Actions only creates deployment packages - no server access needed.

## Manual Deployment Process

### Step 1: Push Your Changes

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Step 2: Download Deployment Package

1. Go to your repository's **Releases** page
2. Download the latest `palpalette-deployment-latest.tar.gz`
3. Extract it: `tar -xzf palpalette-deployment-latest.tar.gz`

### Step 3: Deploy to Server

```bash
# 1. Connect to your VPN first!

# 2. Upload to server
scp -r release/* user@cides06.gm.fh-koeln.de:/opt/palpalette/

# 3. SSH to server
ssh user@cides06.gm.fh-koeln.de
cd /opt/palpalette

# 4. Configure environment (FIRST TIME ONLY)
nano .env.production
# Set your DB_PASSWORD and JWT_SECRET (see below)

# 5. Deploy!
./deploy.sh
```

## Environment Configuration (First Time Setup)

When you first deploy, you need to edit `.env.production` on the server:

### Generate Secure Values

**Database Password:**

```bash
# Generate a secure password
openssl rand -base64 32
# Example: K8mN2pQ7rS9tU1vW3xY5zA2bC4dE6fG8h
```

**JWT Secret:**

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Example: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Edit .env.production

Replace these values in `/opt/palpalette/.env.production`:

```env
# Change these values!
DB_PASSWORD=K8mN2pQ7rS9tU1vW3xY5zA2bC4dE6fG8h
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## Server Setup Requirements

### One-time server setup:

```bash
# SSH to your server (via VPN)
ssh user@cides06.gm.fh-koeln.de

# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Add user to docker group
sudo usermod -aG docker $USER

# 4. Create deployment directory
sudo mkdir -p /opt/palpalette
sudo chown $USER:$USER /opt/palpalette

# 5. Configure firewall
sudo ufw allow 3000/tcp  # Backend API
sudo ufw allow 3001/tcp  # WebSocket for ESP32

# 6. Log out and back in for group changes to take effect
exit
```

## Deployment Workflow

### Every time you want to deploy:

1. **Make changes** to your code
2. **Push to main** → Triggers GitHub Actions
3. **Download package** from Releases
4. **Connect to VPN**
5. **Upload and deploy** with the provided scripts

### The deployment package includes:

- ✅ **Backend source code** (no node_modules - Docker handles this)
- ✅ **Docker configuration** for production
- ✅ **Deployment script** with health checks
- ✅ **Rollback script** for emergencies
- ✅ **Environment template** with placeholders
- ✅ **Comprehensive README** with instructions

## Benefits of This Approach

### ✅ **Simple Setup**

- No SSH keys to manage
- No server credentials in GitHub
- Zero secrets needed!

### ✅ **Secure**

- No external access to your server
- You control when deployment happens
- VPN requirement maintained

### ✅ **Automated Building**

- Code testing happens automatically
- Deployment packages created automatically
- Mobile apps and firmware built automatically

### ✅ **Manual Control**

- Deploy when you're ready
- Review changes before deployment
- Easy rollback if needed

## Testing the Setup

### Test 1: Check Repository Permissions

First, verify your repository has the correct permissions:

1. **Go to Repository Settings**:

   - Navigate to: `https://github.com/nickcrisci/PalPalette-2/settings`
   - Go to **Actions** → **General**

2. **Set Workflow Permissions**:
   - Under "Workflow permissions", select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
   - Click **Save**

### Test 2: Test Release Creation

1. **Run the test workflow**:

   - Go to **Actions** tab
   - Select **"Test Release Creation"** workflow
   - Click **"Run workflow"** → **"Run workflow"**

2. **Check if test release is created**:
   - If successful, you'll see a test release in the **Releases** section
   - You can delete the test release after verification

### Test 3: Create a Deployment Package

1. Make a small change to your code
2. Push to main branch: `git push origin main`
3. Check GitHub Actions: Go to **Actions** tab
4. Wait for "Create Deployment Release" to complete
5. Check **Releases** tab for the new deployment package

### Test 2: Manual Deployment

1. Download the deployment package
2. Extract and review the contents
3. Upload to server via VPN
4. Test deployment on server

## Quick Commands Reference

### Download Latest Release

```bash
# Get the latest release URL (GitHub CLI)
gh release download --pattern "palpalette-deployment-latest.tar.gz"

# Or download manually from GitHub web interface
# Go to: https://github.com/nickcrisci/PalPalette-2/releases
```

### Deploy to Server

```bash
# Extract package
tar -xzf palpalette-deployment-latest.tar.gz

# Upload to server (via VPN)
scp -r release/* user@cides06.gm.fh-koeln.de:/opt/palpalette/

# Deploy on server
ssh user@cides06.gm.fh-koeln.de "cd /opt/palpalette && ./deploy.sh"
```

### Check Deployment

```bash
# SSH to server and check status
ssh user@cides06.gm.fh-koeln.de
cd /opt/palpalette

# Check container status
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test API
curl http://localhost:3000/health
```

## Troubleshooting

### GitHub Actions Issues

**Problem: "Create Release" fails with 403 error**

- **Cause**: Insufficient permissions for GitHub Actions
- **Solution**:
  1. Go to Repository Settings → Actions → General
  2. Set Workflow permissions to "Read and write permissions"
  3. Enable "Allow GitHub Actions to create and approve pull requests"
  4. Save settings and retry

**Problem: Workflow doesn't trigger**

- Check that your changes are in the `backend/` folder
- Ensure you're pushing to the `main` branch
- Check the **Actions** tab for error messages

**Problem: Package creation fails**

- Check if `docker-compose.production.yml` exists
- Verify backend code compiles: `cd backend && npm run build`

### Server Deployment Issues

**Problem: "CHANGE_THIS" error**

- Edit `.env.production` on the server
- Set proper values for `DB_PASSWORD` and `JWT_SECRET`
- Ensure no placeholder values remain

**Problem: Docker build fails**

- Check available disk space: `df -h`
- Clean old images: `docker system prune -a`
- Ensure Docker is running: `docker ps`

**Problem: Containers won't start**

- Check logs: `docker-compose logs backend`
- Verify environment variables are correct
- Ensure ports 3000/3001 are available

**Problem: VPN Connection Issues**

- Ensure VPN is connected before SSH/SCP
- Test basic connectivity: `ping cides06.gm.fh-koeln.de`
- Verify you can SSH manually first

## Deployment Package Contents

When you download and extract the deployment package, you'll find:

```
release/
├── backend/              # Backend source code
├── docker-compose.yml    # Production Docker config
├── .env.production       # Environment template (EDIT THIS!)
├── deploy.sh            # Smart deployment script
├── rollback.sh          # Emergency rollback script
└── README.md            # Detailed deployment instructions
```

## Advanced Features

### Smart Deployment Script

The `deploy.sh` script includes:

- ✅ **Environment validation** - Won't deploy with placeholder values
- ✅ **Health checks** - Verifies deployment success
- ✅ **Container management** - Stops old, starts new containers
- ✅ **Cleanup** - Removes old Docker images
- ✅ **Error handling** - Shows logs if deployment fails

### Rollback Capability

If something goes wrong:

```bash
cd /opt/palpalette
./rollback.sh
# Then deploy a previous version package
```

### Environment Protection

The deployment script prevents accidental deployment with:

- Default passwords
- Placeholder JWT secrets
- Invalid configuration

## Future Enhancements

If you want to automate deployment later, you can:

1. **Self-hosted Runner**: Install GitHub Actions runner on your network
2. **VPN Gateway**: Configure GitHub Actions to use your VPN
3. **Webhook Deployment**: Create HTTP-based deployment endpoint

For now, manual deployment gives you full control while maintaining security! 🚀

## Summary

✅ **Zero GitHub secrets required**  
✅ **Automated package creation**  
✅ **Manual deployment control**  
✅ **VPN security maintained**  
✅ **Smart deployment scripts**  
✅ **Health checks and rollback**

Your deployment is now as simple as: **Push → Download → Deploy** 🎉
