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
    <div className="home-container" style={{maxWidth:400,margin:'40px auto',padding:24,boxShadow:'0 2px 8px #ccc',borderRadius:12,background:'#fff'}}>
      <h1 style={{textAlign:'center',marginBottom:24}}>Bienvenido a MagTrain</h1>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <label style={{fontWeight:'bold'}}>Nombre:</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{padding:8,borderRadius:6,border:'1px solid #ccc'}}
        />
        <label style={{fontWeight:'bold'}}>Cargo al que aspiras:</label>
        <input
          type="text"
          placeholder="Ejemplo: Desarrollador Backend, Diseñador UX, Gerente de Ventas"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
          style={{padding:8,borderRadius:6,border:'1px solid #ccc'}}
        />
        <button type="submit" disabled={loading || !name.trim() || !role.trim()} style={{padding:10,borderRadius:6,background:'#1976d2',color:'#fff',fontWeight:'bold',border:'none',marginTop:12}}>
          {loading ? 'Creando...' : 'Comenzar'}
        </button>
      </form>
      {error && <p style={{color:'red',marginTop:12}}>{error}</p>}
      <div style={{marginTop:32,fontSize:14,color:'#555',textAlign:'center'}}>
        <p>Ingresa tu nombre y el cargo al que aspiras.<br/>Presiona <b>Comenzar</b> para iniciar tu entrenamiento personalizado.</p>
      </div>
    </div>
  );
}

export default Home;
