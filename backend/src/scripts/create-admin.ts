/**
* Script pour créer le compte administrateur par défaut
* Utilisé lors du premier démarrage de l'application
*/

import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

const SALT_ROUNDS = 10;

async function createAdmin() {
console.log(' Création du compte administrateur...');

try {
// Vérifier si un admin existe déjà
const existingAdmin = await prisma.user.findFirst({
where: { role: 'ADMIN' },
});

if (existingAdmin) {
console.log(' Un compte administrateur existe déjà, ignoré.');
return;
}

// Hasher le mot de passe par défaut
const hashedPassword = await bcrypt.hash('Admin123', SALT_ROUNDS);

// Créer l'administrateur
const admin = await prisma.user.create({
data: {
id: 'admin-default-id',
email: 'admin@fastfood.com',
username: 'admin',
password: hashedPassword,
firstName: 'Administrateur',
lastName: 'Système',
role: 'ADMIN',
isActive: true,
},
});

console.log(' Compte administrateur créé avec succès !');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' Email : admin@fastfood.com');
console.log(' Username : admin');
console.log(' Password : Admin123');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' IMPORTANT: Changez ce mot de passe après la première connexion !');
console.log('');

} catch (error) {
console.error(' Erreur lors de la création de l\'administrateur:', error);
process.exit(1);
} finally {
await prisma.$disconnect();
}
}

createAdmin();
