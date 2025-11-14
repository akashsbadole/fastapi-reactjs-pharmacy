# Subdomain-Based Tenant Identification Setup Guide

This guide provides step-by-step instructions for setting up subdomain-based tenant identification for the Pharmacy Management System.

## Overview

Subdomain-based tenant identification allows each pharmacy to have its own subdomain (e.g., `pharmacy1.yourdomain.com`, `pharmacy2.yourdomain.com`) while using the same application instance.

## Prerequisites

1. A domain name (e.g., `yourdomain.com`)
2. Access to DNS settings for your domain
3. SSL certificate (recommended for production)
4. Web server (Nginx, Apache, etc.) or cloud service

## DNS Configuration

### Step 1: Create Wildcard DNS Record

Add a wildcard DNS record to point all subdomains to your server:

```
Type: A
Name: *.yourdomain.com
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600 (or as preferred)
```

### Step 2: Verify DNS Configuration

Use a tool like `nslookup` or `dig` to verify the wildcard record:

```bash
nslookup test.yourdomain.com
```

It should return your server's IP address.

## Web Server Configuration

### Nginx Configuration

Create an Nginx configuration file for your domain:

```nginx
server {
    listen 80;
    server_name *.yourdomain.com yourdomain.com;
    
    # Redirect HTTP to HTTPS (recommended)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.yourdomain.com yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/wildcard/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Proxy to your application
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Static files (if serving directly)
    location /static/ {
        alias /path/to/your/static/files/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache Configuration

If using Apache, create a virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias *.yourdomain.com
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias *.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/wildcard/certificate.crt
    SSLCertificateKeyFile /path/to/your/private/key
    
    # Proxy to your application
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:8000/$1" [P,L]
</VirtualHost>
```

## SSL Certificate

### Option 1: Wildcard Certificate

Purchase a wildcard SSL certificate for `*.yourdomain.com`. This will secure all subdomains.

### Option 2: Let's Encrypt Wildcard Certificate

Use Let's Encrypt to generate a free wildcard certificate:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns -d *.yourdomain.com
```

Follow the instructions to add the required TXT record to your DNS.

## Application Configuration

### Backend Configuration

Ensure your FastAPI application is configured to handle requests from any host:

```python
# In main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Tenant Creation

Create tenants with appropriate slugs that match the subdomains:

```bash
# Example API call to create a tenant
curl -X POST "http://localhost:8000/api/tenants/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacy One",
    "slug": "pharmacy1",
    "plan": "professional",
    "billing_email": "admin@pharmacy1.com"
  }'
```

This will create a tenant accessible at `pharmacy1.yourdomain.com`.

## Testing the Setup

### 1. Local Testing with Hosts File

For local testing, modify your hosts file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
```
127.0.0.1 pharmacy1.localhost
127.0.0.1 pharmacy2.localhost
```

**Linux/Mac:** `/etc/hosts`
```
127.0.0.1 pharmacy1.localhost
127.0.0.1 pharmacy2.localhost
```

### 2. Testing with curl

Test the tenant identification:

```bash
# Test with subdomain
curl -H "Host: pharmacy1.localhost" http://localhost:8000/api/health

# Test with another subdomain
curl -H "Host: pharmacy2.localhost" http://localhost:8000/api/health
```

### 3. Browser Testing

Open your browser and navigate to:
- `http://pharmacy1.localhost:8000` (for local testing)
- `https://pharmacy1.yourdomain.com` (for production)

## Troubleshooting

### Common Issues

1. **Subdomain not resolving**
   - Check DNS configuration
   - Verify wildcard DNS record
   - Check DNS propagation

2. **SSL certificate errors**
   - Verify certificate covers the subdomain
   - Check certificate installation
   - Ensure certificate is not expired

3. **Tenant not identified**
   - Check middleware configuration
   - Verify tenant exists in database
   - Check subdomain matches tenant slug

4. **CORS issues**
   - Update CORS configuration
   - Check preflight requests
   - Verify allowed origins

### Debugging Tips

1. Check Nginx/Apache error logs
2. Monitor application logs for tenant identification
3. Use browser developer tools to inspect requests
4. Test with different subdomains to isolate issues

## Production Considerations

1. **Security**
   - Use HTTPS for all requests
   - Implement rate limiting
   - Monitor for unauthorized subdomain access

2. **Performance**
   - Implement caching for tenant settings
   - Use CDN for static assets
   - Monitor server resources

3. **Monitoring**
   - Set up alerts for subdomain failures
   - Monitor SSL certificate expiration
   - Track tenant-specific metrics

## Advanced Configuration

### Custom Domain Support

To support custom domains (e.g., `pharmacy1.com` pointing to your application):

1. Add the custom domain to your DNS configuration
2. Update your web server configuration
3. Add the custom domain to the tenant record in the database

### Multi-Region Deployment

For multi-region deployments:

1. Use GeoDNS to route to the nearest server
2. Replicate database across regions
3. Implement session affinity

This setup provides a robust foundation for subdomain-based tenant identification in your Pharmacy Management System.