#!/usr/bin/env python3
"""
Сборка проекта «Полиглот».

1) standalone.html — один самодостаточный файл (весь CSS и JS внутри).
   Нужен, чтобы можно было открыть приложение прямо из «Файлов» на iPhone
   без всякого хостинга.
2) icon-180.png / icon-512.png — иконки для домашнего экрана iOS.

Запуск:  python3 build.py
"""

import os
import re
import base64

ROOT = os.path.dirname(os.path.abspath(__file__))


def read(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return f.read()


# ---------------------------------------------------------------- standalone
def build_standalone():
    html = read('index.html')
    css = read('css/app.css')
    js = '\n'.join(read('js/' + n) for n in
                   ('data.js', 'course.js', 'engine.js', 'app.js'))

    icon_svg = read('icon.svg')
    icon_b64 = base64.b64encode(icon_svg.encode('utf-8')).decode('ascii')
    icon_uri = 'data:image/svg+xml;base64,' + icon_b64

    html = html.replace(
        '<link rel="stylesheet" href="css/app.css">',
        '<style>\n' + css + '\n</style>')

    html = re.sub(r'\s*<script src="js/[a-z]+\.js"></script>', '', html)
    html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>')

    # в одиночном файле manifest и service worker не нужны
    html = html.replace('<link rel="manifest" href="manifest.json">', '')
    html = html.replace('href="icon-180.png"', 'href="%s"' % icon_uri)
    html = html.replace('href="icon.svg"', 'href="%s"' % icon_uri)

    out = os.path.join(ROOT, 'standalone.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('standalone.html  %.0f КБ' % (os.path.getsize(out) / 1024))


# ---------------------------------------------------------------- иконки
def build_icons():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('иконки: Pillow не установлен, пропускаю (pip install pillow)')
        return

    for size in (180, 512):
        k = size / 512.0
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([0, 0, size - 1, size - 1],
                            radius=int(112 * k), fill=(16, 14, 12, 255))

        w = max(2, int(18 * k))
        amber = (224, 161, 85, 255)
        faint = (224, 161, 85, 90)
        rust = (196, 83, 47, 255)

        for y in (136, 256, 376):
            d.line([136 * k, y * k, 376 * k, y * k], fill=amber, width=w)
        for x in (216, 296):
            d.line([x * k, 116 * k, x * k, 396 * k], fill=faint, width=w)

        for (cx, cy, col) in ((176, 196, amber), (256, 316, rust), (336, 196, faint)):
            r = 20 * k
            d.ellipse([(cx - 20) * k, (cy - 20) * k, (cx + 20) * k, (cy + 20) * k], fill=col)

        path = os.path.join(ROOT, 'icon-%d.png' % size)
        img.save(path)
        print('icon-%d.png' % size)


if __name__ == '__main__':
    build_standalone()
    build_icons()
