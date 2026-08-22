# Digital Stamp Card Application

A modern, minimal premium cafe-style digital stamp card web application built with React, TypeScript, and TailwindCSS.

## Features

- **User Authentication**: Simple email/password registration and login system
- **Digital Stamp Cards**: Create and manage multiple stamp cards for different cafes
- **Stamp Collection**: Add stamps to track progress toward rewards
- **QR Code Generation**: Generate unique QR codes for each stamp card
- **Reward Redemption**: Redeem completed stamp cards for rewards
- **Premium Cafe UI**: Minimal, elegant design with warm cafe-inspired colors
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Local Storage**: Data persists in browser localStorage (no backend required)

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS with custom cafe color palette
- **Icons**: Lucide React
- **QR Codes**: qrcode.react
- **State Management**: React Context API
- **Data Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd "stamp card/stampcard"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### For Customers

1. **Register**: Create an account with your email and password
2. **Create Stamp Card**: Click "New Card" to create your first stamp card
3. **Customize Card**: Set cafe name, reward description, and required stamps
4. **Collect Stamps**: Click "Add Stamp" to add stamps manually (for testing)
5. **Show QR Code**: Click "Show QR Code" to display your unique QR code for cafe staff
6. **Redeem Rewards**: When your card is complete, click "Redeem Reward"

### For Cafe Staff

1. **Scan QR Code**: Use a QR code scanner to read the customer's card ID
2. **Verify Stamps**: Check the customer's current stamp count
3. **Add Stamps**: In a production environment, staff would scan the QR code and add stamps through a staff interface

## Customization

### Cafe Colors

The color palette can be customized in `tailwind.config.js`:

```javascript
colors: {
  cafe: {
    cream: '#F5F0E8',
    beige: '#E8DFD0',
    brown: '#8B7355',
    dark: '#4A3728',
    gold: '#C9A962',
    light: '#F9F7F2'
  }
}
```

### Default Settings

Default cafe settings are stored in localStorage and can be modified in the "New Card" modal.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Vite and deploy
4. Your app will be live with a free SSL certificate

### Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Or connect your GitHub repository for automatic deployments

### Other Platforms

Any static hosting service that supports single-page applications will work:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## Future Enhancements

- Backend API with proper database
- Staff authentication and permissions
- Real-time QR code scanning
- Push notifications for rewards
- Analytics and reporting
- Multi-cafe support
- Email notifications

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
