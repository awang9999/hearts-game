# AWS Setup Instructions

This file contains instructions for setting up AWS credentials and policies for deployment.

## IAM Policy Setup

1. Copy the example policy file:
   ```bash
   cp aws-iam-policy-minimal.json.example aws-iam-policy-minimal.json
   ```

2. Apply the policy to your IAM role:
   ```bash
   aws iam put-role-policy \
     --role-name YourRoleName \
     --policy-name HeartsGameDeployment \
     --policy-document file://aws-iam-policy-minimal.json
   ```

## Required AWS Resources

The deployment scripts will auto-detect:
- Route 53 hosted zone for your domain
- ACM SSL certificate (*.yourdomain.com)

Make sure you have:
1. A Route 53 hosted zone for your domain
2. An ACM certificate in us-east-1 region (required for CloudFront)

## Configuration

Edit the configuration section in `deploy.sh`:

```bash
# Configuration
SUBDOMAIN="hearts"              # Your subdomain
DOMAIN="yourdomain.com"         # Your domain
REGION="us-west-2"              # Your AWS region
```

The scripts will automatically detect:
- Hosted Zone ID
- ACM Certificate ARN
- CloudFront Distribution ID (after creation)

## Security Notes

- IAM policy files (`aws-iam-policy-*.json`) are gitignored
- No sensitive IDs are hardcoded in scripts
- All AWS resources are auto-detected at runtime
- Keep your AWS credentials secure and never commit them

## Testing

After setup, test with:
```bash
./deploy.sh
```

This will verify your AWS credentials and deploy your application.
