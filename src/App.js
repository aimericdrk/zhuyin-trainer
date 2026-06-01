import { useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import HomeScreen from './screens/HomeScreen';
import TrainerScreen from './screens/TrainerScreen';
import HardScreen from './screens/HardScreen';

export default function App() {
  const [view, setView] = useState({ name: 'home' });

  return (
    <ThemeProvider>
      <I18nProvider>
        {view.name === 'home' && (
          <HomeScreen
            onStart={() => setView({ name: 'trainer' })}
            onStartHard={() => setView({ name: 'hard' })}
          />
        )}
        {view.name === 'trainer' && (
          <TrainerScreen onBack={() => setView({ name: 'home' })} />
        )}
        {view.name === 'hard' && (
          <HardScreen onBack={() => setView({ name: 'home' })} />
        )}
      </I18nProvider>
    </ThemeProvider>
  );
}
