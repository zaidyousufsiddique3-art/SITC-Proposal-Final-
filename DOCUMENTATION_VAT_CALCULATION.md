# SITC Proposal System: VAT & Calculation Logic

This document outlines the precise calculation logic used for all services within the SITC Proposal Portal.

## 1. Core Price Calculation

For every service (Hotels, Flights, Transportation, Activities, Custom Items), the system calculates a **Sell Price** based on the input **Net Price** and the configured **Markup**.

### Net Total Calculation
`Total Net = Unit Net Price × Quantity × Duration (Days/Nights)`

### Markup Calculation
The system supports two types of markups:
- **Fixed**: `Markup Amount = Markup Value × Quantity × Duration`
- **Percentage**: `Markup Amount = Total Net × (Markup Value / 100)`

### Sell Price (Before VAT)
`Sell Price = Total Net + Markup Amount`

---

## 2. VAT Calculation Rules

VAT application depends on the **VAT Rule** assigned to the specific service or provider.

### Rule A: Domestic
Applied when the service is subject to full local taxation.
- **VAT Base**: The entire Sell Price.
- **Formula**: `VAT Amount = Sell Price × (VAT Percentage / 100)`
- **Total**: `Grand Total = Sell Price + VAT Amount`

### Rule B: International
Applied to international services where VAT is only applicable to the agency's service fee (Markup).
- **VAT Base**: Only the Markup Amount.
- **Formula**: `VAT Amount = Markup Amount × (VAT Percentage / 100)`
- **Total**: `Grand Total = Sell Price + VAT Amount`
- *Note: In this rule, the Net Price portion remains tax-exempt at the source.*

---

## 3. Service-Specific Application

### Accommodation (Hotels)
- Sums all Room Types, Meeting Rooms, and Dining entries.
- Each Hotel Option can be toggled between **Domestic** and **International**.
- Room totals are calculated as: `Rate × Qty × Nights`.
- Event/Dining totals are calculated as: `Rate × Qty × Days`.

### Flights
- Calculated per Quote (Economy, Business, etc.).
- `Total = (Net per Seat + Markup) + VAT (Rule-based)`.
- Usually set to **International** (VAT on markup only).

### Transportation
- Calculated as: `Net per Day × Qty × Days + Markup + VAT`.
- Markup is applied to the total daily rate.

### Activities & Custom Items
- Calculated as: `Unit Net × Qty × Days + Markup + VAT`.

---

## 4. Summary & Investment Packages
The "Investment Summary" page aggregates these costs into distinct packages based on the Hotel Options.
- **Package Total** = `Hotel Specific Costs` + `Shared Costs (Flights, Transport, etc.)`
- VAT is recalculated at the summary level to ensure precision, summing the individual VAT components of each line item.
