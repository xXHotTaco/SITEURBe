# SITEURBe API

Backend en JavaScript para registrar reportes de recepcion/mantenimiento de unidades usando Cloudflare Workers, Hono y D1.

De momento no usa R2 ni subida de evidencia. Todo lo que guarda vive en D1.

## Que incluye

- API REST con Hono.
- Persistencia en Cloudflare D1.
- Generacion de folio en backend.
- Validacion de campos minimos.
- Calculo de prioridad automatica.
- Calculo de area sugerida.

## Preparar Cloudflare

Instala dependencias y autentica Wrangler:

```bash
npm install
npx wrangler login
```

Crea la base D1:

```bash
npx wrangler d1 create siteurbe-db
```

Cloudflare te va a regresar algo como:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "siteurbe-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

Copia ese `database_id` en `wrangler.jsonc`, reemplazando `REEMPLAZA_CON_TU_DATABASE_ID`.

## Migraciones

Local:

```bash
npm run db:migrate:local
```

Produccion:

```bash
npm run db:migrate:remote
```

## Desarrollo

```bash
npm run dev
```

Wrangler levanta la API localmente, normalmente en `http://localhost:8787`.

## Deploy

```bash
npm run deploy
```

## Endpoints

```txt
GET    /health
GET    /api/reports
GET    /api/reports/:folio
POST   /api/reports
PUT    /api/reports/:folio
PATCH  /api/reports/:folio/status
```

`POST /api/reports` genera el `folio`; el frontend ya no necesita crearlo.

Ejemplo minimo:

```json
{
  "fecha": "2026-06-17",
  "hora": "10:30",
  "linea": "Linea 1",
  "patio": "Patio Norte",
  "unidad": "Unidad 24",
  "noEconomico": "ECO-024",
  "operador": "Juan Perez",
  "expediente": "EXP-100",
  "responsableUnidad": "Jefe de patio",
  "responsableRecibe": "Recepcion taller",
  "fallas": ["Frenos"],
  "otroDanio": "",
  "temperaturaMotor": "Normal",
  "prioridadManual": "Auto"
}
```

## Integracion frontend

- `getSavedReports()` -> `GET /api/reports`
- `saveReports()` -> `POST /api/reports` o `PUT /api/reports/:folio`
- `handleSave()` -> manda el objeto del formulario al API
- `handleLoad(folio)` -> `GET /api/reports/:folio`

