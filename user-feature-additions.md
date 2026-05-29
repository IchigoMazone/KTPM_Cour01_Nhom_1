# User feature additions

## Scope

- Added a new `/user` application area at the same level as `/home`.
- Reused the current sidebar structure through `UserSidebar`.
- Added a separate customer topbar/search so user actions route to `/user` instead of `/home`.

## Pages

- `/user`: customer overview with active orders, order progress, loyalty points, and quick services.
- `/user/bookings`: pickup booking form, price estimate, upcoming booking list.
- `/user/orders`: customer order history, period filter, status table, pagination.
- `/user/loyalty`: points, membership progress, vouchers, referral block.
- `/user/support`: support ticket form, quick contact channels, ticket history, FAQ.
- Profile is now handled by the shared account modal from the sidebar dropdown, not a standalone `/user/profile` page.

## Sidebar behavior

- Mobile sidebar closes automatically after selecting a user menu item.
- Desktop sidebar keeps the same collapsed/expanded structure and visual rhythm as the current dashboard sidebar.
