# InsightNexus Setup Script
# This script installs dependencies and creates default .env files for all services.

$root = Get-Location
$services = @(
    "backend\api-gateway",
    "backend\server-1-core\auth-service",
    "backend\server-1-core\user-service",
    "backend\server-2-operations\inventory-service",
    "backend\server-2-operations\supplier-service",
    "backend\server-2-operations\procurement-service",
    "backend\server-3-finance\cost-intelligence-service",
    "backend\server-3-finance\finance-service",
    "backend\server-4-intelligence\reports-service",
    "backend\server-4-intelligence\notification-service",
    "frontend\insight-nexus"
)

$envDefaults = @{
    "backend\server-1-core\auth-service" = @{ "PORT"="5000"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_auth"; "JWT_SECRET"="secret123" }
    "backend\server-1-core\user-service" = @{ "PORT"="5001"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_user"; "JWT_SECRET"="secret123" }
    "backend\server-2-operations\inventory-service" = @{ "PORT"="5002"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_inventory"; "JWT_SECRET"="secret123" }
    "backend\server-2-operations\supplier-service" = @{ "PORT"="5003"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_supplier"; "JWT_SECRET"="secret123" }
    "backend\server-2-operations\procurement-service" = @{ "PORT"="5008"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_procurement"; "JWT_SECRET"="secret123" }
    "backend\server-3-finance\cost-intelligence-service" = @{ "PORT"="5004"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_cost"; "JWT_SECRET"="secret123" }
    "backend\server-3-finance\finance-service" = @{ "PORT"="5005"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_finance"; "JWT_SECRET"="secret123" }
    "backend\server-4-intelligence\reports-service" = @{ "PORT"="5006"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_reports"; "JWT_SECRET"="secret123" }
    "backend\server-4-intelligence\notification-service" = @{ "PORT"="5007"; "MONGO_URI"="mongodb://localhost:27017/insight_nexus_notifications"; "JWT_SECRET"="secret123" }
}

foreach ($service in $services) {
    Write-Host "`n>>> Setting up $service..." -ForegroundColor Cyan
    Set-Location "$root\$service"
    
    # Install dependencies
    if (Test-Path "package.json") {
        npm install
    }
    
    # Create .env if it doesn't exist and we have defaults
    if ($envDefaults.ContainsKey($service)) {
        if (-not (Test-Path ".env")) {
            Write-Host "Creating .env for $service" -ForegroundColor Yellow
            $envContent = ""
            $envDefaults[$service].GetEnumerator() | ForEach-Object {
                $envContent += "$($_.Key)=$($_.Value)`n"
            }
            $envContent | Out-File -FilePath ".env" -Encoding ascii
        }
    }
}

Set-Location $root
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
