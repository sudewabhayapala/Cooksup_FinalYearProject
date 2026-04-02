# CooksUp Platform - Windows Setup Script
# Run this script in PowerShell to set up the entire project

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CooksUp Platform Setup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please download and install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MySQL is installed
try {
    $mysqlVersion = mysql --version
    Write-Host "✓ MySQL is installed: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ MySQL is not installed!" -ForegroundColor Red
    Write-Host "  Please download and install MySQL from https://dev.mysql.com/downloads/" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Backend Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install backend dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    
    # Prompt for database password
    Write-Host "`nPlease enter your MySQL configuration:" -ForegroundColor Cyan
    $dbPassword = Read-Host "MySQL root password"
    $dbName = Read-Host "Database name (press Enter for 'cooksup_db')"
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "cooksup_db"
    }
    
    # Generate random JWT secret
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    # Create .env file
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$dbPassword
DB_NAME=$dbName
DB_PORT=3306

# JWT Configuration
JWT_SECRET=$jwtSecret
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Setup database
Write-Host "`nSetting up database..." -ForegroundColor Yellow
$setupDb = Read-Host "Do you want to set up the database now? (Y/N)"

if ($setupDb -eq "Y" -or $setupDb -eq "y") {
    npm run db:setup
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database setup completed" -ForegroundColor Green
        
        # Seed data
        $seedDb = Read-Host "`nDo you want to add sample data? (Y/N)"
        if ($seedDb -eq "Y" -or $seedDb -eq "y") {
            npm run db:seed
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Sample data added" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✗ Database setup failed. Please check your MySQL credentials." -ForegroundColor Red
        Write-Host "  You can run 'npm run db:setup' manually later." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Skipping database setup" -ForegroundColor Yellow
    Write-Host "  Remember to run 'npm run db:setup' before starting the server!" -ForegroundColor Yellow
}

# Return to project root
Set-Location -Path ".."

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✓ Installation completed successfully!`n" -ForegroundColor Green

Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "`n1. Start the backend server:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n2. In a new terminal, start the frontend:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White

Write-Host "`nDemo Accounts (if you seeded data):" -ForegroundColor Yellow
Write-Host "  Customer: john.doe@example.com / password123" -ForegroundColor White
Write-Host "  Chef: chef.gordon@example.com / password123" -ForegroundColor White

Write-Host "`nURLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  API Docs: See backend/API_REFERENCE.md" -ForegroundColor White

Write-Host "`nFor detailed documentation, see:" -ForegroundColor Yellow
Write-Host "  - SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  - backend/DATABASE.md" -ForegroundColor White
Write-Host "  - backend/API_REFERENCE.md" -ForegroundColor White

Write-Host "`nHappy coding! 🚀👨‍🍳`n" -ForegroundColor Green
