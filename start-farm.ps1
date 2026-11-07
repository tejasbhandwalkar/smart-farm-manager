Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " SMART FARM MANAGER - 20-ACRE FAMILY FARM MANAGEMENT APPLICATION" -ForegroundColor Yellow
Write-Host " Crops: Sugarcane, Wheat, Onion | Marathi (Default), Hindi, English" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Green
Set-Location -Path $PSScriptRoot
npm run dev -- --host
