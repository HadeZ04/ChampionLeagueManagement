# Scan for Import Paths That Need Migration
# This script finds all files using relative paths (../../..) that should use @/ alias

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Scanning for imports that need migration to @/ alias...   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$results = @()
$patterns = @(
    "from ['\`"]\.\.\/\.\.\/\.\.\/"  # ../../../
    "from ['\`"]\.\.\/\.\.\/"        # ../../
)

foreach ($pattern in $patterns) {
    Write-Host "Searching for pattern: $pattern" -ForegroundColor Yellow
    
    $matches = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js","*.tsx","*.ts" -ErrorAction SilentlyContinue |
        Select-String -Pattern $pattern |
        ForEach-Object {
            [PSCustomObject]@{
                File = $_.Path
                LineNumber = $_.LineNumber
                Line = $_.Line.Trim()
            }
        }
    
    $results += $matches
}

if ($results.Count -eq 0) {
    Write-Host "`n✅ No problematic imports found! All imports are clean." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Found $($results.Count) imports that need migration:`n" -ForegroundColor Yellow
    
    # Group by file
    $grouped = $results | Group-Object File | Sort-Object Name
    
    foreach ($group in $grouped) {
        $relativePath = $group.Name.Replace((Get-Location).Path + "\", "")
        Write-Host "`n📄 $relativePath" -ForegroundColor Cyan
        Write-Host "   ($($group.Count) imports to fix)" -ForegroundColor Gray
        
        foreach ($item in $group.Group | Select-Object -First 3) {
            Write-Host "   Line $($item.LineNumber): " -ForegroundColor Gray -NoNewline
            Write-Host $item.Line -ForegroundColor White
        }
        
        if ($group.Count -gt 3) {
            Write-Host "   ... and $($group.Count - 3) more" -ForegroundColor Gray
        }
    }
    
    # Export to CSV
    $csvPath = "import_migration_report.csv"
    $results | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "`n📊 Full report exported to: $csvPath" -ForegroundColor Green
    
    # Summary by file type
    Write-Host "`n📈 Summary by file type:" -ForegroundColor Cyan
    $results | Group-Object { [System.IO.Path]::GetExtension($_.File) } |
        Sort-Object Count -Descending |
        ForEach-Object {
            Write-Host "   $($_.Name): $($_.Count) imports" -ForegroundColor White
        }
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review import_migration_report.csv" -ForegroundColor White
Write-Host "   2. Use find & replace patterns from docs/IMPORT_PATH_MIGRATION.md" -ForegroundColor White
Write-Host "   3. Test with: npm run dev" -ForegroundColor White
Write-Host "`n"
