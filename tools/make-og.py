#!/usr/bin/env python3
"""Telegram/WhatsApp uchun ulashish rasmini yasaydi → assets/og.png (1200x630)."""

import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'og.png')

TEAL_MID = (23, 117, 109)
TEAL_DEEP = (6, 42, 43)
GOLD = (201, 162, 75)
GOLD_LT = (235, 214, 155)
CREAM = (250, 244, 231)

SERIF = [
    '/System/Library/Fonts/Supplemental/Didot.ttc',
    '/System/Library/Fonts/Supplemental/Baskerville.ttc',
    '/System/Library/Fonts/Supplemental/Georgia.ttf',
    '/System/Library/Fonts/Times.ttc',
]
SANS = [
    '/System/Library/Fonts/Supplemental/Futura.ttc',
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
]


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def width_of(draw, text, fnt, track=0):
    w = draw.textlength(text, font=fnt)
    return w + track * max(0, len(text) - 1)


def tracked(draw, text, fnt, y, fill, track=0, center=True, x=None):
    """Harflar orasiga bo'shliq qo'shib yozadi (letter-spacing)."""
    total = width_of(draw, text, fnt, track)
    cx = (W - total) / 2 if center else x
    for ch in text:
        draw.text((cx, y), ch, font=fnt, fill=fill)
        cx += draw.textlength(ch, font=fnt) + track


img = Image.new('RGB', (W, H), TEAL_DEEP)
d = ImageDraw.Draw(img)

# ── radial fon ────────────────────────────────────────
cx, cy = W / 2, H * 0.16
maxr = (W ** 2 + H ** 2) ** 0.5
for i in range(int(maxr), 0, -3):
    t = min(1.0, i / maxr / 0.95)
    col = tuple(int(TEAL_MID[k] + (TEAL_DEEP[k] - TEAL_MID[k]) * t) for k in range(3))
    d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=col)

# ── girih naqsh ───────────────────────────────────────
tile = 84
pat = Image.new('RGBA', (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(pat)
a = 26
for gx in range(-tile, W + tile, tile):
    for gy in range(-tile, H + tile, tile):
        m, s = tile / 2, tile * 0.30
        pd.rectangle([gx + s, gy + s, gx + tile - s, gy + tile - s], outline=GOLD_LT + (a,), width=1)
        pd.polygon([(gx + m, gy + tile * .09), (gx + tile * .91, gy + m),
                    (gx + m, gy + tile * .91), (gx + tile * .09, gy + m)],
                   outline=GOLD_LT + (a,), width=1)
        r = tile * .10
        pd.ellipse([gx + m - r, gy + m - r, gx + m + r, gy + m + r], outline=GOLD_LT + (a,), width=1)
img = Image.alpha_composite(img.convert('RGBA'), pat).convert('RGB')
d = ImageDraw.Draw(img)

# ── ramka ─────────────────────────────────────────────
d.rectangle([26, 26, W - 27, H - 27], outline=GOLD, width=2)
d.rectangle([38, 38, W - 39, H - 39], outline=GOLD + (0,), width=1)
for (ox, oy, sx, sy) in ((26, 26, 1, 1), (W - 27, 26, -1, 1), (26, H - 27, 1, -1), (W - 27, H - 27, -1, -1)):
    d.line([(ox, oy + 46 * sy), (ox, oy), (ox + 46 * sx, oy)], fill=GOLD_LT, width=3)

# ── matn ──────────────────────────────────────────────
f_eye = font(SANS, 22)
f_name = font(SERIF, 104)
f_amp = font(SERIF, 40)
f_meta = font(SANS, 27)
f_place = font(SANS, 22)

tracked(d, "NIKOH TO'YIGA TAKLIFNOMA", f_eye, 132, GOLD_LT, track=9)

tracked(d, 'Sohibjon', f_name, 190, GOLD_LT, track=2)
tracked(d, 'va', f_amp, 318, GOLD, track=2)
tracked(d, 'Dilnozaxon', f_name, 372, GOLD_LT, track=2)

# ornament
oy = 509
d.line([(W / 2 - 190, oy), (W / 2 - 46, oy)], fill=GOLD, width=2)
d.line([(W / 2 + 46, oy), (W / 2 + 190, oy)], fill=GOLD, width=2)
d.polygon([(W / 2, oy - 12), (W / 2 + 12, oy), (W / 2, oy + 12), (W / 2 - 12, oy)], outline=GOLD, width=2)

tracked(d, '17 AVGUST 2026   ·   SOAT 19:00', f_meta, 526, CREAM, track=5)
tracked(d, '«GRAND ASIA» TO’YXONASI  ·  ISHTIXON', f_place, 563, GOLD_LT, track=4)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, 'PNG', optimize=True)
print('yaratildi:', os.path.abspath(OUT), os.path.getsize(OUT) // 1024, 'KB')
