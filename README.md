# Vehicle Images Dataset

Dataset abierto de imágenes de vehículos organizado por:

**Marca → Modelo → Generación → Color OEM → Imagen**

El proyecto incluye:

- Catálogo OEM de colores automotrices
- Códigos originales de pintura
- Valores HEX de referencia visual
- Disponibilidad por años
- Organización por generación
- Herramientas de importación
- Herramientas de validación
- Dataset de imágenes optimizado para aplicaciones automotrices

---

# Estado del Proyecto

## Dataset

- ✅ Catálogo OEM por marca
- ✅ Organización por generación
- ✅ Colores OEM normalizados
- ✅ Importación incremental
- ✅ Validación automática
- ✅ Gestión automática de carpetas

## Imágenes

- 🚧 En construcción

La cobertura actual puede verificarse mediante:

```bash
node tools/validate-dataset.js
```

---

# Objetivo

Crear un dataset abierto y estructurado que permita:

- Mostrar imágenes correctas según modelo y generación.
- Seleccionar colores OEM reales.
- Asociar vehículos con su apariencia correcta.
- Integrarse con CRMs automotrices.
- Integrarse con DMS.
- Integrarse con talleres mecánicos.
- Integrarse con catálogos de repuestos.
- Integrarse con aplicaciones móviles y sitios web.

---

# Estructura del Repositorio

```text
catalog/
images/
imports/
tools/

README.md
SCHEMA.md
```

## catalog

Contiene toda la información estructurada.

```text
catalog/

index.json
mitsubishi.json
toyota.json
honda.json
```

## images

Contiene las imágenes finales.

```text
images/

mitsubishi/
└── outlander/
    └── gen3/
        └── Labrador Black Pearl [X42]/
            └── main.webp
```

## imports

Contiene archivos temporales para importar.

```text
imports/

mitsubishi.txt

images/
├── mitsubishi/
├── imported/
└── failed/
```

## tools

Herramientas oficiales del proyecto.

```text
tools/

reset-dataset.js
import-brand.js
import-images.js
validate-dataset.js
```

---

# Estructura del Catálogo

Ejemplo simplificado:

```json
{
  "make": "mitsubishi",

  "colors": {
    "X42": {
      "slug": "labrador-black-pearl",
      "name": "Labrador Black Pearl",
      "hex": "#0C0E10"
    }
  },

  "models": [
    {
      "name": "outlander",

      "generations": [
        {
          "name": "gen3",

          "years": {
            "from": 2014,
            "to": 2021
          },

          "colors": [
            {
              "code": "X42",
              "from": 2014,
              "to": 2020
            }
          ]
        }
      ]
    }
  ]
}
```

---

# Importación de Marcas

Los archivos TXT deben colocarse en:

```text
imports/
```

Ejemplo:

```text
imports/

mitsubishi.txt
toyota.txt
honda.txt
```

Formato:

```text
MAKE|mitsubishi

MODEL|outlander

GENERATION|gen3|2014|2021

COLOR|labrador-black-pearl|Labrador Black Pearl|X42|#0C0E10|2014|2020
COLOR|quartz-brown-metallic|Quartz Brown Metallic|C06|#5C4A3A|2016|2021
```

Ejecutar:

```bash
node tools/import-brand.js
```

La herramienta detectará automáticamente los TXT disponibles.

---

# Importación de Imágenes

Las imágenes se colocan en:

```text
imports/images/
```

Organizadas por marca:

```text
imports/images/

mitsubishi/
├── outlander__gen3__x42.jpg
├── outlander__gen3__c06.jpg
└── outlander__gen4__p62.png
```

Formato obligatorio:

```text
modelo__generacion__codigo.ext
```

Ejemplos válidos:

```text
outlander__gen3__x42.jpg

galant__gen8__x13.png

l200__gen6__u28.webp
```

Ejemplos inválidos:

```text
x42.jpg

mitsubishi_x42.jpg

outlander-x42.jpg
```

---

# Procesar Imágenes

Ejecutar:

```bash
node tools/import-images.js
```

El sistema automáticamente:

