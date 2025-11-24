#!/bin/bash

set -e  # Arrêter en cas d'erreur

echo "================================"
echo "🔧 RÉPARATION COMPLÈTE DU LOGO"
echo "================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Étape 1/5: Arrêt et nettoyage du frontend...${NC}"
docker-compose stop frontend || true
docker-compose rm -f frontend || true
docker rmi gestion_fast_food-frontend 2>/dev/null || true
docker rmi gestion_fast_food_frontend 2>/dev/null || true
echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""

echo -e "${YELLOW}🗑️ Étape 2/5: Nettoyage du cache Docker...${NC}"
docker builder prune -f
echo -e "${GREEN}✅ Cache nettoyé${NC}"
echo ""

echo -e "${YELLOW}🔨 Étape 3/5: Reconstruction du frontend SANS cache (cela peut prendre quelques minutes)...${NC}"
docker-compose build --no-cache frontend
echo -e "${GREEN}✅ Frontend reconstruit${NC}"
echo ""

echo -e "${YELLOW}🚀 Étape 4/5: Redémarrage du frontend...${NC}"
docker-compose up -d frontend
sleep 5
echo -e "${GREEN}✅ Frontend redémarré${NC}"
echo ""

echo -e "${YELLOW}🗄️ Étape 5/5: Nettoyage des URLs de logo en base de données...${NC}"
docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db < fix-logo-urls.sql
echo -e "${GREEN}✅ Base de données nettoyée${NC}"
echo ""

echo "================================"
echo -e "${GREEN}✅ RÉPARATION TERMINÉE !${NC}"
echo "================================"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Ouvrez votre navigateur"
echo "2. Videz le cache (Ctrl+Shift+Del)"
echo "3. Rafraîchissez avec Ctrl+F5"
echo "4. Allez dans Paramètres App"
echo "5. Uploadez une nouvelle image"
echo ""
echo "✅ Les logs doivent maintenant montrer :"
echo "   🔄 Upload du logo en cours... [VERSION 2.0 - URL RELATIVE]"
echo "   ✅ Logo uploadé avec succès. URL: /uploads/logo-xxx.png"
echo "   🎯 Type URL: ✅ RELATIVE (NOUVEAU CODE!)"
echo ""
echo "📊 Vérifier les logs du frontend :"
echo "   docker-compose logs -f frontend"
echo ""
