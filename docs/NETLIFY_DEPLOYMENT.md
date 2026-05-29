# Netlify Deployment Guide

This guide will help you deploy the Fuel Buddy frontend to Netlify.

## Prerequisites

- A Netlify account (free tier works)
- Your backend API URL
- Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Git (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Connect your repository to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Select your Git provider
   - Choose your repository

3. **Configure build settings**
   Netlify will automatically detect the `netlify.toml` file, but verify these settings:
   
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: 18

4. **Set environment variables**
   - Go to Site Settings > Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.a.run.app/api`
   - Replace with your actual backend URL

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize the site**
   ```bash
   netlify init
   ```
   - Follow the prompts to create a new site or link to an existing one

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Configuration Details

The `netlify.toml` file in the root directory includes:

- **Build settings**: Builds the frontend using Vite
- **SPA routing**: Redirects all routes to `index.html` for client-side routing
- **Caching headers**: Optimizes caching for static assets
- **Node version**: Sets Node.js to version 18

## Environment Variables

Required environment variable for production:

- `VITE_API_URL`: Your backend API endpoint (e.g., `https://your-backend-url.a.run.app/api`)

## Post-Deployment

1. **Test your deployment**
   - Visit your Netlify URL
   - Test all major features
   - Check browser console for errors

2. **Set up custom domain (optional)**
   - Go to Domain Settings in Netlify
   - Add your custom domain
   - Update DNS records as instructed

3. **Enable branch previews (optional)**
   - Go to Site Settings > Build & Deploy > Deploy contexts
   - Enable branch previews for pull requests

## Troubleshooting

### Build fails

- Check the build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### API requests fail

- Verify `VITE_API_URL` is set correctly in Netlify environment variables
- Check CORS settings on your backend
- Ensure backend is accessible from the internet

### Routing issues

- The `netlify.toml` includes SPA routing configuration
- If using React Router, ensure all routes are client-side
- Check that redirects are working correctly

## Continuous Deployment

Once set up, Netlify will automatically deploy:

- On every push to your main branch
- On pull requests (if enabled)
- When you merge pull requests

## Performance Optimization

The configuration includes:

- Static asset caching (1 year)
- JS/CSS file caching (1 year)
- Automatic minification via Vite
- Tree shaking to reduce bundle size

## Security Considerations

- Never commit `.env.production` with real API keys
- Use Netlify environment variables for sensitive data
- Enable HTTPS (automatic on Netlify)
- Consider adding security headers if needed
