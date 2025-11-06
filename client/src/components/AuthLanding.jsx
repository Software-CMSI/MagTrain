import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

export default function AuthLanding(){
  const navigate = useNavigate();
  return (
    <Layout maxWidth={560}>
      <h1 style={{textAlign:'center',color:'#2898ee',marginBottom:24}}>Bienvenido a MagTrain</h1>
      <div style={{display:'flex',gap:20,justifyContent:'center',alignItems:'center'}}>
        <button className="mag-btn primary" onClick={() => navigate('/auth/create')}>Crear cuenta</button>
        <button className="mag-btn secondary" onClick={() => navigate('/auth/login')}>Iniciar sesión</button>
      </div>

      <style>{`
        .mag-btn{padding:12px 20px;border-radius:10px;border:none;font-weight:700;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease,filter .12s;background:#2f3148;color:#fff}
        .mag-btn.primary{background:#0cbccc;color:#04263a}
        .mag-btn.secondary{background:#1976d2;color:#fff}
        .mag-btn:focus{outline:3px solid rgba(12,203,204,0.12)}
        .mag-btn:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(8,12,40,0.5);filter:brightness(.98)}
      `}</style>
    </Layout>
  );
}
