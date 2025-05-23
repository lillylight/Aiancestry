# Deployment Guide

## Vercel Deployment

### Prerequisites

Before deploying to Vercel, ensure the following environment variables are set in your Vercel project settings:

1. **Next.js Environment Variables**
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnchainKit API key
   - `NEXT_PUBLIC_PRODUCT_ID`: Your product ID
   - `OPENAI_API_KEY`: Your OpenAI API key (for image analysis)

2. **Image Configuration**
   - The application uses Next.js image optimization. Ensure any custom image domains are added to the `images.domains` array in `next.config.js`

### Deployment Steps

1. Push your code to the repository
2. Go to your Vercel dashboard
3. Connect your GitHub repository
4. Set up environment variables in Vercel project settings:
   - Go to Project Settings > Environment Variables
   - Add all required environment variables listed above
5. Deploy the project

### Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for all sensitive credentials
   - Ensure API keys have appropriate permissions

2. **Image Handling**
   - Images are processed in-memory and not stored
   - Use proper error handling for image uploads
   - Implement rate limiting for image processing

3. **Error Handling**
   - Implement proper error boundaries
   - Log errors appropriately
   - Provide user-friendly error messages

### Common Issues and Solutions

1. **Build Errors**
   - Ensure all dependencies are properly installed
   - Check for missing environment variables
   - Verify image domains in `next.config.js`

2. **Performance**
   - Monitor image optimization performance
   - Implement proper caching strategies
   - Consider lazy loading for images

3. **Security**
   - Regularly update dependencies
   - Monitor for security vulnerabilities
   - Implement proper authentication

### Post-Deployment

1. Verify all features are working
2. Test image upload and processing
3. Check error handling
4. Monitor performance metrics
5. Set up proper monitoring and logging
