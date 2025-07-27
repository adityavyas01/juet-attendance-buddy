# JUET Attendance Buddy - Mobile App

A production-ready mobile application for JUET students to track their attendance, view marks, and monitor academic progress through WebKiosk integration.

## 🚀 Features

- **Real-time Attendance Tracking**: Automatic sync with JUET WebKiosk
- **Academic Performance**: View exam marks and SGPA/CGPA data
- **Mobile-First Design**: Native mobile experience with Capacitor
- **Offline Support**: Works offline with local data caching
- **Cross-Platform**: Runs on Android and iOS
- **Secure Authentication**: JWT-based authentication with secure storage
- **Dark/Light Mode**: Adaptive UI themes

## 📱 Mobile Development

This app is built with:
- **React + TypeScript** for the UI
- **Capacitor** for native mobile functionality
- **Vite** for fast development and building
- **Tailwind CSS + shadcn/ui** for styling
- **Node.js + Express** backend with MongoDB

### Development Commands

#### Development
```bash
# Start web development server
npm run dev

# Build for production
npm run build

# Build and sync with mobile platforms
npm run mobile:build
```

#### Android Development
```bash
# Open Android Studio
npm run mobile:android

# Run on Android device/emulator
npm run mobile:run:android

# Live reload development on Android
npm run mobile:livereload:android
```

#### iOS Development (macOS only)
```bash
# Open Xcode
npm run mobile:ios

# Run on iOS device/simulator
npm run mobile:run:ios

# Live reload development on iOS
npm run mobile:livereload:ios
```

### Mobile-Specific Features

- **Native Storage**: Secure storage with Capacitor Preferences API
- **Status Bar**: Automatic styling based on app theme
- **Splash Screen**: Custom branding and loading experience
- **Keyboard Handling**: Intelligent keyboard behavior
- **Network Detection**: Automatic online/offline detection
- **Device Features**: Access to device information and capabilities
- **Safe Area Support**: Proper handling of notches and status bars

## 🔧 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Build the App**:
   ```bash
   npm run mobile:build
   ```

3. **Run on Android**:
   ```bash
   npm run mobile:android
   ```

4. **Run on iOS** (macOS only):
   ```bash
   npm run mobile:ios
   ```

## 📦 Backend Integration

The app connects to a Node.js backend that:
- Scrapes WebKiosk data using Puppeteer
- Stores data in MongoDB
- Provides secure REST API endpoints
- Handles JWT authentication
- Implements data caching with Redis

## 🔐 Security Features

- JWT-based authentication
- Secure password hashing
- Rate limiting and input validation
- CORS protection
- Secure native storage

## 📱 Mobile App Store Ready

This application is configured for deployment to:
- **Google Play Store** (Android)
- **Apple App Store** (iOS)

With proper signing and configuration, the app can be distributed through official app stores.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/853bda5c-2c52-4eb6-958b-c6b1e6170650) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
