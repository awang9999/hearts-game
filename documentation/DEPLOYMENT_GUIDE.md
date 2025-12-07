# Hearts Card Game - Complete Deployment Guide

**Live URL**: https://hearts.alexander-wang.net

This guide covers everything you need to deploy, update, and manage your Hearts Card Game on AWS.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Scripts](#deployment-scripts)
3. [Common Workflows](#common-workflows)
4. [AWS Resources](#aws-resources)
5. [IAM Permissions](#iam-permissions)
6. [Troubleshooting](#troubleshooting)
7. [Cost Information](#cost-information)

---

## Quick Start

### First Time Deployment

```bash
./deploy-hearts-to-aws.sh
```

Wait 15-20 minutes for CloudFront to deploy, then visit: https://hearts.alexander-wang.net

### Update Website Content

```bash
./update-hearts.sh
```

Takes ~2 minutes (includes cache invalidation).

### Interactive Menu

```bash
./deploy.sh
```

Provides a menu for all operations.

---

## Deployment Scripts

### Available Scripts

| Script | Purpose | Time |
|--------|---------|------|
| `deploy.sh` | Full deployment (S3 + CloudFront + Route53) | ~5 min + 15-20 min CloudFront |
| `update.sh` | Quick content update only | ~2 min |
| `teardown.sh` | Remove all AWS resources | ~15 min |

### Script Details

#### `deploy.sh`

**Full deployment script** that creates all AWS resources.

```bash
# Full deployment
./deploy.sh
```

**What it does:**
1. ✅ Checks prerequisites (AWS CLI, Node.js, credentials)
2. ✅ Builds your React app (`npm run build`)
3. ✅ Creates S3 bucket `hearts.alexander-wang.net`
4. ✅ Enables static website hosting
5. ✅ Disables Block Public Access
6. ✅ Sets public read policy
7. ✅ Uploads files with optimal cache headers
8. ✅ Creates CloudFront distribution with HTTPS
9. ✅ Creates Route 53 DNS record
10. ✅ Provides deployment summary

#### `update.sh`

**Quick update script** for content changes only.

```bash
./update.sh
```

**What it does:**
1. ✅ Builds your React app
2. ✅ Uploads to S3
3. ✅ Invalidates CloudFront cache
4. ✅ Done in ~2 minutes

**Use this when:**
- You've made code changes
- You want to update the website quickly
- Infrastructure is already deployed

#### `teardown.sh`

**Removal script** that deletes all AWS resources.

```bash
./teardown.sh
```

**What it does:**
1. ⚠️ Finds CloudFront distribution
2. ⚠️ Disables distribution (takes 10-15 min)
3. ⚠️ Deletes distribution
4. ⚠️ Deletes Route 53 DNS record
5. ⚠️ Empties and deletes S3 bucket

**Warning:** Type `DELETE` to confirm. This is irreversible!

#### `deploy.sh`

**Interactive menu** for all operations.

```bash
./deploy.sh
```

**Menu options:**
1. Quick Update
2. Full Deployment
3. Terraform Deployment
4. Teardown
5. View Deployment Status
6. Help & Documentation
7. Exit

---

## Common Workflows

### First Time Setup

```bash
# 1. Deploy everything
./deploy.sh

# 2. Wait for CloudFront (15-20 minutes)
# Check status with the distribution ID from deployment output

# 3. Visit your site
open https://hearts.alexander-wang.net
```

### Making Code Changes

```bash
# 1. Edit your code
vim src/App.tsx

# 2. Update the site
./update.sh

# 3. Wait 1-2 minutes for cache invalidation

# 4. Refresh browser (hard refresh: Ctrl+Shift+R)
```

### Checking Deployment Status

```bash
# Manual checks
aws s3 ls s3://hearts.alexander-wang.net/
aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'hearts.alexander-wang.net')]]"
aws route53 list-resource-record-sets --hosted-zone-id Z04325761YBHOSD0AF7RH --query "ResourceRecordSets[?Name=='hearts.alexander-wang.net.']"
```

### Complete Removal

```bash
# Remove everything
./teardown.sh

# Type 'DELETE' when prompted
# Wait ~15 minutes for CloudFront deletion
```

---

## AWS Resources

### What Gets Created

#### 1. S3 Bucket
- **Name**: `hearts.alexander-wang.net`
- **Region**: us-west-2
- **Purpose**: Hosts static files (HTML, CSS, JS, assets)
- **Configuration**:
  - Static website hosting enabled
  - Index document: `index.html`
  - Error document: `index.html` (for SPA routing)
  - Public read access enabled
  - Block Public Access: disabled

#### 2. CloudFront Distribution
- **ID**: E2F96O5L3ZEDKQ (from your deployment)
- **Domain**: d3p64r4f2yre1p.cloudfront.net
- **Purpose**: Global CDN with HTTPS
- **Configuration**:
  - Origin: S3 website endpoint
  - HTTPS: Redirect HTTP to HTTPS
  - SSL Certificate: `*.alexander-wang.net` (existing)
  - Custom error pages: 403/404 → index.html (for SPA routing)
  - Compression: Enabled
  - HTTP version: HTTP/2
  - Price class: All edge locations

#### 3. Route 53 DNS Record
- **Name**: hearts.alexander-wang.net
- **Type**: A (Alias)
- **Target**: CloudFront distribution
- **Hosted Zone**: alexander-wang.net (Z04325761YBHOSD0AF7RH)

#### 4. SSL Certificate (Existing)
- **ARN**: arn:aws:acm:us-east-1:488985706349:certificate/43e7d0e9-5c03-47e6-8ab9-9f7a809835ed
- **Domain**: `*.alexander-wang.net` (wildcard)
- **Status**: Issued
- **Region**: us-east-1 (required for CloudFront)

### Resource Diagram

```
User Browser
    ↓
https://hearts.alexander-wang.net (Route 53)
    ↓
CloudFront Distribution (HTTPS, Global CDN)
    ↓
S3 Bucket (Static Website Hosting)
    ↓
React App Files (HTML, CSS, JS)
```

---

## IAM Permissions

### Required Permissions

Your IAM role needs these permissions for deployment:

#### Critical (Must Have)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:ListBucket",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:ListDistributions",
        "cloudfront:CreateInvalidation",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "acm:ListCertificates",
        "acm:DescribeCertificate"
      ],
      "Resource": "*"
    }
  ]
}
```

### Policy Files

- `aws-iam-policy-minimal.json` - Minimal required permissions
- `aws-iam-policy-required.json` - Complete permissions with all features

### Applying Permissions

```bash
# Update IAM role policy
aws iam put-role-policy \
  --role-name AgenticAIAccessRole \
  --policy-name HeartsGameDeployment \
  --policy-document file://aws-iam-policy-minimal.json
```

### Assuming the Role

```bash
# Assume role
aws sts assume-role \
  --role-arn arn:aws:iam::488985706349:role/AgenticAIAccessRole \
  --role-session-name hearts-deployment \
  --profile awang

# Export credentials (from output)
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
export AWS_DEFAULT_REGION="us-west-2"
```

---

## Troubleshooting

### Common Issues

#### 1. "Access Denied" when creating CloudFront distribution

**Cause**: Missing `cloudfront:CreateDistribution` permission

**Fix**: Apply IAM policy from `aws-iam-policy-minimal.json`

#### 2. "Access Denied" when setting bucket policy

**Cause**: Block Public Access is enabled

**Fix**: Script now handles this automatically by disabling Block Public Access first

#### 3. Website shows old content

**Cause**: CloudFront cache not invalidated

**Fix**: 
```bash
aws cloudfront create-invalidation --distribution-id E2F96O5L3ZEDKQ --paths "/*"
```

Or use `./update-hearts.sh` which does this automatically.

#### 4. 403 Forbidden error

**Cause**: Bucket policy not set correctly

**Fix**:
```bash
aws s3api get-bucket-policy --bucket hearts.alexander-wang.net
```

Verify policy allows public read access.

#### 5. CloudFront deployment taking forever

**Cause**: This is normal

**Solution**: CloudFront deployments take 15-20 minutes. Check status:
```bash
aws cloudfront get-distribution --id E2F96O5L3ZEDKQ --query 'Distribution.Status'
```

#### 6. DNS not resolving

**Cause**: DNS propagation delay

**Solution**: Wait a few minutes. Check DNS:
```bash
dig hearts.alexander-wang.net
nslookup hearts.alexander-wang.net
```

#### 7. "MalformedXML" error with HttpVersion

**Cause**: CloudFront API requires lowercase enum values

**Fix**: Already fixed in script (changed `HTTP2` to `http2`)

### Debugging Commands

```bash
# Check S3 bucket
aws s3 ls s3://hearts.alexander-wang.net/ --recursive

# Check CloudFront distribution
aws cloudfront get-distribution --id E2F96O5L3ZEDKQ

# Check Route 53 record
aws route53 list-resource-record-sets \
  --hosted-zone-id Z04325761YBHOSD0AF7RH \
  --query "ResourceRecordSets[?Name=='hearts.alexander-wang.net.']"

# Check SSL certificate
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:488985706349:certificate/43e7d0e9-5c03-47e6-8ab9-9f7a809835ed \
  --region us-east-1

# Test website
curl -I https://hearts.alexander-wang.net
```

---

## Cost Information

### Monthly Costs (Estimated)

| Service | Cost | Notes |
|---------|------|-------|
| **S3** | ~$0.50 | Storage + requests for low traffic |
| **CloudFront** | ~$1-5 | First 1TB free tier, then $0.085/GB |
| **Route 53** | $0 | Using existing hosted zone ($0.50/month already paid) |
| **SSL Certificate** | $0 | Free with ACM |
| **Total** | **~$2-6/month** | For low to moderate traffic |

### Cost Breakdown

#### S3 Costs
- Storage: $0.023/GB/month (~$0.01 for this app)
- GET requests: $0.0004/1000 requests
- Data transfer to CloudFront: Free

#### CloudFront Costs
- First 1TB: Free tier (first 12 months) or $0.085/GB
- HTTPS requests: $0.01/10,000 requests
- No charge for data transfer from S3 to CloudFront

#### Route 53 Costs
- Hosted zone: $0.50/month (already exists for alexander-wang.net)
- Queries: $0.40/million (first 1M free)

### Cost Optimization Tips

1. **Use CloudFront caching** - Reduces S3 requests
2. **Set proper cache headers** - Script already does this
3. **Enable compression** - Already enabled in CloudFront
4. **Monitor usage** - Use AWS Cost Explorer

### Monitoring Costs

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## Deployment Timeline

### Initial Deployment
- Build app: ~30 seconds
- Create S3 bucket: ~5 seconds
- Upload files: ~10 seconds
- Create CloudFront: ~5 seconds
- **CloudFront propagation: 15-20 minutes** ⏰
- Create DNS record: ~5 seconds
- DNS propagation: 1-5 minutes

**Total**: ~20-25 minutes until fully live

### Content Updates
- Build app: ~30 seconds
- Upload files: ~10 seconds
- Cache invalidation: ~1-2 minutes

**Total**: ~2-3 minutes

### Teardown
- Disable CloudFront: ~5 seconds
- **CloudFront deployment: 10-15 minutes** ⏰
- Delete CloudFront: ~5 seconds
- Delete DNS record: ~5 seconds
- Delete S3 bucket: ~10 seconds

**Total**: ~15 minutes

---

## Configuration

### Current Configuration

```bash
SUBDOMAIN="hearts"
DOMAIN="alexander-wang.net"
FULL_DOMAIN="hearts.alexander-wang.net"
BUCKET_NAME="hearts.alexander-wang.net"
REGION="us-west-2"
HOSTED_ZONE_ID="Z04325761YBHOSD0AF7RH"
ACM_CERT_ARN="arn:aws:acm:us-east-1:488985706349:certificate/43e7d0e9-5c03-47e6-8ab9-9f7a809835ed"
DISTRIBUTION_ID="E2F96O5L3ZEDKQ"
```

### Changing Configuration

To deploy to a different subdomain or domain, edit these variables in `deploy-hearts-to-aws.sh`:

```bash
SUBDOMAIN="your-subdomain"
DOMAIN="your-domain.com"
```

---

## Cache Strategy

### Cache Headers

The deployment script sets optimal cache headers:

**Static Assets** (CSS, JS, images):
```
Cache-Control: public, max-age=31536000, immutable
```
- Cached for 1 year
- Immutable (won't change)
- Safe because filenames include content hash

**HTML Files**:
```
Cache-Control: public, max-age=0, must-revalidate
```
- Always check for updates
- Ensures users get latest version

### Cache Invalidation

When you update content, CloudFront cache is automatically invalidated:

```bash
aws cloudfront create-invalidation \
  --distribution-id E2F96O5L3ZEDKQ \
  --paths "/*"
```

This is included in `update-hearts.sh`.

---

## Security

### Current Security Setup

✅ **HTTPS Only** - CloudFront redirects HTTP to HTTPS
✅ **SSL Certificate** - Valid wildcard certificate
✅ **Public Read Only** - S3 bucket allows only GET requests
✅ **No Directory Listing** - S3 website hosting prevents listing
✅ **SPA Routing** - 404 errors redirect to index.html

### Security Best Practices

1. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor AWS CloudTrail** - Track API calls

3. **Enable S3 versioning** (optional)
   ```bash
   aws s3api put-bucket-versioning \
     --bucket hearts.alexander-wang.net \
     --versioning-configuration Status=Enabled
   ```

4. **Set up CloudWatch alarms** (optional)

5. **Regular backups** - S3 versioning or separate backup bucket

---

## Additional Resources

### AWS Documentation
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)

### Project Files
- `deploy.sh` - Main deployment script
- `update.sh` - Quick update script
- `teardown.sh` - Removal script

### Support Commands

```bash
# View all deployment scripts
ls -la *.sh

# Make scripts executable
chmod +x *.sh

# View script help
./deploy.sh

# Check AWS credentials
aws sts get-caller-identity

# List all S3 buckets
aws s3 ls

# List CloudFront distributions
aws cloudfront list-distributions

# Check deployment status (use your distribution ID from deployment)
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID --query 'Distribution.Status'
```

---

## Quick Reference

### Most Common Commands

```bash
# Deploy everything
./deploy.sh

# Update content
./update.sh

# Remove everything
./teardown.sh
```

### Important URLs

- **Website**: https://hearts.alexander-wang.net
- **S3 Endpoint**: http://hearts.alexander-wang.net.s3-website-us-west-2.amazonaws.com
- **CloudFront**: https://d3p64r4f2yre1p.cloudfront.net

### Important IDs

- **CloudFront Distribution**: E2F96O5L3ZEDKQ
- **Hosted Zone**: Z04325761YBHOSD0AF7RH
- **AWS Account**: 488985706349
- **Region**: us-west-2

---

## Summary

You now have a complete AWS deployment setup for your Hearts Card Game:

✅ **Automated deployment** with bash scripts
✅ **Quick updates** in ~2 minutes
✅ **HTTPS enabled** with existing SSL certificate
✅ **Global CDN** via CloudFront
✅ **Custom domain** at hearts.alexander-wang.net
✅ **Easy teardown** when needed
✅ **Optional Terraform** for infrastructure as code

**Your game is live at**: https://hearts.alexander-wang.net 🎮🚀

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section above.
