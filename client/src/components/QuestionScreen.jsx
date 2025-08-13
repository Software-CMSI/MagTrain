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
  const { user, nivel } = location.state || {};
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { listening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();

  useEffect(() => {
    async function fetchQuestion() {
      setLoading(true);
      try {
        const res = await api.get(`/interviews/question/${user}/${nivel}`);
        setQuestion(res.data.pregunta);
        speak(res.data.pregunta);
      } catch (err) {
        setError('Error al obtener la pregunta.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestion();
    // eslint-disable-next-line
  }, [user, nivel]);

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/interviews', {
        user,
        nivel,
        respuesta: answer
      });
      localStorage.setItem('interviewAnswers', JSON.stringify([res.data.respuestas?.[0] || { nivel, respuesta: answer }]));
      navigate('/interview');
    } catch (err) {
      setError('Error al guardar la respuesta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:500,margin:'40px auto',padding:24,background:'#fff',borderRadius:16,boxShadow:'0 2px 8px #0002'}}>
      <h2 style={{color:'#4F8CFF',marginBottom:16}}>Pregunta del Nivel {nivel}</h2>
      <p style={{fontSize:18,color:'#222',marginBottom:24}}>{question || 'Cargando pregunta...'}</p>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Responde aquí o usa el micrófono"
        rows={4}
        required
        style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ccc',marginBottom:12,fontSize:16}}
      />
      <div style={{display:'flex',gap:12,marginBottom:12}}>
        <button onClick={startListening} disabled={listening || loading} style={{background:'#4F8CFF',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:15}}>
          {listening ? 'Escuchando...' : '🎤 Voz'}
        </button>
        <button onClick={stopListening} disabled={!listening || loading} style={{background:'#FF6B6B',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',fontSize:15}}>
          Detener
        </button>
      </div>
      <button onClick={handleSubmit} disabled={!answer.trim() || loading} style={{background:'#4F8CFF',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:16}}>
        {loading ? 'Guardando...' : 'Enviar respuesta'}
      </button>
      {error && <p style={{color:'red',marginTop:8}}>{error}</p>}
    </div>
  );
};

export default QuestionScreen;
