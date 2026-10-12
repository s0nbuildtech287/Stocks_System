Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  KHOI DONG VN STOCK LAB QUANTITATIVE TERMINAL" -ForegroundColor Yellow
Write-Host "  Dia chi: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
npm --prefix frontend run dev
