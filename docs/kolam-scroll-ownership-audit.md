# Kolam Scroll Ownership Audit

Date: 2026-08-07

## Rule

`src/domain/kolam-workspace-scroll.ts` is the source of truth for workspace
scroll policy. Only routes with their own bounded page scroll may disable the
shell `ScrollView`. Mapped-table pages must stay on the shell `ScrollView`
because `KolamListTableComposition` renders rows directly with `rows.map(...)`
and is not a page scroll owner.

`KolamAppShellSurface` provides this policy to workspace content.
`KolamDetailScrollSurface` follows the policy: when the shell owns page
scrolling, detail/form pages render a native content wrapper instead of nesting
another page `ScrollView`.

## Owned-Scroll Routes

These routes may return `true` from `isCatalogTableListRoute`:

- `/` - Beranda owns page scrolling through `KolamDetailScrollSurface`.
- `/app-downloads` - Download aplikasi owns page scrolling through
  `KolamDetailScrollSurface`.
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

Runtime confirmation:

- `/species` - confirmed in the running Windows app after resizing the
  JungleSystem window to force vertical overflow. Wheel scroll moved the list
  from top rows to lower rows; screenshot diff sampled 22,781 pixels with
  1,802 changed pixels (7.91%). Evidence images:
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\species-small-before.png`
  and
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\species-small-after.png`.
- `/products` - confirmed in the running Windows app after navigating through
  the sidebar, resizing the JungleSystem window to force vertical overflow, and
  sending wheel scroll over the workspace. Screenshot diff sampled 22,781
  pixels with 1,579 changed pixels (6.93%). Evidence images:
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\product-small-before.png`
  and
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\product-small-after.png`.
- `/stock-transaction` - confirmed in the running Windows app after navigating
  through the sidebar, resizing the JungleSystem window to force vertical
  overflow, and sending wheel scroll over the workspace. Screenshot diff
  sampled 22,781 pixels with 2,080 changed pixels (9.13%). Evidence images:
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\stock-transaction-small-before.png`
  and
  `E:\Data\Dunia-Anura\temp.script\scroll-runtime\stock-transaction-small-after.png`.

Runtime confirmation after app reload is still required for the other pilot
pages.

Runtime gaps from the Windows app probe:

- `/media` - navigation through the top-nav Media library button worked, but
  two wheel/PageDown probes produced 0.00% screenshot diff. The captured page
  did not visibly move, so this is inconclusive and is not counted as a pass.
- `/customers` - sidebar text was visible during the probe, but UI Automation
  click/selection and physical coordinate clicks did not reliably activate the
  route from the current scrolled sidebar state.
- Finance pilots (`/payable`, `/receivable`, `/commissions`,
  `/finance/payroll`, `/finance/bonus`) - the visible runtime sidebar exposed
  `Ringkasan Keuangan`, `Dompet`, `Pengeluaran & Pemasukan`, and
  `Payroll & Tax`, but not the individual pilot routes as directly selectable
  items during this probe.
