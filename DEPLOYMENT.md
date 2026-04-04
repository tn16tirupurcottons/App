# 🚀 Production Deployment Guide

This guide covers deploying TN16 Ecommerce for production environments.

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured (.env file)
- [ ] Database backup and migration strategy
- [ ] SSL/TLS certificates obtained
- [ ] Domain name configured
- [ ] Payment gateway credentials updated to production keys
- [ ] Email service configured
- [ ] File upload storage configured (local or cloud)
- [ ] Logging and monitoring setup
- [ ] Security audit completed
- [ ] Load testing completed

## 🔧 Production Environment Setup

### 1. Environment Variables

Update `.env` with production values:

```bash
NODE_ENV=production
PORT=5001

# Database - Use a managed service (AWS RDS, DigitalOcean, etc.)
DB_URL=postgresql://user:secure_password@prod-db.example.com:5432/tn16_ecommerce

# JWT - Generate strong random keys
JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Use production API keys
STRIPE_SECRET_KEY=sk_live_...
RAZORPAY_KEY_ID=...

# CORS - Set to production domain
CORS_ORIGIN=https://yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

### 2. Database Migration

```bash
# Backup production database before migration
pg_dump -U postgres tn16_ecommerce > backup-$(date +%Y%m%d-%H%M%S).sql

# Run migrations (automatic on first start)
npm run dev:backend  # or npm start

# Or manually with Sequelize:
npx sequelize db:migrate
```

### 3. Build Frontend

```bash
cd ecommerce-frontend
npm run build

# Output in dist/ directory ready for deployment
```

## 🖥️ Deployment Options

### Option 1: Traditional VPS/Server

**Using PM2 (Process Manager):**

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js in backend directory
cat > ecommerce-backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tn16-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecommerce-backend/ecosystem.config.js

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/tn16-api
upstream backend {
    server localhost:5001;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Frontend Static Hosting (Nginx):**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/tn16-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend;
    }
}
```

### Option 2: Docker Deployment

**Dockerfile for Backend:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 5001
CMD ["npm", "start"]
```

**Dockerfile for Frontend:**

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)
```bash
npm install -g vercel
cd ecommerce-frontend
vercel --prod
```

#### Heroku (Backend)
```bash
heroku login
heroku create tn16-api
git push heroku main
```

#### AWS (Both)
- Use EC2 for application server
- Use RDS for PostgreSQL database
- Use S3 for file storage
- Use CloudFront for CDN

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install New Relic
npm install newrelic

# Or Datadog
npm install datadog-browser-rum
```

### Log Management

```bash
# Using Winston logger
npm install winston

# Configure in server.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔐 Security Best Practices

### 1. HTTPS/SSL
- Use Let's Encrypt for free SSL certificates
- Configure auto-renewal
- Enable HSTS headers

### 2. Database Security
- Use strong passwords
- Enable encryption at rest
- Regular backups (daily minimum)
- Whitelist IP addresses
- Use VPN for connections

### 3. Secrets Management
- Use environment variables (not in code)
- Use secrets management service (AWS Secrets Manager, Vault)
- Rotate keys regularly
- Never commit .env files

### 4. Application Security
- Keep dependencies updated: `npm audit fix`
- Rate limiting (configured)
- Input validation (configured)
- SQL injection prevention (Sequelize)
- CORS properly configured
- CSP headers enabled

### 5. File Upload Security
- Size limits enforced (50MB)
- File type validation
- Scan uploads for malware
- Store outside web root

## 📈 Performance Optimization

### Frontend
```bash
# Enable gzip compression
npm install compression

# Lazy load routes (already configured)
# Optimize images with Sharp (already configured)
```

### Backend
```bash
# Enable compression middleware
import compression from 'compression';
app.use(compression());

# Database query optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Implement query caching
```

### Caching
```bash
# Add Redis for session/cache
npm install redis

# Configure in middleware
```

## 🔄 CI/CD Pipeline

**GitHub Actions Example:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install-all
      
      - name: Run tests
        run: npm test
      
      - name: Build frontend
        run: npm run build-frontend
      
      - name: Deploy
        run: npm run deploy
```

## 📦 Backup & Disaster Recovery

### Database Backups
```bash
# Daily automated backups
0 2 * * * pg_dump -U postgres tn16_ecommerce | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Store in cloud (S3, Google Cloud Storage)
aws s3 sync /backups s3://bucket-name/backups/
```

### Restore from Backup
```bash
gunzip < backup.sql.gz | psql -U postgres tn16_ecommerce
```

## 🆘 Emergency Procedures

### Database Connection Issues
```bash
# Check database service
systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d tn16_ecommerce

# Restart application
pm2 restart tn16-api
```

### Out of Disk Space
```bash
# Clean old logs
find /var/log -type f -name "*.log" -mtime +30 -delete

# Clean node_modules if needed (rebuild after)
npm run clean
```

### Memory Issues
```bash
# Monitor memory usage
free -h

# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

## ✅ Post-Deployment Verification

1. **Smoke Tests**
   ```bash
   curl https://api.yourdomain.com/health
   curl https://yourdomain.com
   ```

2. **Functional Tests**
   - User registration and login
   - Product browsing and filtering
   - Cart and checkout
   - Payment processing

3. **Performance Tests**
   - Page load times
   - API response times
   - Database query times

4. **Security Tests**
   - SSL certificate validity
   - CORS headers
   - Security headers (via OWASP header check)

## 📞 Support & Updates

- Monitor security advisories: `npm audit`
- Keep Node.js updated: `nvm install node`
- Review logs regularly for errors
- Set up alerts for critical errors

---

**Last Updated**: April 2026
**Version**: 1.0.0
