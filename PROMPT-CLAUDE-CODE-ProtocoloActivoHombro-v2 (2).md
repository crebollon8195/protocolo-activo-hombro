# PROMPT MAESTRO — Claude Code
# Protocolo Activo de Hombro – Recovery Tracker MVP v2
# Dr. Carlos Rebollón | drcarlosrebollon.com

---

## OBJETIVO

Construir el MVP de una plataforma clínica digital de seguimiento de recuperación de hombro llamada:
**"Protocolo Activo de Hombro – Recovery Tracker"**

Deploy target: Vercel
Stack: Next.js 14 App Router + Tailwind CSS + shadcn/ui
Idiomas: Bilingüe — Español (default) / English (toggle)
Datos: Mock data realista (sin backend real aún)

---

## IDENTIDAD VISUAL

- Logo: Dr. Carlos Rebollón (usar placeholder con texto hasta que se provea el archivo)

### Paleta de colores exacta (extraída de drcarlosrebollon.com):
```
--color-primary:       #0170B9   /* Azul médico principal — botones, links, CTAs */
--color-accent:        #5072AC   /* Azul medio — hover states, badges */
--color-dark:          #314C8B   /* Azul marino — títulos H1, H2 */
--color-light-blue:    #8ECAEE   /* Azul claro — highlights, iconos */
--color-bg-subtle:     #EBEEF3   /* Gris azulado — fondos de cards, secciones alternas */
--color-bg-white:      #FFFFFF   /* Fondo principal */
--color-text-primary:  #3A3A3A   /* Texto principal */
--color-text-secondary:#808285   /* Texto secundario, subtítulos */
--color-selection:     #4E85C5   /* Color de selección de texto */
```

### Tipografía exacta (extraída de drcarlosrebollon.com):
```
--font-primary:   "Montserrat", Sans-serif   /* Títulos, botones, navegación — weight 600 */
--font-secondary: "Roboto Slab", Serif        /* Subtítulos, citas — weight 400 */
--font-body:      "Montserrat", Sans-serif    /* Cuerpo de texto — weight 400, 14-15px */
```

### Estilo general:
- Premium medical SaaS — consistente con drcarlosrebollon.com
- Minimalista, sombras suaves (`0px 0px 4px 0 #00000057`)
- Bordes redondeados
- Mobile-first, completamente responsive

---

## LO QUE NO DEBES IMPLEMENTAR AHORA

- Stripe real
- Supabase real
- Autenticación real con backend
- Envío real de emails o WhatsApp
- Módulos de relojes / básculas inteligentes

Prepara la arquitectura modular para conectarlos después.

---

## ARQUITECTURA MODULAR

Estructura de carpetas lista para escalar:

```
/app
  /landing
  /auth (login, register, forgot-password)
  /dashboard (paciente)
  /tracking (registro diario)
  /analytics (progreso)
  /report (informe final)
  /profile
  /admin
    /dashboard
    /patients
    /alerts
    /patient/[id]
/components
  /ui (shadcn)
  /charts
  /cards
  /forms
  /layout
/lib
  /mock-data
  /utils
  /constants
  /types
/messages
  /es.json   ← todos los textos en español
  /en.json   ← todos los textos en inglés
/modules (carpeta vacía preparada para módulos futuros)
  /whatsapp
  /ai-analysis
  /wearables
  /telemedicine
  /knee-program
  /hip-program
  /memberships
```

---

## MODELOS DE BASE DE DATOS (Supabase-ready)

```typescript
// profiles
id, full_name, email, role ('patient' | 'admin'), access_active, created_at

// patient_profiles
id, user_id, age, affected_shoulder ('left'|'right'|'both'),
initial_diagnosis, initial_pain_score, main_goal,
surgery_history (boolean), trauma_history (boolean)

// daily_logs
id, user_id, date, week_number, pain_score (0-10),
exercises_completed (boolean), mobility_status ('better'|'same'|'worse'),
night_pain (boolean), sleep_quality ('good'|'regular'|'bad'),
main_limitation (text), comments (text)

// weekly_progress
id, user_id, week_number, adherence_percentage,
average_pain, recovery_score

// final_reports
id, user_id, report_status, pain_reduction_percentage,
recommendation ('good'|'partial'|'poor'), generated_at
```

