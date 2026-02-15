# Finance Tracker RBAC

Aplicación full-stack para gestión de finanzas personales con control de acceso basado en roles (RBAC).

## 🚀 Cómo ejecutar el proyecto localmente

### Prerrequisitos
- Node.js 20+
- PostgreSQL (o Supabase)
- Cuenta de GitHub para OAuth

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/finance-tracker-rbac.git
cd finance-tracker-rbac
```

### 2. Configurar el Backend

```bash
# Entrar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales
# Necesitas: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DATABASE_URL

# Ejecutar migraciones de la base de datos
npx prisma migrate dev
npx prisma db seed  # (opcional) carga datos de prueba

# Iniciar el servidor backend (puerto 3000)
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 3. Configurar el Frontend

```bash
# En otra terminal, entrar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con la URL del backend:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Iniciar el servidor frontend (puerto 3001)
npm run dev
```

El frontend estará disponible en: `http://localhost:3001`

### 4. Acceder a la aplicación

1. Abre `http://localhost:3001` en tu navegador
2. Haz clic en "Continuar con GitHub"
3. Autoriza la aplicación
4. ¡Listo! Ya puedes usar Finance Tracker

> **Nota:** Todos los nuevos usuarios se registran automáticamente con rol **ADMIN** para facilitar las pruebas.

### 5. (Opcional) Ejecutar pruebas

```bash
# Backend
cd backend
npm test                 # Todas las pruebas
npm run test:watch      # Modo watch
npm run test:coverage   # Cobertura

# Frontend (si tienes pruebas)
cd frontend
npm test
```

---

## 📋 Descripción del Proyecto

Aplicación full-stack para gestión de finanzas personales con control de acceso basado en roles (RBAC). Desarrollada con Next.js, TypeScript, Tailwind CSS, Shadcn/ui, Prisma y Better Auth.

### Características Principales

#### 🔐 Autenticación
- Login con GitHub OAuth
- Sesiones persistentes con cookies
- Registro automático con rol ADMIN
- Cierre de sesión seguro

#### 👥 Roles y Permisos
- **ADMIN:** Acceso completo a movimientos, usuarios y reportes
- **USER:** Solo puede ver sus propios movimientos

#### 💰 Gestión de Movimientos
- CRUD completo de ingresos y egresos
- Búsqueda en tiempo real por concepto
- Filtros por tipo (Ingreso/Egreso) y rango de fechas
- Paginación
- Formato de moneda COP

#### 👤 Gestión de Usuarios (solo ADMIN)
- Lista de usuarios con filtros
- Edición de nombre, teléfono y rol
- Estadísticas por usuario (cantidad de movimientos)
- Eliminación de usuarios

#### 📊 Reportes (solo ADMIN)
- Gráficos de barras (ingresos/egresos por día)
- Gráfico de pastel (distribución)
- Saldo actual
- Filtros por fecha
- Descarga de reportes en CSV
- Top usuarios por movimientos

#### 🎨 UI/UX
- Modo oscuro/claro con toggle
- Diseño responsive
- Skeletons de carga
- Notificaciones toast
- Confirmaciones antes de acciones destructivas
- Componentes con Shadcn/ui

#### 🧪 Testing
- 25+ pruebas unitarias con Jest
- Tests de API endpoints
- Tests de validación y autorización RBAC

#### 📚 Documentación
- API documentada con Swagger/OpenAPI en `/api/docs`
- Endpoints con ejemplos y schemas definidos

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Uso |
|------------|-----|
| Next.js (Pages Router) | Framework API |
| TypeScript | Lenguaje |
| PostgreSQL | Base de datos |
| Prisma ORM | Modelado y consultas |
| Better Auth | Autenticación |
| Zod | Validación |
| Jest + Supertest | Testing |
| Swagger UI | Documentación API |

### Frontend
| Tecnología | Uso |
|------------|-----|
| Next.js (App Router) | Framework |
| TypeScript | Lenguaje |
| Tailwind CSS | Estilos |
| Shadcn/ui | Componentes |
| Recharts | Gráficos |
| React Hook Form | Formularios |
| Zod | Validación |
| date-fns | Manejo de fechas |
| Sonner | Notificaciones |
| Lucide React | Iconos |

---

## 📁 Estructura del Proyecto

```
finance-tracker-rbac/
├── backend/                    # API REST
│   ├── pages/api/              # Endpoints
│   │   ├── auth/               # Autenticación
│   │   ├── movements/          # CRUD movimientos
│   │   ├── users/              # CRUD usuarios
│   │   └── reports/            # Reportes y CSV
│   ├── prisma/                  # Modelos de BD
│   ├── src/lib/                  # Utilidades
│   └── __tests__/               # Pruebas unitarias
│
└── frontend/                   # UI
    ├── src/
    │   ├── app/                 # Páginas
    │   │   ├── (auth)/          # Login
    │   │   └── (dashboard)/      # Movements, Users, Reports
    │   ├── components/           # Componentes UI
    │   ├── contexts/             # Contextos (Auth)
    │   ├── hooks/                # Custom hooks
    │   └── lib/                  # Utilidades y API
    └── ...
```

---

## 🔧 Variables de Entorno

### Backend (`.env`)
```env
# GitHub OAuth
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret

# Better Auth
BETTER_AUTH_SECRET=tu_secret
BETTER_AUTH_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/finance_tracker"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📦 Despliegue en Vercel

### Backend
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Comando de build: `npm run build`
4. Directorio de salida: `backend`

### Frontend
1. Conectar repositorio a Vercel
2. Configurar `NEXT_PUBLIC_API_URL` con URL del backend desplegado
3. Comando de build: `npm run build`
4. Directorio de salida: `frontend`

---

## 📚 Documentación API

Una vez desplegado el backend, accede a:
```
https://tu-backend.vercel.app/api/docs
```

---

## 👨‍💻 Autor

**Andrés Felipe Tapias**  
- GitHub: [@LikeDRES](https://github.com/LikeDRES)

---
