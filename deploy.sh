#!/bin/bash

################################################################################
# AWS Deployment Script for Hearts Game
# Deploys to hearts.alexander-wang.net
#
# This script follows the same pattern as alexander-wang.net:
# - S3 bucket for static hosting
# - CloudFront distribution with HTTPS
# - Route 53 DNS record
# - Uses existing wildcard certificate *.alexander-wang.net
################################################################################

set -e  # Exit on error

# Configuration
SUBDOMAIN="hearts"
DOMAIN="alexander-wang.net"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
BUCKET_NAME="${FULL_DOMAIN}"
REGION="us-west-2"

# These will be auto-detected from your AWS account
HOSTED_ZONE_ID=""  # Will be detected automatically
ACM_CERT_ARN=""    # Will be detected automatically

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Auto-detect AWS resources
detect_aws_resources() {
    print_header "Detecting AWS Resources"
    
    # Detect hosted zone
    if [ -z "$HOSTED_ZONE_ID" ]; then
        print_info "Detecting Route 53 hosted zone for ${DOMAIN}..."
        HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
            --no-cli-pager \
            --query "HostedZones[?Name=='${DOMAIN}.'].Id" \
            --output text | cut -d'/' -f3)
        
        if [ -z "$HOSTED_ZONE_ID" ]; then
            print_error "Could not find hosted zone for ${DOMAIN}"
            exit 1
        fi
        print_success "Found hosted zone: ${HOSTED_ZONE_ID}"
    fi
    
    # Detect ACM certificate
    if [ -z "$ACM_CERT_ARN" ]; then
        print_info "Detecting ACM certificate for *.${DOMAIN}..."
        ACM_CERT_ARN=$(aws acm list-certificates \
            --region us-east-1 \
            --no-cli-pager \
            --query "CertificateSummaryList[?DomainName=='*.${DOMAIN}' || DomainName=='${DOMAIN}'].CertificateArn" \
            --output text | head -1)
        
        if [ -z "$ACM_CERT_ARN" ]; then
            print_warning "No ACM certificate found for *.${DOMAIN}"
            print_info "You may need to create one in us-east-1 region"
        else
            print_success "Found certificate: ${ACM_CERT_ARN}"
        fi
    fi
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    print_success "AWS CLI is installed"
    
    if ! aws sts get-caller-identity --no-cli-pager &> /dev/null; then
        print_error "AWS CLI is not configured"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --no-cli-pager)
    print_success "AWS Account: ${ACCOUNT_ID}"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js is installed ($(node --version))"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    print_success "package.json found"
}

# Build the application
build_app() {
    print_header "Building Application"
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    print_info "Building production bundle..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Build completed successfully"
}

# Create S3 bucket
create_bucket() {
    print_header "Creating S3 Bucket"
    
    if aws s3 ls "s3://${BUCKET_NAME}" --no-cli-pager 2>&1 | grep -q 'NoSuchBucket'; then
        print_info "Creating bucket: ${BUCKET_NAME}"
        aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}" --no-cli-pager
        print_success "Bucket created"
    else
        print_warning "Bucket already exists: ${BUCKET_NAME}"
    fi
}

# Configure bucket for static website hosting
configure_website() {
    print_header "Configuring Static Website Hosting"
    
    print_info "Enabling static website hosting..."
    aws s3 website "s3://${BUCKET_NAME}" \
        --index-document index.html \
        --error-document index.html \
        --no-cli-pager
    
    print_success "Static website hosting enabled"
}

# Set bucket policy for CloudFront access
set_bucket_policy() {
    print_header "Setting Bucket Policy"
    
    # First, disable Block Public Access
    print_info "Disabling Block Public Access..."
    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
        --no-cli-pager
    
    print_success "Block Public Access disabled"
    
    print_info "Creating public read policy..."
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "${BUCKET_NAME}" \
        --policy file:///tmp/bucket-policy.json \
        --no-cli-pager
    
    rm /tmp/bucket-policy.json
    
    print_success "Bucket policy applied"
}

# Upload files to S3
upload_files() {
    print_header "Uploading Files to S3"
    
    print_info "Uploading static assets (with long cache)..."
    aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
        --delete \
        --cache-control "public, max-age=31536000, immutable" \
        --exclude "index.html" \
        --exclude "*.html" \
        --no-cli-pager
    
    print_info "Uploading HTML files (with short cache)..."
    aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
        --cache-control "public, max-age=0, must-revalidate" \
        --exclude "*" \
        --include "*.html" \
        --no-cli-pager
    
    print_success "Files uploaded successfully"
}

