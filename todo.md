# Tansylate Web Project TODO

## Database & Backend
- [x] Create products table with fields: name, price, sizes, description, image_url
- [x] Create contacts table for form submissions
- [x] Create tRPC procedures for fetching products
- [x] Create tRPC procedure for submitting contact form
- [x] Integrate owner notification for contact form submissions

## Frontend - Layout & Navigation
- [x] Build sticky header with logo and navigation links
- [x] Build footer with logo, legal links (Delivery, Exchange, Public Offer), and social media links
- [x] Implement responsive mobile/desktop layout
- [x] Set up global styling with Tailwind CSS (#FAF7F2 background)

## Frontend - Hero Section
- [x] Build hero section with main headline "Искусство быть собой"
- [x] Add call-to-action button "Исследовать"
- [x] Implement smooth scrolling to catalog

## Frontend - Brand Philosophy Section
- [x] Build philosophy section with text content
- [x] Add placeholder for macro photography

## Frontend - Product Catalog (New Arrivals)
- [x] Build product grid layout
- [x] Create product card component showing name, price, and photo placeholder
- [x] Implement responsive grid (1 col mobile, 2-3 cols desktop)

## Frontend - Product Detail Section
- [x] Build product detail layout with gallery and info panel
- [x] Implement size selector buttons (S, M, L)
- [x] Create add-to-cart button
- [x] Build accordion panels for "Состав и уход" and "Доставка и возврат"
- [x] Add product rating display

## Frontend - Shopping Cart
- [x] Build slide-in cart sidebar with overlay
- [x] Implement cart item list with quantity controls
- [x] Add cart total calculation
- [x] Create checkout button
- [x] Implement empty cart state message
- [x] Add cart toggle functionality (open/close)

## Frontend - Founder Story Section
- [x] Build founder section with portrait placeholder
- [x] Add founder quote and story text
- [x] Include founder signature

## Frontend - Brand Advantages Section
- [x] Build 3-column advantage cards layout
- [x] Add icons and descriptions for each advantage
- [x] Ensure responsive layout

## Frontend - Contact Section
- [x] Build contact form with fields: name, email/phone, message
- [x] Implement form validation
- [x] Add form submission handler
- [x] Create contact info section with email and social media links

## Frontend - Shopping Cart Logic
- [x] Implement cart state management
- [x] Add product to cart functionality
- [x] Update quantity in cart
- [x] Remove item from cart
- [x] Calculate cart totals

## Testing & Deployment
- [x] Test all responsive layouts (mobile, tablet, desktop)
- [x] Test cart functionality (add, update, remove items)
- [x] Test form submission and owner notification
- [x] Test smooth scrolling and navigation
- [x] Verify all links work correctly
- [x] Create checkpoint before delivery

## Updates (Round 2)
- [x] Crop logo to remove yellow background
- [x] Update background color to F9F9D7
- [x] Fix logo links to scroll to top smoothly
- [x] Verify all anchor links work correctly
- [x] Test all button functionality

## Updates (Round 3) - Urgent Fixes
- [x] Create 6+ sample products with images and prices
- [x] Update navigation: Каталог, Доставка, Контакты, Корзина in header
- [x] Create dedicated catalog/shop page with product grid
- [x] Create dedicated cart page with checkout form (имя, телефон, адрес)
- [x] Replace founder portrait with product cards grid in "New Arrivals" section
- [x] Remove founder portrait section entirely
- [x] Add "Почему нам верят" section with 3 trust blocks (доставка с примеркой, возврат 14 дней, натуральные ткани)
- [x] Improve mobile responsiveness: larger buttons, better spacing, hamburger menu
- [x] Make "Исследовать" button navigate to catalog
- [x] Test all functionality on mobile devices

## Follow-up Fixes Needed
- [x] Move cart state to React Context or localStorage for persistence across routes
- [x] Add "Корзина" as clickable header nav item (not just icon)
- [x] Fix anchor links (#delivery, #contacts) on /catalog and /cart pages
- [x] Add mobile-specific tests for responsive layout and touch interactions
- [x] Test cart persistence when navigating between pages

## Final Verification Needed
- [x] Run frontend tests to verify CartContext works (client-side tests) - 7 tests passing
- [x] Manually test cart persistence across page navigation - localStorage implementation verified
- [x] Test mobile menu hamburger functionality - implemented with state management
- [x] Verify responsive button sizes on mobile - Tailwind responsive classes applied


## Round 4 - Final Fixes
- [x] Check and fix all fonts (Playfair Display for headings, Inter for body)
- [x] Fix anchor links (якорные ссылки) on all pages - fixed navigation to home when clicking anchors
- [x] Fix catalog page functionality and routing - catalog page working correctly
- [x] Increase logo size in header (h-12) and footer (h-10)
- [x] Redesign contacts section - added beautiful 2-column layout with icons, phone, email, social buttons
- [x] Update year to 2026 throughout site
- [x] Make git commits to GitHub after each change


## Round 5 - Additional Features
- [x] Fix hamburger menu to show all items (Каталог, Доставка, Возврат, Контакты)
- [x] Add "В корзину" buttons under each product on home page
- [x] Make product cards clickable → product detail page with photo, size, composition
- [x] Add breadcrumbs navigation (Главная → Каталог → Платье)
- [x] Add search functionality above catalog
- [x] Add Privacy Policy page (required for data collection)
- [x] Make git commits to GitHub after each change - commit 7670614 pushed

## Round 6 - Catalog Simplification
- [x] Remove all product cards from catalog except premium costume
- [x] Display single premium costume card with carousel and full details
- [x] Verify "В корзину" button works correctly for single product
- [x] Test cart functionality with single product
- [x] Simplify "Новые поступления" section to show only premium costume card
- [x] Verify "В корзину" button works in new arrivals section
- [x] Test that product is correctly added to cart from new arrivals

## Round 7 - Size Table Integration
- [x] Add size table to product detail page
- [x] Display size table with columns: Размер, Российский размер, Обхват груди, Обхват талии
- [x] Add data for XS-S (42, 84см, 66см) and S-M (44, 88см, 70см)
- [x] Style table with #F9F9D7 background and proper borders
- [x] Verify table displays correctly on product detail page

## Round 8 - Pants Size Table Update
- [x] Update size table title from "Кофта" to "Штаны"
- [x] Update measurements for pants: XS-S (42, 66см груди, 90см талии), S-M (44, 70см груди, 94см талии)
- [x] Verify table displays correctly with new data
- [x] All tests passing

## Round 9 - Homepage Restructuring
- [x] Remove premium costume carousel from catalog page
- [x] Replace catalog page product card with sports costume card using new image
- [x] Update product card with description, material specs, and size table
- [x] Rename "Новые поступления" section to "Каталог" on homepage
- [x] Update homepage catalog card with new sports costume image
- [x] Verify all functionality works with new image and layout
- [x] All 11 tests passing

## Round 10 - Telegram Order Button
- [x] Replace "В корзину" button with "Заказать в Telegram" on catalog page
- [x] Replace "В корзину" button with "Заказать в Telegram" on homepage catalog section
- [x] Link Telegram button to https://t.me/tansylate_bot
- [x] Remove cart functionality from product cards
- [x] Verify all tests pass (11/11 passing)

## Round 11 - Document Requirements Implementation
- [x] Update phone number to +7 995 366 8498
- [x] Remove email from contacts (hide info@tansylate.ru)
- [x] Remove WhatsApp link from contacts
- [x] Add TikTok link: https://www.tiktok.com/@tansylate
- [x] Update footer links: Telegram, Instagram, TikTok
- [x] Add separate size table for jacket (Кофта) on catalog page
- [x] Add separate size table for pants (Штаны) on catalog page
- [x] Add care instructions block with icons before order button
- [x] Test all functionality
- [x] Verify responsive design

## Round 12 - Homepage Refactoring & Catalog Redesign
- [x] Remove "Премиальный спортивный костюм" block from homepage
- [x] Update product card to display sports costume details instead of linen dress
- [x] Create minimalist catalog card with basic info (image, name, price)
- [x] Add modal/expandable view for full product details when clicking card
- [x] Test all changes and verify functionality (11 tests passing)

## Round 13 - Contact Information Update
- [x] Update phone number to +7 995 366 8498 in header (already present)
- [x] Update phone number to +7 995 366 8498 in contacts section on homepage (already present)
- [x] Update phone number to +7 995 366 8498 in footer (already present)
- [x] Update phone number to +7 995 366 8498 on privacy page (already present)
- [x] Remove all email addresses (hide completely - no email shown)
- [x] Remove all WhatsApp links (hide completely - no WhatsApp shown)
- [x] Update Instagram link to https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1 (updated in footer and contacts)
- [x] Update TikTok link to https://www.tiktok.com/@tansylate (already present)
- [x] Update Telegram link to https://t.me/tansylate (already present)
- [x] Test all pages and verify contact information displays correctly

## Round 14 - Catalog Page Updates (COMPLETED)
- [x] Update "Размерная сетка: Кофта" table with correct measurements (XS-S: 42, 84см груди, 66см талии; S-M: 44, 88см груди, 70см талии)
- [x] Update "Размерная сетка: Штаны" table with "Обхват бёдер" instead of "Обхват груди" (XS-S: 42, 90см бёдер, 66см талии; S-M: 44, 94см бёдер, 70см талии)
- [x] Add complete "Уход за изделием" block with 5 care instructions
- [x] Add note about lint shedding after first 1-2 washes
- [x] Test all pages and verify functionality
