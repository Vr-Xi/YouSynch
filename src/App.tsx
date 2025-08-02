import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watchroom from './pages/Watchroom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:sessionId" element={<Watchroom />} />
      </Routes>
    </Router>
  );
}

export default App;