# Intel Image Pipeline

## Estructura
- workspace/inputs: imagenes originales
- workspace/outputs: resultados

## Cambiar color (OpenCV/HSV, CPU)
python color_mod.py --input workspace/inputs/foto.png --output workspace/outputs/foto_azul.png --from-color red --to-color blue

## Quitar fondo (rembg, CPU)
python -c "from rembg import remove; from PIL import Image; im=Image.open('workspace/inputs/foto.png'); remove(im).save('workspace/outputs/foto_nobg.png')"

## Servidor MCP local
python rembg_mcp_server.py

## Notas
- rembg usa onnxruntime en CPU por defecto.
- La primera ejecucion de rembg descarga el modelo u2net.
- El servidor MCP expone remove_background y change_image_color.
