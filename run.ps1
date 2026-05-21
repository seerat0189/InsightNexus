# InsightNexus Run Script
# This script starts all services in separate terminal windows.

$root = Get-Location
$services = @(
    @{ Path="backend\api-gateway"; Name="API Gateway"; Command="node app.js" },
    @{ Path="backend\server-1-core\auth-service"; Name="Auth Service"; Command="npm run dev" },
    @{ Path="backend\server-1-core\user-service"; Name="User Service"; Command="npm run dev" },
    @{ Path="backend\server-2-operations\inventory-service"; Name="Inventory Service"; Command="npm run dev" },
    @{ Path="backend\server-2-operations\supplier-service"; Name="Supplier Service"; Command="npm run dev" },
    @{ Path="backend\server-2-operations\procurement-service"; Name="Procurement Service"; Command="npm run dev" },
    @{ Path="backend\server-3-finance\cost-intelligence-service"; Name="Cost Service"; Command="npm run dev" },
    @{ Path="backend\server-3-finance\finance-service"; Name="Finance Service"; Command="npm run dev" },
    @{ Path="backend\server-4-intelligence\reports-service"; Name="Reports Service"; Command="npm run dev" },
    @{ Path="backend\server-4-intelligence\notification-service"; Name="Notification Service"; Command="npm run dev" },
    @{ Path="frontend\insight-nexus"; Name="Frontend"; Command="npm run dev" }
)

Write-Host "Starting all services..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Launching $($service.Name)..." -ForegroundColor Yellow
    $servicePath = Join-Path $root $service.Path
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$servicePath'; $($service.Command)"
}

Write-Host "`n🚀 All services are launching! Check the new windows." -ForegroundColor Green
