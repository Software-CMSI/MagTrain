import React from 'react';
import Layout from './Layout';

function Feedback() {
  const user = JSON.parse(localStorage.getItem('interviewUser'));
  const answers = JSON.parse(localStorage.getItem('interviewAnswers'));

  // Calcular puntaje global y feedback por nivel
  const puntajes = answers?.map(a => a.puntaje || 0);
  const puntajeGlobal = puntajes?.length ? (puntajes.reduce((a,b) => a+b, 0) / puntajes.length).toFixed(2) : null;

  return (
    <Layout>
      <div className="feedback-container">
        <h2 style={{color:'#2898ee',textAlign:'center',marginBottom:16}}>¡Entrevista finalizada!</h2>
        <p style={{textAlign:'center'}}>Gracias, <b>{user?.name}</b>, por completar la simulación para el cargo de <b>{user?.role}</b>.</p>
      {puntajeGlobal && (
        <h3>Calificación global: <span style={{color:'green'}}>{puntajeGlobal} / 10</span></h3>
      )}
      <h3>Retroalimentación por nivel:</h3>
      <ol>
        {answers && answers.map((ans, idx) => (
          <li key={idx}>
            <b>Nivel {ans.nivel}:</b><br/>
            <b>Pregunta:</b> {ans.pregunta}<br/>
            <b>Tu respuesta:</b> {ans.respuesta}<br/>
            <b>Puntaje:</b> {ans.puntaje || 'N/A'}<br/>
            <b>Feedback IA:</b> {ans.evaluacion || 'Sin feedback'}
          </li>
        ))}
      </ol>
        <p style={{textAlign:'center',marginTop:18}}><i>¡Sigue practicando para mejorar tus resultados!</i></p>
      </div>
    </Layout>
  );
}

export default Feedback;
