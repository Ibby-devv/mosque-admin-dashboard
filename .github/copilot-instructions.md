# Mosque Admin Dashboard - Copilot Instructions

## Project Overview
This is a **React-based administrative dashboard** for managing mosque operations including prayer times, Jumuah times, events, donations, campaigns, notifications, and mosque settings. The app uses Firebase for backend services (Authentication, Firestore, Cloud Functions, Storage) and is deployed to Firebase Hosting.

**Project Name:** Al-Madina Masjid Admin Dashboard  
**Firebase Project ID:** `al-madina-masjid-app`  
**Region:** Australia Southeast 1

## Tech Stack

### Core Technologies
- **React 19.2.0** with TypeScript
- **Create React App** (react-scripts 5.0.1) - standard CRA setup, **NOT ejected**
- **TypeScript 4.9.5** with strict mode enabled
- **Node.js** (v14+ required, v20 recommended)

### Firebase Services
- **Firebase 12.4.0** (Authentication, Firestore, Cloud Functions, Storage)
- **Firebase Hosting** for deployment

### Styling
- **styled-components 6.1.19** - primary styling approach (CSS-in-JS)
- **tailwindcss 4.1.14** - installed but not fully configured (no config file present)
- **lucide-react 0.545.0** for icons
- Standard CSS for global styles (`index.css`, `App.css`)

### Testing
- **@testing-library/react 16.3.0**, **@testing-library/jest-dom 6.9.1**, **@testing-library/user-event 13.5.0**
- Test runner: `react-scripts test` (Jest)

## Project Structure

```
/src
  /components         # React components (25 .tsx files)
    /ui              # Reusable UI components (Card, Toast, Loading, Modal, Pagination)
    *Tab.tsx         # Tab-specific components (PrayerTimes, Jumuah, Events, etc.)
    LoginForm.tsx
    Header.tsx
    Tabs.tsx
    ProtectedComponent.tsx  # Permission-based rendering wrapper
  /constants         # Configuration constants
    roles.ts         # RBAC definitions (roles, permissions)
    theme.ts         # Theme constants
  /hooks             # Custom React hooks (3 files)
    useFirebaseAuth.ts
    usePermissions.ts
    useToast.ts
  /types             # TypeScript type definitions
    index.ts         # All TypeScript interfaces and types
  /utils             # Utility functions
    permissions.ts   # Permission helper functions
  App.tsx            # Main application component
  firebase.ts        # Firebase initialization and exports
  index.js           # App entry point (registers PWA service worker)
  serviceWorkerRegistration.ts  # PWA service worker
```

## Environment Setup

### Required Environment Variables
Create `.env` file from `.env.example`. All variables are **required**:

```bash
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_REGION=australia-southeast1
```

**Important:** The app **will throw an error** on startup if any environment variables are missing (see `src/firebase.ts` validation).

### Setup Commands
```bash
# Install dependencies
npm install

# Development server (starts on http://localhost:3000)
npm start

# Run tests (interactive watch mode)
npm test

# Production build
npm run build
```

**Note:** There are **no custom build scripts**. Use standard CRA commands only.

## Build & Deployment

### Local Build
```bash
npm run build
# Outputs to /build directory
```

### Firebase Deployment
```bash
# Prerequisites: firebase-tools installed globally
npm install -g firebase-tools
firebase login

# Test locally
firebase serve  # http://localhost:5000

# Deploy to hosting
firebase deploy --only hosting
```

### CI/CD
- **GitHub Actions workflow:** `.github/workflows/firebase-deploy.yml`
- Triggers on push/PR to `main` branch
- Uses Node.js 20
- Requires GitHub secrets for Firebase config and service account

**Production URLs:**
- `https://al-madina-masjid-app.web.app`
- `https://al-madina-masjid-app.firebaseapp.com`

## Code Style & Patterns

### TypeScript Usage
- **Strict mode enabled** (`strict: true` in `tsconfig.json`)
- **NO `any` types** - use proper typing
- All types defined in `/src/types/index.ts`
- Component props use explicit interfaces

