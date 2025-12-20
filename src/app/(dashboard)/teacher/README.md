# 📚 Teacher Mobile App

> A comprehensive React Native mobile application for teachers to manage classes, students, attendance, and assignments efficiently.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Start with cache clear (recommended for first run)
npx expo start -c
```

### Running the App

- **Android Emulator**: Press `a` in terminal
- **iOS Simulator**: Press `i` in terminal (Mac only)
- **Physical Device**: Scan QR code with Expo Go app

---

## ✨ Features

### 📊 Dashboard

- Dynamic greeting based on time of day
- Live class indicator with LIVE badge
- Animated statistics cards
- Quick actions for common tasks
- Today's attendance summary
- Recent activity feed

### 📚 Class Management

- View all classes with details
- Comprehensive class details modal
- Quick stats and performance overview
- Take attendance directly from class card
- Filter by subject and grade

### ✅ Attendance System

- **Smart Class Detection** - Auto-selects current running class
- **QR Code Scanner** - Quick attendance marking
- **Manual Marking** - Radio buttons for Present/Late/Absent
- **Real-time Stats** - Live count updates
- **Validation** - Ensures all students are marked

### 👤 Profile & Check-in

- Teacher profile with stats
- One-tap check-in/check-out system
- Attendance history with month filtering
- Leave application system
- LinkedIn-style sidebar drawer
- Dark/Light mode toggle

### 📝 Assignments

- Create and manage assignments
- File/image picker integration
- Date and time pickers
- Professional toast notifications

---

## 🏗️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI**: Custom theme system with dark/light mode
- **Icons**: Ionicons, Material Icons
- **Camera**: expo-camera (QR scanning)
- **Gradients**: expo-linear-gradient
- **Storage**: AsyncStorage

---

## 📁 Project Structure

```
Teacher_Mobile_App/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── classes.tsx    # Classes screen
│   │   ├── attendance.tsx # Attendance screen
│   │   └── profile.tsx    # Profile screen
│   └── index.tsx          # Login screen
│
├── components/            # Reusable components
│   ├── attendance/       # Attendance components
│   ├── classes/          # Class components
│   ├── dashboard/        # Dashboard components
│   ├── profile/          # Profile components
│   └── ui/               # UI components
│
├── constants/            # Theme and constants
│   ├── theme.ts         # Main theme file
│   └── theme.types.ts   # TypeScript types
│
├── context/             # React Context
│   └── ThemeContext.tsx # Theme management
│
├── data/                # Mock data
│   ├── classes.ts
│   ├── students.ts
│   └── dashboard.ts
│
└── types/               # TypeScript types
    └── classes.ts
```

---

## 🎨 Theme System

The app uses a comprehensive theme system with no hardcoded colors.

### Usage

```typescript
import { AppColors, Spacing, BorderRadius, FontSizes } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: FontSizes.xl,
  },
});
```

### Color Palette

- **Primary**: Professional Blue (#4A90E2)
- **Success**: Green (#10B981) - Present/Pass
- **Error**: Red (#EF4444) - Absent/Fail
- **Warning**: Yellow (#F59E0B) - Late/Pending
- **Info**: Blue (#3B82F6)

---

## 📱 Key Features

### Smart Attendance

- Auto-detects current running class based on schedule
- Shows LIVE indicator for active classes
- QR code scanner for quick marking
- Real-time statistics
- Validation before submission

### Check-in/Check-out System

- One-tap attendance tracking for teachers
- Status indicator (Not Checked In, Checked In, Checked Out)
- Attendance history with month filtering
- Working hours calculation

### Leave Management

- Apply for different leave types (Sick, Casual, Emergency, Annual)
- Date range picker
- Automatic duration calculation
- Reason input with character counter
- Leave history tracking

### Sidebar Drawer

- LinkedIn-style navigation menu
- Profile information and stats
- Account settings
- Support options
- Smooth animations

---

## 🧪 Testing

### QR Scanner Testing

1. Generate QR codes with student IDs (1, 2, 3, etc.) or roll numbers (001, 002, etc.)
2. Use online QR generator: [qr-code-generator.com](https://www.qr-code-generator.com/)
3. Open Attendance tab → Tap QR icon → Scan code
4. Verify student is marked as Present

### Login Credentials

For development, any email and password will work (no backend authentication yet).

---

## 📖 Documentation

For complete documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

This includes:

- Detailed feature descriptions
- Component documentation
- Architecture overview
- Best practices
- Troubleshooting guide

---

## 🔮 Future Enhancements

- [ ] Real API integration
- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Export reports (PDF)
- [ ] Parent communication portal
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

## 🛠️ Development

### Code Style

- Always use TypeScript types
- Import from theme constants (never hardcode colors)
- Use functional components with hooks
- Follow naming conventions (PascalCase for components, camelCase for functions)

### Best Practices

```typescript
// ✅ CORRECT: Import from theme
import { AppColors } from "@/constants/theme";
backgroundColor: AppColors.primary.main;

// ❌ WRONG: Hardcoded hex color
backgroundColor: "#4A90E2"; // NEVER DO THIS!
```

---

## 📞 Support

For issues or questions:

1. Check [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
2. Review component documentation
3. Check console for errors

---

## 📄 License

This project is for educational purposes.

---

## 👥 Credits

**Developed with**: React Native, Expo, TypeScript  
**Design**: Modern education app patterns  
**Status**: Production Ready ✅

---

**Made with ❤️ for Teachers**
