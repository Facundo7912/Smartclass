# SmartClass - Generador Inteligente de Material Didáctico Técnico

SmartClass es una aplicación web para gestionar cursos y clases técnicas con persistencia en Supabase y despliegue en Vercel (frontend) y Render (backend). Permite crear, listar, editar y eliminar cursos y clases, además de adjuntar archivos PDF y mostrar el nombre del archivo en la interfaz.

---

## Demo en vivo

- Frontend (Vercel): `https://smartclass-frontend.vercel.app`
- Backend (Render): `https://smartclass-backend.onrender.com`

> Ajusta estas URLs con los enlaces reales de tu despliegue si son diferentes.

---

## Tecnologías utilizadas

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: Supabase (PostgreSQL)
- Deploy: Vercel (frontend) + Render (backend)

---

## Estructura del proyecto

### Raíz del proyecto

- `index.js` - Entrada principal del servidor backend.
- `package.json` - Dependencias y scripts del backend.
- `README.md` - Documentación general del proyecto.

### Backend

- `src/app.js` - Configuración del servidor Express, CORS, rutas y middleware.
- `src/supabase.js` - Cliente Supabase y validación de las variables de entorno.
- `src/controllers/` - Controladores para manejar la lógica de clases, cursos y health check.
  - `class.controller.js`
  - `course.controller.js`
  - `health.controller.js`
- `src/models/` - Acceso directo a la base de datos a través de Supabase.
  - `class.model.js`
  - `Course.model.js`
  - `health.model.js`
- `src/routes/` - Definición de endpoints REST para clases y cursos.
  - `class.routes.js`
  - `course.routes.js`
  - `index.routes.js`

### Frontend

- `frontend/index.html` - Plantilla HTML base de la aplicación React.
- `frontend/package.json` - Dependencias y scripts del frontend.
- `frontend/vite.config.js` - Configuración de Vite.
- `frontend/postcss.config.js` - Configuración de PostCSS / Tailwind.
- `frontend/tailwind.config.js` - Configuración de Tailwind CSS.
- `frontend/src/` - Código fuente de la aplicación React.
  - `App.jsx` - Componente principal del frontend.
  - `main.jsx` - Montaje de React en el DOM.
  - `index.css`, `App.css` - Estilos globales y de componentes.
  - `components/`
    - `ClassForm.jsx` - Formulario de creación/edición de clases.
    - `ClassList.jsx` - Lista de clases con información, estado y nombre de PDF.
    - `CourseForm.jsx` - Formulario de creación/edición de cursos.
    - `CourseList.jsx` - Lista de cursos.
  - `services/`
    - `class.service.js` - Cliente API para clases.
    - `course.service.js` - Cliente API para cursos.

---

## Funcionalidades

- CRUD de cursos:
  - Crear cursos
  - Listar cursos
  - Editar cursos
  - Eliminar cursos
- CRUD de clases:
  - Crear clases
  - Listar clases
  - Editar clases
  - Eliminar clases
- Subir archivos PDF:
  - Lectura del nombre del archivo PDF en el formulario de clase
  - Visualización del nombre del archivo dentro de la tarjeta de clase
- Conexión a Supabase para persistencia de datos:
  - Registro de cursos y clases en PostgreSQL
  - Integración mediante `@supabase/supabase-js`

---

## Configuración local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/<tu-usuario>/Smartclass.git
   cd Smartclass
   ```

2. Instalar dependencias del backend:
   ```bash
   npm install
   ```

3. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Configurar variables de entorno en el backend:
   - Crea un archivo `.env` en la raíz del proyecto con:
     ```env
     SUPABASE_URL=https://<tu-proyecto>.supabase.co
     SUPABASE_ANON_KEY=eyJ...
     SUPABASE_SERVICE_ROLE_KEY=eyJ...   # opcional, recomendado si usas RLS
     ```

5. Configurar el frontend:
   - Crea un archivo `.env` dentro de `frontend/` con:
     ```env
     VITE_API_URL=https://smartclass-backend.onrender.com
     ```

6. Ejecutar backend:
   ```bash
   npm run dev
   ```

7. Ejecutar frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Variables de entorno

### Backend

- `SUPABASE_URL` - URL de tu proyecto Supabase.
- `SUPABASE_ANON_KEY` - Clave anónima para el cliente Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de rol de servicio (opcional, necesaria si Row Level Security está activado).
- `PORT` - Puerto opcional para el servidor Express.

### Frontend

- `VITE_API_URL` - URL base del backend desplegado.

---

## Endpoints de la API

### Salud
- `GET /api/health`

### Cursos
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:id`
- `PATCH /api/courses/:id`
- `DELETE /api/courses/:id`

### Clases
- `GET /api/classes`
- `POST /api/classes`
- `GET /api/classes/:id`
- `PATCH /api/classes/:id`
- `DELETE /api/classes/:id`

---

## Desafíos superados

- Corrección de nombres de columnas y campos para alinear el backend con el esquema de Supabase.
- Solución de errores de mayúsculas/minúsculas en Linux (Render) al renombrar archivos y rutas del backend.
- Configuración de CORS en Express para permitir el consumo desde el frontend.
- Validación de variables de entorno en `src/supabase.js` para evitar fallos por configuración incompleta.
- Ajuste del frontend para mostrar correctamente el nombre de archivos PDF adjuntos en las tarjetas de clase.

---

## Estado del proyecto

- MVP funcionando
- CRUD completo para cursos y clases
- Persistencia con Supabase
- Frontend React responsivo con Tailwind
- Backend Express con endpoints REST y manejo de errores

---

## Licencia y créditos

- Licencia: MIT
- Créditos: Proyecto desarrollado como solución SmartClass para gestión de material didáctico técnico utilizando React, Vite, Tailwind, Express y Supabase.
