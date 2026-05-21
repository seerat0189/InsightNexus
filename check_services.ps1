# InsightNexus Service Health Checker
# This script checks if the ports for all services are listening.

$services = @(
    @{ Name="API Gateway"; Port=4000 },
    @{ Name="Auth Service"; Port=5000 },
    @{ Name="User Service"; Port=5001 },
    @{ Name="Inventory Service"; Port=5002 },
    @{ Name="Supplier Service"; Port=5003 },
    @{ Name="Cost Service"; Port=5004 },
    @{ Name="Finance Service"; Port=5005 },
    @{ Name="Reports Service"; Port=5006 },
    @{ Name="Notification Service"; Port=5007 },
    @{ Name="Procurement Service"; Port=5008 }
)

Write-Host "Checking service status...`n" -ForegroundColor Cyan
$allRunning = $true

foreach ($service in $services) {
    $port = $service.Port
    $name = $service.Name
    
    $check = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
    
    if ($check) {
        Write-Host "[ONLINE] $name (Port $port)" -ForegroundColor Green
    } else {
        Write-Host "[OFFLINE] $name (Port $port)" -ForegroundColor Red
        $allRunning = $false
    }
}

if ($allRunning) {
    Write-Host "`n✅ All services are reachable!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some services are down. Check the logs." -ForegroundColor Yellow
}
