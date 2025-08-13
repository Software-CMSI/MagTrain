import React, { useState } from 'react';
import axios from 'axios';

const Interview = ({ userId }) => {
  const [nivel, setNivel] = useState(1);
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [evaluacion, setEvaluacion] = useState('');

  const obtenerPregunta = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/interviews/question/${userId}/${nivel}`);
      setPregunta(res.data.pregunta);
    } catch (error) {
      console.error(error);
    }
  };

  const enviarRespuesta = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/interviews`, {
        user: userId,
        nivel,
        respuesta
      });
      setEvaluacion(res.data.respuestas[0].evaluacion || 'Evaluado en backend');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Entrevista Nivel {nivel}</h2>
      <button onClick={obtenerPregunta}>Obtener Pregunta</button>
      {pregunta && (
        <>
          <p><b>Pregunta:</b> {pregunta}</p>
          <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
          <button onClick={enviarRespuesta}>Enviar Respuesta</button>
        </>
      )}
      {evaluacion && (
        <p><b>Evaluación IA:</b> {evaluacion}</p>
      )}
    </div>
  );
};

export default Interview;
