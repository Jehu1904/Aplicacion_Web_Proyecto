$ErrorActionPreference = 'Stop'
$port = 4200
$deadline = (Get-Date).AddSeconds(90)

do {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        Write-Host "Angular is listening on port $port."
        exit 0
    }

    Start-Sleep -Milliseconds 500
} while ((Get-Date) -lt $deadline)

throw "Angular did not start listening on port $port within 90 seconds; check the dev:angular output."
