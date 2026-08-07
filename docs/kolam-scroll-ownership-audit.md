# Kolam Scroll Ownership Audit

Date: 2026-08-07

## Rule

Only routes with their own bounded page scroll may disable the shell `ScrollView`.
Mapped-table pages must stay on the shell `ScrollView` because `KolamListTableComposition`
renders rows directly with `rows.map(...)` and is not a page scroll owner.

## Owned-Scroll Routes

These routes may return `true` from `isCatalogTableListRoute`:

- `/` - Beranda owns page scrolling through `KolamDetailScrollSurface`.
- `/cashflow-session` - list body owns scrolling through `FlatList`.

## Shell-Scroll Routes

These pilot routes must return `false` from `isCatalogTableListRoute`:

- `/species`
- `/products`
- `/products/archive`
- `/stock-transaction`
- `/customers`
- `/list-of-users`
- `/payable`
- `/receivable`
- `/commissions`
- `/finance/payroll`
- `/finance/bonus`
- `/media`

Additional audited mapped-table/detail routes that also stay on shell `ScrollView`:

- `/stock-transaction?productId=abc`
- `/stock-transaction/tx-1`
- `/suppliers`
- `/purchase-order`
- `/purchase-order/create`
- `/purchase-order/po-1`
- `/production`
- `/production/create`
- `/production/prod-1`
- `/product-serials`
- `/sales`
- `/raw-materials`
- `/raw-materials/create`
- `/stock-opname`
- `/finance`
- `/finance/abc123`
- `/wallet`
- `/wallet/w1`
- `/routine-expenses`
- `/unexpected-expense`
- `/unexpected-income`
- `/asset-purchase`
- `/finance/tax`
- `/finance/settings/tax-profile`
- `/finance/payroll/2026-08`
- `/payable/p1`
- `/cashflow-session/create`
- `/cashflow-session/session-1`
- `/pengaturan`
- `/teranura`
- `/packing-materials`

## Verification

Primary guards:

- `__tests__/kolam-catalog-table-list-route.test.ts`
- `__tests__/kolam-app-shell-surface-component.test.tsx`
- `__tests__/kolam-list-table-composition-component.test.tsx`

Pilot domain/API tests used during the audit:

- `__tests__/kolam-stock-transaction-list.test.ts`
- `__tests__/kolam-stock-transaction-detail.test.ts`
- `__tests__/kolam-stock-transaction-opname.test.ts`
- `__tests__/kolam-species-list-pagination.test.ts`
- `__tests__/kolam-customer-controller-hook.test.tsx`
- `__tests__/kolam-payable.test.ts`
- `__tests__/kolam-receivable.test.ts`
- `__tests__/kolam-payroll-bonus-tax.test.ts`
- `__tests__/kolam-media-domain.test.ts`
- `__tests__/kolam-media-api.test.ts`

Runtime confirmation after app reload is still required for each pilot page.
