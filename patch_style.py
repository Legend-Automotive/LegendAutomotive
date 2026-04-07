with open('style.css', 'r') as f:
    content = f.read()

content = content.replace("background-color: #131313;", "background-color: var(--color-background);")
content = content.replace("color: #e5e2e1;", "color: var(--color-on-background);")
content = content.replace("background: #131313;", "background: var(--color-background);")
content = content.replace("background: #2a2a2a;", "background: var(--color-surface-container-high);")
content = content.replace("background: #d4af37;", "background: var(--color-primary-container);")
content = content.replace("background: rgba(42, 42, 42, 0.4);", "background: rgba(var(--rgb-background), 0.4);") # This is an approximation
content = content.replace("rgba(19, 19, 19, 0)", "rgba(var(--rgb-background), 0)")
content = content.replace("rgba(19, 19, 19, 1)", "rgba(var(--rgb-background), 1)")

content = content.replace("background-color: #0e0e0e !important;", "background-color: var(--color-surface-container-lowest) !important;")
content = content.replace("color: #e5e2e1 !important;", "color: var(--color-on-surface) !important;")

with open('style.css', 'w') as f:
    f.write(content)
