param(
    [string]$EnvPath = ".env",
    [string]$OutputDir = "storage/app/backups"
)

if (-not (Test-Path $EnvPath)) {
    throw "No se encontro el archivo .env en $EnvPath"
}

$envValues = @{}
Get-Content $EnvPath | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -notmatch "=") {
        return
    }

    $parts = $_ -split "=", 2
    $envValues[$parts[0].Trim()] = $parts[1].Trim().Trim('"')
}

$connection = $envValues["DB_CONNECTION"]
if ($connection -notin @("mysql", "mariadb")) {
    throw "Este respaldo espera DB_CONNECTION=mysql o mariadb. Valor actual: $connection"
}

$hostName = $envValues["DB_HOST"]
if ([string]::IsNullOrWhiteSpace($hostName)) {
    $hostName = "127.0.0.1"
}

$port = $envValues["DB_PORT"]
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "3306"
}

$database = $envValues["DB_DATABASE"]
$username = $envValues["DB_USERNAME"]
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = $envValues["DB_PASSWORD"]
if ($null -eq $password) {
    $password = ""
}

if ([string]::IsNullOrWhiteSpace($database)) {
    throw "DB_DATABASE esta vacio en .env"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $OutputDir "$database-$timestamp.sql"

$passwordArg = ""
if (-not [string]::IsNullOrEmpty($password)) {
    $passwordArg = "-p$password"
}

$dumpCommand = Get-Command mysqldump -ErrorAction SilentlyContinue
$dumpPath = $null
if ($dumpCommand) {
    $dumpPath = $dumpCommand.Source
}

if (-not $dumpPath) {
    $candidates = @(
        "C:\laragon\bin\mysql\*\bin\mysqldump.exe",
        "A:\laragon\bin\mysql\*\bin\mysqldump.exe",
        "C:\xampp\mysql\bin\mysqldump.exe"
    )

    foreach ($candidate in $candidates) {
        $match = Get-ChildItem $candidate -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
        if ($match) {
            $dumpPath = $match.FullName
            break
        }
    }
}

if (-not $dumpPath) {
    throw "No se encontro mysqldump. Agrega MySQL/Laragon al PATH o ejecuta el script desde una terminal con mysqldump disponible."
}

& $dumpPath --host=$hostName --port=$port --user=$username $passwordArg --single-transaction --routines --triggers --events --databases $database --result-file=$outputFile

if ($LASTEXITCODE -ne 0) {
    throw "mysqldump fallo con codigo $LASTEXITCODE"
}

Write-Host "Respaldo generado: $outputFile"