---

## LÓGICA DE NEGOCIO

### Recovery Score
Combina:
- Adherencia (% días con ejercicios completados)
- Consistencia (días sin saltar)
- Mejora del dolor (dolor inicial vs actual)
- Evolución de movilidad

Resultados:
- BUENO: reducción dolor >50% + adherencia >70%
- PARCIAL: reducción dolor 20–50%
- POBRE: reducción dolor <20%

### Lógica de Alertas (Admin)
- Sin registro por 3+ días → alerta inactividad
- Dolor persistente >7 → alerta dolor
- Adherencia <50% → alerta adherencia
- Programa incompleto al llegar semana 6 → alerta

---

## PÁGINAS A CONSTRUIR

---

### 1. LANDING PAGE

Hero:
- Título: "Mide tu progreso durante tu recuperación de hombro"
- Subtítulo: "Un sistema clínico digital de seguimiento para registrar dolor, movilidad, adherencia y evolución durante 6 semanas."
- CTA: "Iniciar seguimiento"

Secciones:
- Beneficios (6 cards con iconos)
- Cómo funciona (4 pasos numerados)
- Features de tracking (5 items)
- FAQ (5 preguntas frecuentes de pacientes)
- Disclaimer médico
- Footer con logo Dr. Carlos Rebollón + drcarlosrebollon.com

---

### 2. AUTENTICACIÓN

Páginas:
- /auth/login — Email + Password + placeholder Google login
- /auth/register — Email + Password + nombre
- /auth/forgot-password — Email recovery

UI: Elegante, médico, card centrada, logo arriba

---

### 3. DASHBOARD DEL PACIENTE

Header:
- "Bienvenido, [Nombre]"
- Semana actual: "Semana 2 de 6"
- Barra de progreso visual con 6 hitos

KPI Cards (5):
- Dolor hoy
- Adherencia %
- Días completados
- Racha actual
- Progreso semanal

Botón principal:
- "Registrar progreso de hoy" (si no ha registrado hoy)
- "Ya registraste hoy ✓" (si ya registró)

Gráficas:
- Evolución del dolor (línea)
- Evolución de adherencia (barras)
- Consistencia semanal

Card de estado dinámico según Recovery Score:
- Verde: "Vas progresando adecuadamente"
- Amarillo: "Tu dolor se mantiene elevado esta semana"
- Naranja: "Tu adherencia ha disminuido"
- Rojo: "Necesitas retomar el programa"

Calendario semanal visual:
- Días completados ✓ en verde
- Días pendientes en gris
- Hoy destacado

Notificaciones in-app (campana):
- Recordatorio de registro diario
- Resumen semanal disponible
- Informe final listo

---

### 4. FORMULARIO DE REGISTRO DIARIO

Campos:

1. Nivel de dolor (slider 0-10 con escala visual de colores):
   - 0-2: Verde — Sin dolor / Mínimo
   - 3-5: Amarillo — Dolor moderado
   - 6-8: Naranja — Dolor intenso
   - 9-10: Rojo — Dolor severo

2. ¿Completaste los ejercicios hoy? (Sí / No)

3. Movilidad hoy vs ayer (Mejor / Igual / Peor)

4. ¿Tuviste dolor nocturno? (Sí / No)

5. Calidad del sueño (Buena / Regular / Mala)

6. Principal limitación hoy (input de texto)

7. Comentarios adicionales (textarea)

Botón: "Guardar progreso"
Mensaje de éxito: "Registro guardado correctamente ✓"

---

### 5. ANALYTICS DE PROGRESO

Secciones:

- Tendencia del dolor (gráfica de línea)
- Tendencia de adherencia (gráfica de barras)
- Evolución de movilidad (cards semanales)
- Timeline de recuperación semana a semana

Estadísticas:
- Días completados de 42
- Reducción promedio del dolor
- Porcentaje de adherencia
- Racha actual
- Mejor semana
- Semana más difícil

Recovery Score visual con gauge/medidor

---

### 6. INFORME FINAL DE RECUPERACIÓN

Generado al completar semana 6.

