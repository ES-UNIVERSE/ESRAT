# Lucky-Games 🎮

A fully responsive gaming website built with React, Firebase, and modern web technologies.

## Features

- **Mobile Number Authentication**: Secure login using Firebase
- **User Profiles**: Complete user management with profile pictures, bank details
- **Dual Balance System**: Rupee balance for real money games, Coin balance for free play
- **Daily Free Spins**: 5 free spins per day with real rewards
- **Live Winner Feed**: Real-time display of winners to create excitement
- **Transaction System**: Deposit and withdrawal functionality
- **Responsive Design**: Works perfectly on desktop and mobile
- **Gaming Theme**: Vibrant colors, animations, and smooth transitions

## Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lucky-games
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - The Firebase configuration is already set up in `src/firebase.js`
   - Make sure your Firebase project has Realtime Database enabled

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Create a new repository** on GitHub
2. **Push your code** to the main branch
3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

4. **The deployment will happen automatically** when you push to main branch

### Manual Deployment:

If you prefer manual deployment:

```bash
npm run build
# Then upload the contents of the 'dist' folder to your GitHub Pages repository
```

## Firebase Configuration

The app uses Firebase for:
- User authentication via mobile number
- Real-time database for user data storage
- Transaction history tracking

### Database Structure:
```
users/
  {mobileNumber}/
    userId: string
    name: string
    email: string
    profilePic: string
    balance: number
    coins: number
    transactionHistory: array
    bankDetails: object
```

## Game Features

### Default User Setup:
- **Initial Balance**: ₹0.00
- **Initial Coins**: 150 coins
- **Game Cost**: 10 coins per game
- **Win Reward**: 20 coins
- **Conversion Rate**: 1000 coins = ₹100

### Available Games:
- Number Guessing 🎯
- Card Flip 🃏
- Tic Tac Toe ⭕
- Ludo vs AI 🎲
- Color Match 🌈
- Lucky Wheel 🎰

## Security Features

- Mobile number validation (10 digits)
- Firebase security rules
- Transaction limits (₹300 - ₹2,50,000)
- Secure bank detail storage

## Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any issues or questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for the gaming community**

