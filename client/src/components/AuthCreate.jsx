import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

export default function AuthCreate(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    if(!name.trim() || !email.trim() || !password.trim()){
      setError('Completa todos los campos');
      return;
    }
    (async () => {
      try {
        // use shared axios instance (api) so baseURL and CORS are handled consistently
        const { default: api } = await import('../api');
        const res = await api.post('/users', { nombre: name.trim(), email: email.trim(), password });
        const data = res.data;
        // store interviewUser for subsequent steps
        localStorage.setItem('interviewUser', JSON.stringify({ id: data._id, name: data.nombre, email: data.email }));
        navigate('/home');
      } catch (err) {
        console.error('Create account error', err);
        // try to extract server-provided message
        const serverMsg = err?.response?.data?.error || err?.message;
        setError(serverMsg || 'Error al crear cuenta. Intenta de nuevo.');
      }
    })();
  };

  return (
    <Layout maxWidth={560}>
      <h2 style={{color:'#2898ee',textAlign:'center'}}>Crear cuenta</h2>
      <form onSubmit={handleCreate} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input className="mag-input" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <input className="mag-input" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="mag-input" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'#ff6b6b'}}>{error}</div>}
        <div style={{display:'flex',gap:10}}>
          <button className="mag-btn primary" type="submit">Continuar</button>
          <button className="mag-btn ghost" type="button" onClick={() => navigate('/')}>Cancelar</button>
        </div>
      </form>

      <style>{`
        .mag-input{padding:12px;border-radius:10px;border:2px solid #2b3b6a;background:#23275a;color:#e3eaf2;font-size:15px}
        .mag-input:focus{outline:none;border-color:#0cbccc;box-shadow:0 6px 18px rgba(12,203,204,0.08)}
        .mag-btn{padding:10px 16px;border-radius:8px;border:none;font-weight:700;cursor:pointer;transition:transform .12s ease,box-shadow .12s;background:#2f3148;color:#fff}
        .mag-btn.primary{background:#0cbccc;color:#04263a}
        .mag-btn.ghost{background:transparent;border:2px solid #3b3f57;color:#d6d9ef}
        .mag-btn:focus{outline:3px solid rgba(12,203,204,0.12)}
        .mag-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(8,12,40,0.45)}
      `}</style>
    </Layout>
  );
}
