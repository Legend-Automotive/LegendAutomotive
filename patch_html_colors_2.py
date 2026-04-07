import os
import glob

html_files = glob.glob('*.html')

for filename in html_files:
    with open(filename, 'r') as f:
        content = f.read()

    # The ones left in details and financing are due to tailwind config not being replaced properly
    # Actually wait, my regex earlier might have failed on details.html and financing.html if their config format is slightly different. Let me run the regex again but with a wider net.

    # We will just do a direct string replace for the old tailwind config colors object to the new one just in case
    # or just use a generic regex to replace any tailwind config colors object.
