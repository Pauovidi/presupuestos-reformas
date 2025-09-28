# Calculadora de Reformas — v12

**v12 = UI v5 restaurada + mejoras de v11**
- Campos completos (alicatados por aplicación/material/m², falso techo técnico, fontanería, electricidad).
- Referencia por ciudad con botón **Referencia** (o precio €/m² manual).
- Panel de parámetros editable con CRUD de ciudades y exportar/importar JSON.
- Exportación **PDF** (jsPDF + autotable) y **JSON**.
- Alias `@/*` habilitado con `jsconfig.json`.
- Rutas: `/` (Formulario), `/chat` (Chat asistido).

## Ejecutar
```bash
npm install
npm run dev
# http://localhost:3000 y /chat
```

## Desplegar en Vercel
- Importa el repo tal cual (Node 18/20).

## Estructura
```
pages/
  index.js
  chat.js
components/
  SidebarParams.jsx
  SummaryCard.jsx
lib/
  calculo.js
  pdf.js
styles/
  globals.css
jsconfig.json  # alias @/*
```
