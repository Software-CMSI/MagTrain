import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AuthLanding from './components/AuthLanding';
import AuthCreate from './components/AuthCreate';
import AuthLogin from './components/AuthLogin';
import Interview from './components/Interview';
import Feedback from './components/Feedback';
import QuestionScreen from './components/QuestionScreen';
import Resultados from './components/Resultados';

function App() {
  useEffect(() => {
    localStorage.removeItem('maxLevelCompleted');
    localStorage.removeItem('respuestasEntrevista');
  }, []);

  return (
    <Router>
      <Routes>
  <Route path="/" element={<AuthLanding />} />
  <Route path="/auth/create" element={<AuthCreate />} />
  <Route path="/auth/login" element={<AuthLogin />} />
  <Route path="/home" element={<Home />} />
  <Route path="/interview" element={<Interview />} />
  <Route path="/question" element={<QuestionScreen />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/resultados" element={<Resultados />} />
      </Routes>
    </Router>
  );
}

export default App;
