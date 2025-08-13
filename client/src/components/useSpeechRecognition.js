import { useState, useRef } from 'react';

export default function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome para mejor experiencia.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      setTranscript(event.results[0][0].transcript);
      // No detenemos el reconocimiento aquí
    };
    recognition.onerror = () => {
      if (listening) recognition.start();
    };
    recognition.onend = () => {
      // Si listening sigue en true, reinicia el reconocimiento
      if (listening) recognition.start();
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return { listening, transcript, startListening, stopListening, setTranscript };
}
