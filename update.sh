#!/bin/bash

################################################################################
# Quick Update Script for Hearts Game
# Only rebuilds and uploads to S3, then invalidates CloudFront cache
################################################################################

set -e

# Configuration
BUCKET_NAME="hearts.alexander-wang.net"
DISTRIBUTION_ID=""  # Will be auto-detected

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

echo ""
echo "🎮 Updating Hearts Card Game..."
echo ""

# Build
print_info "Building application..."
npm run build
print_success "Build complete"

# Upload to S3
print_info "Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.html" \
    --no-cli-pager

aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --no-cli-pager

print_success "Files uploaded"

# Get CloudFront distribution ID if not set
if [ -z "$DISTRIBUTION_ID" ]; then
    print_info "Finding CloudFront distribution..."
    DISTRIBUTION_ID=$(aws cloudfront list-distributions \
        --no-cli-pager \
        --query "DistributionList.Items[?Aliases.Items[?contains(@, '${BUCKET_NAME}')]].Id" \
        --output text)
fi

if [ -n "$DISTRIBUTION_ID" ]; then
    print_info "Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "${DISTRIBUTION_ID}" \
        --paths "/*" \
        --no-cli-pager \
        --query 'Invalidation.Id' \
        --output text)
    
    print_success "Cache invalidation created: ${INVALIDATION_ID}"
    print_warning "Invalidation may take 1-2 minutes to complete"
else
    print_warning "CloudFront distribution not found, skipping cache invalidation"
fi

echo ""
print_success "Update complete! 🎉"
echo ""
print_info "Visit: https://${BUCKET_NAME}"
echo ""
