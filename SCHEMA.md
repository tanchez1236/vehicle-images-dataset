# Dataset Schema

Este documento define la estructura oficial del catálogo y las reglas que deben seguir los datos para considerarse válidos.

---

# Archivo de Marca

Cada fabricante se almacena en:

```text
catalog/<marca>.json
```

Ejemplo:

```text
catalog/mitsubishi.json
```

---

# Estructura General

```json
{
  "make": "mitsubishi",
  "colors": {},
  "models": []
}
```

---

# make

Nombre del fabricante.

Ejemplo:

```json
{
  "make": "mitsubishi"
}
```

Reglas:

- Obligatorio
- Minúsculas recomendadas
- Debe coincidir con el nombre del archivo

---

# colors

Lista global de colores OEM utilizados por la marca.

Ejemplo:

```json
{
  "colors": {
    "X42": {
      "slug": "labrador-black-pearl",
      "name": "Labrador Black Pearl",
      "hex": "#0C0E10"
    }
  }
}
```

---

# Color

## code

Clave OEM.

Ejemplo:

```json
"X42"
```

Reglas:

- Obligatorio
- Único dentro de la marca

---

## slug

Identificador URL-friendly.

Ejemplo:

```json
"labrador-black-pearl"
```

Reglas:

- Minúsculas
- Guiones permitidos
- Sin espacios

---

## name

Nombre comercial OEM.

Ejemplo:

```json
"Labrador Black Pearl"
```

---

## hex

Valor hexadecimal aproximado para representación visual.

Ejemplo:

```json
"#0C0E10"
```

Reglas:

- Formato HEX RGB
- No representa fórmula real de pintura

---

# models

Lista de modelos de la marca.

Ejemplo:

```json
{
  "models": []
}
```

---

# Modelo

Ejemplo:

```json
{
  "name": "outlander",
  "generations": []
}
```

---

# generations

Lista de generaciones de un modelo.

Ejemplo:

```json
{
  "name": "gen3",
  "years": {},
  "colors": []
}
```

---

# name

Identificador de generación.

Ejemplo:

```json
"gen3"
```

Reglas:

- Obligatorio
- Único dentro del modelo

---

# years

Rango de producción aproximado.

Ejemplo:

```json
{
  "from": 2014,
  "to": 2021
}
```

Reglas:

- from <= to

---

# colors (dentro de una generación)

Ejemplo:

```json
{
  "code": "X42",
  "from": 2014,
  "to": 2020
}
```

Representa la disponibilidad de un color dentro de una generación específica.

---

# code

Código OEM.

Debe existir previamente en:

```json
colors
```

---

# from

Año inicial de disponibilidad.

Ejemplo:

```json
2014
```

---

# to

Año final de disponibilidad.

Ejemplo:

```json
2020
```

---

# index.json

Archivo generado automáticamente.

Ubicación:

```text
catalog/index.json
```

Ejemplo:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-26T00:00:00Z",
  "totalMakes": 1,
  "makes": [
    "mitsubishi"
  ]
}
```

---

# Estructura de Imágenes

Ruta oficial:

```text
images/
└── marca/
    └── modelo/
        └── generacion/
            └── Color OEM [CODIGO]/
                └── main.webp
```

Ejemplo:

```text
images/
└── mitsubishi/
    └── outlander/
        └── gen3/
            └── Labrador Black Pearl [X42]/
                └── main.webp
```

---

# Imagen Principal

Nombre obligatorio:

```text
main.webp
```

Formato obligatorio:

```text
WEBP
```

---

# Importación de Imágenes

Archivos de entrada:

```text
imports/images/<marca>/
```

Ejemplo:

```text
imports/images/mitsubishi/

outlander__gen3__x42.jpg

outlander__gen4__p62.png
```

Formato obligatorio:

```text
modelo__generacion__codigo.ext
```

Ejemplo:

```text
outlander__gen3__x42.jpg
```

---

# Validación

Se considera válido cuando:

- No existen generaciones vacías.
- No existen colores huérfanos.
- No existen colores sin definición.
- No existen carpetas faltantes.
- La estructura de carpetas coincide con el catálogo.

---

# Compatibilidad

Schema actual:

```text
v1
```

Representado en:

```json
{
  "schemaVersion": 1
}
```

Cambios incompatibles deberán incrementar la versión del schema.
