$files = Get-ChildItem -Path app/src/modules/admin -Recurse -File -Include *.vue,*.ts
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $original = $content

    $content = $content -replace 'shadow-md', 'shadow-soft'
    $content = $content -replace 'shadow-lg', 'shadow-soft'
    $content = $content -replace 'shadow-xl', 'shadow-soft'

    $content = $content -replace 'rounded-2xl', 'rounded-xl'
    $content = $content -replace 'rounded-3xl', 'rounded-xl'

    if ($original -cne $content) {
        Set-Content -Path $f.FullName -Value $content -NoNewline
    }
}
