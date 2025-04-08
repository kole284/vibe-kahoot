# FONIS Quiz - Kahoot Clone

A real-time quiz application built with React, TypeScript, and Firebase Realtime Database.

## Features

- Real-time synchronization between players and display
- QR code scanning for team registration
- Interactive question display with timer
- Live leaderboard
- Mobile-responsive design
- Beautiful animations with Framer Motion

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fonis-quiz.git
cd fonis-quiz
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable Realtime Database

4. Copy your Firebase configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

## Usage

1. Open the application in two browser windows:
   - Display view: `http://localhost:5173/display`
   - Player view: `http://localhost:5173`

2. Scan the QR code with your mobile device to join the game

3. Enter your team name and table number

4. Wait for the game to start

5. Answer questions as they appear

## Project Structure

```
src/
├── components/
│   ├── ui/               # Shadcn components
│   ├── game/            # Game-specific components
│   ├── display/         # Display view components
│   └── layout/          # Layout components
├── context/             # React context
├── lib/                 # Firebase configuration
├── types/              # TypeScript types
└── styles/             # Global styles
```

## Technologies Used

- React
- TypeScript
- Firebase Realtime Database
- Tailwind CSS
- Framer Motion
- React Router
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
