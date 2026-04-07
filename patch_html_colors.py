import os
import glob
import re

html_files = glob.glob('*.html')

# We need to replace arbitrary hardcoded hex classes with semantic ones
# e.g., bg-[#131313] -> bg-background
# text-[#f2ca50] -> text-primary
# bg-[#0e0e0e] -> bg-surface-container-lowest
# border-[#4d4635]/15 -> border-outline-variant/15
# bg-[#d4af37] -> bg-primary-container
# text-[#d4af37] -> text-primary-container
# border-[#d4af37] -> border-primary-container
# bg-[#131313]/80 -> bg-background/80
# from-[#131313] -> from-background
# border-[#353535] -> border-surface-variant

color_map = {
    'bg-[#131313]': 'bg-background',
    'bg-[#131313]/80': 'bg-background/80',
    'from-[#131313]': 'from-background',
    'text-[#f2ca50]': 'text-primary',
    'hover:text-[#f2ca50]': 'hover:text-primary',
    'focus:border-[#f2ca50]': 'focus:border-primary',
    'bg-[#0e0e0e]': 'bg-surface-container-lowest',
    'border-[#4d4635]/15': 'border-outline-variant/15',
    'bg-[#d4af37]': 'bg-primary-container',
    'text-[#d4af37]': 'text-primary-container',
    'border-[#d4af37]': 'border-primary-container',
    'hover:text-[#d4af37]': 'hover:text-primary-container',
    'border-[#353535]': 'border-surface-variant',
}

for filename in html_files:
    with open(filename, 'r') as f:
        content = f.read()

    for k, v in color_map.items():
        content = content.replace(k, v)

    with open(filename, 'w') as f:
        f.write(content)
