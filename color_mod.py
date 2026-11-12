import argparse
import colorsys
import os
import cv2
import numpy as np

NAMED = {"red": 0, "orange": 20, "yellow": 30, "green": 60, "cyan": 90, "blue": 120, "purple": 150, "magenta": 170}

def parse_color(value):
    value = value.strip().lower()
    if value.startswith("#"):
        h = value.lstrip("#")
        if len(h) != 6:
            raise ValueError("hex color must be #RRGGBB")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        hh, ss, vv = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
        return int(hh * 179), int(ss * 255), int(vv * 255)
    if value not in NAMED:
        raise ValueError("unknown color: " + value)
    return NAMED[value], 255, 255

def source_ranges(value):
    value = value.strip().lower()
    if value.startswith("#"):
        h, s, v = parse_color(value)
        return [(max(0, h - 8), min(179, h + 8))]
    if value not in NAMED:
        raise ValueError("unknown color: " + value)
    h = NAMED[value]
    if value == "red":
        return [(0, 10), (170, 179)]
    return [(max(0, h - 10), min(179, h + 10))]

def change_color(input_path, output_path, from_color, to_color):
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(input_path)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    alpha = None
    if img.shape[2] == 4:
        alpha = img[:, :, 3].copy()
        bgr = img[:, :, :3]
    else:
        bgr = img
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
    for lo, hi in source_ranges(from_color):
        mask = cv2.bitwise_or(mask, cv2.inRange(hsv, np.array([lo, 40, 30]), np.array([hi, 255, 255])))
    target_h, target_s, target_v = parse_color(to_color)
    hsv[mask > 0, 0] = target_h
    hsv[mask > 0, 1] = np.maximum(hsv[mask > 0, 1], target_s)
    hsv[mask > 0, 2] = np.maximum(hsv[mask > 0, 2], target_v)
    result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    if alpha is not None:
        result = np.dstack([result, alpha])
    cv2.imwrite(output_path, result)
    return int(np.count_nonzero(mask))

def main():
    p = argparse.ArgumentParser(description="Cambia un color por otro en una imagen usando OpenCV/HSV")
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--from-color", required=True)
    p.add_argument("--to-color", required=True)
    a = p.parse_args()
    n = change_color(a.input, a.output, a.from_color, a.to_color)
    print("pixeles modificados:", n)

if __name__ == "__main__":
    main()
