import glob

# The replacement script
html_files = glob.glob('*.html')

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

import re

for filename in html_files:
    with open(filename, 'r') as f:
        content = f.read()

    # Find where tailwind.config starts and where the "colors": { block ends
    # We will just grab from tailwind.config = to the closing brace of the colors block
    # Note: the previous regex might have missed if there was a difference in spacing
    pattern = re.compile(r'tailwind\.config\s*=\s*{.*?darkMode:\s*["\']class["\'],.*?theme:\s*{.*?extend:\s*{.*?"colors":\s*{.*?},', re.DOTALL)

    if re.search(pattern, content):
        content = re.sub(pattern, replacement[1:], content)
    else:
        # maybe no darkMode setting in these files? Let's try without it
        pattern2 = re.compile(r'tailwind\.config\s*=\s*{.*?theme:\s*{.*?extend:\s*{.*?"colors":\s*{.*?},', re.DOTALL)
        content = re.sub(pattern2, replacement[1:], content)

    # Clean up hardcoded style tag in contact.html
    content = content.replace("background-color: #131313;", "background-color: var(--color-background);")
    content = content.replace("color: #e5e2e1;", "color: var(--color-on-background);")

    with open(filename, 'w') as f:
        f.write(content)
