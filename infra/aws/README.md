# AWS Deployment Blueprint

## Target topology
- **EC2 (Auto Scaling Group)**: runs frontend/backend containers
- **RDS PostgreSQL**: managed primary relational database
- **ElastiCache Redis**: cache/session storage
- **S3 + CloudFront**: static assets and CDN
- **ALB + ACM**: HTTPS termination + routing

## Rollout strategy
1. Build Docker images in CI and push to ECR.
2. Deploy on EC2 using blue/green strategy.
3. Run SQL migrations against RDS before traffic switch.
4. Use CloudWatch alarms for latency/error thresholds.
