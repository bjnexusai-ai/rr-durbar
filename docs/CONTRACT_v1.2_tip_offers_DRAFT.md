# RR Durbar API contract v1.2 (DRAFT): tip, coupons, points

Status: DRAFT, 27 Oct 2026. Page side built in `public/checkout/v2/index.html` (v2.1, demo mode). API side NOT built.
v1.2 only ADDS optional fields to contract v1.1. A v1.1 server keeps working: the page shows no tip, coupon or points controls in live mode until `/config` announces them.

## 1. Switch-on: `GET /api/config` adds
```json
"features": { "tip": true, "offers": true }
```
Absent or false = v1.1 behaviour (tested: `live v1.1: no tip, coupon or points controls until /config announces them`).

## 2. Money order (one path, server only, integer paise)
1. `subtotal` = sum of lines (Rista prices).
2. `discount` = coupon OR points (one offer per order), server-validated, 0 to subtotal.
3. `GST` = 5% of (subtotal - discount), half up. **Owner and accountant to confirm** that GST is on the discounted amount and that Rista invoices it the same way.
4. `tip` = pct of subtotal (5, 10, 15) or a fixed amount; capped at Rs 500 and 30% of subtotal. Not taxed. 100% to staff.
5. `total` = subtotal - discount + GST + charges + tip. PayU is charged this total.
6. `earnPoints` = floor((subtotal - discount) / 100). No points on tip or tax.
7. Pay at pickup limit (Rs 1000.00, D9) compares the total INCLUDING the tip. **Owner to confirm.**

## 3. `POST /api/quote` adds (optional)
Request: `"tip": { "pct": 5 }` or `"tip": { "paise": 5000 }`; `"offer": { "kind": "coupon", "code": "RR10" }` or `"offer": { "kind": "points", "points": 240 }` (offer needs `Authorization: Bearer`).
Response adds: `discountPaise`, `discountLabel` ("Coupon RR10" / "240 points"), `tipPaise`, `offerError` (customer-safe text; the quote still succeeds without the discount).

## 4. `POST /api/offers` (Bearer) NEW
Request `{ "branch", "items": [{id, qty}] }`. Response:
```json
{ "coupons": [ { "code": "RR10", "title": "10% off", "desc": "...", "eligible": true, "reason": "", "youSavePaise": 6480 } ],
  "points": { "paisePerPoint": 5, "min": 200, "step": 20, "maxPctOfBill": 50 }, "onePerOrder": true }
```
Reelo down: `{ "coupons": [], "points": null }` with HTTP 200 (ordering never blocks on Reelo).

## 5. `POST /api/checkout/start` adds
The same `tip` and `offer` as the quote. Server re-quotes with them; `expectedTotalPaise` must match or `409 quote_mismatch`.
Order stores `tip_paise`, `discount_paise`, `offer_kind`, `offer_ref`. Redemption: reserve at start, commit on PAID (online) or counter settlement (pickup), release on PAYMENT_FAILED / EXPIRED.

## 6. `GET /api/order/status` adds (optional)
`tipPaise`, `discountPaise`, `discountLabel`, `items: [{name, qty}]` so the confirmed page can show them after the PayU return.

## 7. Database (migration 0003, API repo)
Migration 0001 has `CHECK (total_paise = subtotal_paise + tax_paise + charges_paise)`: a tip or discount order would be REFUSED by the database today. 0003 must rebuild `orders` (SQLite cannot alter a CHECK) with `tip_paise`, `discount_paise` and
`CHECK (total_paise = subtotal_paise - discount_paise + tax_paise + charges_paise + tip_paise)`, plus a `redemptions` table (order_id, kind, ref, amount_paise, state reserved|committed|released). Test it on a copy of real D1 first.

## 8. Blocked on
- Reelo: R1 (online redemption yes or no), coupon list API, reserve and release (Revert Points docs missing), real point value. Demo uses placeholders: RR10, FLAT75, FEAST20, DIWALI25 (expired), 1 point = Rs 0.05, min 200, step 20, max 50% of the bill.
- Owner: tip on or off, tip limits, GST on the discounted amount, pay-at-pickup limit with tip, stacking (one offer per order assumed).

## 9. Tests
`python3 tools/checkout-v2/uitest.py`: 49 checks (38 earlier plus 11 for tip, coupons, points, the confirmed page and the live v1.1 guard).
