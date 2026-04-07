import re
import glob

html_files = ['details.html', 'financing.html']

replacement = """
    tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface": "var(--color-surface)",
                    "tertiary-container": "var(--color-tertiary-container)",
                    "surface-variant": "var(--color-surface-variant)",
                    "surface-container": "var(--color-surface-container)",
                    "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
                    "tertiary-fixed": "var(--color-tertiary-fixed)",
                    "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
                    "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
                    "on-error-container": "var(--color-on-error-container)",
                    "primary": "var(--color-primary)",
                    "error-container": "var(--color-error-container)",
                    "surface-container-lowest": "var(--color-surface-container-lowest)",
                    "secondary-container": "var(--color-secondary-container)",
                    "surface-dim": "var(--color-surface-dim)",
                    "primary-container": "var(--color-primary-container)",
                    "secondary": "var(--color-secondary)",
                    "tertiary": "var(--color-tertiary)",
                    "primary-fixed": "var(--color-primary-fixed)",
                    "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
                    "secondary-fixed": "var(--color-secondary-fixed)",
                    "on-primary-fixed": "var(--color-on-primary-fixed)",
                    "on-primary-container": "var(--color-on-primary-container)",
                    "on-secondary-fixed": "var(--color-on-secondary-fixed)",
                    "on-secondary-container": "var(--color-on-secondary-container)",
                    "outline": "var(--color-outline)",
                    "inverse-surface": "var(--color-inverse-surface)",
                    "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
                    "surface-container-high": "var(--color-surface-container-high)",
                    "primary-fixed-dim": "var(--color-primary-fixed-dim)",
                    "on-surface": "var(--color-on-surface)",
                    "inverse-primary": "var(--color-inverse-primary)",
                    "outline-variant": "var(--color-outline-variant)",
                    "surface-container-highest": "var(--color-surface-container-highest)",
                    "error": "var(--color-error)",
                    "surface-container-low": "var(--color-surface-container-low)",
                    "on-tertiary-container": "var(--color-on-tertiary-container)",
                    "on-error": "var(--color-on-error)",
                    "on-primary": "var(--color-on-primary)",
                    "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
                    "surface-bright": "var(--color-surface-bright)",
                    "inverse-on-surface": "var(--color-inverse-on-surface)",
                    "background": "var(--color-background)",
                    "on-background": "var(--color-on-background)",
                    "on-secondary": "var(--color-on-secondary)",
                    "on-surface-variant": "var(--color-on-surface-variant)",
                    "surface-tint": "var(--color-surface-tint)",
                    "on-tertiary": "var(--color-on-tertiary)"
            },
"""

for filename in html_files:
    with open(filename, 'r') as f:
        content = f.read()

    # Find the colors object directly without tailwind.config assignment
    pattern = re.compile(r'colors:\s*{.*?},', re.DOTALL)

    # Extract just the colors object from replacement
    colors_replacement = replacement[replacement.find('"colors": {'):]

    if re.search(pattern, content):
        content = re.sub(pattern, colors_replacement, content)

    with open(filename, 'w') as f:
        f.write(content)