Contenido del informe:
- Nombre del paciente
- Fecha inicio y fin del programa
- Dolor inicial vs final
- % reducción del dolor
- % adherencia
- Días completados
- Evolución de movilidad
- Evolución de dolor nocturno
- Recovery Score final
- Interpretación clínica
- Recomendación según resultado

Resultados posibles:
A. BUEN PROGRESO — continuar fortalecimiento
B. PROGRESO PARCIAL — continuar + evaluación médica
C. PROGRESO LIMITADO — evaluación presencial urgente

Diseño:
- Premium, imprimible
- Logo Dr. Carlos Rebollón
- QR code → drcarlosrebollon.com
- Placeholder de firma
- Fecha y ID de paciente
- Botón: "Descargar informe PDF"

---

### 7. PERFIL DEL PACIENTE

Campos editables:
- Nombre completo
- Email
- Edad
- Hombro afectado (Izquierdo / Derecho / Ambos)
- Diagnóstico inicial
- Dolor inicial (0-10)
- Objetivo principal
- Historial de cirugías (Sí/No)
- Historial de trauma (Sí/No)

---

### 8. ADMIN — DASHBOARD MAESTRO

Métricas top (6 cards):
- Total pacientes activos
- Pacientes con dolor elevado (>7)
- Pacientes con baja adherencia (<50%)
- Pacientes completando programa
- Actividad semanal
- Recovery Score promedio

Sección de alertas:
- Paciente inactivo 3+ días
- Dolor persistente >7
- Adherencia baja
- Programa incompleto

Tabla de pacientes:
Columnas: Nombre | Semana actual | Dolor promedio | Adherencia % | Recovery Score | Estado | Último registro

Estados:
- 🟢 Excelente
- 🔵 Estable
- 🟡 Alerta
- 🔴 Requiere seguimiento

Acciones por paciente:
- Ver progreso
- Enviar mensaje (placeholder)
- Ver informe final
- Ver registros diarios

---

### 9. ADMIN — DETALLE DE PACIENTE

- Gráfica completa de dolor
- Gráfica de adherencia
- Registros diarios (tabla)
- Resúmenes semanales
- Timeline de recuperación
- Preview del informe final

---

## MOCK DATA REALISTA

Crear al menos 5 pacientes de ejemplo:

1. María González — Semana 4, buena adherencia, dolor bajando
2. Roberto Martínez — Semana 2, dolor elevado, alerta activa
3. Ana Rodríguez — Semana 6, completando programa, excelente
4. Carlos Pérez — Semana 3, baja adherencia, inactivo 4 días
5. Lucía Herrera — Semana 1, recién iniciando

---

## REQUISITOS TÉCNICOS

- Next.js 14 App Router
- Tailwind CSS
- shadcn/ui components
- Recharts para todas las gráficas
- TypeScript
- Estructura modular y escalable
- Comentarios en código indicando dónde conectar Supabase
- Comentarios indicando dónde conectar módulos futuros
- Deploy-ready para Vercel (vercel.json si necesario)

### INTERNACIONALIZACIÓN (i18n)
- Librería: next-intl
- Idiomas: Español (es) | English (en)
- Default: Español
- Toggle de idioma visible en header y en landing page
- Todos los textos en archivos de traducción separados:
  - /messages/es.json
  - /messages/en.json
- El cambio de idioma NO recarga la página
- Traducir: landing, dashboard, formularios, analytics, informe final, admin, notificaciones
- El informe PDF final se genera en el idioma activo del paciente

---

## ONBOARDING DEL PACIENTE (flujo post-registro)

3 pasos obligatorios antes de acceder al dashboard:

Paso 1: Completar perfil médico
Paso 2: Seleccionar fecha de inicio del programa
Paso 3: Tutorial rápido de cómo usar el tracker (3 slides)

---

## IMPORTANTE

- Plataforma bilingüe: Español (default) / English (toggle en header)
- UI premium tipo Apple/health-tech
- Mobile-first
- Arquitectura lista para agregar módulos futuros:
  - WhatsApp automation
  - IA para análisis de recuperación
  - Relojes y básculas inteligentes (Apple Watch, Withings, Garmin)
  - Telemedicina
  - Programas de rodilla, cadera, columna
  - Membresías
  - Ecosistema EXAMEDICA
