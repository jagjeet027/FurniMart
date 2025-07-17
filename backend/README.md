<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh -->

# FurniMart - Modern Signup Application

## Project Overview

FurniMart is a modern, responsive signup application with phone authentication and themed design.

## Prerequisites

- Node.js (v14 or later)
- npm or Yarn
- Firebase Account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://your-repository-url.git
cd furnimart
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Phone & Email/Password)
3. Create a `.env` file in the project root with the following:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application

```bash
npm start
# or
yarn start
```

## Features

- Phone Number Authentication
- Email/Password Registration
- Dynamic Themes
- Responsive Design
- Form Validation
- Error Handling

## Dependencies

- React
- Firebase
- React Router
- Tailwind CSS
- Lucide React Icons

## Security Recommendations

- Enable Multi-Factor Authentication in Firebase
- Use strong password policies
- Implement proper error handling
- Regularly update dependencies

## Deployment

Refer to your hosting platform's documentation for deployment instructions.

```

```
