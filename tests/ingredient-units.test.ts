import test from "node:test";
import assert from "node:assert/strict";
import { convertIngredient } from "../lib/ingredient-units.ts";

test("converts metric weights into cook-friendly pounds and ounces", () => {
  assert.equal(convertIngredient("600g chicken", "imperial"), "1 lb 5¼ oz chicken");
  assert.equal(convertIngredient("1kg potatoes", "imperial"), "2 lb 3¼ oz potatoes");
  assert.equal(convertIngredient("50g butter", "imperial"), "1¾ oz butter");
});

test("converts metric liquids into UK fluid ounces", () => {
  assert.equal(convertIngredient("850ml whole milk", "imperial"), "30 fl oz whole milk");
  assert.equal(convertIngredient("150ml double cream", "imperial"), "5¼ fl oz double cream");
});

test("uses supplied metric amounts instead of duplicating cup or spoon measures", () => {
  assert.equal(convertIngredient("1 cup (240ml) whole milk", "metric"), "240ml whole milk");
  assert.equal(convertIngredient("3 tbsp (45g) butter", "metric"), "45g butter");
  assert.equal(convertIngredient("½ cup (50g) Cheddar", "metric"), "50g Cheddar");
});

test("converts cups to metric volume when no verified weight is supplied", () => {
  assert.equal(convertIngredient("3 cups long-grain rice", "metric"), "720ml long-grain rice");
  assert.equal(convertIngredient("⅓ cup vegetable oil", "metric"), "80ml vegetable oil");
});

test("keeps spoon measures and ingredients without quantities unchanged", () => {
  assert.equal(convertIngredient("2½ tablespoons oil", "metric"), "2½ tablespoons oil");
  assert.equal(convertIngredient("Freshly grated nutmeg", "imperial"), "Freshly grated nutmeg");
});
