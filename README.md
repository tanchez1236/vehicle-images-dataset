# Vehicle Images Dataset

Dataset público de imágenes de vehículos para [MotorSeguro](https://motorseguro.com).
Organizado por **marca → modelo → año** para consulta directa vía GitHub Raw.

## 📂 Estructura

```
images/
  {marca}/
    {modelo}/
      {año}/
        default.jpg     ← imagen principal (vista lateral)
        front.jpg       ← vista frontal (opcional)
        rear.jpg        ← vista trasera (opcional)
        interior.jpg    ← interior (opcional)
placeholders/
  default.jpg           ← imagen genérica cuando no hay foto del vehículo
```

### Reglas de nomenclatura

- Todas las carpetas en **minúsculas**
- Espacios reemplazados por guión `-`
- Sin tildes ni caracteres especiales
- Año como carpeta numérica de 4 dígitos

### Ejemplos

| Vehículo | Ruta |
|---|---|
| Toyota Yaris 2007 | `images/toyota/yaris/2007/default.jpg` |
| Honda Civic 2015 | `images/honda/civic/2015/default.jpg` |
| Mitsubishi Lancer Evolution 2005 | `images/mitsubishi/lancer-evolution/2005/default.jpg` |
| Volkswagen Golf GTI 2019 | `images/volkswagen/golf-gti/2019/default.jpg` |

## 🔗 URL de acceso (CDN GitHub Raw)

```
https://raw.githubusercontent.com/tanchez1236/vehicle-images-dataset/main/images/{marca}/{modelo}/{año}/default.jpg
```

Ejemplo:
```
https://raw.githubusercontent.com/tanchez1236/vehicle-images-dataset/main/images/toyota/yaris/2007/default.jpg
```

## 📋 Cómo agregar imágenes

1. Normaliza el nombre:
   - Minúsculas: `Toyota Yaris` → `toyota`
   - Espacios → guión: `Land Rover` → `land-rover`
   - Sin tildes: `Mitsubishi` → `mitsubishi`
2. Crea la carpeta en la ruta correcta
3. Nombra la imagen principal `default.jpg`
4. Tamaño recomendado: **800×450px** (16:9), JPG, max 150KB
5. Vista preferida: **lateral derecho** del vehículo

## 📊 Índice de vehículos disponibles

Ver [data.json](./data.json) para el catálogo completo de imágenes disponibles.

## ⚙️ Integración con MotorSeguro

La webapp consulta este repositorio automáticamente.
Ver función `getVehicleImageUrl()` en el código fuente.
