# PowerShell script to kill processes using port 5000
Write-Host "Checking for processes using port 5000..." -ForegroundColor Yellow

$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "Found process(es) using port 5000. Killing them..." -ForegroundColor Red
    foreach ($pid in $processes) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Killing process $pid ($($proc.ProcessName))..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Host "Could not kill process $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 1
    Write-Host "Port 5000 is now free!" -ForegroundColor Green
} else {
    Write-Host "Port 5000 is already free." -ForegroundColor Green
}

