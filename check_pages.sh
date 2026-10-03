#!/bin/bash
echo "Prüfe GitHub Pages Deployment..."
while true; do
  STATUS_DOMAIN=$(curl -ILs https://carintel.de | head -n 1)
  STATUS_GITHUB=$(curl -ILs https://protoncode99.github.io/carintel/ | head -n 1)
  
  echo "[$(date +%T)] carintel.de: $STATUS_DOMAIN | protoncode99.github.io: $STATUS_GITHUB"
  
  if [[ "$STATUS_DOMAIN" == *"200"* || "$STATUS_GITHUB" == *"200"* || "$STATUS_GITHUB" == *"301"* ]]; then
    echo "✅ Erfolgreich! HTTP 200/301 erkannt. Deployment ist live."
    break
  fi
  sleep 10
done
