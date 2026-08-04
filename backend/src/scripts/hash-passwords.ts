/**
* Script pour hasher tous les mots de passe en clair dans la base de données
* À exécuter UNE SEULE FOIS après la mise en place de bcrypt
*
* Usage: npx tsx src/scripts/hash-passwords.ts
*/

import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

const SALT_ROUNDS = 10;

async function hashAllPasswords() {
console.log(' Début du hachage des mots de passe...\n');

try {
// Récupérer tous les utilisateurs
const users = await prisma.user.findMany({
select: {
id: true,
username: true,
email: true,
password: true,
},
});

console.log(` ${users.length} utilisateurs trouvés\n`);

let hashedCount = 0;
let skippedCount = 0;

for (const user of users) {
// Vérifier si le mot de passe est déjà hashé (commence par $2b$)
if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
console.log(` ${user.username} - Mot de passe déjà hashé, ignoré`);
skippedCount++;
continue;
}

// Hasher le mot de passe
const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

// Mettre à jour l'utilisateur
await prisma.user.update({
where: { id: user.id },
data: { password: hashedPassword },
});

console.log(` ${user.username} - Mot de passe hashé avec succès`);
hashedCount++;
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' Hachage terminé avec succès !');
console.log(` Statistiques:`);
console.log(` - Mots de passe hashés: ${hashedCount}`);
console.log(` - Mots de passe ignorés (déjà hashés): ${skippedCount}`);
console.log(` - Total: ${users.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hashedCount > 0) {
console.log(' IMPORTANT: Les utilisateurs doivent maintenant utiliser');
console.log(' leurs mots de passe originaux pour se connecter.');
console.log(' L\'application utilise désormais bcrypt pour la sécurité.\n');
}
} catch (error) {
console.error(' Erreur lors du hachage des mots de passe:', error);
process.exit(1);
} finally {
await prisma.$disconnect();
}
}

// Exécuter le script
hashAllPasswords();
