import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { STAFF_PROFILES } from './data';
import { useAppStore } from './store/appStore';
import { Header } from './components/Header';
import { BookingModal } from './components/BookingModal';
import { B2BQuoteView } from './components/B2BQuoteView';
import { AdminDashboard } from './components/AdminDashboard';
import { SalesDeskView } from './components/SalesDeskView';
import { DesignSystemView } from './components/DesignSystemView';
import { InventoryWorkspace } from './components/InventoryWorkspace';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toast } from './components/ui/Toast';
import {
  type AppViewMode,
  VIEW_PATHS,
  PATH_TO_VIEW,
} from './types/views';

/** Sync Zustand currentView ↔ React Router URL */
function useViewSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = useAppStore((s) => s.currentView);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const activeRole = useAppStore((s) => s.activeRole);

  // URL → store (browser back/forward, deep links)
  useEffect(() => {
    const fromPath = PATH_TO_VIEW[location.pathname] ?? 'inventory_kiosk';
    if (fromPath !== currentView) {
      const allowed = STAFF_PROFILES[activeRole].allowedViews;
      if (allowed.includes(fromPath)) {
        setCurrentView(fromPath);
      } else {
        navigate(VIEW_PATHS[allowed[0]], { replace: true });
      }
    }
    // Only react to path changes for URL→store direction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Store → URL (role switcher / internal setCurrentView)
  useEffect(() => {
    const expected = VIEW_PATHS[currentView];
    if (location.pathname !== expected) {
      navigate(expected, { replace: true });
    }
  }, [currentView, location.pathname, navigate]);
}

function StaffShell() {
  useViewSync();

  const activeRole = useAppStore((s) => s.activeRole);
  const currentView = useAppStore((s) => s.currentView);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const products = useAppStore((s) => s.products);
  const orders = useAppStore((s) => s.orders);
  const bookings = useAppStore((s) => s.bookings);
  const movements = useAppStore((s) => s.movements);
  const quoteItems = useAppStore((s) => s.quoteItems);
  const releaseNotifications = useAppStore((s) => s.releaseNotifications);
  const isSoundMuted = useAppStore((s) => s.isSoundMuted);
  const isBookingModalOpen = useAppStore((s) => s.isBookingModalOpen);
  const selectedTireForBooking = useAppStore((s) => s.selectedTireForBooking);

  const triggerToast = useAppStore((s) => s.triggerToast);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const updateProductStock = useAppStore((s) => s.updateProductStock);
  const updateMinThreshold = useAppStore((s) => s.updateMinThreshold);
  const saveProduct = useAppStore((s) => s.saveProduct);
  const archiveProduct = useAppStore((s) => s.archiveProduct);
  const addMovement = useAppStore((s) => s.addMovement);
  const addToQuote = useAppStore((s) => s.addToQuote);
  const updateQuoteQuantity = useAppStore((s) => s.updateQuoteQuantity);
  const removeQuoteItem = useAppStore((s) => s.removeQuoteItem);
  const clearQuote = useAppStore((s) => s.clearQuote);
  const convertQuoteToOrder = useAppStore((s) => s.convertQuoteToOrder);
  const openBookingModal = useAppStore((s) => s.openBookingModal);
  const closeBookingModal = useAppStore((s) => s.closeBookingModal);
  const confirmBooking = useAppStore((s) => s.confirmBooking);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const verifyOrder = useAppStore((s) => s.verifyOrder);
  const rejectOrder = useAppStore((s) => s.rejectOrder);
  const fulfillReleaseTicket = useAppStore((s) => s.fulfillReleaseTicket);
  const simulateNewAlert = useAppStore((s) => s.simulateNewAlert);
  const openDispatchForTicket = useAppStore((s) => s.openDispatchForTicket);
  const cancelReleaseTicket = useAppStore((s) => s.cancelReleaseTicket);
  const requestTireFromWarehouse = useAppStore((s) => s.requestTireFromWarehouse);
  const copyCustomerTrackingLink = useAppStore((s) => s.copyCustomerTrackingLink);

  const pendingAuditsCount = orders.filter((o) => o.paymentStatus === 'Under Review' || o.paymentStatus === 'Awaiting Proof').length;
  const activeBaysCount = bookings.filter(
    (b) => b.status === 'Vehicle in Bay (In Progress)' || b.status === 'Waiting for Arrival'
  ).length;

  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Toast />

      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        b2bCount={quoteItems.length}
        pendingAuditsCount={pendingAuditsCount}
        activeBaysCount={activeBaysCount}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        releaseNotifications={releaseNotifications}
        onOpenDispatchForTicket={openDispatchForTicket}
        onCancelTicket={(id) => cancelReleaseTicket(id)}
        onSimulateNewAlert={simulateNewAlert}
        onTriggerToast={triggerToast}
        isSoundMuted={isSoundMuted}
        onToggleSound={toggleSound}
      />

      <main className="app-main" id="main-content">
        <ErrorBoundary>
          <Routes>
            <Route
              path="/inventory"
              element={
                <div className="app-main-inner">
                  <InventoryWorkspace
                    products={products}
                    onUpdateProductStock={updateProductStock}
                    onUpdateMinThreshold={updateMinThreshold}
                    onSaveProduct={saveProduct}
                    onArchiveProduct={archiveProduct}
                    activeRole={activeRole}
                    movements={movements}
                    onAddMovement={addMovement}
                    onTriggerToast={triggerToast}
                    onNavigateToView={(view: string) => setCurrentView(view as AppViewMode)}
                    releaseNotifications={releaseNotifications}
                    onFulfillReleaseTicket={fulfillReleaseTicket}
                  />
                </div>
              }
            />
            <Route
              path="/sales"
              element={
                <div className="app-main-inner">
                  <SalesDeskView
                    products={products}
                    onBookInstallation={openBookingModal}
                    onAddToQuote={addToQuote}
                    onOpenCustomerLink={copyCustomerTrackingLink}
                    onTriggerToast={triggerToast}
                    onRequestTireFromWarehouse={requestTireFromWarehouse}
                  />
                </div>
              }
            />
            <Route
              path="/bays"
              element={
                <div className="app-main-inner">
                  <AdminDashboard
                    orders={orders}
                    bookings={bookings}
                    activeRole={activeRole}
                    onApproveOrder={verifyOrder}
                    onRejectOrder={rejectOrder}
                    onUpdateBookingStatus={updateBookingStatus}
                    onAddWalkinBooking={(booking) => {
                      // AdminDashboard sometimes passes a full record; store confirms via omit-id path
                      const { id: _ignored, ...rest } = booking;
                      confirmBooking(rest);
                    }}
                    initialTab="bays"
                    onOpenCustomerLink={copyCustomerTrackingLink}
                    onTriggerToast={triggerToast}
                  />
                </div>
              }
            />
            <Route
              path="/audit"
              element={
                <div className="app-main-inner">
                  <AdminDashboard
                    orders={orders}
                    bookings={bookings}
                    activeRole={activeRole}
                    onApproveOrder={verifyOrder}
                    onRejectOrder={rejectOrder}
                    onUpdateBookingStatus={updateBookingStatus}
                    onAddWalkinBooking={(booking) => {
                      // AdminDashboard sometimes passes a full record; store confirms via omit-id path
                      const { id: _ignored, ...rest } = booking;
                      confirmBooking(rest);
                    }}
                    initialTab="audit"
                    onOpenCustomerLink={copyCustomerTrackingLink}
                    onTriggerToast={triggerToast}
                  />
                </div>
              }
            />
            <Route
              path="/fleet-quotes"
              element={
                <div className="app-main-inner">
                  <B2BQuoteView
                    quoteItems={quoteItems}
                    onUpdateQuantity={updateQuoteQuantity}
                    onRemoveItem={removeQuoteItem}
                    onAddItem={addToQuote}
                    onClearQuote={clearQuote}
                    onConvertToOrder={(meta) => {
                      const id = convertQuoteToOrder(meta);
                      if (id) setCurrentView('accounting_audit');
                    }}
                  />
                </div>
              }
            />
            <Route
              path="/design-system"
              element={
                <div className="app-main-inner">
                  <DesignSystemView />
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/sales" replace />} />
            <Route path="*" element={<Navigate to="/sales" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        selectedTire={selectedTireForBooking}
        onConfirmBooking={confirmBooking}
        existingBookings={bookings}
      />

      <footer className="border-t border-slate-200 bg-white text-[12px] text-slate-500 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Superbdeal Corp · Quezon City hub</span>
          <span className="text-slate-400">Internal demo · not live integrations</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <StaffShell />;
}