- Detecta las marcas disponibles
- Busca el catálogo correspondiente
- Valida modelo, generación y color
- Convierte a WebP
- Renombra como main.webp
- Mueve archivos procesados a imported
- Mueve errores a failed

---

# Formato Oficial de Imágenes

## Formato

```text
WEBP
```

## Nombre

```text
main.webp
```

## Ruta

```text
marca/
modelo/
generacion/
color/
main.webp
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

# Validación

Ejecutar:

```bash
node tools/validate-dataset.js
```

Ejemplo:

```text
Marcas: 1

Modelos: 19

Generaciones: 34

Referencias color: 484

Carpetas OEM: 484

main.webp: 52

Cobertura imágenes:
10.74%
```

---

# Cobertura de Imágenes

La cobertura se calcula mediante:

```text
(imágenes main.webp existentes)

dividido entre

(colores OEM referenciados)
```

Ejemplo:

```text
484 colores OEM

52 imágenes

Cobertura:
10.74%
```

---

# Flujo Recomendado

## 1. Importar catálogo

```bash
node tools/import-brand.js
```

## 2. Validar catálogo

```bash
node tools/validate-dataset.js
```

## 3. Agregar imágenes

```text
imports/images/mitsubishi/
```

## 4. Importar imágenes

```bash
node tools/import-images.js
```

## 5. Validar nuevamente

```bash
node tools/validate-dataset.js
```

---

# Roadmap

- [x] Catálogo OEM por generación
- [x] Colores OEM
- [x] Importador incremental
- [x] Validación automática
- [x] index.json global
- [x] Gestión automática de carpetas
- [ ] Cobertura por marca
- [ ] Variantes y trims
- [ ] Múltiples imágenes por color
- [ ] API pública
- [ ] Estadísticas automáticas
- [ ] Dataset público completo

---

# Contribuir

1. Crear o actualizar un archivo TXT.
2. Ejecutar import-brand.js.
3. Agregar imágenes en imports/images/<marca>.
4. Ejecutar import-images.js.
5. Ejecutar validate-dataset.js.
6. Crear Pull Request.

---

# Aviso

Los nombres de colores, códigos OEM y valores HEX tienen fines informativos y de identificación visual.

Los valores HEX son aproximaciones para representación gráfica y **no deben utilizarse para mezcla, formulación o fabricación de pintura automotriz**.

---

# Licencia

Pendiente de definir.

---

# Contribuir

1. Crear o actualizar un archivo TXT.
2. Ejecutar:

```bash
node tools/import-brand.js
```

3. Colocar imágenes en:

```text
imports/images/<marca>/
```

4. Ejecutar:

```bash
node tools/import-images.js
```

5. Validar:

```bash
node tools/validate-dataset.js
```

6. Crear Pull Request.

---

# Aviso Sobre Imágenes

Las imágenes incluidas en este dataset tienen fines exclusivamente ilustrativos y de referencia visual.

Las imágenes pueden haber sido:

- Redimensionadas
- Recortadas
- Optimizadas
- Procesadas digitalmente
- Editadas
- Coloreadas mediante herramientas de inteligencia artificial

Las representaciones visuales no deben considerarse una referencia exacta del acabado o color real de fábrica.

---

# Aviso Sobre Colores OEM

Los códigos OEM, nombres comerciales y valores HEX tienen fines informativos y de identificación visual.

Los valores HEX son aproximaciones gráficas y no deben utilizarse para:

- Mezcla de pintura
- Formulación de pintura
- Fabricación de pintura
- Igualación profesional de color

---

# Copyright y Derechos de Terceros

Este proyecto busca utilizar exclusivamente imágenes:

- Generadas por inteligencia artificial
- Producidas por los colaboradores del proyecto
- Provenientes de fuentes que permitan reutilización

Si considera que algún contenido infringe derechos de autor, puede abrir un Issue o solicitar su revisión mediante un Pull Request.

---

# Licencia

Este proyecto se distribuye bajo:

Creative Commons Attribution 4.0 International (CC BY 4.0)

https://creativecommons.org/licenses/by/4.0/