import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import useSpeechRecognition from './useSpeechRecognition';
import Layout from './Layout';

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.speak(utter);
  }
}

// Simple in-memory cache to avoid duplicate API calls for the same user/level/description
const questionCache = new Map();

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
  const [cacheBust, setCacheBust] = useState(0);
  const { listening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();

  useEffect(() => {
    let controller = new AbortController();
    async function fetchQuestions() {
      setLoading(true);
      try {
        // include the current cargo/role in the cache key so changing cargo forces a new AI request
        const storedUserForCache = JSON.parse(localStorage.getItem('interviewUser') || 'null');
        const cargoForCache = storedUserForCache?.role || storedUserForCache?.cargo || '';
        const cacheKey = `${user}_${nivel}_${encodeURIComponent(descripcion || '')}_${encodeURIComponent(cargoForCache)}`;
        if (questionCache.has(cacheKey)) {
          setQuestions(questionCache.get(cacheKey));
          setCurrentIndex(0);
          return;
        }
        const res = await api.get(`/interviews/question/${user}/${nivel}?descripcion=${encodeURIComponent(descripcion)}`, { signal: controller.signal });
        // Solo tomar la primera pregunta de la lista: una pregunta por nivel
        const preguntas = res.data.preguntas || [];
        const first = preguntas.slice(0, 1);
        questionCache.set(cacheKey, first);
        setQuestions(first);
        setCurrentIndex(0);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'CanceledError' /* axios may throw different names */) {
          // request cancelled - ignore
        } else {
          setError('Error al obtener las preguntas.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
    return () => {
      // cancel inflight request when unmounting or deps change
      controller.abort();
    };
  }, [user, nivel, descripcion, cacheBust]);

  // Listen for cargo changes so we can invalidate the in-memory question cache.
  useEffect(() => {
    const handler = (evt) => {
      // evt.detail may contain userId and cargo
      try {
        for (const k of questionCache.keys()) {
          if (k.startsWith(`${user}_`)) questionCache.delete(k);
        }
      } catch (e) {
        // ignore
      }
      // trigger refetch
      setCacheBust(c => c + 1);
    };

    const storageHandler = (e) => {
      // other tabs may update interviewUser in localStorage
      if (e.key === 'interviewUser') {
        try {
          for (const k of questionCache.keys()) {
            if (k.startsWith(`${user}_`)) questionCache.delete(k);
          }
        } catch (ee) {}
        setCacheBust(c => c + 1);
      }
    };

    window.addEventListener('cargoChanged', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('cargoChanged', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [user]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      // Leer la pregunta en voz alta, pero NO iniciar el temporizador automáticamente.
      speak(questions[currentIndex]);
      // Reiniciar contador visual pero no arrancar intervalos hasta que el usuario interaccione.
      setTimer(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    // Limpiar temporizador al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [questions, currentIndex]);

  // Inicia el temporizador si no está corriendo
  const startTimerIfNeeded = () => {
    if (!timerRef.current) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
      // Si la respuesta llega por voz, iniciar el temporizador si aún no está en marcha
      startTimerIfNeeded();
    }
  }, [transcript]);

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    setError('');
    try {
      // include current cargo as snapshot so interviews are stored per-cargo
      const storedUser = JSON.parse(localStorage.getItem('interviewUser') || 'null');
      const cargoSnapshot = storedUser?.role || storedUser?.cargo || '';
      await api.post('/interviews', {
        user,
        nivel,
        pregunta: questions[currentIndex],
        respuesta: answer,
        cargo: cargoSnapshot
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
    <Layout>
      <div style={{background:'#142157',borderRadius:18,padding:28,boxShadow:'0 8px 32px rgba(0,0,0,0.35)'}}>
        <h2 style={{color:'#2898ee',marginBottom:18,fontWeight:'700',fontSize:26,textAlign:'center',letterSpacing:0.6}}>
          <span style={{fontSize:26,marginRight:8,color:'#2898ee'}}></span> Pregunta {currentIndex + 1} de {questions.length} - Nivel {nivel}
        </h2>

        <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:18}}>
          <p style={{fontSize:18,color:'#bfefff',margin:0,lineHeight:1.5,flex:1}}>{questions[currentIndex] || 'Cargando pregunta...'}</p>
          <div style={{minWidth:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#0cbccc',color:'#072235',padding:'10px 12px',borderRadius:12,fontWeight:'700',fontSize:18,boxShadow:'0 6px 20px rgba(12,188,204,0.18)'}}>⏰ {timer}s</div>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={e => {
            const val = e.target.value;
            // Mantener la actualización del estado
            setAnswer(val);
          }}
          onKeyDown={() => {
            // Inicia el temporizador en la primera pulsación de tecla al escribir
            startTimerIfNeeded();
          }}
          placeholder="Responde aquí o usa el micrófono"
          rows={5}
          required
          style={{display:'block',width:'90%',maxWidth:900,margin:'0 auto 20px',padding:18,borderRadius:12,border:'1px solid rgba(255,255,255,0.06)',fontSize:16,background:'#071029',color:'#e6f7fb',boxShadow:'inset 0 2px 8px rgba(0,0,0,0.5)'}}
        />

        <div style={{display:'flex',flexWrap:'wrap',gap:14,marginBottom:6,justifyContent:'center'}}>
          {/* Unified button style */}
          <button onClick={() => { startListening(); startTimerIfNeeded(); }} disabled={listening || loading} style={{background:'#0cbccc',color:'#072235',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:'700',fontSize:16,boxShadow:'0 8px 30px rgba(12,188,204,0.16)',cursor: listening || loading ? 'not-allowed' : 'pointer'}}>
            {listening ? 'Escuchando...' : '🎤 Voz'}
          </button>
          <button onClick={stopListening} disabled={!listening || loading} style={{background:'#0cbccc',color:'#072235',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:'700',fontSize:16,boxShadow:'0 8px 30px rgba(12,188,204,0.16)',cursor: !listening || loading ? 'not-allowed' : 'pointer'}}>Detener</button>
          <button onClick={() => speak(questions[currentIndex])} disabled={loading || !questions[currentIndex]} style={{background:'#0cbccc',color:'#072235',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:'700',fontSize:16,boxShadow:'0 8px 30px rgba(12,188,204,0.16)',cursor: loading || !questions[currentIndex] ? 'not-allowed' : 'pointer'}}>🔊 Escuchar pregunta</button>
        </div>

        <div style={{display:'flex',justifyContent:'center'}}>
          <button onClick={handleSubmit} disabled={!answer.trim() || loading} style={{background:'#0cbccc',color:'#072235',border:'none',borderRadius:12,padding:'14px 36px',fontWeight:'800',fontSize:18,boxShadow:'0 12px 38px rgba(12,188,204,0.18)',cursor: !answer.trim() || loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Guardando...' : 'Enviar respuesta'}
          </button>
        </div>
      </div>
      {error && <p style={{color:'#FF6B6B',marginTop:10,fontWeight:'bold'}}>{error}</p>}
      <style>{``}</style>
    </Layout>
  );
};

export default QuestionScreen;
