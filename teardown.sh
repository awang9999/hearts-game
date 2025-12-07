#!/bin/bash

################################################################################
# Teardown Script for Hearts Game
# Removes all AWS resources created for hearts.alexander-wang.net
################################################################################

set -e

# Configuration
SUBDOMAIN="hearts"
DOMAIN="alexander-wang.net"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
BUCKET_NAME="${FULL_DOMAIN}"

# Auto-detect hosted zone
print_info() { echo -e "\033[0;34mℹ $1\033[0m"; }
print_info "Detecting Route 53 hosted zone..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
    --no-cli-pager \
    --query "HostedZones[?Name=='${DOMAIN}.'].Id" \
    --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "Warning: Could not auto-detect hosted zone for ${DOMAIN}"
    echo "DNS record deletion will be skipped"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║        Hearts Card Game Teardown                      ║"
echo "║        hearts.alexander-wang.net                      ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

print_warning "This will DELETE all AWS resources for ${FULL_DOMAIN}"
echo ""
echo "Resources to be deleted:"
echo "  • S3 bucket: ${BUCKET_NAME}"
echo "  • CloudFront distribution"
echo "  • Route 53 DNS record"
echo ""
read -p "Are you sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    print_info "Teardown cancelled"
    exit 0
fi

echo ""

# Find CloudFront distribution
print_info "Finding CloudFront distribution..."
DISTRIBUTION_INFO=$(aws cloudfront list-distributions \
    --no-cli-pager \
    --query "DistributionList.Items[?Aliases.Items[?contains(@, '${FULL_DOMAIN}')]].{Id:Id,ETag:ETag}" \
    --output json)

DISTRIBUTION_ID=$(echo "$DISTRIBUTION_INFO" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DISTRIBUTION_ID" ]; then
    print_success "Found CloudFront distribution: ${DISTRIBUTION_ID}"
    
    # Disable distribution first
    print_info "Disabling CloudFront distribution..."
    
    # Get current config
    aws cloudfront get-distribution-config \
        --id "${DISTRIBUTION_ID}" \
        --no-cli-pager \
        --output json > /tmp/cf-config.json
    
    ETAG=$(cat /tmp/cf-config.json | grep -o '"ETag": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    # Modify config to disable
    cat /tmp/cf-config.json | \
        jq '.DistributionConfig.Enabled = false | .DistributionConfig' > /tmp/cf-config-disabled.json
    
    aws cloudfront update-distribution \
        --id "${DISTRIBUTION_ID}" \
        --distribution-config file:///tmp/cf-config-disabled.json \
        --if-match "${ETAG}" \
        --no-cli-pager > /dev/null
    
    print_success "Distribution disabled"
    print_warning "Waiting for distribution to deploy (this may take 10-15 minutes)..."
    
    # Wait for distribution to be deployed
    aws cloudfront wait distribution-deployed --id "${DISTRIBUTION_ID}" --no-cli-pager
    
    print_success "Distribution deployed"
    
    # Get new ETag after deployment
    NEW_ETAG=$(aws cloudfront get-distribution \
        --id "${DISTRIBUTION_ID}" \
        --no-cli-pager \
        --query 'ETag' \
        --output text)
    
    # Delete distribution
    print_info "Deleting CloudFront distribution..."
    aws cloudfront delete-distribution \
        --id "${DISTRIBUTION_ID}" \
        --if-match "${NEW_ETAG}" \
        --no-cli-pager
    
    print_success "CloudFront distribution deleted"
    
    rm -f /tmp/cf-config.json /tmp/cf-config-disabled.json
else
    print_warning "CloudFront distribution not found"
fi

# Delete Route 53 record
print_info "Deleting Route 53 DNS record..."

# Get CloudFront domain from record (if it exists)
RECORD_INFO=$(aws route53 list-resource-record-sets \
    --hosted-zone-id "${HOSTED_ZONE_ID}" \
    --no-cli-pager \
    --query "ResourceRecordSets[?Name=='${FULL_DOMAIN}.']" \
    --output json)

if [ "$(echo "$RECORD_INFO" | jq '. | length')" -gt 0 ]; then
    CF_DOMAIN=$(echo "$RECORD_INFO" | jq -r '.[0].AliasTarget.DNSName')
    
    cat > /tmp/route53-delete.json << EOF
{
  "Changes": [
    {
      "Action": "DELETE",
      "ResourceRecordSet": {
        "Name": "${FULL_DOMAIN}",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "${CF_DOMAIN}",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "${HOSTED_ZONE_ID}" \
        --change-batch file:///tmp/route53-delete.json \
        --no-cli-pager > /dev/null
    
    rm /tmp/route53-delete.json
    
    print_success "DNS record deleted"
else
    print_warning "DNS record not found"
fi

# Empty and delete S3 bucket
print_info "Emptying S3 bucket..."
if aws s3 ls "s3://${BUCKET_NAME}" --no-cli-pager &> /dev/null; then
    aws s3 rm "s3://${BUCKET_NAME}" --recursive --no-cli-pager
    print_success "Bucket emptied"
    
    print_info "Deleting S3 bucket..."
    aws s3 rb "s3://${BUCKET_NAME}" --no-cli-pager
    print_success "S3 bucket deleted"
else
    print_warning "S3 bucket not found"
fi

echo ""
print_success "Teardown complete! All resources have been removed."
echo ""
