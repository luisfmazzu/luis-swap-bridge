import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import MyTips from './pages/MyTips';
import Header from './components/Header';
import TipModal from './components/TipModal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-tips" element={<MyTips />} />
        </Routes>
        <TipModal />
      </div>
    </Router>
  );
}

export default App;