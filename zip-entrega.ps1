# Gera o ZIP para envio no Moodle sem node_modules, .env local, dist, etc.
# Uso (no PowerShell, na pasta do projeto):
#   .\zip-entrega.ps1

$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$outputName = 'projeto2-biblioteca-entrega.zip'
$output = Join-Path $root $outputName

if (Test-Path $output) { Remove-Item $output -Force }

$include = @(
    'README.md',
    'docker-compose.yml',
    'zip-entrega.ps1',
    'backend',
    'frontend'
)

$excludePatterns = @(
    '\\node_modules(\\|$)',
    '\\dist(\\|$)',
    '\\dist-ssr(\\|$)',
    '\\.env$',
    '\\.git(\\|$)',
    '\\.DS_Store$',
    '\.log$'
)

$tmpDir = Join-Path $env:TEMP ("projeto2-zip-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmpDir | Out-Null

foreach ($item in $include) {
    $source = Join-Path $root $item
    if (-not (Test-Path $source)) { continue }
    if (Test-Path $source -PathType Container) {
        $target = Join-Path $tmpDir $item
        New-Item -ItemType Directory -Path $target -Force | Out-Null
        Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
            $rel = $_.FullName.Substring($source.Length + 1)
            $shouldExclude = $false
            foreach ($p in $excludePatterns) {
                if (('\\' + $rel) -match $p) { $shouldExclude = $true; break }
            }
            if (-not $shouldExclude) {
                $dest = Join-Path $target $rel
                $destDir = Split-Path $dest -Parent
                if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
                Copy-Item $_.FullName $dest
            }
        }
    } else {
        Copy-Item $source (Join-Path $tmpDir $item)
    }
}

Compress-Archive -Path (Join-Path $tmpDir '*') -DestinationPath $output -Force
Remove-Item -Recurse -Force $tmpDir

Write-Host ""
Write-Host "ZIP criado em: $output" -ForegroundColor Green
$fileInfo = Get-Item $output
Write-Host ("Tamanho: {0:N2} MB" -f ($fileInfo.Length / 1MB)) -ForegroundColor Green
