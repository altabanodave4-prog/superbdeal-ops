# Modules Documentation (Updated for v0.1.0 refactor)

> **Architecture note:** Domain state and actions now live in `src/store/appStore.ts` (Zustand).
> Navigation is URL-based via React Router (`src/types/views.ts`). `App.tsx` is a thin shell.
> Child components still accept props for compatibility; migrate them to `useAppStore()` over time.

---

# Superbdeal Corp - Operations Workstation
## Project Module & Function Documentation

This document explains every module, file, and function in the project in simple words.

---

## 1. Main Entry Point & Core Application

### `src/main.tsx`
- **What it does**: This is the starting point of the entire web application. It mounts React and loads the app into the `index.html` page in the browser.

### `src/App.tsx` (Main Hub & State Manager)
- **What it does**: This is the "brain" of the application. It holds all the live data in memory (tires, orders, bookings, quotes) and coordinates what screen the user is looking at.

#### Functions inside `App.tsx`:
1. **`triggerToast(message)`**:
   - **What it does**: Shows a blue popup banner at the top of the screen to give the user quick feedback (for example: *"Bay slot scheduled"* or *"Copied to clipboard"*), then automatically hides it after 3.5 seconds.
2. **`handleCopyCustomerTrackingLink(query)`**:
   - **What it does**: Generates the live tracking link (e.g., `https://track.superbdeal.com/status/...`) and copies it to your clipboard so staff can paste it into Viber or SMS for the car owner.
3. **`handleAddToQuote(product)`**:
   - **What it does**: Adds a selected tire into the Corporate Fleet Quotation list. If the tire is already in the quote, it increases the quantity.
4. **`handleUpdateQuoteQuantity(productId, quantity)`**:
   - **What it does**: Changes the number of tires for an item already listed in the fleet quote.
5. **`handleRemoveQuoteItem(productId)`**:
   - **What it does**: Removes a specific tire from the fleet quotation list.
6. **`handleBookInstallation(product)`**:
   - **What it does**: Opens the appointment booking popup with the chosen tire pre-selected for walk-in or phone customers.
7. **`handleConfirmBooking(bookingData)`**:
   - **What it does**: Creates a new appointment with a unique reference number (e.g., `APPT-QC-1024`), saves it to the Bay schedule, and closes the popup.
8. **`handleApproveOrder(orderId)`**:
   - **What it does**: Marks a customer's bank deposit slip as verified, updates its status, and generates a QuickBooks sync reference ID.
9. **`handleRejectOrder(orderId, reason)`**:
   - **What it does**: Rejects an invalid or fake deposit slip, records the explanation (e.g., *"Blurry receipt"* or *"Reference number not found"*), and changes the order status to "Payment Proof Rejected".
10. **`handleUpdateBookingStatus(bookingId, newStatus)`**:
    - **What it does**: Moves a vehicle through the shop workflow:
      - `Waiting for Arrival` &rarr; `Vehicle in Bay` &rarr; `Installation Complete` &rarr; `Completed`.

---

## 2. Staff Workstation Components (`src/components/`)

### `src/components/SalesDeskView.tsx` (Frontline Sales Counter)
- **What it does**: Designed for frontline counter staff answering walk-ins and phone calls. It allows staff to find tires in 3 seconds, check wholesale costs vs. retail price, and build ready-to-paste Viber quotes.

#### Key Functions & Logics:
1. **Search & Filter Engine**:
   - **What it does**: Instantly filters the tire list by size (width/profile/rim), vehicle model (e.g., Fortuner, Hilux), tire brand (Michelin, Yokohama, etc.), or terrain type (All-Terrain, Highway).
2. **Dealer Profit & Margin Calculation**:
   - **What it does**: Takes the selling price and wholesale cost, subtracts 12% BIR VAT, and shows the exact peso margin and profit percentage for the company.
3. **`handleCopyViberQuote(product, quantity)`**:
   - **What it does**: Generates a professional, complete quotation message formatted with tire specs, prices, warranty details, free services (3D alignment, mounting, balancing), and the customer tracking link, then copies it to the clipboard.
4. **`handleCopyViberShort(product, quantity)`**:
   - **What it does**: Generates a compact 2-line quick price summary for rapid chat replies.

---

### `src/components/AdminDashboard.tsx` (Bay Dispatch Terminal & Payment Audit)
- **What it does**: Combines two crucial operations:
  1. **Service Bay Terminal**: Mechanics & advisors managing Bay 1 (Hunter 3D Alignment) and Bay 2 (Corghi Mounting).
  2. **Payment Audit Desk**: Finance staff checking BDO/BPI/GCash deposit receipts side-by-side with claimed orders.

#### Key Functions & Logics:
1. **`setActiveTab(tab)`**:
   - **What it does**: Switches between the "Service Bays" view and the "Payment Audit" queue.
2. **`handleAdvanceStatus(bookingId, currentStatus)`**:
   - **What it does**: One-click button for mechanics to advance a car to the next step (e.g., clicking "Start Alignment" changes status from *Waiting* to *In Bay*).
