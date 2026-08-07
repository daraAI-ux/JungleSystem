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
