
import React, { useState, useEffect } from 'react';
import useSpeechRecognition from './useSpeechRecognition';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const levels = [
  {
    title: 'Nivel 1',
    subtitle: 'Presentación Personal y Motivación',
    description: 'Cuéntame sobre ti. ¿Por qué quieres este puesto? ¿Qué sabes sobre nuestra empresa?',
    icon: '👤',
    color: '#4F8CFF'
  },
  {
    title: 'Nivel 2',
    subtitle: 'Experiencia y Trayectoria Profesional',
    description: 'Háblame de tus roles anteriores, logros y crecimiento profesional.',
    icon: '💼',
    color: '#6DD47E'
  },
  {
    title: 'Nivel 3',
    subtitle: 'Habilidades Blandas y Trabajo en Equipo',
    description: '¿Cómo manejas el trabajo en equipo, liderazgo y resolución de conflictos?',
    icon: '🤝',
    color: '#FFD166'
  },
  {
    title: 'Nivel 4',
    subtitle: 'Situaciones Conductuales y Problemas',
    description: 'Cuéntame de una vez que enfrentaste un desafío y cómo lo resolviste.',
    icon: '🧩',
    color: '#FF6B6B'
  },
  {
    title: 'Nivel 5',
    subtitle: 'Preguntas Técnicas del Rol',
    description: 'Preguntas específicas del cargo que indicaste.',
    icon: '🛠️',
    color: '#9D4EDD'
  }
];

function Interview() {
  const [currentLevel, setCurrentLevel] = useState(0);
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
    if (idx === currentLevel) {
      navigate('/question', { state: { user: user.id, nivel: idx + 1 } });
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
    <div style={{maxWidth:500,margin:'40px auto',padding:24}}>
      <h2 style={{textAlign:'center',marginBottom:24}}>Niveles de Entrevista</h2>
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        {levels.map((lvl, idx) => (
          <div key={lvl.title} style={{
            opacity: idx > currentLevel ? 0.5 : 1,
            background: '#222',
            borderRadius:16,
            boxShadow:'0 2px 8px #0002',
            padding:20,
            display:'flex',
            alignItems:'center',
            gap:20,
            position:'relative',
            border: idx === currentLevel ? `2px solid ${lvl.color}` : '2px solid #333'
          }}>
            <span style={{fontSize:40}}>{lvl.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',fontSize:20,color:lvl.color}}>{lvl.title}</div>
              <div style={{fontSize:16,color:'#fff',marginBottom:4}}>{lvl.subtitle}</div>
              <div style={{fontSize:14,color:'#bbb'}}>{lvl.description}</div>
            </div>
            {idx === currentLevel ? (
              <button
                style={{background:lvl.color,color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:16,boxShadow:'0 2px 8px #0002',cursor:'pointer'}}
                onClick={() => handleStartLevel(idx)}
                disabled={showQuestion}
              >
                {showQuestion ? 'En curso...' : 'START'}
              </button>
            ) : (
              <button
                style={{background:'#555',color:'#ccc',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:'bold',fontSize:16,boxShadow:'0 2px 8px #0002',cursor:'not-allowed'}}
                disabled
              >
                Bloqueado
              </button>
            )}
            {answers[idx] && (
              <span style={{position:'absolute',top:10,right:10,fontSize:24,color:'#6DD47E'}}>✔️</span>
            )}
          </div>
        ))}
      </div>

  {/* La pantalla de pregunta ahora es QuestionScreen.jsx */}
    </div>
  );
}

export default Interview;
