import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

function Home() {
  // If coming from account creation or sign-in, pendingAccount or signedInAccount will be set
  const pendingAccount = JSON.parse(localStorage.getItem('pendingAccount') || 'null');
  const signedInAccount = JSON.parse(localStorage.getItem('signedInAccount') || 'null');

  const [name, setName] = useState(pendingAccount?.name || signedInAccount?.name || '');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Crear usuario en el backend (nombre proviene de pendingAccount o del formulario)
      const userName = name.trim();
      // If we already have a created user (from auth flow), just update cargo
      const stored = JSON.parse(localStorage.getItem('interviewUser') || 'null');
      if (stored && stored.id) {
        const res = await api.patch(`/users/${stored.id}/cargo`, { cargo: role });
        const updated = res.data;
        const interviewUser = { id: updated._id || stored.id, name: updated.nombre || stored.name, email: updated.email || stored.email, role: updated.cargo };
        localStorage.setItem('interviewUser', JSON.stringify(interviewUser));
        // Notify other parts of the app (and other tabs) that the cargo changed so cached questions are invalidated
        try {
          window.dispatchEvent(new CustomEvent('cargoChanged', { detail: { userId: interviewUser.id, cargo: interviewUser.role } }));
        } catch (e) {
          // ignore in environments without CustomEvent support
        }
        // cleanup pending account flag
        localStorage.removeItem('pendingAccount');
        navigate('/interview');
        return;
      }

      // Otherwise create (legacy flow): backend accepts nombre+cargo
      const res = await api.post('/users', { nombre: userName, cargo: role });
      const interviewUser = { name: userName, role, id: res.data._id };
      localStorage.setItem('interviewUser', JSON.stringify(interviewUser));
      // Notify other parts of the app that a new user/cargo was created
      try {
        window.dispatchEvent(new CustomEvent('cargoChanged', { detail: { userId: interviewUser.id, cargo: interviewUser.role || interviewUser.role } }));
      } catch (e) {}
      localStorage.removeItem('pendingAccount');
      navigate('/interview');
    } catch (err) {
      setError('Error al crear usuario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout maxWidth={440}>
      <h1 style={{textAlign:'center',marginBottom:28,fontSize:32,color:'#2898ee',fontWeight:'bold',letterSpacing:2}}>
        <span style={{fontSize:32,marginRight:8}}></span> Bienvenido a MagTrain
      </h1>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
        {!(pendingAccount || signedInAccount) && (
          <>
            <label style={{fontWeight:'bold',color:'#0cbccc'}}>Nombre:</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{padding:12,borderRadius:8,border:'2px solid #2898ee',fontSize:16,marginBottom:4,boxShadow:'0 2px 8px #15297c',color:'#e3eaf2',background:'#23275a'}}
            />
          </>
        )}

        <label style={{fontWeight:'bold',color:'#0cbccc'}}>Cargo al que aspiras:</label>
        <input
          type="text"
          placeholder="Ejemplo: Desarrollador Backend, Diseñador UX, Gerente de Ventas"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
          style={{padding:12,borderRadius:8,border:'2px solid #2898ee',fontSize:16,marginBottom:4,boxShadow:'0 2px 8px #15297c',color:'#e3eaf2',background:'#23275a'}}
        />
        <button type="submit" disabled={loading || !name.trim() || !role.trim()} style={{padding:14,borderRadius:10,background:'#0cbccc',color:'#fff',fontWeight:'bold',border:'none',marginTop:16,fontSize:18,boxShadow:'0 4px 16px #15297c',textShadow:'none'}}>
          {loading ? 'Creando...' : 'Comenzar'}
        </button>
      </form>
  {error && <p style={{color:'#FF6B6B',marginTop:14,fontWeight:'bold',textShadow:'none'}}>{error}</p>}
      <div style={{marginTop:36,fontSize:15,color:'#b3c6e7',textAlign:'center',background:'#15297c',borderRadius:10,padding:'12px 8px',boxShadow:'0 2px 8px #2898ee',textShadow:'none'}}>
        <p>Ingresa tu nombre y el cargo al que aspiras.<br/>Presiona <b>Comenzar</b> para iniciar tu entrenamiento personalizado.</p>
      </div>
      <style>{``}</style>
    </Layout>
  );
}

export default Home;
