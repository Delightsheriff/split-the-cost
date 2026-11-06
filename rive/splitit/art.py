"""Draws the splash and app icons: the owed Moodling from generate.py's geometry.
Run: python3 art.py"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 1024
SS = 4  # supersampling for smooth edges
INK = (14, 14, 16, 255)
GREEN = (19, 236, 91, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)
NIGHT = (11, 11, 13, 255)  # the app's dark background

ASSETS = Path(__file__).resolve().parents[2] / "assets"


def moodling(draw, width, body=GREEN, face=INK):
    """The owed Moodling, `width` pixels across, centred on the canvas."""
    unit = width * SS / 200  # the scene draws the body 200 units wide

    def px(x, y):
        return (SIZE * SS / 2 + x * unit, SIZE * SS / 2 + y * unit)

    def quad(p0, q, p1, n=48):
        return [
            px((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * q[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * q[1] + t * t * p1[1])
            for t in (i / n for i in range(n + 1))
        ]

    def round_line(points, w):
        # Stamping discs along a dense curve gives a smooth round-capped stroke;
        # PIL's wide polylines come out scalloped.
        r = w * unit / 2
        for x, y in points:
            draw.ellipse((x - r, y - r, x + r, y + r), fill=face)

    # Body: radius ripples 8 times, as in generate.py's LOOK["owed"].
    lobes, depth = 8, 0.1
    r0 = 100 / (1 + depth)
    outline = [px(r0 * (1 + depth * math.cos(lobes * t)) * math.cos(t), r0 * (1 + depth * math.cos(lobes * t)) * math.sin(t))
               for t in (i / 720 * 2 * math.pi for i in range(720))]
    draw.polygon(outline, fill=body)

    # Happy eyes are closed arcs; the grin is a filled curve.
    for cx in (-28, 28):
        round_line(quad((cx - 14, -15), (cx, -37), (cx + 14, -15), 400), 8)
    draw.polygon(quad((-28, 6), (0, 42), (28, 6)), fill=face)


def save(name, width, background=CLEAR, body=GREEN, face=INK, mode="RGBA"):
    img = Image.new("RGBA", (SIZE * SS, SIZE * SS), background)
    moodling(ImageDraw.Draw(img), width, body, face)
    out = ASSETS / name
    img.resize((SIZE, SIZE), Image.LANCZOS).convert(mode).save(out)
    print("wrote", out)


save("splash.png", SIZE)
# iOS masks the corners itself and wants no alpha on the main icon.
save("icon.png", 700, background=NIGHT, mode="RGB")
# Dark and tinted icons sit on a system backdrop, so they keep a clear background.
save("icon-dark.png", 700)
save("icon-tinted.png", 700, body=WHITE, face=CLEAR)
# Android crops adaptive icons to the middle two thirds.
save("adaptive-icon.png", 560)
save("adaptive-icon-mono.png", 560, body=WHITE, face=CLEAR)
