// RR Durbar pages and their sections, exactly as the live site shows them today (the route map inside public/index.html,
// read 26 Oct 2026). One source of truth for the Studio (which sections an editor may fill) and for tools/cms (validation).
// When the page split (Phase 3) changes a page, change it HERE first.
// 'catering-serve', 'purpose' and 'cta' are in the site's route map but no element has those ids (26 Oct check), so they are left out here.
export const ROUTES = {
  home: { title: 'Home', sections: ['home', 'bestsellers', 'menu', 'trust', 'honours', 'reviews', 'gallery', 'loyalty', 'outlets'] },
  'about-us': { title: 'About us', sections: ['about', 'story', 'foundation', 'family', 'why-us', 'about-sig', 'about-go', 'promise-green', 'stats', 'awards', 'reels'] },
  menu: { title: 'Menu', sections: ['menu-page'] },
  'order-now': { title: 'Order now', sections: ['ordering'] },
  pickup: { title: 'Pickup', sections: ['pickup'] },
  'pickup-menu': { title: 'Pickup menu', sections: ['pickup-menu'] },
  branches: { title: 'Branches', sections: ['br-locator', 'br-list'] },
  locations: { title: 'Locations (to merge into Branches, plan 3.1)', sections: ['locations'] },
  catering: { title: 'Catering', sections: ['catering', 'catering-occasions', 'catering-why', 'catering-gallery', 'catering-cta'] },
  contact: { title: 'Contact', sections: ['contact'] },
  loyalty: { title: 'Loyalty Program (new page, plan 9.4)', sections: ['loyalty'] },
  'track-order': { title: 'Track order', sections: ['track-order', 'tracking'] },
  policies: { title: 'Policies', sections: ['policies'] },
  'privacy-policy': { title: 'Privacy policy', sections: ['pol-privacy'] },
  'terms-of-service': { title: 'Terms of service', sections: ['pol-terms'] },
  'refund-cancellation': { title: 'Refund and cancellation', sections: ['pol-refund'] },
};
// Order pages stay out of Google (plan 3.5).
export const NOINDEX_ROUTES = ['order-now', 'pickup', 'pickup-menu', 'track-order'];
// Ordering outlets: website slug -> Rista branch code. Patamatalanka (PL) is call-to-order only. PA and HO are never on the site.
export const OUTLETS = { singhnagar: 'SN', moghalrajpuram: 'MR', bhavanipuram: 'BH', poranki: 'PO', autonagar: 'AT', patamatalanka: 'PL' };
export const LEGAL_KINDS = { privacy: 'privacy-policy', terms: 'terms-of-service', refund: 'refund-cancellation' };
