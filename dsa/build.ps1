# OrganSync C DSA Engine Windows Compilation Script
Write-Host "Compiling OrganSync C DSA Engine with MinGW GCC..." -ForegroundColor Cyan

$srcFiles = @(
    "src/models.c",
    "src/stack.c",
    "src/queue.c",
    "src/hash_table.c",
    "src/priority_queue.c",
    "src/graph.c",
    "src/compatibility.c",
    "src/matching_engine.c"
)

# 1. Compile Main CLI Executable
Write-Host "Building organsync_engine.exe..."
gcc -Wall -Wextra -std=c11 -O2 -Iinclude -o organsync_engine.exe src/main.c $srcFiles -lm
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] organsync_engine.exe compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to compile organsync_engine.exe" -ForegroundColor Red
    exit 1
}

# 2. Compile Test Executable
Write-Host "Building test_dsa.exe..."
gcc -Wall -Wextra -std=c11 -O2 -Iinclude -o test_dsa.exe tests/test_dsa.c $srcFiles -lm
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] test_dsa.exe compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to compile test_dsa.exe" -ForegroundColor Red
    exit 1
}

# 3. Execute Tests
Write-Host "Running automated DSA test suite..." -ForegroundColor Yellow
.\test_dsa.exe
