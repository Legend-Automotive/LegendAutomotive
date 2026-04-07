import json

colors_str = """{
    "surface": "#131313",
    "tertiary-container": "#ceb05a",
    "surface-variant": "#353535",
    "surface-container": "#20201f",
    "on-tertiary-fixed": "#241a00",
    "tertiary-fixed": "#ffe089",
    "on-secondary-fixed-variant": "#584400",
    "on-tertiary-fixed-variant": "#574400",
    "on-error-container": "#ffdad6",
    "primary": "#f2ca50",
    "error-container": "#93000a",
    "surface-container-lowest": "#0e0e0e",
    "secondary-container": "#b08c10",
    "surface-dim": "#131313",
    "primary-container": "#d4af37",
    "secondary": "#eac249",
    "tertiary": "#ebcc72",
    "primary-fixed": "#ffe088",
    "tertiary-fixed-dim": "#e3c46b",
    "secondary-fixed": "#ffe08b",
    "on-primary-fixed": "#241a00",
    "on-primary-container": "#554300",
    "on-secondary-fixed": "#241a00",
    "on-secondary-container": "#352800",
    "outline": "#99907c",
    "inverse-surface": "#e5e2e1",
    "on-primary-fixed-variant": "#574500",
    "surface-container-high": "#2a2a2a",
    "primary-fixed-dim": "#e9c349",
    "on-surface": "#e5e2e1",
    "inverse-primary": "#735c00",
    "outline-variant": "#4d4635",
    "surface-container-highest": "#353535",
    "error": "#ffb4ab",
    "surface-container-low": "#1c1b1b",
    "on-tertiary-container": "#554300",
    "on-error": "#690005",
    "on-primary": "#3c2f00",
    "secondary-fixed-dim": "#eac249",
    "surface-bright": "#393939",
    "inverse-on-surface": "#313030",
    "background": "#131313",
    "on-background": "#e5e2e1",
    "on-secondary": "#3d2f00",
    "on-surface-variant": "#d0c5af",
    "surface-tint": "#e9c349",
    "on-tertiary": "#3d2f00"
}"""

colors = json.loads(colors_str)

# Map hex to a light theme variant.
# We'll use simple heuristics:
# background: #fdfdfc (off white)
# surface: #f8f9fa
# surface-container-lowest: #ffffff
# surface-container-low: #f8f9fa
# surface-container: #f1f3f5
# surface-container-high: #e9ecef
# surface-container-highest: #dee2e6
# outline: #adb5bd
# outline-variant: #ced4da
# on-background / on-surface: #1a1a1a
# on-surface-variant: #495057
# primary/secondary: keep gold, maybe slightly darker for text contrast

light_colors = {}
dark_colors = colors

for k, v in colors.items():
    if "background" in k or "surface" in k:
        if k == "background": light_colors[k] = "#f8f9eb" # Warm off white
        elif k == "on-background": light_colors[k] = "#131313"
        elif k == "surface": light_colors[k] = "#fbfbfa"
        elif k == "on-surface": light_colors[k] = "#1c1b1b"
        elif k == "surface-variant": light_colors[k] = "#e6e5e3"
        elif k == "on-surface-variant": light_colors[k] = "#4d4c4b"
        elif k == "inverse-surface": light_colors[k] = "#313030"
        elif k == "inverse-on-surface": light_colors[k] = "#f5f4f3"
        elif k == "surface-container-lowest": light_colors[k] = "#ffffff"
        elif k == "surface-container-low": light_colors[k] = "#f8f7f5"
        elif k == "surface-container": light_colors[k] = "#f1f0ee"
        elif k == "surface-container-high": light_colors[k] = "#e9e8e6"
        elif k == "surface-container-highest": light_colors[k] = "#e2e1df"
        elif k == "surface-bright": light_colors[k] = "#ffffff"
        elif k == "surface-dim": light_colors[k] = "#dbdad8"
        elif k == "surface-tint": light_colors[k] = "#b89a36"
        else: light_colors[k] = v
    elif k == "outline": light_colors[k] = "#797875"
    elif k == "outline-variant": light_colors[k] = "#cac9c7"
    elif "primary" in k:
        if k == "primary": light_colors[k] = "#c7a230"
        elif k == "on-primary": light_colors[k] = "#ffffff"
        elif k == "primary-container": light_colors[k] = "#ffe68a"
        elif k == "on-primary-container": light_colors[k] = "#3d3000"
        else: light_colors[k] = v
    elif "secondary" in k:
        if k == "secondary": light_colors[k] = "#a6882c"
        elif k == "on-secondary": light_colors[k] = "#ffffff"
        elif k == "secondary-container": light_colors[k] = "#ffe68f"
        elif k == "on-secondary-container": light_colors[k] = "#332800"
        else: light_colors[k] = v
    else:
        light_colors[k] = v

print("/* CSS Variables */")
print(":root {")
for k, v in light_colors.items():
    print(f"  --color-{k}: {v};")
print("  --rgb-background: 248, 249, 235;")
print("}")

print("\n.dark {")
for k, v in dark_colors.items():
    print(f"  --color-{k}: {v};")
print("  --rgb-background: 19, 19, 19;")
print("}")
