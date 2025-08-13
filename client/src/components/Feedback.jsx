import React from 'react';

function Feedback() {
  const user = JSON.parse(localStorage.getItem('interviewUser'));
  const answers = JSON.parse(localStorage.getItem('interviewAnswers'));

  // Calcular puntaje global y feedback por nivel
  const puntajes = answers?.map(a => a.puntaje || 0);
  const feedbacks = answers?.map(a => a.evaluacion || '');
  const puntajeGlobal = puntajes?.length ? (puntajes.reduce((a,b) => a+b, 0) / puntajes.length).toFixed(2) : null;

  return (
    <div className="feedback-container">
      <h2>¡Entrevista finalizada!</h2>
      <p>Gracias, <b>{user?.name}</b>, por completar la simulación para el cargo de <b>{user?.role}</b>.</p>
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
      <p><i>¡Sigue practicando para mejorar tus resultados!</i></p>
    </div>
  );
}

export default Feedback;
