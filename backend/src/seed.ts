import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
console.log(' Starting database seeding...');

// Créer un utilisateur admin par défaut
const admin = await prisma.user.upsert({
where: { email: 'admin@fastfood.com' },
update: {},
create: {
email: 'admin@fastfood.com',
username: 'admin',
password: 'admin123', // À hasher en production !
firstName: 'Admin',
lastName: 'System',
role: 'ADMIN',
},
});

console.log(' Admin user created:', admin.email);

// Créer un caissier
const cashier = await prisma.user.upsert({
where: { email: 'cashier@fastfood.com' },
update: {},
create: {
email: 'cashier@fastfood.com',
username: 'cashier',
password: 'cashier123',
firstName: 'John',
lastName: 'Doe',
role: 'CASHIER',
},
});

console.log(' Cashier user created:', cashier.email);

// Créer des catégories
const burgers = await prisma.category.create({
data: {
name: 'Burgers',
description: 'Nos délicieux burgers',
icon: '',
displayOrder: 1,
},
});

const drinks = await prisma.category.create({
data: {
name: 'Boissons',
description: 'Boissons fraîches',
icon: '',
displayOrder: 2,
},
});

const sides = await prisma.category.create({
data: {
name: 'Accompagnements',
description: 'Frites, salades, etc.',
icon: '',
displayOrder: 3,
},
});

console.log(' Categories created');

// Créer des ingrédients
const ingredients = await prisma.ingredient.createMany({
data: [
{ name: 'Pain burger', unit: 'PIECE', currentStock: 100, minStock: 20, unitCost: 0.5 },
{ name: 'Steak haché', unit: 'GRAM', currentStock: 5000, minStock: 1000, unitCost: 0.01 },
{ name: 'Fromage', unit: 'GRAM', currentStock: 2000, minStock: 500, unitCost: 0.015 },
{ name: 'Salade', unit: 'GRAM', currentStock: 3000, minStock: 500, unitCost: 0.005 },
{ name: 'Tomate', unit: 'GRAM', currentStock: 3000, minStock: 500, unitCost: 0.008 },
{ name: 'Oignon', unit: 'GRAM', currentStock: 2000, minStock: 500, unitCost: 0.006 },
{ name: 'Sauce burger', unit: 'MILLILITER', currentStock: 5000, minStock: 1000, unitCost: 0.003 },
{ name: 'Pommes de terre', unit: 'GRAM', currentStock: 10000, minStock: 2000, unitCost: 0.002 },
{ name: 'Coca-Cola', unit: 'LITER', currentStock: 50, minStock: 10, unitCost: 1.5 },
{ name: 'Fanta', unit: 'LITER', currentStock: 40, minStock: 10, unitCost: 1.5 },
],
});

console.log(' Ingredients created');

// Créer des produits
const burger = await prisma.product.create({
data: {
name: 'Burger Classic',
description: 'Notre burger signature',
price: 5.99,
cost: 2.5,
type: 'FOOD',
categoryId: burgers.id,
preparationTime: 10,
},
});

const cheeseburger = await prisma.product.create({
data: {
name: 'Cheeseburger',
description: 'Burger avec fromage',
price: 6.99,
cost: 2.8,
type: 'FOOD',
categoryId: burgers.id,
preparationTime: 10,
},
});

const fries = await prisma.product.create({
data: {
name: 'Frites',
description: 'Frites croustillantes',
price: 2.99,
cost: 0.8,
type: 'SIDE',
categoryId: sides.id,
preparationTime: 5,
},
});

const cola = await prisma.product.create({
data: {
name: 'Coca-Cola',
description: 'Coca-Cola 33cl',
price: 1.99,
cost: 0.5,
type: 'DRINK',
categoryId: drinks.id,
preparationTime: 1,
},
});

console.log(' Products created');

// Créer des options
const extraCheese = await prisma.option.create({
data: {
name: 'Supplément fromage',
type: 'SUPPLEMENT',
price: 0.5,
},
});

const noCheese = await prisma.option.create({
data: {
name: 'Sans fromage',
type: 'REMOVAL',
price: 0,
},
});

const extraSauce = await prisma.option.create({
data: {
name: 'Sauce en plus',
type: 'SUPPLEMENT',
price: 0.3,
},
});

console.log(' Options created');

// Lier options aux produits
await prisma.productOption.createMany({
data: [
{ productId: burger.id, optionId: extraCheese.id },
{ productId: burger.id, optionId: extraSauce.id },
{ productId: cheeseburger.id, optionId: noCheese.id },
{ productId: cheeseburger.id, optionId: extraSauce.id },
],
});

console.log(' Product options linked');

// Créer des recettes (lien produit -> ingrédients)
const ingredientList = await prisma.ingredient.findMany();
const painBurger = ingredientList.find(i => i.name === 'Pain burger');
const steakHache = ingredientList.find(i => i.name === 'Steak haché');
const fromage = ingredientList.find(i => i.name === 'Fromage');
const salade = ingredientList.find(i => i.name === 'Salade');
const tomate = ingredientList.find(i => i.name === 'Tomate');
const sauceBurger = ingredientList.find(i => i.name === 'Sauce burger');
const pommesDeTerre = ingredientList.find(i => i.name === 'Pommes de terre');
const cocaCola = ingredientList.find(i => i.name === 'Coca-Cola');

if (painBurger && steakHache && salade && tomate && sauceBurger) {
await prisma.recipe.createMany({
data: [
{ productId: burger.id, ingredientId: painBurger.id, quantity: 1 },
{ productId: burger.id, ingredientId: steakHache.id, quantity: 150 },
{ productId: burger.id, ingredientId: salade.id, quantity: 20 },
{ productId: burger.id, ingredientId: tomate.id, quantity: 30 },
{ productId: burger.id, ingredientId: sauceBurger.id, quantity: 20 },
],
});
}

if (painBurger && steakHache && fromage && salade && tomate && sauceBurger) {
await prisma.recipe.createMany({
data: [
{ productId: cheeseburger.id, ingredientId: painBurger.id, quantity: 1 },
{ productId: cheeseburger.id, ingredientId: steakHache.id, quantity: 150 },
{ productId: cheeseburger.id, ingredientId: fromage.id, quantity: 30 },
{ productId: cheeseburger.id, ingredientId: salade.id, quantity: 20 },
{ productId: cheeseburger.id, ingredientId: tomate.id, quantity: 30 },
{ productId: cheeseburger.id, ingredientId: sauceBurger.id, quantity: 20 },
],
});
}

if (pommesDeTerre) {
await prisma.recipe.create({
data: {
productId: fries.id,
ingredientId: pommesDeTerre.id,
quantity: 200,
},
});
}

if (cocaCola) {
await prisma.recipe.create({
data: {
productId: cola.id,
ingredientId: cocaCola.id,
quantity: 0.33,
},
});
}

console.log(' Recipes created');

// Créer des tables
await prisma.table.createMany({
data: [
{ number: 1, capacity: 2 },
{ number: 2, capacity: 4 },
{ number: 3, capacity: 4 },
{ number: 4, capacity: 6 },
{ number: 5, capacity: 2 },
],
});

console.log(' Tables created');

console.log(' Seeding completed successfully!');
}

main()
.catch((e) => {
console.error(' Error seeding database:', e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
