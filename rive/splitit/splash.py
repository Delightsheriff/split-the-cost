"""Draws the splash image: the owed Moodling from generate.py's geometry, on a
transparent square. Run: python3 splash.py"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 1024
SS = 4  # supersampling for smooth edges
UNIT = SIZE * SS / 200  # the scene draws the body 200 units wide
INK = (14, 14, 16, 255)
GREEN = (19, 236, 91, 255)


def px(x, y):
    return (SIZE * SS / 2 + x * UNIT, SIZE * SS / 2 + y * UNIT)


def quad(p0, q, p1, n=48):
    return [
        px((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * q[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * q[1] + t * t * p1[1])
        for t in (i / n for i in range(n + 1))
    ]


def round_line(draw, points, width):
    # Stamping discs along a dense curve gives a smooth round-capped stroke;
    # PIL's wide polylines come out scalloped.
    r = width * UNIT / 2
    for x, y in points:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=INK)


img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Body: radius ripples 8 times, as in generate.py's LOOK["owed"].
lobes, depth = 8, 0.1
r0 = 100 / (1 + depth)
body = [px(r0 * (1 + depth * math.cos(lobes * t)) * math.cos(t), r0 * (1 + depth * math.cos(lobes * t)) * math.sin(t))
        for t in (i / 720 * 2 * math.pi for i in range(720))]
draw.polygon(body, fill=GREEN)

# Happy eyes are closed arcs; the grin is a filled curve.
for cx in (-28, 28):
    round_line(draw, quad((cx - 14, -15), (cx, -37), (cx + 14, -15), 400), 8)
draw.polygon(quad((-28, 6), (0, 42), (28, 6)), fill=INK)

out = Path(__file__).resolve().parents[2] / "assets" / "splash.png"
img.resize((SIZE, SIZE), Image.LANCZOS).save(out)
print("wrote", out)
