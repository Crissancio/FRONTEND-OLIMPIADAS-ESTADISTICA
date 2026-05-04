$files = Get-ChildItem -Path app/src/modules -Recurse -File -Include *.vue
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $original = $content

    $content = $content -replace 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors'
    $content = $content -replace 'focus:outline-none focus:ring-2 focus:ring-primary', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors'
    $content = $content -replace 'focus:ring-primary', 'focus-visible:ring-primary'
    $content = $content -replace 'focus:border-primary', 'focus-visible:border-primary'

    if ($original -cne $content) {
        Set-Content -Path $f.FullName -Value $content -NoNewline
    }
}
