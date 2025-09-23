import React, { useState, useEffect } from 'react';
import useSpeechRecognition from './useSpeechRecognition';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const levels = [
  {
    title: 'Nivel 1',
    subtitle: 'Presentación Personal y Motivación',
    description: 'Cuéntame sobre ti. ¿Por qué quieres este puesto? ¿Qué sabes sobre nuestra empresa?',
    color: '#4F8CFF'
  },
  {
    title: 'Nivel 2',
    subtitle: 'Experiencia y Trayectoria Profesional',
    description: 'Háblame de tus roles anteriores, logros y crecimiento profesional.',
    color: '#6DD47E'
  },
  {
    title: 'Nivel 3',
    subtitle: 'Habilidades Blandas y Trabajo en Equipo',
    description: '¿Cómo manejas el trabajo en equipo, liderazgo y resolución de conflictos?',
    color: '#FFD166'
  },
  {
    title: 'Nivel 4',
    subtitle: 'Situaciones Conductuales y Problemas',
    description: 'Cuéntame de una vez que enfrentaste un desafío y cómo lo resolviste.',
    color: '#FF6B6B'
  },
  {
    title: 'Nivel 5',
    subtitle: 'Preguntas Técnicas del Rol',
    description: 'Preguntas específicas del cargo que indicaste.',
    color: '#9D4EDD'
  }
];

function Interview() {
  const handleContinue = () => {
    window.sessionStorage.removeItem('levelJustCompleted');
    navigate('/resultados');
  };
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [maxLevelCompleted, setMaxLevelCompleted] = useState(Number(localStorage.getItem('maxLevelCompleted') || 0));
  useEffect(() => {
    // Mostrar mensaje si acaba de finalizar un nivel
    if (window.sessionStorage.getItem('levelJustCompleted')) {
      setShowCompleted(true);
      window.sessionStorage.removeItem('levelJustCompleted');
      setTimeout(() => setShowCompleted(false), 3000);
    }
    setMaxLevelCompleted(Number(localStorage.getItem('maxLevelCompleted') || 0));
  }, []);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { listening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('interviewUser'));

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
    // eslint-disable-next-line
  }, [transcript]);

  const handleStartLevel = (idx) => {
    if (idx <= maxLevelCompleted) {
      navigate('/question', { state: { user: user.id, nivel: idx + 1, descripcion: levels[idx].description } });
    }
  };

  const handleNext = async () => {
    setLoading(true);
    setError('');
    try {
      // Enviar respuesta al backend
      const res = await api.post('/interviews', {
        user: user.id,
        nivel: currentLevel + 1,
        respuesta: answer
      });
      setAnswers([...answers, res.data.respuestas?.[0] || { nivel: currentLevel + 1, respuesta: answer }]);
      setAnswer('');
      setTranscript('');
      setShowQuestion(false);
      if (currentLevel < levels.length - 1) {
        setCurrentLevel(currentLevel + 1);
      } else {
        // Guardar respuestas y navegar a feedback
        localStorage.setItem('interviewAnswers', JSON.stringify([...answers, res.data.respuestas?.[0] || { nivel: currentLevel + 1, respuesta: answer }]));
        navigate('/feedback');
      }
    } catch (err) {
      setError('Error al guardar la respuesta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div style={{maxWidth:600,margin:'40px auto',padding:32,background:'#1a1e3a',borderRadius:24,boxShadow:'0 4px 16px #1a1e3a',transition:'background 0.5s'}}>
      {showCompleted && (
        <div style={{background:'#0cbccc',color:'#fff',padding:'16px',borderRadius:'12px',textAlign:'center',fontWeight:'bold',fontSize:'18px',marginBottom:'16px',animation:'fadeInUp 0.7s'}}>¡Nivel finalizado!</div>
      )}
      <h1 style={{ textAlign: "center", marginBottom: "32px", color: "#1976d2", letterSpacing: "2px", fontWeight: "bold" }}>
        <span style={{fontSize:32,marginRight:8,animation:'bounce 1.2s infinite',color:'#1976d2'}}></span> Entrevista
      </h1>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'24px'}}>
        {levels.map((lvl, idx) => (
          <div key={lvl.title} style={{
            width: '100%',
            maxWidth: '700px',
            minWidth: '340px',
            background: '#23275a',
            borderRadius: 18,
            boxShadow: '0 4px 16px #1976d2',
            padding: '32px 32px 32px 32px',
            marginBottom: '0',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
            border: idx === currentLevel ? '2px solid #2898ee' : '2px solid #23275a',
            animation: `fadeInUp 0.7s ${idx * 0.15}s both`
          }}>
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',fontSize:26,color:'#2898ee',marginBottom:6,textShadow:'none'}}>{lvl.title}</div>
              <div style={{fontSize:18,color:'#5faee3',marginBottom:6,textShadow:'none'}}>{lvl.subtitle}</div>
              <div style={{fontSize:16,color:'#b3c6e7',textShadow:'none'}}>{lvl.description}</div>
            </div>
            {idx < maxLevelCompleted ? (
              <button
                style={{background:'#23275a',color:'#fff',border:'2px solid #2898ee',borderRadius:10,padding:'12px 32px',fontWeight:'bold',fontSize:18,boxShadow:'0 2px 8px #2898ee',cursor:'not-allowed'}}
                disabled
              >
                Finalizado
              </button>
            ) : idx === maxLevelCompleted ? (
              <button
                style={{background:'#2898ee',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:'bold',fontSize:18,boxShadow:'0 2px 8px #2898ee',cursor:'pointer'}}
                onClick={() => handleStartLevel(idx)}
                disabled={showQuestion}
              >
                {showQuestion ? 'En curso...' : 'START'}
              </button>
            ) : (
              <button
                style={{background:'#555',color:'#ccc',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:'bold',fontSize:18,boxShadow:'0 2px 8px #23275a',cursor:'not-allowed'}}
                disabled
              >
                Bloqueado
              </button>
            )}
          </div>
        ))}
        <button
          style={{marginTop:32,background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'14px 32px',fontWeight:'bold',fontSize:18,boxShadow:'0 2px 8px #1a1e3a',cursor: maxLevelCompleted === 5 ? 'pointer' : 'not-allowed', opacity: maxLevelCompleted === 5 ? 1 : 0.5, animation:'bounce 1.2s infinite'}}
          disabled={maxLevelCompleted !== 5}
          onClick={handleContinue}
        >
          <span style={{fontSize:22,marginRight:8,animation:'bounce 1.2s infinite'}}></span> Continuar
        </button>
      </div>
      <style>{`
        @keyframes fadeInUp { 0%{opacity:0;transform:translateY(40px);} 100%{opacity:1;transform:translateY(0);} }
        @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      `}</style>
    </div>
  );
}

export default Interview;
