import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Submissions from './pages/Submissions';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🃏 Poker Hands Manager
            </h1>
            <nav className="flex gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link to="/players" className="text-gray-600 hover:text-gray-900 font-medium">
                Jogadores
              </Link>
              <Link to="/submissions" className="text-gray-600 hover:text-gray-900 font-medium">
                Submissões
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/submissions" element={<Submissions />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          Poker Hands Manager © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default App;
