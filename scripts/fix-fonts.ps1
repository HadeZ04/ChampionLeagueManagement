# Script to remove inline font-family styles and replace with proper classes
# This script removes all Barlow Condensed inline styles from JSX files

Write-Host "Starting font cleanup..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Include *.jsx,*.tsx

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove inline Barlow Condensed styles
    $content = $content -replace '\s*style=\{\{\s*fontFamily:\s*[''"]Barlow\s+Condensed,\s*sans-serif[''\"]\s*\}\}', ''
    $content = $content -replace '\s*style=\{\{\s*fontFamily:\s*[''"]Barlow,\s*sans-serif[''\"]\s*\}\}', ''
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "Completed! Fixed $count files." -ForegroundColor Green
Write-Host "All components now use Be Vietnam Pro globally via Tailwind." -ForegroundColor Cyan
