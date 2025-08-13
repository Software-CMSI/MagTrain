import React, { useState, useEffect } from 'react';
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
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Envía la respuesta al backend
      await api.post('/interviews', {
        user,
        nivel,
        pregunta: questions[currentIndex],
        respuesta: answer
      });
      // Avanza a la siguiente pregunta si hay más
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer('');
        setTranscript && setTranscript('');
        speak(questions[currentIndex + 1]);
      } else {
        // Si ya respondió todas, navega o finaliza
        navigate('/interview');
      }
    } catch (err) {
      setError('Error al guardar la respuesta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:500,margin:'40px auto',padding:24,background:'#fff',borderRadius:16,boxShadow:'0 2px 8px #0002'}}>
  <h2 style={{color:'#4F8CFF',marginBottom:16}}>Pregunta {currentIndex + 1} de {questions.length} - Nivel {nivel}</h2>
  <p style={{fontSize:18,color:'#222',marginBottom:24}}>{questions[currentIndex] || 'Cargando pregunta...'}</p>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Responde aquí o usa el micrófono"
        rows={4}
        required
        style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontSize:16}}
      />
      <div style={{display:'flex',flexWrap:'wrap',gap:16,marginBottom:16,justifyContent:'center'}}>
        <button onClick={startListening} disabled={listening || loading} style={{background:'#4F8CFF',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:15}}>
          {listening ? 'Escuchando...' : '🎤 Voz'}
        </button>
        <button onClick={stopListening} disabled={!listening || loading} style={{background:'#FF6B6B',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:15}}>
          Detener
        </button>
        <button onClick={() => speak(questions[currentIndex])} disabled={loading || !questions[currentIndex]} style={{background:'#FFD166',color:'#222',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:15}}>
          🔊 Escuchar pregunta
        </button>
        <button onClick={handleSubmit} disabled={!answer.trim() || loading} style={{background:'#4F8CFF',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:16}}>
          {loading ? 'Guardando...' : 'Enviar respuesta'}
        </button>
      </div>
      {error && <p style={{color:'red',marginTop:8}}>{error}</p>}
    </div>
  );
};

export default QuestionScreen;
