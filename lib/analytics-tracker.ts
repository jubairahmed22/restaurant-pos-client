'use client';

// ─── Conversion event tracker ─────────────────────────────────────────────────
// Pushes to window.dataLayer (GTM-compatible) and fires Meta Pixel if loaded.
// No third-party SDK required — fires with whatever tags you configure in GTM.

type EventName =
  | 'view_item_list'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'payment_failed'
  | 'reservation_start'
  | 'reservation_success'
  | 'reservation_failed'
  | 'page_view';

interface EventProps {
  value?:       number;
  currency?:    string;
  items?:       { item_id: string; item_name: string; price: number; quantity: number }[];
  order_id?:    string;
  payment_type?: string;
  category?:    string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: object[];
    fbq?:       (...args: unknown[]) => void;
  }
}

export function trackEvent(event: EventName, props: EventProps = {}): void {
  if (typeof window === 'undefined') return;

  const payload = { event, currency: 'AUD', ...props };

  // Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  // Meta Pixel (fires standard events if fbq is loaded via GTM or script tag)
  if (typeof window.fbq === 'function') {
    const metaMap: Partial<Record<EventName, string>> = {
      view_item_list:  'ViewContent',
      add_to_cart:     'AddToCart',
      begin_checkout:  'InitiateCheckout',
      add_payment_info:'AddPaymentInfo',
      purchase:        'Purchase',
      reservation_success: 'Lead',
    };
    const metaEvent = metaMap[event];
    if (metaEvent) {
      const metaData: Record<string, unknown> = { currency: 'AUD', value: props.value };
      if (props.items) metaData.contents = props.items.map(i => ({ id: i.item_id, quantity: i.quantity }));
      window.fbq('track', metaEvent, metaData);
    }
  }
}

// Convenience helpers
export const track = {
  pageView: () => trackEvent('page_view'),

  addToCart: (item: { _id: string; title?: string; name?: string; price: number }, qty: number) =>
    trackEvent('add_to_cart', {
      value: item.price * qty,
      items: [{ item_id: item._id, item_name: item.title ?? item.name ?? '', price: item.price, quantity: qty }],
    }),

  beginCheckout: (total: number, itemCount: number) =>
    trackEvent('begin_checkout', { value: total, items: [{ item_id: 'cart', item_name: 'Cart', price: total, quantity: itemCount }] }),

  purchase: (orderId: string, total: number, paymentType: string) =>
    trackEvent('purchase', { order_id: orderId, value: total, payment_type: paymentType }),

  paymentFailed: (reason: string) =>
    trackEvent('payment_failed', { reason }),

  reservationStart: () =>
    trackEvent('reservation_start'),

  reservationSuccess: (people: number) =>
    trackEvent('reservation_success', { value: 0, category: 'reservation', items: [{ item_id: 'reservation', item_name: 'Table Reservation', price: 0, quantity: people }] }),

  reservationFailed: (reason: string) =>
    trackEvent('reservation_failed', { reason }),
};
