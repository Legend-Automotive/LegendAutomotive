import os
import glob
import re

for filename in glob.glob('*.html'):
    with open(filename, 'r') as f:
        content = f.read()

    # Check if style.css is already linked (either correctly or as css/style.css)
    if '<link rel="stylesheet" href="style.css">' in content:
        print(f"{filename} already has correct style.css link.")
        continue

    # Check if there's a reference to css/style.css
    if '<link rel="stylesheet" href="css/style.css">' in content:
        content = content.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="style.css">')
        print(f"Fixed css/style.css to style.css in {filename}.")
        with open(filename, 'w') as f:
            f.write(content)
        continue

    # Otherwise, add it before the closing </head> tag or after the last <link> tag
    # Let's insert it after the tailwind-config script block or just before </head>

    # A safe bet is to find </head> and insert it right before that.
    if '</head>' in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="style.css">\n</head>')
        print(f"Added style.css link to {filename}.")
        with open(filename, 'w') as f:
            f.write(content)
    else:
        print(f"Warning: no </head> found in {filename}.")
