# Firebase Hosting Deployment

This admin dashboard is configured for Firebase Hosting deployment.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created (use existing: al-madina-masjid-app)
- Logged in to Firebase CLI: `firebase login`

## Initial Setup

1. **Initialize Firebase Hosting** (first time only):
```bash
firebase init hosting
```
Select options:
- Use existing project: `al-madina-masjid-app`
- Public directory: `build`
- Single-page app: `Yes`
- Automatic builds with GitHub: `No` (for now)

2. **Set Production Environment Variables**:
Create `.env.production` with your production Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your_production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=al-madina-masjid-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=al-madina-masjid-app
REACT_APP_FIREBASE_STORAGE_BUCKET=al-madina-masjid-app.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_REGION=australia-southeast1
```

## Deployment Process

### 1. Build for Production
```bash
npm run build
```

### 2. Test Build Locally (Optional)
```bash
firebase serve
```
Open http://localhost:5000 to test

### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Post-Deployment

Your admin dashboard will be available at:
- **Primary URL**: `https://al-madina-masjid-app.web.app`
- **Secondary URL**: `https://al-madina-masjid-app.firebaseapp.com`

## Adding Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `admin.alansarmasjid.com.au`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

## Deployment Checklist

Before deploying:
- [ ] `.env.production` configured with correct values
- [ ] Build completes without errors: `npm run build`
- [ ] Test locally if needed: `firebase serve`
- [ ] Review Firebase security rules
- [ ] Verify admin users are set up in Firebase Authentication

## Rollback

If you need to rollback to a previous version:
```bash
firebase hosting:rollback
```

## CI/CD (Future Enhancement)

For automated deployments, consider:
- GitHub Actions with Firebase
- GitLab CI/CD
- Bitbucket Pipelines

Example GitHub Actions workflow can be found in `.github/workflows/` (to be added).

## Security Notes

1. **Environment Variables**: Never commit `.env.production` to version control
2. **Admin Access**: Ensure only authorized users have admin claims
3. **Firebase Security Rules**: Review Firestore and Storage rules
4. **HTTPS Only**: Firebase Hosting enforces HTTPS automatically
5. **Admin Dashboard**: Consider restricting access by IP if needed (Firebase Hosting Pro feature)

## Monitoring

- **Firebase Console**: Monitor usage and errors
- **Analytics**: Consider adding Firebase Analytics
- **Error Tracking**: Add Sentry for production error monitoring

## Support

For deployment issues:
1. Check Firebase CLI version: `firebase --version`
2. Re-login if needed: `firebase login --reauth`
3. Check project: `firebase projects:list`
4. View logs: `firebase hosting:channel:list`
