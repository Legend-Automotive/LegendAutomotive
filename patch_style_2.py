with open('style.css', 'r') as f:
    content = f.read()

# Fix the bug introduced in the python generation
content = content.replace("--color-on-background: var(--color-background);", "--color-on-background: #131313;")
content = content.replace("--color-background: var(--color-background);", "--color-background: #131313;")

with open('style.css', 'w') as f:
    f.write(content)
