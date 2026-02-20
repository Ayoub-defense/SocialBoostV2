#!/bin/bash
# Script de build pour Render
# Il build le frontend React, puis le backend Express le sert

echo "📦 Installation des dépendances frontend..."
cd frontend
npm install
echo "🔨 Build du frontend React..."
npm run build
echo "✅ Frontend buildé !"

echo "📦 Installation des dépendances backend..."
cd ../backend
npm install
echo "✅ Tout est prêt !"
