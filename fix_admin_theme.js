window.toggleTheme = function() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }

    // Update icons
    document.querySelectorAll('.theme-icon').forEach(icon => {
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.textContent = 'light_mode';
        });
    } else {
        document.documentElement.classList.add('dark');
        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.textContent = 'dark_mode';
        });
    }
});
