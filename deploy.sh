#!/bin/bash

# Configuration - Update these values
PROJECT_ID=""
SERVICE_NAME=""
REGION=""
GEMINI_API_KEY=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment to GCP Cloud Run...${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build and submit the container image
echo -e "${YELLOW}🏗️  Building container image...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --memory 2Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📋 API Endpoints:${NC}"
echo -e "  • Health Check: ${SERVICE_URL}/health"
echo -e "  • Analysis: ${SERVICE_URL}/analyze (POST with file upload)"
echo ""
echo -e "${YELLOW}🧪 Test your deployment:${NC}"
echo -e "curl -X GET ${SERVICE_URL}/health"
echo ""
echo -e "${YELLOW}📝 To upload a file for analysis:${NC}"
echo -e "curl -X POST -F 'file=@your-image.jpg' ${SERVICE_URL}/analyze"