# Create CloudFront distribution
create_cloudfront() {
    print_header "Creating CloudFront Distribution"
    
    # Check if distribution already exists
    EXISTING_DIST=$(aws cloudfront list-distributions --no-cli-pager --query "DistributionList.Items[?Aliases.Items[?contains(@, '${FULL_DOMAIN}')]].Id" --output text)
    
    if [ -n "$EXISTING_DIST" ]; then
        print_warning "CloudFront distribution already exists: ${EXISTING_DIST}"
        DISTRIBUTION_ID="$EXISTING_DIST"
        return
    fi
    
    print_info "Creating CloudFront distribution..."
    
    S3_WEBSITE_ENDPOINT="${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
    
    cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "hearts-game-$(date +%s)",
  "Comment": "Hearts Card Game - ${FULL_DOMAIN}",
  "Enabled": true,
  "Aliases": {
    "Quantity": 1,
    "Items": ["${FULL_DOMAIN}"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "${S3_WEBSITE_ENDPOINT}",
        "DomainName": "${S3_WEBSITE_ENDPOINT}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 3,
            "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
          },
          "OriginReadTimeout": 30,
          "OriginKeepaliveTimeout": 5
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "${S3_WEBSITE_ENDPOINT}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "TrustedKeyGroups": {
      "Enabled": false,
      "Quantity": 0
    },
    "LambdaFunctionAssociations": {
      "Quantity": 0
    },
    "FunctionAssociations": {
      "Quantity": 0
    },
    "FieldLevelEncryptionId": ""
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      }
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "${ACM_CERT_ARN}",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "Certificate": "${ACM_CERT_ARN}",
    "CertificateSource": "acm"
  },
  "PriceClass": "PriceClass_All",
  "HttpVersion": "http2",
  "IsIPV6Enabled": true
}
EOF
    
    RESULT=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cloudfront-config.json \
        --no-cli-pager \
        --output json)
    
    DISTRIBUTION_ID=$(echo "$RESULT" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)
    CLOUDFRONT_DOMAIN=$(echo "$RESULT" | grep -o '"DomainName": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    rm /tmp/cloudfront-config.json
    
    print_success "CloudFront distribution created: ${DISTRIBUTION_ID}"
    print_info "CloudFront domain: ${CLOUDFRONT_DOMAIN}"
    print_warning "Distribution deployment may take 15-20 minutes"
}

# Create Route 53 DNS record
create_dns_record() {
    print_header "Creating Route 53 DNS Record"
    
    # Get CloudFront distribution domain
    if [ -z "$CLOUDFRONT_DOMAIN" ]; then
        CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
            --id "${DISTRIBUTION_ID}" \
            --no-cli-pager \
            --query 'Distribution.DomainName' \
            --output text)
    fi
    
    print_info "Creating DNS record for ${FULL_DOMAIN}..."
    
    cat > /tmp/route53-record.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${FULL_DOMAIN}",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "${CLOUDFRONT_DOMAIN}",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "${HOSTED_ZONE_ID}" \
        --change-batch file:///tmp/route53-record.json \
        --no-cli-pager
    
    rm /tmp/route53-record.json
    
    print_success "DNS record created for ${FULL_DOMAIN}"
    print_warning "DNS propagation can take a few minutes"
}

# Display deployment summary
display_summary() {
    print_header "Deployment Summary"
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🎮 Hearts Card Game is now live!"
    echo ""
    echo "  📦 S3 Bucket:         ${BUCKET_NAME}"
    echo "  🌍 Region:            ${REGION}"
    echo "  ☁️  CloudFront:        ${DISTRIBUTION_ID}"
    echo "  🔗 URL:               https://${FULL_DOMAIN}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_warning "Note: CloudFront deployment takes 15-20 minutes"
    print_info "Check status: aws cloudfront get-distribution --id ${DISTRIBUTION_ID} --query 'Distribution.Status'"
    echo ""
    
    print_info "To update your site:"
    echo "  Run: ./update.sh"
    echo ""
    
    print_info "To invalidate CloudFront cache:"
    echo "  aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths '/*'"
    echo ""
}

# Main deployment flow
main() {
    clear
    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║        Hearts Card Game Deployment                    ║"
    echo "║        hearts.alexander-wang.net                      ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    detect_aws_resources
    
    echo ""
    print_warning "This will deploy to AWS. Charges may apply."
    print_info "Domain: ${FULL_DOMAIN}"
    print_info "Region: ${REGION}"
    print_info "Hosted Zone: ${HOSTED_ZONE_ID}"
    echo ""
    print_info "Tip: Use './update.sh' for quick content updates"
    echo ""
    read -p "Continue? (y/n): " CONFIRM
    
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    build_app
    create_bucket
    configure_website
    set_bucket_policy
    upload_files
    create_cloudfront
    create_dns_record
    display_summary
}

# Run main function
main "$@"