### Component Patterns
1. **Functional components** with hooks (no class components)
2. **styled-components** for component styling (NOT inline styles or Tailwind classes)
3. **Permission-based rendering** using `<ProtectedComponent>` wrapper
4. **Error boundaries** implemented (`ErrorBoundary.tsx`)

### Styling Guidelines
- Use **styled-components** for all component styles
- Follow existing naming: `const ComponentName = styled.div`...``
- Colors and theme values in `/src/constants/theme.ts`
- Do NOT add Tailwind classes (Tailwind is not fully configured)

### Firebase Patterns
- Import services from `src/firebase.ts`: `auth`, `db`, `functions`, `storage`
- Use Firebase v9+ modular SDK syntax (NOT compat mode)
- Firestore operations use `getFirestore()` from `firebase/firestore`
- Always handle Firebase errors with try-catch

### RBAC System
- **Role-based access control** defined in `/src/constants/roles.ts`
- Roles: Super Admin, Admin, Events Manager, Prayer Times Manager, Donations Viewer
- Permissions checked via `usePermissions()` hook
- User roles/permissions stored in Firebase Auth custom claims
- Use `<ProtectedComponent>` wrapper for conditional rendering based on permissions

## Available Scripts

```bash
npm start          # Development server
npm test           # Run tests in watch mode
npm run build      # Production build
npm run eject      # ⚠️ ONE-WAY operation - DO NOT use unless absolutely necessary
```

**ESLint:** Configured via `eslintConfig` in `package.json` (extends `react-app`, `react-app/jest`)  
**No separate ESLint config file** - uses CRA defaults

## Common Issues & Solutions

### Environment Variables
- Missing env vars cause app crash at startup
- Error message lists missing variables
- Never commit `.env` or `.env.production` files

### Build Issues
- If build fails, ensure all env vars are set (even for build)
- Build artifacts go to `/build` - already in `.gitignore`
- Service worker only registers in production mode

### Firebase Connection
- Ensure Firebase project exists: `al-madina-masjid-app`
- Region must be `australia-southeast1`
- Admin users need custom claims set via Firebase Admin SDK/Cloud Functions

### Dependencies
- Use `npm install` (project uses npm, not yarn)
- Lock file: `package-lock.json`
- 27 vulnerabilities present (24 moderate, 3 high) - known issue with react-scripts 5.0.1

## Testing

- Test files: `*.test.js` or `*.test.tsx`
- Only one test file exists: `src/App.test.js`
- Setup file: `src/setupTests.js`
- Run tests: `npm test`
- No E2E tests configured

## Known TODOs
- **ErrorBoundary.tsx:** TODO to add error tracking service integration (e.g., Sentry)

## Important Notes

### DO NOT:
- ❌ Run `npm run eject` (project uses standard CRA setup)
- ❌ Add Tailwind utility classes (not configured despite package presence)
- ❌ Commit `.env`, `.env.production`, or `.firebase/` directory
- ❌ Use `any` types in TypeScript
- ❌ Create class components (use functional components only)
- ❌ Modify Firebase config in `firebase.json` without understanding hosting implications

### ALWAYS:
- ✅ Use styled-components for styling
- ✅ Follow existing TypeScript patterns and interfaces
- ✅ Check permissions using `usePermissions()` hook or `<ProtectedComponent>`
- ✅ Handle Firebase errors with try-catch blocks
- ✅ Test builds locally before committing
- ✅ Validate environment variables are set before running

## Progressive Web App (PWA)
- Service worker is registered (`src/serviceWorkerRegistration.ts`)
- PWA manifest: `public/manifest.json`
- Icons: `public/logo192.png`, `public/logo512.png`
- Service worker only active in production builds

## Additional Resources
- **README.md** - Setup instructions and CRA documentation
- **DEPLOYMENT.md** - Complete Firebase deployment guide with checklist
- **Firebase Console** - `https://console.firebase.google.com/project/al-madina-masjid-app`
