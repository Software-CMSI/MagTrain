# MagTrain: simulador de entrevistas laborales con IA

Aplicación web full-stack para practicar entrevistas de trabajo. El usuario avanza por **5 niveles de dificultad**, responde por escrito o **por voz**, y recibe retroalimentación generada con IA sobre cada respuesta.

<!-- Agregar 2 capturas: la pantalla de pregunta y la de retroalimentación. -->

## Funcionalidades

- Registro e inicio de sesión (contraseñas con bcrypt).
- 5 niveles con preguntas generadas por la API de Gemini según el rol y la descripción de cada nivel.
- Respuesta escrita o por voz (Web Speech API) y lectura en voz alta de las preguntas.
- Cronómetro por pregunta y seguimiento del avance entre niveles.
- Retroalimentación con IA al final de cada nivel y pantalla de resultados.
- Historial de entrevistas guardado en MongoDB.

## Arquitectura

| Parte | Tecnología |
|---|---|
| `client/` | React (Create React App), Axios |
| `server/` | Node.js, Express, Mongoose, bcryptjs |
| Base de datos | MongoDB Atlas |
| IA | API de Gemini (Google AI Studio) |

El servidor expone una API REST con rutas para usuarios, entrevistas e IA, organizadas en controladores, modelos y rutas separados.

## Inicio rápido

Requisitos: Node.js 18+ y una base de datos en MongoDB Atlas.

```bash
git clone https://github.com/Software-CMSI/MagTrain
cd MagTrain

# Servidor
cd server
npm install
# crear .env con PORT, MONGO_URI y GEMINI_API_KEY
npm run dev              # http://localhost:5000

# Cliente (otra terminal)
cd client
npm install
npm start                # http://localhost:3000
```

**Error `queryTxt ETIMEOUT` al conectar a Atlas:** tu red está bloqueando las consultas DNS de las URIs `mongodb+srv://`. Cambia el DNS a 8.8.8.8 o usa la cadena de conexión estándar (sin `+srv`) que ofrece Atlas.

## Autor

Camilo Álvarez Villegas, Universidad EAFIT (2025-2).
