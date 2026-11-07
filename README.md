# 🌾 SMART FARM MANAGER (स्मार्ट फार्म मॅनेजर)
### Complete Full-Stack Web Application for 20-Acre Agricultural Land

**SMART FARM MANAGER** is a production-ready, full-stack farm management system specifically architected for a 20-acre family farm in Maharashtra cultivating **Sugarcane (ऊस), Wheat (गहू), and Onion (कांदा)**.

Designed mobile-first with high-contrast large touch targets for Android phones (main user: Father) and laptops.

---

## 🌟 Key Capabilities & Features

### 1. Farm Information & Land Allocation (20 Acres)
- **20-Acre Strict Enforcement**: Enforces a digital boundary preventing total active plot area from exceeding 20.0 acres.
- **Flexible Digital Plot Creation**: Add, edit, and digitally divide farm land into plots with soil types (Black Cotton, Red, Alluvial, Loamy) and crop assignments.
- **Cultivation History**: Complete crop rotation and plot lifecycle tracking.

### 2. Crop Management
- Specialized tracking for **Sugarcane (ऊस)**, **Wheat (गहू)**, and **Onion (कांदा)**.
- Sowing dates, estimated harvest dates, and real-time days elapsed / days remaining progress bars.
- Growth stages: Germination, Vegetative, Flowering/Bulbing, Maturity, and Harvesting.
- Fertilizer and chemical application logging with automatic synchronization to farm expenses.
- Target yield vs. actual yield performance indicators.

### 3. Worker & Daily Wage Management (10+ Workers)
- Complete directory of farm workers with daily wages (₹350, ₹400, ₹500).
- **Daily Attendance Calendar**: One-touch attendance marking (हजर / Present, गैरहजर / Absent, अर्धा दिवस / Half-day).
- **Cash Advance (उचल) Logging**: Record advance payments taken by workers.
- **Automated Wage Calculation**: `(Days Worked × Daily Wage) - Advances - Payouts = Net Pending Wages`.
- **Wage Settlement / Payouts**: Record cash / UPI wage disbursements and automatically add them to farm finance statements.
- **Excel Export**: 1-click export of the worker wage and attendance sheet (`.xlsx`).

### 4. Daily Farm Tasks
- Create work instructions, assign one or more workers, set deadlines, and configure priorities (Urgent, Medium, Low).
- Track pending, in-progress, and completed states.

### 5. Irrigation & Water Management
- **Canal Water (कालवा पाणी)**: Schedule arrival tracking (expected vs. actual dates, discharge cusecs, notes).
- **Water Pump Controller**: Start/stop time logger for well/borewell submersible pumps (Kirloskar 7.5 HP).
- Energy tracking: Electricity units (MSEDCL) and diesel liters / diesel expenses with auto-logging to finances.
- Next watering reminder alerts.

### 6. Finance Management & Reports
- Categorized Income & Expenses: Labour wages, Fertilizers & Chemicals, Seeds, Machinery & Fuel, Electricity & Water, Transport, Sugarcane Factory Slips, Onion Mandi Sales, Wheat Grain.
- Real-time Profit & Loss statement (Total Revenue, Total Expenses, Net Profit, Profit Margin %).
- Interactive Recharts visual breakdown.
- **Export Reports**: Instant **PDF Financial Statement** and **Excel Spreadsheet (.xlsx)** generation.

### 7. Farm Machinery & Equipment
- Equipment logs for Tractors (Mahindra 575 DI), Pumps, Rotavators, and Battery Sprayers.
- Maintenance history, diesel refills, and upcoming service due reminders.

### 8. Crop Health & Diagnosis
- Upload crop photos and record observed symptoms.
- Diagnosis guidance for Sugarcane Shoot Borer, Onion Purple Blotch/Thrips, and Wheat Rust.
- Prominent **Agricultural Expert Advisory Recommendation** and Kisan Call Center helpline (1800-180-1551).

### 9. Harvest & Crop Sales
- Record harvest dates, sold quantities, rates per unit, and total sale values.
- Buyer details, payment received, and outstanding pending balances.
- Auto-syncs received revenue with farm finance statements.

### 10. Live Weather Integration
- Integrated Open-Meteo satellite weather API (temperature, relative humidity, wind velocity, rainfall probability).
- 7-Day agricultural forecast.
- Automated weather advisories for rain, heatwaves, and spraying windows.

---

## 🌐 Multilingual System (Default: Marathi)

Supports 3 complete languages with a persistent switcher in the header:
1. **Marathi (मराठी) - Default** (`src/locales/mr.json`)
2. **Hindi (हिंदी)** (`src/locales/hi.json`)
3. **English** (`src/locales/en.json`)

Language preferences are automatically saved in local state and synchronized to the user's Supabase database profile.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 19, TypeScript, Tailwind CSS, React Router v7, Recharts, i18next, Lucide React, jsPDF, XLSX.
- **Backend**: Supabase, PostgreSQL, Supabase Authentication, Supabase Storage (`farm-media`), Row Level Security (RLS).
- **Dual-Engine Architecture**: Operates in cloud-connected mode when Supabase credentials are configured, with automatic local offline-sync fallback so the app works seamlessly even in remote fields with intermittent connectivity.
- **Deployment**: Frontend to Vercel, Backend to Supabase.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
# Navigate to project directory
cd smart-farm-manager

# Start Vite dev server with network access for mobile testing
npm run dev -- --host
```
Open `http://localhost:5173` on your laptop, or use the displayed LAN IP on your Android phone connected to the same Wi-Fi.

### 2. Connect Supabase Backend
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the contents of [`supabase/schema.sql`](file:///C:/Users/Admin/.gemini/antigravity/scratch/smart-farm-manager/supabase/schema.sql).
4. (Optional) Run [`supabase/seed.sql`](file:///C:/Users/Admin/.gemini/antigravity/scratch/smart-farm-manager/supabase/seed.sql) to populate realistic 20-acre farm data.
5. In the app header, click the **Database Status Pill** and enter your `Project URL` and `Anon Key`.

### 3. Deploy to Vercel
1. Push this repository to GitHub or upload to Vercel.
2. In Vercel Project Settings, add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! The included `vercel.json` ensures client-side routing works flawlessly.
