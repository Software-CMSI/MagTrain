import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Crear usuario en el backend
      const res = await api.post('/users', { nombre: name, cargo: role });
      localStorage.setItem('interviewUser', JSON.stringify({ name, role, id: res.data._id }));
      navigate('/interview');
    } catch (err) {
      setError('Error al crear usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{maxWidth:440,margin:'40px auto',padding:32,borderRadius:20,background:'#142157',boxShadow:'0 8px 32px #15297c',transition:'background 0.5s'}}>
      <h1 style={{textAlign:'center',marginBottom:28,fontSize:32,color:'#2898ee',fontWeight:'bold',letterSpacing:2}}>
        <span style={{fontSize:32,marginRight:8,animation:'bounce 1.2s infinite'}}></span> Bienvenido a MagTrain
      </h1>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
  <label style={{fontWeight:'bold',color:'#0cbccc'}}>Nombre:</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{padding:12,borderRadius:8,border:'2px solid #2898ee',fontSize:16,marginBottom:4,boxShadow:'0 2px 8px #15297c',color:'#e3eaf2',background:'#23275a'}}
        />
  <label style={{fontWeight:'bold',color:'#0cbccc'}}>Cargo al que aspiras:</label>
        <input
          type="text"
          placeholder="Ejemplo: Desarrollador Backend, Diseñador UX, Gerente de Ventas"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
          style={{padding:12,borderRadius:8,border:'2px solid #2898ee',fontSize:16,marginBottom:4,boxShadow:'0 2px 8px #15297c',color:'#e3eaf2',background:'#23275a'}}
        />
        <button type="submit" disabled={loading || !name.trim() || !role.trim()} style={{padding:14,borderRadius:10,background:'#0cbccc',color:'#fff',fontWeight:'bold',border:'none',marginTop:16,fontSize:18,boxShadow:'0 4px 16px #15297c',animation:'bounce 1.2s infinite',textShadow:'none'}}>
          {loading ? 'Creando...' : 'Comenzar'}
        </button>
      </form>
  {error && <p style={{color:'#FF6B6B',marginTop:14,fontWeight:'bold',textShadow:'none'}}>{error}</p>}
      <div style={{marginTop:36,fontSize:15,color:'#b3c6e7',textAlign:'center',background:'#15297c',borderRadius:10,padding:'12px 8px',boxShadow:'0 2px 8px #2898ee',textShadow:'none'}}>
        <p>Ingresa tu nombre y el cargo al que aspiras.<br/>Presiona <b>Comenzar</b> para iniciar tu entrenamiento personalizado.</p>
      </div>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      `}</style>
    </div>
  );
}

export default Home;
