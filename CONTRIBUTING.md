# Cómo contribuir imágenes

## Requisitos para las imágenes

- **Formato**: JPG (preferido) o PNG
- **Dimensiones**: 800×450px mínimo (ratio 16:9)
- **Peso**: Máximo 200KB por imagen
- **Calidad**: Imagen clara, buena iluminación, fondo neutro o exterior
- **Vista principal**: Lateral derecho del vehículo

## Vistas opcionales

| Archivo | Descripción |
|---|---|
| `default.jpg` | Vista lateral (OBLIGATORIA) |
| `front.jpg` | Vista frontal |
| `rear.jpg` | Vista trasera |
| `interior.jpg` | Interior / tablero |

## Pasos para agregar un vehículo

1. Identifica la ruta correcta:
   ```
   images/{marca-slug}/{modelo-slug}/{año}/
   ```

2. Reglas de slug:
   - Todo en minúsculas
   - Espacios → `-`
   - Caracteres especiales → omitir
   - Tildes → quitar (`á` → `a`)

3. Sube la imagen como `default.jpg`

4. Actualiza `data.json` en la raíz:
   ```json
   {
     "make": "toyota",
     "model": "yaris",
     "year": 2007,
     "views": ["default"],
     "display": "Toyota Yaris 2007"
   }
   ```

## Fuentes recomendadas de imágenes libres

- [Wikimedia Commons](https://commons.wikimedia.org) — imágenes de dominio público
- [Unsplash](https://unsplash.com) — licencia libre
- Fotos propias tomadas en el taller
