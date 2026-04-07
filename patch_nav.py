import glob
import re

html_files = glob.glob('*.html')

desktop_nav_replacement = r"""
<div class="flex items-center gap-4">
<button onclick="toggleTheme()" class="scale-95 active:scale-90 transition-transform text-primary" title="Toggle Theme">
    <span class="material-symbols-outlined theme-icon">dark_mode</span>
</button>
<button id="mobile-menu-btn" class="scale-95 active:scale-90 transition-transform text-primary">
<span class="material-symbols-outlined">person</span>
</button>
</div>
"""

mobile_nav_replacement = r"""
<div id="mobile-menu" class="hidden absolute top-20 left-0 w-full bg-background p-4 flex flex-col space-y-4 shadow-lg border-b border-surface-variant z-50">
    <a href="index.html" class="text-on-background hover:text-primary">Home</a>
    <a href="inventory.html" class="text-on-background hover:text-primary">Explore</a>
    <a href="about.html" class="text-on-background hover:text-primary">About</a>
    <a href="contact.html" class="text-on-background hover:text-primary">Contact</a>
    <button onclick="toggleTheme()" class="text-left text-on-background hover:text-primary flex items-center gap-2"><span class="material-symbols-outlined theme-icon text-sm">dark_mode</span> Theme</button>
    <button onclick="toggleCurrency()" class="currency-toggle text-left text-on-background hover:text-primary">Currency: <span class="currency-text">L.E</span></button>
    <button onclick="toggleLanguage()" class="lang-toggle text-left text-on-background hover:text-primary">Language: En</button>
</div>
"""

for filename in html_files:
    if filename == "admin.html": continue
    with open(filename, 'r') as f:
        content = f.read()

    # Desktop nav
    content = re.sub(r'<div class="flex items-center gap-4">.*?</div>', desktop_nav_replacement, content, flags=re.DOTALL)

    # Mobile nav
    content = re.sub(r'<div id="mobile-menu".*?</div>', mobile_nav_replacement, content, flags=re.DOTALL)

    with open(filename, 'w') as f:
        f.write(content)
