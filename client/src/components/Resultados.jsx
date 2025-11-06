import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

// Llama a la IA en el backend para obtener la puntuación real
async function evaluarRespuestas(respuestas, serverMap = {}) {
  // Envía cada pregunta, respuesta y tiempo a la IA y recibe la puntuación.
  // Pero primero intenta reutilizar evaluaciones ya guardadas en el servidor (serverMap).
  const evals = [];
  const backendUrl = window.__MAGTRAIN_BACKEND_URL__ || 'http://localhost:5000';
  const user = JSON.parse(localStorage.getItem('interviewUser') || '{}');
  // First pass: decide which to reuse and which need evaluation
  const toEvaluate = [];
  const mapIndex = {}; // key -> original respuesta object

  for (const r of respuestas) {
    const key = `${r.nivel}::${r.pregunta}`;
    const sv = serverMap[key];
    if (sv) {
      const existingScore = typeof sv.puntaje !== 'undefined' && sv.puntaje !== null ? sv.puntaje : (sv.score ?? null);
      const existingEvalText = sv.evaluacion ?? sv.evaluation ?? sv.raw ?? '';
      const looksLikeFallback = existingScore === 0 && /no se pudo evaluar|ia no disponible|no se pudo/i.test(String(existingEvalText));
      const hasExistingScore = existingScore !== null && typeof existingScore !== 'undefined';
      if (hasExistingScore && !looksLikeFallback) {
        evals.push({
          nivel: r.nivel,
          pregunta: r.pregunta,
          respuesta: r.respuesta,
          tiempo: r.tiempo,
          puntuacion: existingScore,
          evaluation: existingEvalText || null,
          suggestions: sv.suggestions ?? null
        });
        continue;
      }
      // otherwise schedule re-evaluation (prefer batch)
      const item = { interviewId: sv._interviewId, pregunta: r.pregunta, respuesta: r.respuesta, nivel: r.nivel, tiempo: r.tiempo, cargo: user?.role || user?.cargo || '', key };
      toEvaluate.push(item);
      mapIndex[key] = r;
    } else {
      // not present on server, schedule evaluation
      const key = `${r.nivel}::${r.pregunta}`;
      const item = { interviewId: null, pregunta: r.pregunta, respuesta: r.respuesta, nivel: r.nivel, tiempo: r.tiempo, cargo: user?.role || user?.cargo || '', key };
      toEvaluate.push(item);
      mapIndex[key] = r;
    }
  }

  // If nothing to evaluate, return early
  if (toEvaluate.length === 0) return evals;

  // Call batch endpoint
  try {
    const resp = await fetch(`${backendUrl}/ia/evaluarBatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: toEvaluate })
    });
    const data = await resp.json();
    const results = data.results || [];

    // Merge results back into evals
    for (const r of results) {
      const k = r.key || `${r.nivel}::${r.pregunta}`;
      if (r.result) {
        const punt = r.result.puntaje ?? r.result.score ?? null;
        evals.push({
          nivel: r.nivel,
          pregunta: r.pregunta,
          respuesta: mapIndex[k]?.respuesta ?? '',
          tiempo: mapIndex[k]?.tiempo ?? null,
          puntuacion: punt,
          evaluation: r.result.evaluacion ?? r.result.evaluation ?? null,
          suggestions: r.result.suggestions ?? null
        });
      } else if (r.error) {
        evals.push({
          nivel: r.nivel,
          pregunta: r.pregunta,
          respuesta: mapIndex[k]?.respuesta ?? '',
          tiempo: mapIndex[k]?.tiempo ?? null,
          puntuacion: 0,
          evaluation: r.error,
          suggestions: []
        });
      } else {
        evals.push({
          nivel: r.nivel,
          pregunta: r.pregunta,
          respuesta: mapIndex[k]?.respuesta ?? '',
          tiempo: mapIndex[k]?.tiempo ?? null,
          puntuacion: 0
        });
      }
    }
  } catch (err) {
    console.error('Batch evaluation failed:', err);
    // fallback: mark all as 0
    for (const t of toEvaluate) {
      evals.push({ nivel: t.nivel, pregunta: t.pregunta, respuesta: t.respuesta, tiempo: t.tiempo, puntuacion: 0 });
    }
  }

  return evals;
}

function Resultados() {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const grouped = React.useMemo(() => {
    return Object.entries(
      evaluaciones.reduce((acc, ev) => {
        acc[ev.nivel] = acc[ev.nivel] ? [...acc[ev.nivel], ev] : [ev];
        return acc;
      }, {})
    );
  }, [evaluaciones]);

  useEffect(() => {
    (async () => {
      const respuestas = JSON.parse(localStorage.getItem('respuestasEntrevista') || '[]');
      if (respuestas.length === 0) {
        navigate('/interview');
        return;
      }

      // Try to fetch interviews saved on the server for this user so we can reuse stored evaluations
      const user = JSON.parse(localStorage.getItem('interviewUser') || '{}');
      const serverMap = {};
      try {
        if (user && user.id) {
          const { default: api } = await import('../api');
          const resp = await api.get(`/interviews/${user.id}`);
          // resp.data is array of interview documents, each has respuestas[]
          for (const doc of resp.data) {
            for (const r of doc.respuestas || []) {
              const key = `${r.nivel}::${r.pregunta}`;
              // store the respuesta plus a reference to the parent interview id so we can re-evaluate if needed
              serverMap[key] = { ...r, _interviewId: doc._id };
            }
          }
        }
      } catch (err) {
        // ignore server lookup errors; we'll call IA for missing ones
        console.warn('Could not fetch server interviews:', err);
      }

      // Simula animación de carga y llamada a IA
      setTimeout(async () => {
        const evals = await evaluarRespuestas(respuestas, serverMap);
        setEvaluaciones(evals);
        setLoading(false);
      }, 1200);
    })();
  }, [navigate]);

  return (
    <Layout>
      <h1 style={{textAlign:'center',marginBottom:32,fontSize:32,color:'#1976d2',fontWeight:'bold',letterSpacing:2}}>
        <span style={{fontSize:32,marginRight:8,color:'#1976d2'}}>🏆</span> Resultados de tu Entrevista
      </h1>
      {loading ? (
          <div style={{textAlign:'center',marginTop:80}}>
          <div className="loader" style={{margin:'0 auto 24px',width:60,height:60,borderRadius:'50%',border:'8px solid #2898ee',borderTop:'8px solid #0cbccc'}}></div>
          <div style={{fontSize:22,color:'#0cbccc',fontWeight:'bold',letterSpacing:1}}>Analizando tus respuestas...</div>
        </div>
      ) : (
        grouped.map(([nivel, cards]) => (
          <div key={nivel} style={{marginBottom:20}}>
            <h2 style={{color:'#1976d2'}}>Nivel {nivel}</h2>
            {cards.map((ev, i) => (
              <div key={i} style={{padding:12,marginBottom:10,borderRadius:8,background:'#1f2540',color:'#dbefff'}}>
                <div><b>Pregunta:</b> {ev.pregunta}</div>
                <div><b>Tu respuesta:</b> {ev.respuesta}</div>
                <div><b>Tiempo:</b> {ev.tiempo} s</div>
                <div><b>Score:</b> {ev.puntuacion ?? 'Sin evaluación'}</div>
                {ev.evaluation && <div style={{marginTop:6}}><b>Feedback IA:</b> {ev.evaluation}</div>}
                {Array.isArray(ev.suggestions) && (
                  <ul style={{marginTop:6}}>
                    {ev.suggestions.map((s, k) => <li key={k}>{s}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))
      )}
      <button
        style={{marginTop:'40px',display:'block',marginLeft:'auto',marginRight:'auto',fontSize:'22px',background:'#1976d2',color:'#fff',border:'none',borderRadius:10,padding:'16px 40px',fontWeight:'bold',boxShadow:'0 4px 16px #1a1e3a',letterSpacing:'1px'}}
        onClick={() => {
          localStorage.removeItem('maxLevelCompleted');
          localStorage.removeItem('respuestasEntrevista');
          localStorage.removeItem('interviewUser');
          localStorage.removeItem('interviewAnswers');
          window.sessionStorage.clear();
          navigate('/');
        }}
      >
        <span style={{fontSize:22,marginRight:8,color:'#fff'}}></span> Repetir entrevista
      </button>
      
    </Layout>
  );
}

export default Resultados;
