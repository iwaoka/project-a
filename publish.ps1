param(
  [Parameter(Position=0)]
  [string]$Message
)

$ErrorActionPreference = "Stop"

function Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Warn([string]$msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }

Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".git")) { throw "Not a git repo (.git not found)." }

$origin = (git remote get-url origin 2>$null).Trim()
if ([string]::IsNullOrWhiteSpace($origin)) { throw "origin remote is not set." }

$expected = "https://github.com/iwaoka/project-a.git"
if ($origin -ne $expected) {
  throw ("origin mismatch. expected: {0} actual: {1}" -f $expected, $origin)
}

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") { throw ("branch is not main: {0}" -f $branch) }

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "publish: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

Step "npm run validate"
npm run validate

Step "git add -A"
git add -A

$porcelain = git status --porcelain
if ([string]::IsNullOrWhiteSpace($porcelain)) {
  Warn "No changes. Nothing to publish."
  exit 0
}

Step "git commit"
git commit -m $Message

Step "git push"
git push origin main

Write-Host "`nOK: $Message" -ForegroundColor Green
