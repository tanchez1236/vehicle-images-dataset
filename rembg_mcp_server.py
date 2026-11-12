import os
from mcp.server.fastmcp import FastMCP
from rembg import remove, new_session
from color_mod import change_color

mcp = FastMCP("intel-image-modifier")
_session = None

def get_session():
    global _session
    if _session is None:
        _session = new_session("u2net")
    return _session

@mcp.tool()
def remove_background(input_path: str, output_path: str) -> str:
    """Quita el fondo de una imagen y guarda PNG con transparencia."""
    if not os.path.isfile(input_path):
        raise FileNotFoundError(input_path)
    with open(input_path, "rb") as f:
        data = f.read()
    out = remove(data, session=get_session())
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(out)
    return output_path

@mcp.tool()
def change_image_color(input_path: str, output_path: str, from_color: str, to_color: str) -> str:
    """Cambia un color por otro usando segmentacion HSV en CPU."""
    n = change_color(input_path, output_path, from_color, to_color)
    return output_path + " (" + str(n) + " pixeles)"

if __name__ == "__main__":
    mcp.run(transport="stdio")
