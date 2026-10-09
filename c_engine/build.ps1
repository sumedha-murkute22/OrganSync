# PowerShell Build Script for OrganSync C Engine
Write-Host "Compiling OrganSync C Engine..." -ForegroundColor Cyan

$sources = @(
    "main.c",
    "models.c",
    "hash_table.c",
    "priority_queue.c",
    "graph.c",
    "queue.c",
    "matching.c",
    "json_io.c"
)

$target = "organsync_engine.exe"
$compileCmd = "gcc -Wall -Wextra -O2 -std=c99 " + ($sources -join " ") + " -o $target -lm"

Write-Host "Running: $compileCmd" -ForegroundColor Gray
Invoke-Expression $compileCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build SUCCESS: $target generated successfully!" -ForegroundColor Green
    Write-Host "Running unit tests..." -ForegroundColor Cyan
    & ".\$target" --test
} else {
    Write-Host "Build FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
