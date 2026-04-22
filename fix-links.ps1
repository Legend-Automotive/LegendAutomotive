$files = Get-ChildItem -Path '.' -Include *.html, *.js -Recurse -File
foreach ($file in $files) {
    if ($file.Name -eq 'supabase-config.js' -or $file.Name -eq 'sw.js') { continue }
    $content = Get-Content -Raw -Path $file.FullName
    
    # 1. Update index.html to /
    $content = $content -replace 'href="index\.html"', 'href="/"'
    $content = $content -replace "href='index\.html'", "href='/'"
    $content = $content -replace 'window\.location\.href\s*=\s*''index\.html''', 'window.location.href="/"'
    $content = $content -replace 'window\.location\.href\s*=\s*"index\.html"', 'window.location.href="/"'
    
    # 2. Update other .html to format without .html and prepend /
    $content = $content -replace 'href="([a-zA-Z0-9_-]+)\.html(\?[^"]*)?"', 'href="/$1$2"'
    $content = $content -replace "href='([a-zA-Z0-9_-]+)\.html(\?[^']*)?'", "href='/$1$2'"
    $content = $content -replace 'window\.location\.href\s*=\s*''([a-zA-Z0-9_-]+)\.html(\?[^'']*)?''', 'window.location.href="/$1$2"'
    $content = $content -replace 'window\.location\.href\s*=\s*"([a-zA-Z0-9_-]+)\.html(\?[^"]*)?"', 'window.location.href="/$1$2"'

    # Fix the script.js specifically for routing checking
    $content = $content -replace '/LegendAutomotive/inventory', '/inventory'
    $content = $content -replace '/LegendAutomotive/about', '/about'
    $content = $content -replace '/LegendAutomotive/details', '/details'
    $content = $content -replace '/LegendAutomotive/contact', '/contact'
    $content = $content -replace '/LegendAutomotive/favorites', '/favorites'

    # Handle any case where it already starts with / but had .html
    $content = $content -replace 'href="/([a-zA-Z0-9_-]+)\.html"', 'href="/$1"'

    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Output "Links fixed successfully across all files!"
