# Auto Express Ireland: Unified Stock & Garage Manager

## 🏁 Project Overview
Auto Express Ireland is a sophisticated, unified platform for managing vehicle stock, garage service operations, and financial tracking. Built with a **"Lux-Industrial"** aesthetic, it targets operational efficiency through a strict attribution system.

## 🛠 Tech Stack
- **Frontend**: React 18+ (Vite)
- **Styling**: Vanilla CSS with custom design tokens and class-based glassmorphism.
- **State**: Centralized React Context (`AppContext`).
- **Icons & Motion**: Lucide React & Framer Motion.

## 🔑 Core Features & Security
### 1. The Representative Gate (`RepGate`) [KI-002]
- **Purpose**: Solves the "Amanda Problem" by requiring a `rep_code` before any transaction or status change.
- **Session Contract**: No "Write" action (Insert/Update) without a valid `rep_code` in metadata.
- **UI Gate**: A full-screen `RepGate` blocks access on launch until a rep is authorized.
- **RLS Policy**: Supabase policies reject transactions where `rep_code` doesn't match session JWT.
- **Accountability**: 
    - Every row in `deals`, `payments`, and `finance_apps` must carry the `rep_code`.
    - Payments cannot be deleted. They can only be **"Voided"** with a `void_reason` and a `rep_code` stamp.

### 2. Stock Management (`StockDashboard`)
- Real-time tracking of vehicle inventory.
- Integration with the "Stock Bridge" for moving vehicles through the lifecycle.

### 3. Garage Services (`GarageDashboard`)
- Tracking service tasks and repair progress.
- Linkage between service costs and stock value.

### 4. Finance Waterfall (`FinanceWaterfall`)
- Advanced visualization of revenue streams and performance.
- **[KI-001] Lender Application Sequence**: 
    - **Logic**: Enforced sequence: Finance Ireland → Close Brothers → Finance4U.
    - **UI Enforcements**: Lender (N+1) is strictly "Locked" (blurred/disabled) until Lender (N) is "Declined".
    - **Approval Path**: Approving a lender unlocks `approved_amount` entry, updating the Glass Card Balance Due.
    - **The Dead End**: If Finance4U returns "Declined", the deal is flagged as `unfinanceable: true`.
    - **DB Enforcement**: `check_waterfall_order()` ensures sequential integrity.

## 🎨 Design System (KI-003)
The app follows the **"Lux-Industrial Dark Mode"** aesthetic with high-precision UI standards:

- **Base Theme**: `Midnight Navy` (#020617).
- **Surface**: Glassmorphic cards with `backdrop-blur: 16px` and `1px solid rgba(255,255,255,0.1)`.
- **Semantic Accents**:
    - 🟠 **Amber (#f59e0b)**: Pending actions, Balance Due > 0, Financial inputs.
    - 🟢 **Teal (#14b8a6)**: Completed steps, Balance Due = 0, Success states.
    - 🔴 **Rose (#f43f5e)**: Declined lenders, Unfinanceable deals, Overpayments.
- **Typography**: Strictly **Monospaced** for VINs, Registration plates, and Currency values.
- **Motion**: `300ms ease-out` transitions for waterfall unlocks and number-roll animations.

## 🚀 Getting Started
1. `npm install`
2. `npm run dev`
3. Enter a `rep_code` (e.g., `REP001`) to access the dashboard.