3. **`handleCreateWalkinBooking(walkinData)`**:
   - **What it does**: Allows shop staff to quickly book an unexpected walk-in car into an open bay slot immediately.
4. **Deposit Slip Verification (`handleApprove` / `handleReject`)**:
   - **What it does**: Accounting checks the uploaded bank receipt image, verifies the transaction reference number, and either approves it to QuickBooks or rejects it.
5. **Zoom Proof Modal**:
   - **What it does**: Lets staff click on any bank slip image to inspect dates, amounts, and bank stamps in full size.

---

### `src/components/B2BQuoteView.tsx` (Corporate Fleet Procurement)
- **What it does**: For corporate fleet accounts (logistics companies, taxi operators, company fleets). It calculates bulk order volume pricing and generates printable quotations.

#### Key Functions & Logics:
1. **Volume Discount Engine (`getVolumeDiscountTier`)**:
   - **What it does**: Automatically calculates volume discounts:
     - 12–23 tires: **5% bulk discount**.
     - 24+ tires: **10% commercial fleet discount**.
2. **VAT Breakdown Calculation**:
   - **What it does**: Separates the total into the Net-of-VAT amount and 12% Philippine VAT for official BIR corporate reporting.
3. **PDC Terms Selector**:
   - **What it does**: Allows setting payment terms: **30-Day Post-Dated Check** or **60-Day Post-Dated Check**.
4. **`handlePrintQuote()`**:
   - **What it does**: Launches the browser's print dialog to print or save a clean, official PDF quotation for the corporate client.

---

### `src/components/BookingModal.tsx` (Appointment Scheduler)
- **What it does**: A popup form used by counter staff to schedule vehicle service in Bay 1 or Bay 2.

#### Key Functions & Logics:
1. **Double-Booking Prevention**:
   - **What it does**: Checks existing appointments so staff cannot accidentally book the same bay at the same time slot on the same date.
2. **Service Add-ons**:
   - **What it does**: Lets staff toggle services included with the installation:
     - Computerized 3D 4-Wheel Alignment (Hunter Hawkeye)
     - High-Speed Spin Wheel Balancing
     - Rubber Tire Valves Replacement
     - Nitrogen Gas Fill
3. **Form Validation & Submission**:
   - **What it does**: Ensures plate number, customer name, and contact details are filled out before saving the appointment.

---

### `src/components/Header.tsx` (Navigation Bar)
- **What it does**: The top control bar for internal staff.
- **Key Elements**:
  - **Workstation Switcher**: Lets staff switch with one click between **Sales Desk**, **Service Bays**, **Payment Audit**, and **Fleet Quotes**.
  - **Live Badges**: Shows active counters (e.g., number of cars in the bays right now, or number of unverified bank slips waiting for finance).
  - **Staff Shift Tag**: Confirms the user is working on the internal workstation at the Quezon City Hub.

---

### `src/components/DesignSystemView.tsx` (Brand & Design Spec)
- **What it does**: An internal reference page documenting the visual design tokens:
  - Color palette (pure black `#000000`, zinc grays, and electric blue `#2563eb`).
  - Typography scale (Plus Jakarta Sans and JetBrains Mono).
  - Button styles, badges, and container standards.

---

## 3. Utility & Helper Functions (`src/utils.ts`)

This file contains simple helper functions used across the whole application:

1. **`formatPHP(amount: number): string`**:
   - **What it does**: Takes a raw number like `8500` and converts it into formatted Philippine currency: `₱8,500.00`.
2. **`calculateVatBreakdown(totalWithVat: number)`**:
   - **What it does**: Uses the official Philippine 12% VAT formula:
     - `netOfVat = total / 1.12`
     - `vatAmount = total - netOfVat`
     - Returns both numbers so invoices and quotes can display the exact VAT breakdown.
3. **`getVolumeDiscountTier(totalUnits: number)`**:
   - **What it does**: Determines if a fleet order qualifies for a wholesale discount based on unit count (10% for 24+ units, 5% for 12–23 units).

---

## 4. Data Layer (`src/data.ts`)

This file defines the data structures (TypeScript interfaces) and initial mock database:
- **`TireProduct`**: Describes all details of a tire (brand, size, price, wholesale cost, DOT code, terrain, warranty).
- **`ShopBooking`**: Describes a service bay appointment (customer, car plate, bay number, time slot, service status).
- **`OrderRecord`**: Describes a customer purchase order (payment method, bank slip proof, claimed amount, verification status).
- **`B2BQuoteItem`**: Describes an item inside a bulk fleet tender quotation.
- **`INITIAL_PRODUCTS`**: The preloaded list of tires (Michelin, Bridgestone, Yokohama, Goodyear, etc.).
- **`INITIAL_BOOKINGS`**: Preloaded active appointments for Bay 1 & Bay 2.
- **`INITIAL_ORDERS`**: Preloaded orders with sample BDO and BPI deposit slips.
