// node --test tools/sitegate/menu-snapshot.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { toKitFormat } from './menu-snapshot.mjs';

test('maps categories, dishes, variants and prices into the kit format', () => {
  const menu = { categories: [
    { name: 'Biryani', items: [
      { id: 'd1', name: 'Chicken Dum Biryani', variants: [{ id: 'v1', label: 'Regular' }, { id: 'v2', label: 'Family' }] },
      { id: 'd2', name: 'Veg Butta Biryani' },
    ] },
    { name: 'Empty', items: [] },
  ] };
  const out = toKitFormat(menu, { prices: { v1: 349, v2: 699, d2: 279 } });
  assert.equal(out.food.length, 1);
  assert.equal(out.food[0].title, 'Biryani');
  assert.deepEqual(out.food[0].items[0], { name: 'Chicken Dum Biryani', variants: [{ name: 'Regular', price: 349 }, { name: 'Family', price: 699 }] });
  assert.deepEqual(out.food[0].items[1], { name: 'Veg Butta Biryani', price: 279 });
  assert.equal(out.priced, 2);
});

test('a dish with no price is kept with price 0 so the gate shows it', () => {
  const out = toKitFormat({ categories: [{ name: 'Starters', items: [{ id: 'x', name: 'Crispy Corn' }] }] }, {});
  assert.equal(out.food[0].items[0].price, 0);
  assert.equal(out.priced, 0);
});

test('an unknown shape is reported, not guessed', () => {
  assert.match(toKitFormat({ dishes: [] }, {}).error, /no categories/);
});
