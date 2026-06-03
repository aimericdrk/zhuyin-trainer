import { useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AnnotationProvider } from './theme/AnnotationContext';
import { SpeechProvider } from './theme/SpeechContext';
import { I18nProvider } from './i18n/I18nContext';
import HomeScreen from './screens/HomeScreen';
import TrainerScreen from './screens/TrainerScreen';
import HardScreen from './screens/HardScreen';
import GamesScreen from './screens/GamesScreen';
import GameScreen from './screens/GameScreen';
import BopomofoChart from './screens/BopomofoChart';
import MemoryMatch from './screens/MemoryMatch';
import Flashcards from './screens/Flashcards';
import ReadingScreen from './screens/ReadingScreen';
import WritingScreen from './screens/WritingScreen';
import ChatScreen from './screens/ChatScreen';
import ReviewScreen from './screens/ReviewScreen';
import PatternsScreen from './screens/PatternsScreen';

export default function App() {
  const [view, setView] = useState({ name: 'home' });
  const home = () => setView({ name: 'home' });

  return (
    <ThemeProvider>
      <AnnotationProvider>
      <SpeechProvider>
      <I18nProvider>
        {view.name === 'home' && (
          <HomeScreen onNavigate={(name) => setView({ name })} />
        )}
        {view.name === 'trainer' && <TrainerScreen onBack={home} />}
        {view.name === 'hard' && <HardScreen onBack={home} />}
        {view.name === 'bopomofo' && <BopomofoChart onBack={home} />}
        {view.name === 'memory' && <MemoryMatch onBack={home} />}
        {view.name === 'flashcards' && <Flashcards onBack={home} />}
        {view.name === 'reading' && <ReadingScreen onBack={home} />}
        {view.name === 'writing' && <WritingScreen onBack={home} />}
        {view.name === 'chat' && <ChatScreen onBack={home} />}
        {view.name === 'review' && <ReviewScreen onBack={home} />}
        {view.name === 'patterns' && <PatternsScreen onBack={home} />}
        {view.name === 'games' && (
          <GamesScreen
            onBack={home}
            onSelect={(gameId) => setView({ name: 'game', gameId })}
          />
        )}
        {view.name === 'game' && (
          <GameScreen gameId={view.gameId} onBack={() => setView({ name: 'games' })} />
        )}
      </I18nProvider>
      </SpeechProvider>
      </AnnotationProvider>
    </ThemeProvider>
  );
}
