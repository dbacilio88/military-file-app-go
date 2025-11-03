# Deployment Guide - Sistema de Expedientes Judiciales

## 📋 Índice

1. [Arquitectura de Deployment](#arquitectura-de-deployment)
2. [Prerrequisitos](#prerrequisitos)
3. [Configuración de Entornos](#configuración-de-entornos)
4. [Deployment con Docker](#deployment-con-docker)
5. [Deployment en Kubernetes](#deployment-en-kubernetes)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoreo y Logging](#monitoreo-y-logging)
8. [Backup y Recuperación](#backup-y-recuperación)
9. [Seguridad](#seguridad)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura de Deployment

### Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (NGINX)                   │
├─────────────────────────────────────────────────────────────┤
│                         SSL/TLS                             │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
┌───────────────▼────┐ ┌────────▼────────┐ ┌───▼────────────┐
│   Frontend         │ │   API Gateway   │ │   File Storage │
│   (Next.js)        │ │   (NGINX/Kong)  │ │   (MinIO/S3)   │
│   Port: 3000       │ │   Port: 8080    │ │                │
└────────────────────┘ └─────────────────┘ └────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
┌───────────────▼────┐ ┌────────▼────────┐ ┌───▼────────────┐
│   Backend API      │ │   Backend API   │ │   Background   │
│   (Go - Instance 1)│ │   (Go - Inst 2) │ │   Jobs (Go)    │
│   Port: 8081       │ │   Port: 8082    │ │                │
└────────────────────┘ └─────────────────┘ └────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
┌───────────────▼────┐ ┌────────▼────────┐ ┌───▼────────────┐
│   MongoDB          │ │   Redis Cache   │ │   Monitoring   │
│   (Replica Set)    │ │   Port: 6379    │ │   (Prometheus) │
│   Port: 27017      │ │                 │ │                │
└────────────────────┘ └─────────────────┘ └────────────────┘
```

### Entornos

- **Development**: Desarrollador local
- **Staging**: Entorno de pruebas
- **Production**: Entorno productivo

## 📋 Prerrequisitos

### Servidor de Producción

```bash
# Especificaciones mínimas
CPU: 4 cores (8 cores recomendado)
RAM: 8GB (16GB recomendado)
Storage: 100GB SSD (500GB recomendado)
Bandwidth: 100Mbps

# Sistema Operativo
Ubuntu 22.04 LTS o superior
CentOS 8/RHEL 8 o superior
```

### Software Requerido

```bash
# Docker y Docker Compose
Docker >= 24.0
Docker Compose >= 2.20

# Kubernetes (opcional)
kubectl >= 1.28
helm >= 3.12

# Herramientas de CI/CD
Git >= 2.30
```

## ⚙️ Configuración de Entornos

### Variables de Entorno - Backend

```bash
# .env.production
# Aplicación
APP_ENV=production
APP_PORT=8080
APP_DEBUG=false

# Base de Datos
MONGODB_URI=mongodb://mongo-user:password@mongodb:27017/judicial_records?authSource=admin
MONGODB_DATABASE=judicial_records
MONGODB_TIMEOUT=10s

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=168h

# Cors
CORS_ORIGINS=https://judicial.example.com,https://api.judicial.example.com

# File Storage
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET=judicial-documents

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@judicial.example.com
SMTP_PASS=app-password

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600

# SSL/TLS
TLS_CERT_PATH=/etc/ssl/certs/app.crt
TLS_KEY_PATH=/etc/ssl/private/app.key
```

### Variables de Entorno - Frontend

```bash
# .env.production
# API
NEXT_PUBLIC_API_URL=https://api.judicial.example.com
NEXT_PUBLIC_WS_URL=wss://api.judicial.example.com/ws

# Aplicación
NEXT_PUBLIC_APP_NAME=Sistema Judicial
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Límites
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_MAX_FILES_PER_UPLOAD=5

# URLs
NEXT_PUBLIC_DOCS_URL=https://docs.judicial.example.com
NEXT_PUBLIC_SUPPORT_URL=https://support.judicial.example.com
```

## 🐳 Deployment con Docker

### Docker Compose - Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: judicial-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./frontend/.env.production
    depends_on:
      - backend
    networks:
      - judicial-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`judicial.example.com`)"
      - "traefik.http.routers.frontend.tls=true"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: judicial-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - APP_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - judicial-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.judicial.example.com`)"
      - "traefik.http.routers.backend.tls=true"

  # MongoDB
  mongodb:
    image: mongo:6.0
    container_name: judicial-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: judicial_records
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - judicial-network
    command: mongod --auth --bind_ip_all

  # Redis
  redis:
    image: redis:7-alpine
    container_name: judicial-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - judicial-network

  # Reverse Proxy
  traefik:
    image: traefik:v3.0
    container_name: judicial-traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
      - "8081:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json
    networks:
      - judicial-network

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: judicial-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - judicial-network

  grafana:
    image: grafana/grafana:latest
    container_name: judicial-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - judicial-network

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  judicial-network:
    driver: bridge
```

### Dockerfiles

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile.prod
FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/main.go

# Production stage
FROM alpine:latest

WORKDIR /root/

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/main .

# Create necessary directories
RUN mkdir -p logs uploads

# Add non-root user
RUN adduser -D -s /bin/sh appuser
USER appuser

EXPOSE 8080

CMD ["./main"]
```

### Comandos de Deployment

```bash
# Preparar entorno
mkdir -p logs uploads monitoring
touch acme.json
chmod 600 acme.json

# Crear archivo de variables de entorno
cp .env.example .env.production
# Editar variables según el entorno

# Construir y levantar servicios
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Hacer backup de la base de datos
docker exec judicial-mongodb mongodump --archive=/backup/judicial_$(date +%Y%m%d_%H%M%S).archive --gzip

# Actualizar aplicación
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Deployment en Kubernetes

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: judicial-system
  labels:
    name: judicial-system
```

### ConfigMaps y Secrets

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: judicial-config
  namespace: judicial-system
data:
  APP_ENV: "production"
  MONGODB_DATABASE: "judicial_records"
  REDIS_DB: "0"
  LOG_LEVEL: "info"

---
apiVersion: v1
kind: Secret
metadata:
  name: judicial-secrets
  namespace: judicial-system
type: Opaque
stringData:
  MONGODB_URI: "mongodb://admin:password@mongodb:27017/judicial_records?authSource=admin"
  JWT_SECRET: "your-super-secret-jwt-key"
  REDIS_PASSWORD: "redis-password"
```

### Deployments

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: judicial-backend
  namespace: judicial-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: judicial-backend
  template:
    metadata:
      labels:
        app: judicial-backend
    spec:
      containers:
      - name: backend
        image: judicial/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: APP_PORT
          value: "8080"
        envFrom:
        - configMapRef:
            name: judicial-config
        - secretRef:
            name: judicial-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: judicial-backend-service
  namespace: judicial-system
spec:
  selector:
    app: judicial-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: judicial-ingress
  namespace: judicial-system
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - judicial.example.com
    - api.judicial.example.com
    secretName: judicial-tls
  rules:
  - host: judicial.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: judicial-frontend-service
            port:
              number: 80
  - host: api.judicial.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: judicial-backend-service
            port:
              number: 80
```

### Comandos de Kubernetes

```bash
# Aplicar configuraciones
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar deployments
kubectl get pods -n judicial-system
kubectl get services -n judicial-system
kubectl get ingress -n judicial-system

# Ver logs
kubectl logs -f deployment/judicial-backend -n judicial-system
kubectl logs -f deployment/judicial-frontend -n judicial-system

# Escalar servicios
kubectl scale deployment judicial-backend --replicas=5 -n judicial-system

# Rolling update
kubectl set image deployment/judicial-backend backend=judicial/backend:v1.1.0 -n judicial-system
kubectl rollout status deployment/judicial-backend -n judicial-system

# Rollback
kubectl rollout undo deployment/judicial-backend -n judicial-system
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.25.1'
    
    - name: Run backend tests
      run: |
        cd backend
        go test -v ./...
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm ci
        npm run test
        npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push backend image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        file: ./backend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
    
    - name: Build and push frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        file: ./frontend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/judicial-system
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          
          # Health check
          sleep 30
          curl -f http://localhost:8080/health || exit 1
          curl -f http://localhost:3000 || exit 1
```

### Script de Deployment

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Variables
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

echo "🚀 Deploying to $ENVIRONMENT with version $VERSION"

# Backup database
echo "📦 Creating database backup..."
docker exec judicial-mongodb mongodump \
  --archive=/backup/judicial_pre_deploy_$(date +%Y%m%d_%H%M%S).archive \
  --gzip

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Update services with zero downtime
echo "🔄 Updating services..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 10

# Health check
echo "🏥 Performing health check..."
for i in {1..30}; do
  if curl -f http://localhost:8080/health; then
    echo "✅ Backend is healthy"
    break
  fi
  sleep 2
done

# Update frontend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
sleep 10

# Final health check
for i in {1..30}; do
  if curl -f http://localhost:3000; then
    echo "✅ Frontend is healthy"
    break
  fi
  sleep 2
done

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"
```

## 📊 Monitoreo y Logging

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'judicial-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'judicial-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Sistema Judicial - Dashboard",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"judicial-backend\"}",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "mongodb_connections{job=\"mongodb\"}",
            "legendFormat": "Connections"
          }
        ]
      }
    ]
  }
}
```

### Logging Configuration

```yaml
# logging/fluent.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match judicial.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name judicial-logs
  type_name _doc
  include_tag_key true
  tag_key @log_name
</match>
```

## 💾 Backup y Recuperación

### Script de Backup

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="judicial-backups"

# MongoDB Backup
echo "📦 Creating MongoDB backup..."
docker exec judicial-mongodb mongodump \
  --archive=/backup/mongodb_$DATE.archive \
  --gzip

# Upload to S3
aws s3 cp /backup/mongodb_$DATE.archive s3://$S3_BUCKET/mongodb/

# File uploads backup
echo "📁 Backing up file uploads..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/judicial-system/uploads
aws s3 cp $BACKUP_DIR/uploads_$DATE.tar.gz s3://$S3_BUCKET/uploads/

# Configuration backup
echo "⚙️ Backing up configuration..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  /opt/judicial-system/docker-compose.prod.yml \
  /opt/judicial-system/.env.production

aws s3 cp $BACKUP_DIR/config_$DATE.tar.gz s3://$S3_BUCKET/config/

# Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find /backup -name "*.archive" -mtime +7 -delete

echo "✅ Backup completed successfully"
```

### Script de Restauración

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1
S3_BUCKET="judicial-backups"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "🔄 Restoring from backup: $BACKUP_FILE"

# Download from S3
aws s3 cp s3://$S3_BUCKET/mongodb/$BACKUP_FILE /tmp/

# Stop services
docker-compose -f docker-compose.prod.yml stop backend

# Restore MongoDB
docker exec judicial-mongodb mongorestore \
  --archive=/tmp/$BACKUP_FILE \
  --gzip \
  --drop

# Restart services
docker-compose -f docker-compose.prod.yml start backend

echo "✅ Restore completed successfully"
```

## 🔒 Seguridad

### SSL/TLS Configuration

```nginx
# nginx/judicial.conf
server {
    listen 443 ssl http2;
    server_name judicial.example.com;

    ssl_certificate /etc/ssl/certs/judicial.crt;
    ssl_certificate_key /etc/ssl/private/judicial.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Docker-specific rules
sudo ufw allow from 172.16.0.0/12 to any port 27017
sudo ufw allow from 172.16.0.0/12 to any port 6379
```

## 🔧 Troubleshooting

### Comandos de Diagnóstico

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
docker-compose -f docker-compose.prod.yml logs --tail=50 frontend
docker-compose -f docker-compose.prod.yml logs --tail=50 mongodb

# Verificar conectividad de red
docker network ls
docker network inspect judicial-network

# Verificar uso de recursos
docker stats

# Verificar almacenamiento
docker system df
docker volume ls

# Entrar en contenedor para debugging
docker exec -it judicial-backend sh
docker exec -it judicial-mongodb mongo

# Verificar configuración
docker-compose -f docker-compose.prod.yml config
```

### Problemas Comunes

#### 1. Error de conexión a MongoDB

```bash
# Verificar que MongoDB esté ejecutándose
docker logs judicial-mongodb

# Verificar autenticación
docker exec -it judicial-mongodb mongo admin -u admin -p

# Verificar conectividad desde backend
docker exec -it judicial-backend ping mongodb
```

#### 2. Error de memoria

```bash
# Verificar uso de memoria
docker stats --no-stream

# Ajustar límites en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

#### 3. Error de SSL

```bash
# Verificar certificados
openssl x509 -in /etc/ssl/certs/judicial.crt -text -noout

# Renovar certificados Let's Encrypt
docker-compose exec traefik sh
certbot renew
```

### Scripts de Monitoreo

```bash
#!/bin/bash
# scripts/health-check.sh

# Verificar servicios principales
services=("frontend" "backend" "mongodb" "redis")

for service in "${services[@]}"; do
  if docker-compose -f docker-compose.prod.yml ps $service | grep -q "Up"; then
    echo "✅ $service is running"
  else
    echo "❌ $service is down"
    # Enviar alerta
    curl -X POST "$SLACK_WEBHOOK" \
      -H 'Content-type: application/json' \
      --data '{"text":"🚨 Service '$service' is down!"}'
  fi
done

# Verificar salud de la aplicación
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
  echo "✅ Backend health check passed"
else
  echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Frontend health check passed"
else
  echo "❌ Frontend health check failed"
fi
```

---

**Guía completa para deployment seguro y confiable**  
**Última actualización**: 2024-11-02