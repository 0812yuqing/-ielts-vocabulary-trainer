# IELTS Vocabulary Trainer

A retro gaming-inspired vocabulary learning application designed to help users master IELTS vocabulary through gamification and spaced repetition.

## Features

- **🎮 Retro Gaming Interface**: Pixel-perfect design with CRT effects and gaming aesthetics
- **📚 Adaptive Learning**: Smart vocabulary selection based on user level and progress
- **🎯 Gamification**: Achievements, levels, experience points, and daily challenges
- **📊 Analytics**: Comprehensive progress tracking and performance insights
- **🧠 Spaced Repetition**: Scientifically-backed learning algorithm for optimal retention
- **📱 PWA Ready**: Works offline and can be installed on any device
- **💾 Local Storage**: All data stored locally, privacy-focused

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + Custom CSS
- **Storage**: IndexedDB + localStorage
- **Build Tool**: Vite
- **PWA**: Service Worker + Web App Manifest

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ielts-vocabulary-trainer
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Core UI components (PixelCard, PixelButton, etc.)
├── pages/              # Page components
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and services
└── App.tsx             # Main application component
```

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Static Hosting

The application can be deployed to any static hosting service:

1. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

2. **Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **GitHub Pages**
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Set deployment branch to `gh-pages`

### PWA Features

The application includes Progressive Web App features:
- Offline functionality with service worker
- Add to home screen capability
- Responsive design for all devices
- Fast load times with caching

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Privacy

- All user data is stored locally in the browser
- No server-side data collection
- No third-party analytics
- Export/import functionality for data backup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Vocabulary data sourced from educational IELTS preparation materials
- Inspired by retro gaming aesthetics and language learning applications
- Built with modern web technologies for the best user experience