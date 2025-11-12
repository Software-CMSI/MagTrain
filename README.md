# MagTrain

Proyecto full-stack (React + Express/MongoDB) para entrenamiento/entrevistas (MagTrain).

## Resumen

Este repositorio contiene un cliente React (carpeta `client/`) y un servidor Node/Express (carpeta `server/`). El servidor usa MongoDB (Atlas) mediante Mongoose, y expone API REST que el cliente consume.

El objetivo de este README es explicar qué hace cada parte, cómo ejecutar el proyecto y cómo resolver problemas comunes (por ejemplo, errores de resolución DNS con URIs `mongodb+srv`).

## Estructura del proyecto

- `client/` — Aplicación frontend creada con Create React App
	- `package.json` — scripts y dependencias del frontend
	- `src/` — código React (componentes, páginas, hooks)
- `server/` — API backend en Node.js + Express
	- `package.json` — scripts y dependencias del backend
	- `src/index.js` — punto de entrada del servidor
	- `src/config/db.js` — conexión a MongoDB (Mongoose)
	- `src/controllers/` — controladores para endpoints (iaController, interviewController, userController)
	- `src/models/` — modelos Mongoose (`Interview.js`, `User.js`)
	- `src/routes/` — rutas del servidor (iaRoutes, interviewRoutes, userRoutes)
	- `src/utils/aiService.js` — utilidades/servicios para integración AI
- `.env` (no incluido en el repositorio) — variables de entorno para configuración local.

## Tecnologías principales

- Frontend: React, axios
- Backend: Node.js, Express, Mongoose
- Base de datos: MongoDB Atlas
- Otras: dotenv, nodemon (dev), bcryptjs

## Variables de entorno necesarias

En `server/.env` (crea este archivo en `server/` y no lo agregues al control de versiones):

```
PORT=5000
GEMINI_API_KEY=<tu_api_key>
MONGO_URI=<tu_mongodb_connection_string>
```

- `MONGO_URI`: normalmente Atlas proporciona dos formatos de conexión:
	- `mongodb+srv://usuario:pass@clustername.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority` (SRV)
	- o la `standard` con lista de hosts: `mongodb://host1:27017,host2:27017/<dbname>?replicaSet=...`

IMPORTANTE: no subas credenciales a Git. Si crees que las credenciales se han expuesto, créalas de nuevo desde Atlas (rota la contraseña).

## Cómo instalar y ejecutar (desarrollo)

Requisitos: Node.js (16+ recomendado) y npm.

1) Instalar dependencias del servidor:

```powershell
cd server
npm install
```

2) Crear `server/.env` con las variables indicadas arriba.

3) Ejecutar servidor en modo desarrollo (usa nodemon):

```powershell
npm run dev
```

Desde la raíz del repo puedes correr el script entrando a la carpeta `server` primero o usando un workspace-aware runner (`cd server; npm run dev`).

4) Instalar y ejecutar el cliente:

```powershell
cd client
npm install
npm start
```

El cliente por defecto se levantará en `http://localhost:3000` y hace peticiones al servidor (asegúrate de que el servidor esté corriendo en `http://localhost:5000` o ajusta la URL en `client/src/api.js`).

## Ejecutar en producción (build de frontend)

1) Construye el cliente:

```powershell
cd client
npm run build
```

2) Sirve los archivos estáticos desde tu servidor de preferencia o configura Express para servir la carpeta `client/build`.

## Qué hace cada archivo/directorio clave

- `server/src/index.js`: configura Express, middlewares (CORS, JSON), registra rutas y llama a la función de conexión a la DB (`src/config/db.js`).
- `server/src/config/db.js`: contiene la lógica de conexión a MongoDB usando Mongoose.
- `server/src/models/*`: esquemas de datos (User, Interview).
- `server/src/controllers/*`: lógica de negocio para cada recurso (crear entrevista, manejar IA, etc.).
- `client/src/api.js`: cliente HTTP (axios) configurado para comunicarse con el backend.
- `client/src/components/*`: componentes React para autenticación, entrevistas, resultados y más.

## Problemas comunes y soluciones

1) Error: "queryTxt ETIMEOUT <cluster>.mongodb.net"

Descripción: ocurre con URIs `mongodb+srv://` porque el driver hace consultas DNS SRV/TXT para descubrir los hosts. ETIMEOUT significa que la consulta DNS caducó.

Posibles causas:
- DNS local o ISP bloqueando/siendo lento en consultas SRV/TXT.
- VPN o firewall corporativo que bloquea tráfico DNS o saliente.
- Problema de conectividad temporal.

Pasos de diagnóstico (PowerShell):

```powershell
Resolve-DnsName -Type SRV _mongodb._tcp.tu_cluster.mongodb.net
Resolve-DnsName -Type TXT tu_cluster.mongodb.net
nslookup tu_cluster.mongodb.net 8.8.8.8
```

Si esas consultas fallan desde tu red, prueba:
- Conectar desde otra red (por ejemplo, hotspot del celular). Si funciona desde otra red, el problema está en tu DNS/red local.
- Cambiar DNS a 8.8.8.8 (Google) o 1.1.1.1 (Cloudflare) en la configuración del adaptador de red.
- Si no puedes cambiar DNS, en Atlas toma la conexión "standard" (no +srv) y úsala en `MONGO_URI` para evitar SRV/TXT.

2) Advertencias sobre opciones deprecated en Mongoose

Si ves avisos como `useNewUrlParser is a deprecated option` o `useUnifiedTopology is a deprecated option`, puedes eliminarlas de la llamada a `mongoose.connect`. En su lugar, para depuración añade `serverSelectionTimeoutMS` si quieres que falle más rápido:

Ejemplo (en `server/src/config/db.js`) — sólo para debug:

```javascript
await mongoose.connect(process.env.MONGO_URI, {
	serverSelectionTimeoutMS: 10000 // falla en 10s si no puede seleccionar servidor
});
```

3) No existe el script `server` al ejecutar `npm run server`

El `package.json` en `server/` contiene el script `dev` (nodemon). Para levantar el servidor ejecuta `npm run dev`. Si quieres un script `server` que haga `node src/index.js`, dime y lo añado al `package.json`.

## Seguridad y mantenimiento

- No subas `.env` ni credenciales a Git.
- Usa usuarios de base de datos con permisos mínimos para el entorno.
- Si crees que las credenciales fueron expuestas, rota la contraseña desde MongoDB Atlas.

## Desarrollo adicional y notas

- Si quieres que automatice cambios pequeños (por ejemplo agregar `server` script en `server/package.json` o aplicar el cambio de timeout en `db.js`), dime y lo hago.
- Si quieres que agregue documentación adicional (endpoints disponibles, ejemplos de request/responses, tests), indícame qué partes quieres cubrir primero.

---

Si quieres que aplique ahora alguno de los cambios sugeridos (añadir script `server`, ajustar `db.js`, o generar un `.env.example`), dime cuál y lo edito.

