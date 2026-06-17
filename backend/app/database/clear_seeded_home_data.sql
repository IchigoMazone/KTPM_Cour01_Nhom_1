-- Run manually when you want to clear preloaded home data and related records.
-- This removes inventory, services, promotions, and dependent rows.

TRUNCATE TABLE
    public.home_support_messages,
    public.home_support_tickets,
    public.home_promotion_claims,
    public.home_booking_requests,
    public.home_order_status_history,
    public.home_orders,
    public.home_finance_records,
    public.home_promotions,
    public.home_services,
    public.home_inventory_items
RESTART IDENTITY CASCADE;
