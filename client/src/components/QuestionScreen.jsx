import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import useSpeechRecognition from './useSpeechRecognition';

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.speak(utter);
  }
}

const QuestionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, nivel, descripcion } = location.state || {};
  const [questions, setQuestions] = useState([]); // Array de preguntas
  const [currentIndex, setCurrentIndex] = useState(0); // Índice de la pregunta actual
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(0); // segundos
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { listening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await api.get(`/interviews/question/${user}/${nivel}?descripcion=${encodeURIComponent(descripcion)}`);
        setQuestions(res.data.preguntas || []);
        setCurrentIndex(0);
      } catch (err) {
        setError('Error al obtener las preguntas.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [user, nivel, descripcion]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      speak(questions[currentIndex]);
      setTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    // Limpiar temporizador al desmontar
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, currentIndex]);

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setError('');
    try {
      await api.post('/interviews', {
        user,
        nivel,
        pregunta: questions[currentIndex],
        respuesta: answer
      });
      // Guardar respuesta y tiempo en localStorage
      const respuestasGuardadas = JSON.parse(localStorage.getItem('respuestasEntrevista') || '[]');
      respuestasGuardadas.push({
        nivel,
        pregunta: questions[currentIndex],
        respuesta: answer,
        tiempo: timer
      });
      localStorage.setItem('respuestasEntrevista', JSON.stringify(respuestasGuardadas));
      // Avanza a la siguiente pregunta si hay más
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer('');
        setTranscript && setTranscript('');
        // La pregunta se reproducirá automáticamente por el useEffect
      } else {
        // Si ya respondió todas, guarda progreso y navega
        const prevLevel = Number(localStorage.getItem('maxLevelCompleted') || 0);
        if (Number(nivel) > prevLevel) {
          localStorage.setItem('maxLevelCompleted', String(nivel));
        }
  window.sessionStorage.setItem('levelJustCompleted', '1');
  navigate('/interview');
      }
    } catch (err) {
      setError('Error al guardar la respuesta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:600,margin:'40px auto',padding:32,background:'#142157',borderRadius:24,boxShadow:'0 8px 32px #15297c',transition:'background 0.5s'}}>
      <h2 style={{color:'#2898ee',marginBottom:24,fontWeight:'bold',fontSize:28,textAlign:'center',letterSpacing:1}}>
        <span style={{fontSize:28,marginRight:8,animation:'bounce 1.2s infinite'}}></span> Pregunta {currentIndex + 1} de {questions.length} - Nivel {nivel}
      </h2>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18,justifyContent:'center'}}>
  <p style={{fontSize:20,color:'#0cbccc',margin:0,fontWeight:'bold',textShadow:'none'}}>{questions[currentIndex] || 'Cargando pregunta...'}</p>
        <span style={{background:'#15297c',color:'#FFD166',padding:'8px 20px',borderRadius:14,fontWeight:'bold',fontSize:20,boxShadow:'0 2px 8px #2898ee'}}>⏰ {timer}s</span>
      </div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Responde aquí o usa el micrófono"
        rows={4}
        required
        style={{width:'100%',padding:16,borderRadius:10,border:'2px solid #2898ee',marginBottom:18,fontSize:18,boxShadow:'0 2px 8px #15297c',transition:'border 0.3s'}}
      />
      <div style={{display:'flex',flexWrap:'wrap',gap:18,marginBottom:18,justifyContent:'center'}}>
        <button onClick={startListening} disabled={listening || loading} style={{background:'#2898ee',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:'bold',fontSize:16,boxShadow:'0 2px 8px #15297c',animation:'bounce 1.2s infinite'}}>
          {listening ? 'Escuchando...' : '🎤 Voz'}
        </button>
        <button onClick={stopListening} disabled={!listening || loading} style={{background:'#FF6B6B',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:'bold',fontSize:16,boxShadow:'0 2px 8px #15297c',animation:'bounce 1.2s infinite'}}>Detener</button>
        <button onClick={() => speak(questions[currentIndex])} disabled={loading || !questions[currentIndex]} style={{background:'#FFD166',color:'#142157',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:'bold',fontSize:16,boxShadow:'0 2px 8px #2898ee',animation:'bounce 1.2s infinite'}}>🔊 Escuchar pregunta</button>
        <button onClick={handleSubmit} disabled={!answer.trim() || loading} style={{background:'#0cbccc',color:'#fff',border:'none',borderRadius:8,padding:'12px 28px',fontWeight:'bold',fontSize:18,boxShadow:'0 2px 8px #2898ee',animation:'bounce 1.2s infinite'}}>
          {loading ? 'Guardando...' : 'Enviar respuesta'}
        </button>
      </div>
      {error && <p style={{color:'#FF6B6B',marginTop:10,fontWeight:'bold'}}>{error}</p>}
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      `}</style>
    </div>
  );
};

export default QuestionScreen;
