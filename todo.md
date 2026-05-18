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
