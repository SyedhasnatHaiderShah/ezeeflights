## Change the AWS ENV Credentials for build Pull

```powershell
# Build image from the docker
frontend:
    image: khurramsagoo/ezee-fe:latest
backend:
    image: khurramsagoo/ezee-be:latest

# Build image from the CICD
frontend:
    image: ghcr.io/khurramsagoo/ezeeflights-frontend:latest
backend:
    image: ghcr.io/khurramsagoo/ezeeflights-backend:latest

```

# Docker Build & Deployment Guide

This guide contains the complete list of Docker commands required to build, push, and deploy the **Ezeeflights/Fareshoppe** backend (`ezee-be`) and frontend (`ezee-fe`) services.

---

## 1. Local Build & Push (Run on Windows PowerShell)

Always run these commands from the repository root: `D:\aws\ezeeflights-aws`. Make sure **Docker Desktop** is running.

### Login (One-time)

```powershell
docker login -u khurramsagoo
```

### Build & Push Backend (`ezee-be`)

```powershell
# Build the image using the clean cache Dockerfile
docker build -f infra/docker/backend.Dockerfile -t khurramsagoo/ezee-be:latest .

# Push the backend image to Docker Hub
docker push khurramsagoo/ezee-be:latest
```

### Build & Push Frontend (`ezee-fe`)

```powershell
# Build the image
docker build -f infra/docker/frontend.Dockerfile -t khurramsagoo/ezee-fe:latest .

# Push the frontend image to Docker Hub
docker push khurramsagoo/ezee-fe:latest
```

---

## 2. Server Deployment (Run on AWS EC2 via SSH)

Always run these commands from the compose project directory: `~/app`.

### Update & Recreate Containers

```bash
# 1. Navigate to the app directory
cd ~/app

# 2. Pull the latest images from Docker Hub
sudo docker compose pull

# 3. Stop, recreate, and restart the containers with the new images
sudo docker compose up -d --force-recreate

# 4. Clean up unused/dangling old images to save disk space
sudo docker image prune -f
```

---

## 3. Monitoring & Management (Run on AWS EC2 via SSH)

Use these commands to check status and view logs:

### Check Status

```bash
# List all running containers and their ports
sudo docker compose ps
```

### View Logs

```bash
# View backend logs in real-time
sudo docker compose logs -f backend

# View frontend logs in real-time
sudo docker compose logs -f frontend

# View logs for both services combined
sudo docker compose logs -f
```

### Restart Services (Without Pulling)

```bash
# Restart the backend service container
sudo docker compose restart backend

# Restart the frontend service container
sudo docker compose restart frontend
```
