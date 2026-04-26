const fs = require('fs');
const files = ['index.html', 'inventory.html', 'about.html', 'contact.html', 'favorites.html', 'admin.html', 'admin1.html', 'details.html'];

const configBlock = `<script>
        window.tailwind = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: 'var(--color-primary, #c7a230)',
                        'on-primary': 'var(--color-on-primary, #ffffff)',
                        background: 'var(--color-background, #131313)',
                        'surface-card': 'var(--color-surface-container, #1c1b1b)',
                        'outline-variant': 'var(--color-outline-variant, rgba(224, 220, 213, 0.15))'
                    },
                    fontFamily: {
                        headline: ['Manrope', 'sans-serif'],
                        body: ['Inter', 'sans-serif']
                    }
                }
            }
        };
    </script>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>`;

for (let file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // If it already has tailwind.config, let's just replace the hardcoded color with the var
    if (content.includes('tailwind.config =')) {
        content = content.replace(/primary:\s*['"]#c7a230['"]/g, "primary: 'var(--color-primary, #c7a230)'");
        content = content.replace(/primary:\s*['"]var\(--color-primary\)['"]/g, "primary: 'var(--color-primary, #c7a230)'");
        fs.writeFileSync(file, content);
        console.log('Updated config in ' + file);
    } else {
        content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com\?plugins=forms,container-queries"><\/script>/g, configBlock);
        fs.writeFileSync(file, content);
        console.log('Injected config into ' + file);
    }
  }
}
