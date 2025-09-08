# Ball Busters - Softball Team Manager

A modern, mobile-first softball team management application built with Next.js 15, React 19, and Tailwind CSS. Features intelligent position rotation algorithms, fair play enforcement, and responsive glassmorphism design.

## ⚾ Features

- **Smart Position Assignment**: Automated lineup generation with position constraint validation
- **Fair Play Algorithms**: Ensures equal playing time and position rotation across innings
- **Mobile-First Design**: Responsive interface optimized for sideline use
- **Player Attendance Tracking**: Easy check-in system with collapsible interface
- **Position Constraints**: Respects player preferred positions and skill limitations
- **Team Branding**: Custom team photo display and branded color scheme
- **Real-time Updates**: Live lineup generation and position swapping

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone https://github.com/BradleyExton/ball-busters.git
cd ball-busters
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 Usage

1. **Set Attendance**: Use the collapsible attendance form to mark which players are present
2. **Generate Game**: Click "Generate New Game" to create position assignments for all innings
3. **Review Lineup**: View assignments in mobile cards or desktop table format
4. **Fair Play**: Algorithm ensures players rotate through different positions and bench time

## 🏗️ Technical Architecture

### Core Components

- **PositionsTable**: Main lineup display with mobile/desktop responsive views
- **AttendanceForm**: Collapsible player check-in interface
- **Position Algorithm**: Intelligent assignment system with constraint validation
- **Player Data**: Configurable player positions and preferences

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with glassmorphism effects
- **Build**: Turbopack for fast development
- **Deployment**: Vercel-ready configuration

### Position Algorithm Features

- Position constraint validation (playablePositions + preferredPosition)
- Round-robin rotation with randomization
- Intelligent player swapping for optimal coverage
- Defensive programming with fallback assignments
- Fair bench time distribution

## 📱 Mobile Optimization

- Touch-friendly interface design
- Collapsible sections to save screen space
- Responsive breakpoints (sm/lg/xl)
- Optimized for portrait orientation
- Fast loading with priority image optimization

## 🎨 Design System

- **Primary Color**: #D22237 (team red)
- **Secondary**: #354d74 (navy blue)
- **Effects**: Glassmorphism with backdrop-blur
- **Typography**: Geist font family
- **Layout**: Mobile-first responsive grid

## 📝 License

This project is private and intended for Ball Busters softball team use.

## 👨‍💻 Author

**Bradley Exton**

- GitHub: [@BradleyExton](https://github.com/BradleyExton)
