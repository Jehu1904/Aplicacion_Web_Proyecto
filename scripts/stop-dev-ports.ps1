$ErrorActionPreference = 'Stop'
$ports = @(5173, 5174, 5176, 4200)

foreach ($port in $ports) {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)

    foreach ($processId in $processIds) {
        Stop-Process -Id $processId -Force
        Write-Host "Stopped PID $processId on port $port"
    }
}

$deadline = (Get-Date).AddSeconds(5)
do {
    $remainingListeners = @(
        foreach ($port in $ports) {
            Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        }
    )

    if ($remainingListeners.Count -eq 0) {
        break
    }

    Start-Sleep -Milliseconds 250
} while ((Get-Date) -lt $deadline)

if ($remainingListeners.Count -gt 0) {
    $busyPorts = $remainingListeners | Select-Object -ExpandProperty LocalPort -Unique
    throw "No se pudieron liberar los puertos de desarrollo: $($busyPorts -join ', ')."
}
