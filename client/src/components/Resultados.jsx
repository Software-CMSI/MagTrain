import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Llama a la IA en el backend para obtener la puntuación real
async function evaluarRespuestas(respuestas) {
  // Envía cada pregunta, respuesta y tiempo a la IA y recibe la puntuación
  const evals = [];
  for (const r of respuestas) {
    try {
      // Suponiendo endpoint POST /ia/evaluarPregunta { pregunta, respuesta, tiempo }
      const res = await fetch('/ia/evaluarPregunta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: r.pregunta, respuesta: r.respuesta, tiempo: r.tiempo })
      });
      const data = await res.json();
      evals.push({
        nivel: r.nivel,
        pregunta: r.pregunta,
        respuesta: r.respuesta,
        tiempo: r.tiempo,
        puntuacion: data.puntuacion // La IA debe devolver { puntuacion: 0-10 }
      });
    } catch (e) {
      evals.push({
        nivel: r.nivel,
        pregunta: r.pregunta,
        respuesta: r.respuesta,
        tiempo: r.tiempo,
        puntuacion: 0 // Si falla, puntúa 0
      });
    }
  }
  return evals;
}

function Resultados() {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const respuestas = JSON.parse(localStorage.getItem('respuestasEntrevista') || '[]');
    if (respuestas.length === 0) {
      navigate('/interview');
      return;
    }
    // Simula animación de carga y llamada a IA
    setTimeout(async () => {
      const evals = await evaluarRespuestas(respuestas);
      setEvaluaciones(evals);
      setLoading(false);
    }, 1200);
  }, [navigate]);

  return (
    <div style={{maxWidth:600,margin:'40px auto',padding:32,background:'#1a1e3a',borderRadius:24,boxShadow:'0 4px 16px #1a1e3a',transition:'background 0.5s'}}>
      <h1 style={{textAlign:'center',marginBottom:32,fontSize:32,color:'#1976d2',fontWeight:'bold',letterSpacing:2}}>
        <span style={{fontSize:32,marginRight:8,animation:'bounce 1.2s infinite',color:'#1976d2'}}>🏆</span> Resultados de tu Entrevista
      </h1>
      {loading ? (
        <div style={{textAlign:'center',marginTop:80}}>
          <div className="loader" style={{margin:'0 auto 24px',width:60,height:60,borderRadius:'50%',border:'8px solid #2898ee',borderTop:'8px solid #0cbccc',animation:'spin 1s linear infinite'}}></div>
          <div style={{fontSize:22,color:'#0cbccc',fontWeight:'bold',letterSpacing:1}}>Analizando tus respuestas...</div>
        </div>
      ) : (
        Object.entries(
          evaluaciones.reduce((acc, ev) => {
            acc[ev.nivel] = acc[ev.nivel] ? [...acc[ev.nivel], ev] : [ev];
            return acc;
          }, {})
        ).map(([nivel, cards], idx) => (
          <div key={nivel} style={{display:'flex',flexDirection:'row',flexWrap:'nowrap',gap:24,justifyContent:'center',marginBottom:32}}>
            {cards.map((ev,i) => (
              <div key={i} className="card-anim" style={{background:'#23275a',borderRadius:18,boxShadow:'0 4px 16px #1976d2',padding:28,minWidth:260,maxWidth:340,transition:'transform 0.5s',animation:`fadeInUp 0.7s ${(idx*cards.length+i)*0.2}s both`,position:'relative',overflow:'hidden',border:'2px solid #2898ee'}}>
                <div style={{position:'absolute',top:'-18px',right:'-18px',fontSize:'2.2rem',color:'#0cbccc',opacity:0.7,animation:'bounce 1.2s infinite'}}>⭐</div>
                <div style={{fontWeight:'bold',fontSize:22,color:'#2898ee',textShadow:'none'}}>Nivel {ev.nivel}</div>
                <div style={{fontSize:16,color:'#5faee3',margin:'12px 0 8px',textShadow:'none'}}><b>Pregunta:</b> {ev.pregunta}</div>
                <div style={{fontSize:15,color:'#b3c6e7',marginBottom:8,textShadow:'none'}}><b>Tu respuesta:</b> {ev.respuesta}</div>
                <div style={{fontSize:15,color:'#2898ee',marginBottom:8,textShadow:'none'}}><b>Tiempo:</b> {ev.tiempo} segundos</div>
                <div style={{fontSize:18,fontWeight:'bold',color:'#0cbccc',margin:'10px 0',textShadow:'none'}}>
                  <span style={{fontSize:24,verticalAlign:'middle'}}>⭐</span> Puntuación IA: <span style={{fontSize:22,color:'#2898ee',textShadow:'none'}}>{ev.puntuacion}/10</span>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      <button
        style={{marginTop:'40px',display:'block',marginLeft:'auto',marginRight:'auto',fontSize:'22px',background:'#1976d2',color:'#fff',border:'none',borderRadius:10,padding:'16px 40px',fontWeight:'bold',boxShadow:'0 4px 16px #1a1e3a',letterSpacing:'1px',animation:'bounce 1.2s infinite'}}
        onClick={() => {
          localStorage.removeItem('maxLevelCompleted');
          localStorage.removeItem('respuestasEntrevista');
          localStorage.removeItem('interviewUser');
          localStorage.removeItem('interviewAnswers');
          window.sessionStorage.clear();
          navigate('/');
        }}
      >
        <span style={{fontSize:22,marginRight:8,animation:'bounce 1.2s infinite',color:'#fff'}}></span> Repetir entrevista
      </button>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @keyframes fadeInUp { 0%{opacity:0;transform:translateY(40px);} 100%{opacity:1;transform:translateY(0);} }
        @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      `}</style>
    </div>
  );
}

export default Resultados;
