# Seminario 7 EA — JWT y Web Sockets

¡Bienvenido al **Seminario 7 de Entornos de Aplicaciones (EA)**! Este repositorio contiene un proyecto completo que demuestra la implementación de autenticación segura utilizando **JWT (JSON Web Tokens)** con la estrategia de **Access Token y Refresh Token**. 

> **IMPORTANTE: Web Sockets**
> Actualmente te encuentras en la rama principal que cubre la parte de **JWT**.
> Para acceder al contenido y código correspondiente al seminario de **Web Sockets**, debes **cambiar de rama**. Ejecuta el siguiente comando en tu terminal:
> ```bash
> git checkout socket_io
> ```

---

## Objetivo del Proyecto (JWT)

Este proyecto consiste en una **API REST** construida con **Node.js**, **Express**, **TypeScript** y **Mongoose**, que gestiona dos entidades principales (`Organizacion` y `Usuario`), junto con una aplicación **Frontend en Angular 17+** que consume dicha API.

El objetivo principal de esta rama es entender cómo funciona el flujo de autenticación seguro:
- **Access Token:** Token de corta duración para autenticar cada petición.
- **Refresh Token:** Token de larga duración (HTTP-Only Cookie) para renovar el Access Token automáticamente de forma segura.

---

## Estructura del proyecto

El proyecto está dividido en dos partes principales:

```
.
├── backend/ (o directorio raíz de src/)
│   ├── src/
│   │   ├── server.ts              # Punto de entrada (Config y Mongo)
│   │   ├── config/                # Var de entorno (.env)
│   │   ├── controllers/           # Lógica HTTP (auth, usuarios, organizaciones)
│   │   ├── middleware/            # JWT Auth Guards y validación Joi
│   │   ├── models/                # Esquemas Mongoose
│   │   ├── routes/                # Definición de ramas Express
│   │   ├── services/              # Lógica de negocio (Interacción BD)
│   │   └── utils/                 # Utilidades JWT (firmado y verificación)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/        # Componentes UI (si aplica)
    │   │   ├── pages/             # Vistas principales (Login, Register, Home)
    │   │   ├── services/          # Llamadas HTTP al backend
    │   │   ├── interceptors/      # authInterceptor (Magia del Refresh Token)
    │   │   └── app.routes.ts      # Enrutamiento y Guards de Angular
    └── package.json
```

---

## Autenticación con Access + Refresh Token

### ¿Dónde se guarda cada token?

- **Access Token (Corta duración):** Devuelto en el body JSON durante el `POST /auth/login`. El frontend (Angular) lo intercepta y lo guarda en memoria o `localStorage` para incluirlo en `Authorization: Bearer <token>`.
- **Refresh Token (Larga duración):** El backend lo devuelve en una cabecera de **cookie `httpOnly`** (no accesible por JS) por razones de seguridad.

### El Flujo Implementado (La "Magia")

1. **Login:** El usuario se loguea. El backend devuelve un `accessToken` en el JSON y un `refreshToken` como cookie segura.
2. **Uso Normal:** Angular envía el `accessToken` en cada petición protegida mediante el `authInterceptor`.
3. **Expiración:** El `accessToken` caduca (ej. a los 15 minutos). El servidor rechaza la petición con un `401 Unauthorized`.
4. **Refresh Automático:** El `authInterceptor` de Angular captura el error `401`, pausa la petición, e invoca silenciosamente a `POST /auth/refresh`. El navegador adjunta la cookie `httpOnly` automáticamente.
5. **Reanudación:** El backend valida el refresh token y devuelve un nuevo `accessToken`. El interceptor lo actualiza y **reintenta** la petición original sin que el usuario se entere.

---

## Instalación y Ejecución

Vas a necesitar **dos terminales**, una para el Backend y otra para el Frontend. Asegúrate de tener **MongoDB** ejecutándose en tu máquina (puerto 27017).

### 1. Configurar el Backend

1. **Instala dependencias y arranca el servidor:**
   ```bash
   npm install
   npm start
   ```
   *El servidor debería indicar que está corriendo en puerto 1337 y Mongo conectado.*

### 2. Configurar el Frontend (Angular)

1. Abre una nueva terminal y navega a la carpeta frontend:
   ```bash
   cd frontend
   ```

2. **Instala dependencias y arranca Angular:**
   ```bash
   npm install
   npm start
   ```

3. **Prueba la aplicación!** Abre tu navegador en `http://localhost:4200`. Deberías poder:
   - Registrarte (Crea un usuario).
   - Iniciar sesión.
   - Acceder a la página Home y ver la lista de usuarios.

---

## Endpoints de la API (Backend)

| Método | URL | Privado | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | No | Inicia sesión y devuelve JWT en Body + Cookie. |
| `POST` | `/auth/refresh` | No | Refresca el Access Token usando la Cookie `httpOnly`. |
| `POST` | `/auth/logout` | No | Cierra sesión limpiando la Cookie. |
| `POST` | `/usuarios` | No | Registro de un nuevo usuario. |
| `GET` | `/usuarios/:id` | Si | Obtiene usuario por ID. Requiere Token. |
| `GET` | `/usuarios` | Si | Lista todos los usuarios. Requiere Token. |

La documentación detallada interactiva generada con Swagger está disponible localmente en:
`http://localhost:1337/api` (una vez arranques el backend)

---

Recuerda: si buscas el material de **Web Sockets**, ejecuta `git checkout socket_io`. ¡Diviértete explorando JWT!
