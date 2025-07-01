# Production Deployment Guide

This document outlines the requirements and setup steps necessary to run the deployment script for the SerpNest application.

## Prerequisites

### 1. AWS Credentials Configuration

AWS credentials must be configured using the Elementica user credentials. Follow these steps:

#### For Ubuntu:
```bash
# Install AWS CLI if not installed
sudo apt-get update
sudo apt-get install awscli

# Configure AWS credentials
aws configure
```

#### For macOS:
```bash
# Install AWS CLI if not installed
brew install awscli

# Configure AWS credentials
aws configure
```

When running `aws configure`, you'll need to input the following:
- AWS Access Key ID: [Get from Elementica AWS user]
- AWS Secret Access Key: [Get from Elementica AWS user]
- Default region: us-east-2
- Default output format: json

### 2. kubectl Installation

#### For Ubuntu:
```bash
sudo apt-get update
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

#### For macOS:
```bash
brew install kubectl
```

Verify installation:
```bash
kubectl version --client
```

### 3. Kubernetes Configuration

After installing kubectl, configure access to the EKS cluster:

```bash
aws eks update-kubeconfig --region us-east-2 --name serpnest-p
```

Verify the configuration:
```bash
kubectl get nodes
```

### 4. Git Repository Access

To access the repository via SSH:

1. Generate SSH key if you don't have one:
```bash
ssh-keygen -t ed25519 -C "your.email@elementica.com"
```

2. Start the SSH agent:
```bash
eval "$(ssh-agent -s)"
```

3. Add your SSH key to the agent:
#### For Ubuntu:
```bash
ssh-add ~/.ssh/id_ed25519
```

#### For macOS:
```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

4. Copy your public key:
```bash
cat ~/.ssh/id_ed25519.pub
```

5. Add the SSH key to your GitHub/GitLab account:
   - Go to Settings → SSH Keys
   - Click "Add SSH Key"
   - Paste your public key
   - Save

6. Test your SSH connection:
```bash
ssh -T git@github.com  # For GitHub
# or
ssh -T git@gitlab.com  # For GitLab
```

7. Clone the repository (if not already done):
```bash
git clone git@[repository-url].git
```

### 5. Running the Deployment Script

1. Navigate to the project directory:
```bash
cd [project-directory]
```

2. Make the deployment script executable:
```bash
chmod +x deploy.sh
```

3. Run the deployment script with the desired Git commit hash:
```bash
./deploy.sh ${GIT_COMMIT}
```

Example:
```bash
GIT_COMMIT=abc123def456 ./deploy.sh
```

## Troubleshooting

If you encounter any issues:

1. Ensure all prerequisites are properly installed:
```bash
aws --version
kubectl version --client
git --version
```

2. Verify AWS credentials:
```bash
aws sts get-caller-identity
```

3. Check Kubernetes cluster access:
```bash
kubectl cluster-info
```

4. Verify Git repository access:
```bash
git fetch
```

For any additional issues, please contact the DevOps team.
