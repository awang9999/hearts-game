import { GameBoard, ErrorBoundary, Footer } from './components';
import './App.css';

/**
 * Main App component
 * Wraps the game in an error boundary for error handling
 * Requirements: 11.1, 11.4
 */
function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <GameBoard />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
