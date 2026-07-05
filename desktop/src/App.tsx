import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Layout from './components/Layout';
import TranslatePage from './pages/TranslatePage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/translate" replace />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
