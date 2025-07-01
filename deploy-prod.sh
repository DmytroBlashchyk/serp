#!/bin/bash

# Exit on any error
set -e

# Colors for logging
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Check if GIT_COMMIT parameter is provided
if [ -z "$GIT_COMMIT" ]; then
    error "GIT_COMMIT parameter is required"
fi

# Registry configuration
REGISTRY="353300701778.dkr.ecr.us-east-2.amazonaws.com"

# Step 1: Login to AWS ECR
log "Logging in to AWS ECR"
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $REGISTRY || error "Failed to login to AWS ECR"
success "Successfully logged in to AWS ECR"

# Main app
log "Building main app container"
docker build --platform linux/amd64 -f infrastructure/Dockerfile_kube -t serpnest/production:latest . || error "Failed to build main app"
success "Main app build completed"

log "Tagging main app container"
docker tag serpnest/production:latest 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest:${GIT_COMMIT} || error "Failed to tag main app"
success "Main app tagging completed"

log "Pushing main app container"
docker push 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest:${GIT_COMMIT} || error "Failed to push main app"
success "Main app successfully pushed to registry"

# Fastify app
log "Building fastify container"
docker build --platform linux/amd64 -f infrastructure/Dockerfile_kube_fastify -t serpnest-fastify/production:latest . || error "Failed to build fastify app"
success "Fastify app build completed"

log "Tagging fastify container"
docker tag serpnest-fastify/production:latest 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest-fastify:${GIT_COMMIT} || error "Failed to tag fastify app"
success "Fastify app tagging completed"

log "Pushing fastify container"
docker push 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest-fastify:${GIT_COMMIT} || error "Failed to push fastify app"
success "Fastify app successfully pushed to registry"

# Queue app
log "Building queue container"
docker build --platform linux/amd64 -f infrastructure/Dockerfile_kube_queue -t serpnest-queue/production:latest . || error "Failed to build queue app"
success "Queue app build completed"

log "Tagging queue container"
docker tag serpnest-queue/production:latest 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest-queue:${GIT_COMMIT} || error "Failed to tag queue app"
success "Queue app tagging completed"

log "Pushing queue container"
docker push 353300701778.dkr.ecr.us-east-2.amazonaws.com/serpnest-queue:${GIT_COMMIT} || error "Failed to push queue app"
success "Queue app successfully pushed to registry"

# Deploy with Helm
log "Deploying with Helm"
helm upgrade --install --atomic production-release infrastructure/serpnest-backend-chart/ \
    -f production-values.yaml \
    --namespace serpnest-prod \
    --set app.image.tag=${GIT_COMMIT} \
    --set fapp.image.tag=${GIT_COMMIT} \
    --set queue.image.tag=${GIT_COMMIT} \
    --timeout 15m \
    --debug || error "Helm deployment failed"

success "Deployment completed successfully!"