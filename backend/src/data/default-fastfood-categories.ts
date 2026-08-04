/**
 * Catégories fast-food de départ, proposées à l'onboarding d'un nouveau
 * restaurant (option --with-default-categories). Remplace l'ancien
 * add-categories-fastfood.sql (SQL brut, sans restaurantId) : ce tableau est
 * inséré via prisma.category.createMany avec le restaurantId du nouveau
 * restaurant.
 */
export interface DefaultCategory {
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
}

export const DEFAULT_FASTFOOD_CATEGORIES: DefaultCategory[] = [
  { name: 'Burgers', description: 'Nos délicieux burgers faits maison', icon: '🍔', displayOrder: 1 },
  { name: 'Pizzas', description: "Pizzas fraîches à l'italienne", icon: '🍕', displayOrder: 2 },
  { name: 'Tacos', description: 'Tacos mexicains garnis', icon: '🌮', displayOrder: 3 },
  { name: 'Wraps', description: 'Wraps frais et savoureux', icon: '🌯', displayOrder: 4 },
  { name: 'Sandwichs', description: 'Sandwichs variés et copieux', icon: '🥪', displayOrder: 5 },
  { name: 'Paninis', description: 'Paninis chauds et croustillants', icon: '🥖', displayOrder: 6 },
  { name: 'Kebabs', description: 'Kebabs généreux', icon: '🥙', displayOrder: 7 },
  { name: 'Hot-Dogs', description: 'Hot-dogs américains', icon: '🌭', displayOrder: 8 },
  { name: 'Poulet Frit', description: 'Poulet croustillant et doré', icon: '🍗', displayOrder: 9 },
  { name: 'Nuggets & Tenders', description: 'Nuggets et tenders de poulet', icon: '🍗', displayOrder: 10 },
  { name: 'Ailes de Poulet', description: 'Ailes de poulet épicées', icon: '🍗', displayOrder: 11 },
  { name: 'Pâtes', description: 'Pâtes fraîches et sauces maison', icon: '🍝', displayOrder: 12 },
  { name: 'Plats Chauds', description: 'Plats du jour et spécialités', icon: '🍲', displayOrder: 13 },
  { name: 'Grillades', description: 'Viandes et poissons grillés', icon: '🍖', displayOrder: 14 },
  { name: 'Salades', description: 'Salades fraîches et composées', icon: '🥗', displayOrder: 15 },
  { name: 'Végétarien', description: 'Options sans viande', icon: '🥦', displayOrder: 16 },
  { name: 'Bowls', description: 'Bowls santé et équilibrés', icon: '🥣', displayOrder: 17 },
  { name: 'Frites', description: 'Frites croustillantes', icon: '🍟', displayOrder: 18 },
  { name: 'Accompagnements', description: 'Tous nos accompagnements', icon: '🍚', displayOrder: 19 },
  { name: 'Sauces', description: 'Large choix de sauces', icon: '🥫', displayOrder: 20 },
  { name: 'Petit-Déjeuner', description: 'Options petit-déjeuner', icon: '🍳', displayOrder: 21 },
  { name: 'Viennoiseries', description: 'Croissants et pains au chocolat', icon: '🥐', displayOrder: 22 },
  { name: 'Desserts', description: 'Desserts gourmands', icon: '🍰', displayOrder: 23 },
  { name: 'Glaces', description: 'Glaces et sundaes', icon: '🍨', displayOrder: 24 },
  { name: 'Milkshakes', description: 'Milkshakes onctueux', icon: '🥤', displayOrder: 25 },
  { name: 'Pâtisseries', description: 'Gâteaux et douceurs', icon: '🧁', displayOrder: 26 },
  { name: 'Donuts', description: 'Donuts moelleux', icon: '🍩', displayOrder: 27 },
  { name: 'Cookies', description: 'Cookies maison', icon: '🍪', displayOrder: 28 },
  { name: 'Sodas', description: 'Boissons gazeuses', icon: '🥤', displayOrder: 29 },
  { name: 'Jus de Fruits', description: 'Jus naturels et pressés', icon: '🧃', displayOrder: 30 },
  { name: 'Smoothies', description: 'Smoothies fruits frais', icon: '🥤', displayOrder: 31 },
  { name: 'Eaux', description: 'Eaux plates et gazeuses', icon: '💧', displayOrder: 32 },
  { name: 'Boissons Fraîches', description: 'Boissons froides variées', icon: '🧊', displayOrder: 33 },
  { name: 'Cafés', description: 'Cafés et expressos', icon: '☕', displayOrder: 34 },
  { name: 'Thés', description: 'Thés et infusions', icon: '🍵', displayOrder: 35 },
  { name: 'Chocolats Chauds', description: 'Chocolats chauds gourmands', icon: '🍫', displayOrder: 36 },
  { name: 'Menus & Formules', description: 'Menus complets avantageux', icon: '🍱', displayOrder: 37 },
  { name: 'Menu Enfant', description: 'Menus spéciaux pour enfants', icon: '🧒', displayOrder: 38 },
  { name: 'Menu Midi', description: 'Formules déjeuner rapide', icon: '🕐', displayOrder: 39 },
  { name: 'Menu Famille', description: 'Formules pour toute la famille', icon: '👨‍👩‍👧‍👦', displayOrder: 40 },
  { name: 'Snacks', description: 'En-cas et petites faims', icon: '🥨', displayOrder: 41 },
  { name: 'Apéritif', description: 'Planches et tapas', icon: '🧀', displayOrder: 42 },
  { name: 'Extras', description: 'Suppléments et options', icon: '➕', displayOrder: 43 },
];
