import { Response, expect } from '@playwright/test';
import { cents, json } from './network';

export type Product = {
  id: string;
  name: string;
  price: number;
};

export type Selection = {
  product: Product;
  quantity: number;
};

type Cart = {
  id: string;
  cart_items: {
    product_id: string;
    quantity: number;
    product: Product;
  }[];
};

export type Invoice = {
  id: string;
  invoice_number: string;
  subtotal: number;
  total: number;
};

export type PostcodeLookup = {
  street?: string;
  city?: string;
  state?: string;
};

export async function assertAddToCartResponse(response: Response): Promise<void> {
  const addToCartBody = await json<{ result: string }>(response, 200);
  expect(addToCartBody.result).toBe('item added or updated');
}

export async function assertCartResponse(
  response: Response,
  cartId: string,
  selections: Selection[],
): Promise<{ cart: Cart; totalCents: number }> {
  const cart = await json<Cart>(response, 200);
  expect(cart.id).toBe(cartId);

  let totalCents = 0;
  for (const { product, quantity } of selections) {
    const item = cart.cart_items.find((i) => i.product_id === product.id);
    expect(item, `Cart item not found for ${product.name}`).toBeDefined();
    expect(item!.quantity).toBe(quantity);
    expect(cents(item!.product.price)).toBe(cents(product.price));

    totalCents += cents(product.price) * quantity;
  }

  return { cart, totalCents };
}

export async function assertPostcodeLookupResponse(response: Response): Promise<PostcodeLookup> {
  return json<PostcodeLookup>(response, 200);
}

export async function assertPaymentCheckResponse(
  response: Response,
  paymentMethod: string,
): Promise<{ message: string }> {
  expect(response.request().postDataJSON()).toEqual({
    payment_method: paymentMethod,
    payment_details: {},
  });

  const paymentBody = await json<{ message: string }>(response, 200);
  expect(paymentBody.message).toBe('Payment was successful');
  return paymentBody;
}

export async function assertInvoiceResponse(
  response: Response,
  expected: {
    billing: Record<string, unknown>;
    cartId: string;
    guestEmail: string;
    guestFirstName: string;
    guestLastName: string;
    paymentMethod: string;
    totalCents: number;
  },
): Promise<Invoice> {
  const invoicePayload = response.request().postDataJSON();
  expect(invoicePayload).toMatchObject({
    ...expected.billing,
    cart_id: expected.cartId,
    guest_email: expected.guestEmail,
    guest_first_name: expected.guestFirstName,
    guest_last_name: expected.guestLastName,
    payment_method: expected.paymentMethod,
  });

  const invoice = await json<Invoice>(response, 201);
  expect(invoice.id).toBeTruthy();
  expect(invoice.invoice_number).toMatch(/^INV-\d+$/);
  expect(cents(invoice.subtotal)).toBe(expected.totalCents);
  expect(cents(invoice.total)).toBe(expected.totalCents);

  return invoice;
}
