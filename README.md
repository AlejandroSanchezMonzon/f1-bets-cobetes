<img style="display: block; margin: auto; object-fit: cover; width: 50%;" src="https://github.com/user-attachments/assets/9e222c62-03ad-44b0-8ac0-a34f7d46340c" alt="Logo oficial de la aplicación web de F1 Bets Cobetes" />

# F1 Bets Cobetes

F1 Bets Cobetes es una aplicación web para gestionar apuestas lúdicas durante los fines de semana de Fórmula 1. Los usuarios pueden iniciar sesión, registrar predicciones de podio y seguir el ranking general de la comunidad en tiempo real.

## Tabla de contenidos
- [Descripción del proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Primeros pasos](#primeros-pasos)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Variables de entorno](#variables-de-entorno)
  - [Comandos disponibles](#comandos-disponibles)
- [Arquitectura rápida](#arquitectura-rápida)
- [Uso](#uso)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)
- [Contacto](#contacto)

## Descripción del proyecto
La plataforma combina páginas Astro con islas de React para ofrecer una experiencia ágil en escritorio y móvil. El backend expone rutas API serverless (Vercel) que consultan una base de datos LibSQL/Turso para almacenar pilotos, carreras, predicciones y resultados.

## Características
- **Autenticación con JWT**: Inicio de sesión por correo/contraseña y refresco de información de perfil.
- **Predicciones de carrera**: Formulario dinámico con validaciones y bloqueo 30 minutos antes de cada evento.
- **Panel administrativo**: Gestión de resultados y clasificación (qualy) con recálculo automático de puntos.
- **Ranking global**: Vista React con visualizaciones de puntos totales y últimos resultados.
- **Experiencia responsiva**: Estilos Tailwind 4 y tipografías personalizadas inspiradas en la F1.

## Tecnologías utilizadas
- [Astro 5](https://astro.build/) con salida `server` y adaptador para Vercel.
- [React 19](https://react.dev/) para componentes interactivos.
- [Tailwind CSS 4](https://tailwindcss.com/) + tokens definidos en `src/styles/global.css`.
- [LibSQL / Turso](https://turso.tech/) como base de datos relacional ligera.
- [JSON Web Tokens](https://jwt.io/) para autenticación y control de roles.

## Primeros pasos

### Requisitos
- Node.js 18 o superior.
- Gestor de paquetes compatible (`pnpm`, `npm` o `yarn`). El repositorio incluye `pnpm-lock.yaml`.

### Instalación
```bash
git clone https://github.com/AlejandroSanchezMonzon/f1-bets-cobetes.git
cd f1-bets-cobetes
pnpm install # o npm install / yarn install
```

### Variables de entorno
Crea un archivo `.env` en la raíz con las claves necesarias:

| Variable | Descripción |
| --- | --- |
| `JWT_SECRET` | Clave usada para firmar y verificar los tokens JWT. |
| `TURSO_DATABASE_URL` | URL de conexión a la instancia de LibSQL/Turso. |
| `TURSO_AUTH_TOKEN` | Token de autenticación para la base de datos. |

> ⚠️ **Nunca** publiques estas variables en el repositorio ni en commits.

### Comandos disponibles
| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo en `http://localhost:4321`. |
| `pnpm build` | Genera la versión lista para producción. |
| `pnpm preview` | Sirve la build generada para verificación local. |
| `pnpm astro ...` | Acceso directo a la CLI de Astro. |

## Arquitectura rápida
- Frontend híbrido: Astro para estructura y React (islas `client:load`) para vistas como ranking, countdown o historial de apuestas.
- API interna en `src/pages/api/**`, con helpers reutilizables en `@/utils` y acceso a base de datos vía `@/lib/turso`.
- Modelo de datos documentado en [`db/schema.sql`](db/schema.sql) y ampliado en los archivos de la carpeta [`context`](context/).
- Eliminación lógica (`deleted_at`) en todas las tablas para preservar historiales.

## Uso
La versión en vivo está disponible en [f1-bets-cobetes.vercel.app](https://f1-bets-cobetes.vercel.app). Inicia sesión con tus credenciales para:
- Registrar predicciones antes de cada carrera.
- Revisar el ranking general y los resultados publicados.
- (Solo administradores) Actualizar resultados oficiales, datos de qualy y recalcular puntuaciones.

## Contribuciones
¡Las contribuciones son bienvenidas! Sigue estos pasos:
1. Haz un fork del repositorio y crea una rama descriptiva:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
2. Implementa tus cambios, respeta las convenciones documentadas en [`context/RULES.md`](context/RULES.md).
3. Ejecuta los comandos de verificación que correspondan y actualiza la documentación si aplica.
4. Realiza commit y push de la rama:
   ```bash
   git commit -m "feat: agrega nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request describiendo el problema resuelto, pruebas realizadas y capturas relevantes.

## Licencia
Este proyecto se distribuye bajo la licencia [MIT](LICENSE).

## Contacto
- **Alejandro Sánchez Monzón** · [GitHub](https://github.com/AlejandroSanchezMonzon)

---

© 2025 F1 Bets Cobetes
