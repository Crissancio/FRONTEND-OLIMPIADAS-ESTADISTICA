$f = "app/src/modules/admin/pages/AdminConvocatoriaDetallePage.vue"
$c = Get-Content $f -Raw
$c = $c -replace 'class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"', 'class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50"'
$c = $c -replace 'class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"', 'class="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none sm:text-sm bg-gray-50 py-2 px-3 transition-all"'
Set-Content $f $c -NoNewline
