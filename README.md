# Split The Cost App 💰

A modern React Native expense splitting application built with Expo, designed to help friends, roommates, and groups easily track and split shared expenses. Perfect for trips, meals, household bills, and group activities.

## ✨ Features

### 🏠 Core Functionality

- **Group Management**: Create and manage expense groups for different purposes
- **Smart Expense Tracking**: Add expenses with detailed breakdown of who paid and who owes what
- **Real-time Balance Calculation**: Automatic calculation of who owes whom
- **Settlement System**: Track payments between group members
- **Activity Feed**: View all group activities and transaction history

### 👥 User Experience

- **Secure Authentication**: User registration and login with JWT authentication
- **Interactive Onboarding**: Guided introduction to app features
- **Intuitive UI**: Clean, modern interface with dark theme
- **Avatar Support**: User profile pictures and member avatars
- **Responsive Design**: Works seamlessly on both iOS and Android

### 📊 Expense Categories

- Food & Dining
- Transportation
- Supplies
- Fuel
- Other custom categories

## 🛠 Tech Stack

### Frontend

- **React Native** (0.81.5) with Expo SDK 54
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native) for styling
- **Lucide React Native** for icons

### State Management & Data

- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Async Storage** for local data persistence
- **Expo Secure Store** for sensitive data

### UI/UX

- **Custom fonts** (Manrope)
- **React Native Reanimated** for smooth animations
- **Expo Linear Gradient** for visual effects
- **React Native Safe Area Context** for proper screen layouts

## 📁 Project Structure

```
split-the-cost-app/
├── app/                          # Expo Router file-based routing
│   ├── (app)/                   # Authenticated app screens
│   │   ├── (tabs)/             # Bottom tab navigation
│   │   │   ├── index.tsx       # Groups overview
│   │   │   ├── activity/       # Activity feed
│   │   │   └── profile/        # User profile
│   │   ├── expense/            # Expense management
│   │   └── group/              # Group management
│   ├── (public)/               # Public screens (no auth required)
│   │   ├── index.tsx          # Landing page
│   │   ├── auth/              # Login/Register
│   │   └── onboarding/        # App introduction
│   └── _layout.tsx            # Root layout with providers
├── src/
│   ├── components/ui/          # Reusable UI components
│   ├── contexts/              # React contexts (Auth)
│   ├── services/              # API services and hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── assets/                    # Images, icons, and static files
└── scripts/                   # Build and utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd split-the-cost-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Development Options

- **iOS Simulator**: Press `i` in the terminal or scan QR code with Expo Go
- **Android Emulator**: Press `a` in the terminal or scan QR code with Expo Go
- **Web Browser**: Press `w` in the terminal
- **Physical Device**: Install Expo Go and scan the QR code

## 📱 App Navigation

### Authentication Flow

- **Onboarding**: Interactive introduction to app features
- **Registration/Login**: Secure user authentication
- **Auto-login**: Persistent sessions with secure token storage

### Main App Features

- **Groups Tab**: View and manage your expense groups
- **Activity Tab**: Track all transactions and settlements
- **Profile Tab**: Manage your account and preferences

### Key Screens

- **Group Details**: View expenses, balances, and member information
- **Add Expense**: Create new shared expenses with split configuration
- **Settlement**: Record payments between group members

## 🔧 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android       # Start on Android emulator
npm run ios          # Start on iOS simulator
npm run web          # Start in web browser

# Utilities
npm run lint         # Run ESLint
npm run reset-project # Reset to clean project state
```

## 🏗 Architecture

### Authentication

- JWT-based authentication with secure token storage
- Auto-logout on token expiration
- Protected routes with authentication guards

### Data Management

- **API Client**: Centralized HTTP client with automatic auth headers
- **React Query**: Caching, background updates, and optimistic updates
- **Form Management**: React Hook Form with Zod schema validation

### Styling

- **NativeWind**: Tailwind CSS classes for React Native
- **Custom Theme**: Consistent color palette and typography
- **Responsive Design**: Adaptive layouts for different screen sizes

## 🔒 Security Features

- **Secure Token Storage**: Expo Secure Store for authentication tokens
- **API Error Handling**: Comprehensive error boundaries and user feedback
- **Input Validation**: Client-side validation with Zod schemas
- **Type Safety**: Full TypeScript coverage for runtime safety

## 🎨 Design System

### Colors

- **Primary**: `#13ec5b` (Bright green)
- **Background**: `#102216` (Dark green)
- **Surface**: `#1c2e22` (Card background)
- **Text**: White with various opacities

### Typography

- **Font Family**: Manrope (Regular, Bold)
- **Responsive Text**: Automatic font scaling
- **Consistent Spacing**: Tailwind spacing system

## 🔄 State Management

### Server State (React Query)

- Groups and group details
- Expenses and transactions
- User activities and settlements
- Automatic caching and background sync

### Client State

- Authentication status and user data
- Form states and validation
- UI state (loading, errors, etc.)

## 📦 Key Dependencies

### Core Framework

- `expo`: ^54.0.30
- `react`: ^19.1.0
- `react-native`: ^0.81.5
- `expo-router`: ^6.0.21

### State & Data

- `@tanstack/react-query`: ^5.90.16
- `react-hook-form`: ^7.69.0
- `zod`: ^4.2.1

### UI & Styling

- `nativewind`: ^4.2.1
- `lucide-react-native`: ^0.562.0
- `@expo-google-fonts/manrope`: ^0.4.2

### Storage & Security

- `expo-secure-store`: ^15.0.8
- `@react-native-async-storage/async-storage`: ^2.2.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the Expo documentation
- Review React Native troubleshooting guides

---

**Built with ❤️ using Expo and React Native**
