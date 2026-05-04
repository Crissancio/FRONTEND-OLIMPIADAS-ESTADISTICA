$files = Get-ChildItem -Path app/src -Recurse -File -Include *.vue,*.ts
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $original = $content

    $content = $content -replace '\btext-gray-[456]00\b', 'text-text-muted'
    $content = $content -replace '\btext-gray-[789]00\b', 'text-text-main'
    $content = $content -replace '\btext-slate-[456]00\b', 'text-text-muted'
    $content = $content -replace '\btext-slate-[789]00\b', 'text-text-main'

    $content = $content -replace '\btext-amber-[567]00\b', 'text-warning'
    $content = $content -replace '\bbg-amber-50\b', 'bg-warning/10'
    $content = $content -replace '\bbg-amber-100\b', 'bg-warning/20'
    $content = $content -replace '\bborder-amber-[123]00\b', 'border-warning/20'

    $content = $content -replace '\btext-red-[567]00\b', 'text-danger'
    $content = $content -replace '\bbg-red-50\b', 'bg-danger/10'
    $content = $content -replace '\bborder-red-[123]00\b', 'border-danger/20'

    $content = $content -replace '\btext-(emerald|green)-[567]00\b', 'text-success'
    $content = $content -replace '\bbg-(emerald|green)-50\b', 'bg-success/10'
    $content = $content -replace '\bbg-(emerald|green)-100\b', 'bg-success/20'
    $content = $content -replace '\bborder-(emerald|green)-[123]00\b', 'border-success/20'

    $content = $content -replace '\btext-blue-[567]00\b', 'text-info'
    $content = $content -replace '\bbg-blue-50\b', 'bg-info/10'
    $content = $content -replace '\bbg-blue-100\b', 'bg-info/20'

    if ($original -cne $content) {
        Set-Content -Path $f.FullName -Value $content -NoNewline
    }
}
