export const CATEGORIES = [
  'fashion',
  'beauty',
  'lifestyle',
  'handmade',
  'fitness',
  'food',
  'coffee',
  'bakery',
  'jewelry',
  'accessories',
  'home decor',
  'art',
  'books',
  'electronics',
  'wellness',
  'skincare',
  'kids',
  'pets',
  'flowers',
  'sports',
  'stationery',
  'gifts',
  'furniture',
  'other',
];

export function formatCategory(category) {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
