import cv2
import numpy as np
from PIL import Image

src = "workspace/outputs/chevrolet_nobg.png"
dst = "workspace/outputs/chevrolet_galaxy_white.png"
img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
bgr = img[:, :, :3]
alpha = img[:, :, 3]
h, w = alpha.shape
car = (alpha > 10).astype(np.uint8) * 255
exclude = np.zeros((h, w), np.uint8)
polys = [
    [(140,190),(180,140),(230,105),(300,90),(360,95),(390,120),(360,190),(250,205)],
    [(365,100),(430,105),(450,115),(455,168),(372,182)],
    [(470,112),(535,118),(555,128),(560,172),(485,184)],
    [(565,128),(592,138),(600,172),(565,176)],
    [(160,205),(258,214),(266,258),(180,266)],
    [(52,213),(125,220),(122,252),(55,250)],
    [(72,210),(180,214),(182,252),(78,250)],
    [(42,285),(245,290),(240,325),(55,325)],
    [(585,212),(632,218),(632,262),(588,266)],
]
for p in polys:
    cv2.fillPoly(exclude, [np.array(p, np.int32)], 255)
cv2.fillPoly(exclude, [np.array([(265,340),(270,300),(285,275),(305,262),(330,258),(355,262),(375,275),(388,300),(392,335),(388,365),(375,390),(350,402),(320,402),(295,390),(278,370)], np.int32)], 255)
cv2.fillPoly(exclude, [np.array([(500,320),(505,285),(518,265),(540,255),(562,258),(580,272),(592,295),(596,325),(592,350),(580,370),(560,382),(538,380),(518,365),(505,345)], np.int32)], 255)
body = cv2.bitwise_and(car, cv2.bitwise_not(exclude))
body = cv2.erode(body, np.ones((3,3), np.uint8), iterations=1)
body = cv2.GaussianBlur(body, (5,5), 0)
ov = bgr.copy()
ov[body > 128] = (0, 0, 255)
cv2.imwrite("workspace/outputs/mask_overlay2.png", ov)
b, g, r = cv2.split(bgr)
L = (0.0722*b + 0.7152*g + 0.2126*r).astype(np.float32)
norm = np.clip(L / 110.0, 0, 1)
Y = 0.82 + 0.18 * np.power(norm, 0.45)
target = np.array([240, 244, 244], np.float32)  # BGR de #F4F4F0
out = bgr.astype(np.float32).copy()
m = (body.astype(np.float32) / 255.0)[..., None]
colored = target[None, None, :] * Y[..., None]
out = out * (1 - m) + colored * m
out = np.clip(out, 0, 255).astype(np.uint8)
res = np.dstack([out, alpha])
cv2.imwrite(dst, res)
print("guardado", dst)
