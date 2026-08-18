# FlowSites Project TODO

## Current Billing Task
- [x] Create and verify a $1 live Stripe payment link using the newly supplied Stripe account
- [ ] Update the deployed application to use the verified new Flowsites Corp. Stripe account
- [ ] Retrieve the verified live Stripe credential from the new account and configure a deployable custom secret
- [x] Fix Google OAuth login initiation returning a missing client_id error
- [x] Register the Railway Google OAuth callback URL to resolve redirect_uri_mismatch
- [x] Create or configure the FlowSites Google OAuth web client for Railway production
- [x] Resolve the Railway Google OAuth callback database-unavailable error
- [x] Configure the approved DATABASE_URL for the Railway production service
- [x] Diagnose and resolve the remaining Railway Google OAuth callback server error
- [x] Configure missing Railway JWT_SECRET and OAUTH_SERVER_URL required for Google session creation
- [x] Make the successful Google OAuth callback session recognized by FlowSites dashboard routes
- [x] Provide the existing FlowSites app ID through the repository fallback for Railway Google session validation
- [x] Push the repository-based Google session fallback to GitHub for Railway deployment
- [x] Add a repository-based FlowSites app-ID fallback and passing Google session regression coverage
- [x] Verify deployed Railway Google login reaches and persists into the intended dashboard
- [x] Confirm the GitHub deployment snapshot contains intact login-repair source files needed by Railway

## Current Railway Deployment Fix
- [x] Diagnose and repair missing logo and graphic assets on https://flowsite-main-production.up.railway.app/
- [x] Reproduce and correct the reported missing-logo visibility on the Railway homepage
- [x] Remove the duplicate/broken lower footer and all homepage popup-style overlays on Railway

## Current CRM Redesign
- [ ] Complete and verify a full bright CRM redesign across dashboard cards, tables, lead rows, and key workflows
- [x] Override stale saved dark-theme preferences so the CRM opens bright for every user
- [x] Add and pass light-first CRM regression coverage that ignores stale saved dark preferences
- [ ] Audit and replace dark default styling throughout the public site, scheduling, client portal, and CRM
- [x] Route prompt, free-trial, and all other public conversion actions through the AI business-needs lead-capture flow
- [ ] Restore GitHub write access to publish the completed light-mode and lead-capture update

## Current Brand Asset Update
- [x] Replace the website favicon with the current FlowSites FS logo
- [ ] Publish and verify the new cache-busted FlowSites favicon on the live Railway site

## Current Repository Backup
- [x] Create a checkpoint backup and upload a compressed source backup to https://github.com/flowsiteshq/Flowsite-main.git
- [x] Push a first sanitized FlowSites source snapshot to https://github.com/flowsiteshq/Flowsite-main.git with Git
- [x] Replace hardcoded payment credentials in billing scripts with environment variables and include those scripts in the GitHub snapshot
- [x] Verify the final GitHub snapshot contains client/, server/, drizzle/, package.json, and sanitized billing scripts at the repo root
- [x] Document excluded platform-only artifacts: .project-config.json and the generated backup ZIP
- [x] Add and pass a regression test that blocks hardcoded Stripe keys in billing scripts

## Completed Features
- [x] Homepage with hero, differentiators, portfolio preview, how-it-works, pricing, and CTA sections
- [x] Services page with detailed service offerings
- [x] Portfolio page with real mockups (mydojoma, yaegerssda, zolamind)
- [x] Contact page with lead capture form
- [x] Website analyzer with Google PageSpeed Insights API integration
- [x] Custom FlowSites logo integration
- [x] Dark glassmorphism design theme
- [x] Responsive mobile-first design
- [x] Full-stack upgrade with tRPC backend

## Pending Tasks
- [x] Improve rate limit error handling in analyzer
- [x] Add user-friendly messaging for rate limit errors
- [x] Add documentation for obtaining Google PageSpeed API key
- [ ] Connect contact form to DojoFlow CRM
- [ ] Add client testimonials section to homepage
- [ ] Replace "Book a Demo" buttons with actual Calendly/scheduling links
- [x] Replace portfolio mockup images with actual screenshots of real websites
- [x] Fix PageSpeed analyzer timeout issue
- [x] Add loading progress indicator to website analyzer
- [x] Add 'Analyze Another Site' button to results page
- [x] Add TryHomeUp Services to portfolio
- [x] Create detailed case study page for HomeUp Services
- [x] Add case study links to homepage for customer discoverability
- [x] Create case study pages for MyDojo, Yaeger, and Zolamind
- [x] Add Results Guarantee section to homepage
- [x] Update MyDojo case study with Master Vincent Holmes' photo
- [x] Update Yaeger case study with Master Chris Yaeger's photo from website
- [x] Add FAQ section to homepage
- [x] Create customer onboarding wizard for gathering business details
- [x] Link onboarding wizard from all 'Book a Demo' and 'Get Started' buttons
- [x] Create protected admin dashboard for viewing wizard submissions
- [x] Set up automated confirmation emails for wizard submissions
- [x] Implement status tracking workflow in admin dashboard
- [x] Add "Trusted By" section to homepage with client logos
- [x] Redesign Trusted By section with premium styling and better visual hierarchy
- [x] Research target keywords for martial arts / fitness web agency niche
- [x] Implement meta tags, title tags, and Open Graph for all pages
- [x] Add JSON-LD structured data (Organization, WebSite, FAQPage, ItemList schemas)
- [x] Create sitemap.xml and robots.txt
- [x] Add canonical URLs to all pages
- [x] Optimize semantic HTML structure (aria-labels, landmark roles)
- [x] Add preconnect/preload resource hints
- [x] Optimize font loading strategy
- [x] Implement FAQ schema on homepage
- [x] Add keyword-rich page titles and descriptions for all routes
- [ ] Add blog/resources section for content marketing
- [x] Add PolicyPilot as portfolio entry on homepage and portfolio page
- [x] Create PolicyPilot case study page with Nana Banana style images
- [x] Add PolicyPilot logo to Trusted By section
- [x] Create admin_sessions table for secret admin auth
- [x] Add admin login tRPC procedures (login, logout, verify)
- [x] Build secret admin login page at hidden URL
- [x] Build protected admin dashboard showing all leads/customers
- [x] Add admin middleware to protect admin routes
- [x] Upload real client logos (PolicyPilot, DojoFlow, Yaeger, MyDojo) to CDN and replace generated ones
- [x] Add DojoFlow as portfolio entry and case study
- [x] Create DojoFlow case study page with Nana Banana images
- [x] Remove grayscale/invert/opacity filters from Trusted By logos — show full natural color
- [x] Make PolicyPilot logo 2x larger in Trusted By section
- [x] Upload Vincent Holmes photo and use in MyDojo and DojoFlow case studies
- [x] Add "Meet Our Clients" section to homepage with Vincent Holmes photo and quote
- [x] Add Grand Master Chris Yaeger client card to Meet Our Clients section on homepage
- [x] Add "Book a Call" CTA button inside each client card in Meet Our Clients section
- [x] Create availability and bookings database schema
- [x] Build tRPC procedures for scheduling (get slots, book, manage availability)
- [x] Build public booking page with calendar and time slot picker
- [x] Build admin availability management panel
- [x] Build admin appointments dashboard
- [x] Wire Book a Call buttons to new booking page
- [x] Add owner notification on new booking (via notifyOwner)
- [x] Replace "Book a Demo" button text in Navbar with "Book a Call"
- [ ] Add HomeUp and Zolamind real logos to Trusted By section (user to provide)

## Google Calendar Integration
- [ ] Research Google Calendar API OAuth2 flow for server-side access
- [ ] Add Google OAuth credentials (CLIENT_ID, CLIENT_SECRET) as secrets
- [ ] Build admin Google Calendar connect/disconnect flow (OAuth consent + token storage)
- [ ] Build server-side Google Calendar API helper (create/update/delete events)
- [ ] Wire calendar event creation into booking tRPC procedure
- [ ] Wire calendar event cancellation into booking cancel procedure
- [ ] Add Google Calendar connection status to admin scheduling panel
- [ ] Write vitest tests for calendar helper logic
- [x] Hide navbar on /book-a-call page for distraction-free booking experience
- [x] Send booking confirmation email to guest after booking is created

## Pre-Booking Questionnaire
- [x] Add questionnaire_questions and booking_answers tables to schema
- [x] Build tRPC procedures: getQuestions, adminGetQuestions, adminCreateQuestion, adminUpdateQuestion, adminDeleteQuestion, adminGetBookingAnswers
- [x] Build admin questionnaire builder UI (add/edit/show/hide/delete questions, all field types)
- [x] Integrate questionnaire step into public booking flow (step before confirmation)
- [x] Show questionnaire answers in admin bookings view (expandable per booking)
- [x] Write vitest tests for questionnaire validation and formatting logic (19 tests)

## SMS Reminders
- [ ] Install Twilio SDK and configure credentials
- [ ] Build SMS helper (sendSms function)
- [ ] Build daily cron job to send reminders for next-day bookings
- [ ] Wire cron job into server startup
- [ ] Add SMS reminder toggle in admin scheduling panel
- [ ] Write vitest tests for SMS reminder logic
- [x] Add Bluetide Financial logo to Trusted By section

## Bluetide Financial Case Study
- [x] Research bluetidefinancial.com and capture key content/screenshots
- [x] Add Bluetide Financial to portfolio section on homepage
- [x] Add Bluetide Financial to portfolio page with case study link
- [x] Create /case-study/bluetide page with full case study content
- [x] Add Bluetide Financial to Trusted By section (already done)

## Booking Calendar Availability
- [x] Insert Mon-Fri 9am-5pm CST availability rules
- [x] Block all major US holidays for 2025 and 2026
- [x] Add CST timezone label to time slot picker

## Don Bar Bakery Client Entry
- [ ] Research donbarbakery.com and capture key content/screenshots
- [ ] Upload logo/mockup screenshot to CDN
- [ ] Add Don Bar Bakery to Trusted By section on homepage
- [ ] Add Don Bar Bakery to portfolio section on homepage
- [ ] Add Don Bar Bakery to Portfolio page with case study link
- [ ] Create /case-study/donbar case study page

## Logo Updates
- [x] Create light/white version of Zolamind Counseling logo for Trusted By section
- [x] Create light/white version of HomeUp logo for Trusted By section
- [x] Upload both logos to CDN and update Home.tsx

## GrapheneX Client Entry
- [ ] Research graphenex.net and capture key content
- [ ] Take screenshot and upload to CDN
- [ ] Add GrapheneX to Trusted By section and portfolio on homepage
- [ ] Add GrapheneX to Portfolio page
- [ ] Create /case-study/graphenex page

## Budget Wizard (Website Pricing Calculator)
- [x] Build multi-step budget wizard page at /budget-wizard
- [x] Step 1: Business type selection (industry picker - 6 verticals)
- [x] Step 2: Base package selection (Launch $599 / Growth $1,299-$1,999 / Conversion $2,500-$4,500 / BOS $5,000-$15,000+)
- [x] Step 3: Universal add-ons (core website features + business automation)
- [x] Step 4: Industry-specific add-ons (dynamic based on Step 1 selection)
- [x] Step 5: Live budget summary with itemized breakdown, total range, and CTA
- [x] Wire /budget-wizard route in App.tsx
- [x] Add "Pricing" nav link pointing to budget wizard

## Budget Wizard — Subscription & Payment Plan
- [x] Define 3 monthly subscription tiers ($99 / $149 / $249) tied to feature complexity
- [x] Auto-assign monthly tier based on base package + add-on selections
- [x] Add payment plan option (spread build cost over 6 or 12 months)
- [x] Update wizard summary to show monthly fee + payment plan breakdown
- [x] Show "what's included" in monthly subscription (hosting, upkeep, support)

## Budget Wizard — Submissions & Admin
- [ ] Add wizardSubmissions table to drizzle/schema.ts
- [ ] Push DB migration
- [ ] Add saveWizardSubmission tRPC procedure with email notification
- [ ] Wire submission save in BudgetWizard.tsx (on "See My Quote" step)
- [ ] Build admin submissions view for wizard quotes

- [x] Rename all "Book a Call" CTAs to "Get Started" site-wide
- [ ] Add clientProjects table (stages, milestones, status) to schema
- [ ] Add changeRequests table to schema
- [ ] Build tRPC procedures for client project progress and change requests
- [ ] Build customer portal dashboard at /portal
- [ ] Add change requests tab to admin dashboard
- [ ] Wire admin project management (create/update client projects)
- [ ] Merge GetStarted and BudgetWizard into one unified wizard at /get-started
- [x] Add Salons and Restaurants as industry options with specific features
- [x] Redirect /budget-wizard to /get-started
- [ ] Update DB/tRPC to save full unified submission

- [x] Add search bar to Leads page (search by business name, email, phone)
- [x] Fix admin technician unable to add new leads/people despite having admin role
- [x] Full premium redesign of entire FlowSites site
- [x] Add Green Bahamas Life as customer (portfolio card + case study)
- [ ] Curate Trusted By section to max 6 logos
- [ ] Redesign global theme (index.css) - typography, colors, premium tokens
- [x] Redesign Home.tsx - hero, stats, services, portfolio, pricing, CTA
- [x] Redesign Navbar and Footer components

## Client Portal (Customer Dashboard)
- [x] DB schema: projects table (linked to wizard submission, status, timeline stages)
- [x] DB schema: project_messages table (client ↔ staff messaging thread)
- [x] DB schema: change_requests table
- [x] tRPC: getMyProject, getMessages, sendMessage, submitChangeRequest procedures
- [x] Client portal: project timeline/status tracker page
- [x] Client portal: messaging thread with staff
- [x] Client portal: change request form + history
- [x] Admin panel: manage client projects, respond to messages, update timeline
- [x] Post-payment success screen on /client-portal?payment=success

## GetStarted Wizard Package Differentiation
- [x] Add includedAddons arrays to all BASE_PACKAGES (Growth, Conversion, BOS)
- [x] Update AddOnGrid to filter out included items (pass includedIds prop)
- [x] Update totals computation to skip included add-ons from price calculation
- [x] Add "Included in Your Package" green banner at top of Features step
- [x] Add "✓ N features included" badge to package cards in Step 4
- [x] Write vitest tests for pricing logic (7 tests, all passing)

## Feature Upgrade Flow
- [x] Add "upgrade anytime" reassurance banner to Features step in GetStarted wizard
- [x] Add subtle "add later" note to each add-on card in Features step
- [x] Build "Add Features" tab in client portal for post-payment feature upgrades
- [x] Add featureUpgradeRequests table to DB schema
- [x] Add tRPC procedures: requestFeatureUpgrade, getMyUpgradeRequests (client), adminListUpgradeRequests, adminUpdateUpgradeRequest
- [x] Show upgrade requests in admin dashboard

## Package Differentiation & Logo Fix
- [x] Expand includedAddons for Growth, Conversion, and BOS packages (more features = clear value gap)
- [x] Fix FlowSites logo not showing in GetStarted wizard header

## Checkout Amount Clarity
- [x] Show checkout-due amount on package cards: full price if paying in full, 30% down if financed
- [x] Update header pricing pill to show "Due at checkout: $X" based on payment plan
- [x] Show remaining balance breakdown if financed (70% spread over months)

## Portfolio Fix
- [x] Fix greenbahamas.life showing as "unavailable" in the portfolio section — refreshed mockup screenshot with current live site

## Review Step Copy Update
- [x] Update "What happens next?" bullets: site built within 72 hours, 4 redesigns included instead of "custom proposal with design mockups"

## Pricing Step Subscription Lock
- [x] Lock monthly subscription to package: Launch→Essential($99), Growth→Growth($149), Conversion/BOS→Premium($249) — remove free choice

## Admin CRM Improvements
- [x] Remove footer/navbar from admin dashboard (full-screen immersive CRM)
- [x] Add Leads vs Customers distinction (Customers = status "won"/paid)
- [x] Add single lead deletion (trash icon per row)
- [x] Add multi-select bulk deletion with confirmation modal
- [x] Add backend deleteLead and deleteLeadsBulk tRPC procedures
- [x] Add Customers tab with emerald styling and "CUSTOMER" badge
- [x] Add customer stats (total customers, active projects, monthly revenue)
- [x] Redesign admin tab bar with icons and color-coded counts

## Schedule a Call Rebrand & Booking Redesign
- [x] Rename all "Get a Quote" CTAs to "Schedule a Call" site-wide (Navbar, Footer, all pages)
- [x] Update all CTA links to point to /schedule
- [x] Register /schedule route in App.tsx with BookCall component
- [x] Add /schedule to full-screen routes (hides navbar/footer)
- [x] Rebuild BookCall.tsx as premium Calendly-style two-panel layout
- [x] Left panel: FlowSites host card, call details (30 min, Google Meet, CT timezone), what to expect checklist, selection summary
- [x] Right panel: interactive calendar with month navigation, available/partial/unavailable day states, time slots grid, contact form, questionnaire step
- [x] Confirmation screen with booking code and meeting details
- [x] Minimal branded top bar with back-to-site link

## Full Site Redesign (Conversion-Focused)
- [ ] Research top web agency designs, pricing, onboarding flows
- [ ] Define new design system: typography, colors, spacing, components
- [ ] Redesign global theme in index.css (light/airy or bold-modern)
- [ ] Redesign Home page hero, social proof, services, portfolio, pricing, CTA
- [ ] Redesign Navbar and Footer
- [ ] Redesign Services, Portfolio, Contact pages
- [ ] Simplify GetStarted onboarding wizard (fewer steps, clearer value)
- [ ] Update pricing to industry-standard affordable rates
- [ ] Keep existing client portfolio entries, reorient in new layout

## Full Site Redesign — Clean Light Agency (Apr 2026)
- [x] Switch from dark glassmorphism to clean light agency design inspired by Clay/Digital Silk
- [x] New design system: Syne display font + Plus Jakarta Sans body, white canvas, red accent
- [x] Redesign Home.tsx — bold asymmetric hero, social proof stats, services grid, portfolio cards, pricing, CTA
- [x] Redesign Navbar — white bg, dark text, red "Schedule a Call" CTA
- [x] Redesign Footer — clean dark navy, no CTA strip
- [x] Rename all "Get a Quote" CTAs to "Schedule a Call" site-wide
- [x] Simplify GetStarted wizard from 7 steps to 3 steps (Business Info → Package → Payment)
- [x] Update pricing to industry standard: Launch $1,200/$79mo, Growth $2,400/$129mo, Authority $3,900/$179mo

## Industry Landing Pages
- [ ] Build reusable IndustryLanding component with full tech stack showcase
- [ ] Martial Arts & Fitness landing page (/industries/martial-arts)
- [ ] Restaurants & Cafes landing page (/industries/restaurants)
- [ ] Salons & Spas landing page (/industries/salons)
- [ ] Health & Wellness landing page (/industries/health-wellness)
- [ ] Real Estate landing page (/industries/real-estate)
- [ ] Insurance & Finance landing page (/industries/insurance)
- [ ] Register all industry routes in App.tsx
- [ ] Add Industries dropdown to Navbar
- [ ] Link industry pages from Services and Portfolio pages

## Client Accounts, Billing & Media Portal
- [x] Extend DB schema: client_accounts table (linked to user, website URL, plan, status)
- [x] Extend DB schema: client_invoices table (Stripe invoice ID, amount, status, due date)
- [x] Extend DB schema: client_media table (S3 key, URL, type, uploaded by, client ID)
- [ ] Add Stripe subscription creation procedure (create customer + subscription)
- [x] Add tRPC procedures: getMyAccount, getMyInvoices, getMyMedia, uploadMedia, deleteMedia
- [x] Build client dashboard at /client-billing: overview, billing, media, change requests
- [x] Build billing tab: current plan, next payment date, invoice history with PDF download
- [x] Build media upload tab: drag-and-drop photo/video upload (S3), gallery view, delete
- [x] Build admin client management: create client accounts, assign plan, view all clients
- [x] Admin: view per-client invoices and payment status
- [x] Admin: view per-client media uploads
- [ ] Pre-create 8 client accounts (Aladdin Kebab, Stitched with Love, HomeUp, ASLS, DojoFlow, Don Bar Bakery, Stylist Factory, MyDojo MA)
- [ ] Send invite emails to each client with login instructions

## Portfolio & Trusted By — Real Clients (Apr 2026)
- [ ] Update portfolio section on homepage with all 8 real clients
- [x] Update Portfolio page with all 8 real clients
- [ ] Update Trusted By section with all 8 client logos
- [ ] Add MyDojo MA case study page (/case-study/mydojoma)
- [x] Add Aladdin Kebab Grill to portfolio
- [x] Add Stitched with Love to portfolio
- [x] Add ASLS Foundation to portfolio
- [x] Add Don Bar Bakery to portfolio (already existed)
- [x] Add Stylist Factory to portfolio

## Client Dashboard — Analytics Tab
- [x] Add analytics tRPC procedure to fetch traffic data from built-in analytics API
- [x] Build Analytics tab in ClientBilling.tsx with pageviews, unique visitors, top pages, traffic sources
- [x] Add line chart for pageviews over time (last 30 days)
- [x] Add stat cards: total pageviews, unique visitors, avg session duration, bounce rate
- [x] Add top pages table
- [x] Add traffic sources breakdown (direct, organic, referral, social)

## Analytics Tab — Custom Date Range
- [x] Install react-day-picker for date range selection
- [x] Update getSiteAnalytics tRPC procedure to accept custom startDate/endDate params
- [x] Add custom date range picker UI with calendar popover (start + end date)
- [x] Keep preset buttons (7d, 30d, 90d) alongside the custom picker
- [x] Show selected date range label when custom range is active
- [x] Write vitest tests for custom date range validation logic

## Analytics Tab — Compare to Previous Period
- [x] Extend getSiteAnalytics tRPC procedure to fetch previous period stats/pageviews in parallel
- [x] Add comparePrevious boolean input param to the procedure
- [x] Add "Compare" toggle button next to the date range selector
- [x] Show dashed previous-period line on the area chart when compare is active
- [x] Show % change badges (green up / red down) on each stat card
- [x] Align previous period data points to the same x-axis positions as current period

## Client Account Creation Fix
- [x] Fix admin panel to look up users by email and link client accounts to their OpenID
- [x] Add "Create Account by Email" flow in admin billing panel
- [x] Improve client dashboard empty state with clear instructions instead of black screen
- [x] Add self-registration flow: clients can request access from the /client-billing page

## Bug Fixes — Admin Billing Create Button
- [ ] Fix Create button in Admin Billing panel — mutation silently failing
- [ ] Fix monthly price field to accept dollars (not cents) with proper conversion

## Admin Billing Fixes (Apr 27, 2026)
- [x] Fix adminCreateAccount SQL insert failure (root cause: malformed date string exceeding varchar(10) column limit)
- [x] Change billing start date input to American MM/DD/YYYY format with auto-conversion to YYYY-MM-DD before DB insert
- [x] Add date format validation with real-time feedback (green = valid, red = invalid format)

## Invite Link Fix (Apr 27, 2026)
- [x] Create AcceptInvite page at /accept-invite?token=... with loading/success/error states
- [x] Register /accept-invite route in App.tsx
- [x] Update getLoginUrl() to accept optional returnPath for post-login redirects
- [x] Update OAuth callback to parse returnPath from state and redirect back after login

## Client Dashboard Enhancement (Apr 27, 2026)
- [x] Add Overview tab as default landing tab with site screenshot and PageSpeed scores
- [x] Add getSiteOverview tRPC procedure (PageSpeed + screenshot via Lighthouse API)
- [x] Add getPaymentHistory tRPC procedure (Stripe charges list)
- [x] Add Payments tab showing Stripe payment history with receipt links
- [x] Add Account Summary card to Overview tab
- [x] Add Refresh button to re-analyze PageSpeed scores on demand

## Client Portal Fixes Round 2 (Apr 27, 2026)
- [x] Fix invoice auto-generation on account creation (first invoice should be created automatically)
- [x] Fix website screenshot (switched to Microlink free API)
- [x] Fix analytics not loading (analytics endpoint now uses correct Umami API format)
- [x] Add invoice sharing - public shareable link so third party can view/pay (/invoice/:shareToken)
- [x] Add light/dark mode toggle to client portal, default to light mode

## Invoice Page Redesign
- [x] Redesign public invoice page: standalone (no header/footer), professional layout

## Recurring Billing & Upgrades Store
- [x] Add isRecurring flag to clientInvoices schema
- [ ] Auto-generate next month invoice when current invoice is marked paid
- [x] Show "Recurring Monthly" badge on invoice page
- [x] Add Upgrades tab to client portal with all add-ons from CORE_ADDONS + AUTO_ADDONS
- [x] Add requestUpgrade tRPC procedure (creates featureUpgradeRequest in DB, notifies admin)
- [x] Add getMyUpgradeRequests tRPC procedure for client to see their requests
- [x] Add admin view for upgrade requests in AdminDashboard

## Invoice Logo & Optimization Package (Apr 27, 2026)
- [x] Increase invoice logo to 4x size (h-28 in header band, h-14 in top bar)
- [x] Add $49/mo Monthly Optimization Package to UPGRADE_CATALOG (up to 5 changes/month)

## Admin Invoice View/Share Buttons (Apr 27, 2026)
- [x] Add "View" button to each invoice row in admin billing panel (opens public invoice page)
- [x] Add "Copy Link" button to each invoice row (copies shareable URL to clipboard)

## Upgrade Request Flow Fix (Apr 27, 2026)
- [x] Fix featurePrice validation error (undefined vs number)
- [x] Rework upgrade flow: request add-on → auto-create invoice → client pays → service activates
- [x] Add invoiceType (monthly|addon) and addonRequestId columns to clientInvoices schema
- [x] requestUpgrade procedure now auto-creates open invoice and returns shareToken
- [x] Fix frontend mutation call: pass featurePrice (parsed from price string) + clientNotes
- [x] Show "Pay Now" button on pending add-on requests in Upgrades tab
- [x] Show "Pending Payment" status badge on upgrade requests
- [x] getMyUpgradeRequests now joins invoice shareToken + status for each request

## Stripe Webhook Fix (Apr 28, 2026)
- [x] Diagnose why paid Stripe payments are not updating invoice status in DB
- [x] Fix webhook handler to mark invoice as paid on checkout.session.completed / payment_intent.succeeded
- [x] Added payment_intent.succeeded as fallback event handler
- [ ] Verify invoices update to "paid" status after next successful Stripe payment

## Legal Pages (Apr 28, 2026)
- [x] Create Privacy Policy page (/privacy-policy)
- [x] Create Terms of Service page (/terms-of-service)
- [x] Create Refund Policy page (/refund-policy)
- [x] Add footer links to all three legal pages
- [x] Register routes in App.tsx

## Dashboard Light Mode Fix (Apr 28, 2026)
- [x] Diagnose why light mode is not working in admin dashboard (hardcoded dark oklch colors throughout 1,721 lines)
- [x] Add independent Sun/Moon theme toggle button to admin dashboard header
- [x] Wrap dashboard in local dark/light class scope independent of global site theme
- [x] Update header, tab bar, stats cards, search/filter toolbar for light mode
- [x] Persist dashboard theme preference in localStorage (survives page refresh)

## Technician / Sales Rep System (Apr 28, 2026)
- [x] Add technicians table (userId, name, email, commissionRate=15%, status, invitedAt, joinedAt)
- [x] Add technician_invites table (token, email, invitedBy, usedAt, expiresAt)
- [x] Add technician_commissions table (technicianId, clientAccountId, invoiceId, amount, rate, status: pending|paid, paidAt)
- [x] Add assignedTechnicianId to client_accounts table (FK to technicians)
- [x] Push DB migration
- [x] Add tRPC procedures: adminInviteTechnician, adminGetTechnicians, adminGetCommissions, adminMarkCommissionPaid, adminDeactivateTechnician
- [x] Build "Team" tab in admin dashboard (list reps, invite form, commission sub-tab with Mark Paid)
- [x] Auto-create 15% commission record when first invoice for a tech-referred client is marked paid
- [x] Show commission status (pending/paid) in admin Team tab
- [x] Admin can mark commission as paid
- [ ] Build technician invite email (Resend) with accept link — future enhancement
- [ ] Build /accept-tech-invite page for technicians to create their account — future enhancement
- [ ] Build restricted technician portal view (can see their assigned clients + earnings) — future enhancement
- [ ] Technician can see their commission dashboard after login

## Customers Tab Fix (Apr 28, 2026)
- [x] Fix Customers tab showing 0 despite billing clients existing — now merges client_accounts + won leads
- [x] Add BILLING badge to clients from billing system vs lead-sourced customers
- [x] Show monthly price and account status (active/past_due/paused) on each customer row

## Rep Dashboard — Create Client & Send Welcome (Apr 28, 2026)
- [x] Add rep-facing tRPC procedures: repCreateClient, repSendWelcomeEmail, repSendWelcomeSMS, repGetProfile, repGetMyClients, repGetMyCommissions
- [x] Build /rep-dashboard page: create client form (name, email, phone, plan, monthly price, billing start)
- [x] Auto-create first invoice on client creation from rep dashboard
- [x] Send welcome email via Resend (invoice link + login portal link)
- [x] Send welcome SMS via Twilio (invoice link + login portal link)
- [ ] Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER secrets (user must provide)
- [x] Register /rep-dashboard route in App.tsx (full-screen, no public navbar)
- [x] Rep dashboard shows: profile info, stats, client list, create client form, commissions tab

## Scripts Tab in Admin Dashboard (Apr 28, 2026)
- [x] Add "Scripts" tab to admin dashboard nav (PhoneCall icon, amber color)
- [x] Build ColdCallScriptPanel component with 9 collapsible sections
- [x] Include tone guide, positioning cheat-sheet, and all objection handlers

## Scripts Tab on Rep Dashboard (May 1, 2026)
- [x] Extract ColdCallScriptPanel into shared component file (client/src/components/ColdCallScriptPanel.tsx)
- [x] Add Scripts tab to RepDashboard with same panel (PhoneCall icon, 4th tab)

## Light Mode Dashboard Fix (May 1, 2026)
- [ ] Fix Customers tab light mode: rows, badges, stat cards, text colors
- [ ] Broad light mode audit of all other tabs in AdminDashboard

## Light Mode Dashboard Fix (May 1, 2026)
- [x] Fix Customers tab light mode: rows, badges, stat cards, text colors
- [x] Broad light mode audit of all other tabs in AdminDashboard (Changes, Upgrades, Messages, Team, Scripts all fixed)
- [x] Fix ColdCallScriptPanel quote boxes and note text for light mode

## Dual Commission System (May 1, 2026)
- [x] Add `partners` table to schema (id, name, email, phone, companyName, commissionRate default 15, status, notes, createdAt)
- [x] Add `commissionType` (rep|partner), `partnerId`, `chargebackDeductionCents`, `netCommissionCents` to commissions table
- [x] Add `assignedPartnerId` FK to client_accounts table
- [x] Run pnpm db:push to migrate schema
- [x] Build partnerRouter: adminCreatePartner, adminListPartners, adminUpdatePartner, adminGetAllPartnerCommissions, adminMarkPartnerCommissionPaid, adminApplyChargeback
- [x] Build createDualCommissions() helper: on each payment, creates rep commission (15%) + partner commission (15%) if assigned
- [x] Wire dual commission creation into adminMarkInvoicePaid (manual) and Stripe webhook (checkout.session.completed)
- [x] Wire chargeback deduction into adminApplyChargeback procedure (deducts from both rep and partner)
- [x] Add Partners tab to admin dashboard (Partner Accounts sub-tab + Partner Commissions ledger sub-tab)
- [x] Partners tab: stat cards, add partner form, list with deactivate/reactivate, pending/paid totals per partner
- [x] Partner Commissions ledger: table with chargeback deduction column, Mark Paid button, summary stat cards

## Dashboard Robustness — Tier 1 & 2 (May 1, 2026)

### Tier 1 — High Impact, Low Effort
- [x] Fix MRR stat card to sum monthlyPriceCents from active client_accounts
- [x] Auto-generate next month invoice when current invoice is marked paid (adminMarkInvoicePaid)
- [x] Add partner assignment dropdown to admin Create Client form (Billing tab)
- [x] Add adminNotes field to leads (wizardSubmissions) schema + update procedure
- [x] Add source field to leads (Website/Cold Call/Referral/Social/Partner) + update procedure
- [x] Add followUpDate field to leads + surface overdue follow-ups at top of Leads tab
- [x] Add assignedTechnicianId + assignedPartnerId to wizardSubmissions (leads) schema
- [x] Add rep/partner assignment dropdowns to Leads tab expanded row

### Tier 2 — High Impact, Medium Effort
- [x] Add "Convert Lead → Client" button on won leads (pre-fills billing create form)
- [x] Add Revenue Analytics tab: MRR, collected vs outstanding, commissions owed, top clients, recent payments
- [x] Add bulk status update action to Leads tab (change multiple leads status at once)
- [x] Add invoice void/cancel action with reason field (adminVoidInvoice procedure + Void button in UI)
- [x] Run pnpm db:push after all schema changes

## Billing Tab Light Mode Fix (May 2, 2026)
- [x] Pass isDark prop to AdminBillingPanel and fix all ghost text in light mode
- [x] Build AnalyticsPanel component (MRR, collected, outstanding, commissions owed, top clients, recent payments)

## 4-Tier Access Level System (May 2, 2026)
- [x] Add `role` enum to technicians table: 'sales_rep' | 'technician' | 'manager' | 'admin'
- [x] Run pnpm db:push to migrate schema
- [x] Add requireRole() middleware helpers to server procedures
- [x] Gate admin dashboard tabs by role (Owner/Admin see all; Manager sees most; Sales Rep sees leads/scripts/commissions; Technician sees projects/messages/scripts)
- [x] Add role badge to Team tab technician rows + role selector for admin
- [x] Update rep dashboard to show role-appropriate tabs
- [x] Add role column to technician invite form

## Convert Quote to Customer (May 2, 2026)
- [x] Add `budgetQuote.convertToClient` server procedure
- [x] Add "Convert to Customer" button in Budget Quotes tab (expanded row)
- [x] Mark quote as converted after successful conversion

## Create Project Shortcut from Customers Tab (May 3, 2026)
- [x] Add "Create Project" button in Customers tab expanded row
- [x] Pre-fill new project form with client data (name, email, phone, business, website, monthly price)
- [x] Switch to Projects tab and open the new project form automatically

## Auto Welcome Email on Project Creation (May 3, 2026)
- [x] Read project creation procedure and welcome email template system
- [x] Wire sendWelcomeEmail into the createProject server procedure
- [x] Write vitest test for auto-send logic

## Auto Welcome SMS on Project Creation (May 3, 2026)
- [x] Audit existing SMS/Twilio infrastructure
- [x] Add sendProjectWelcomeSMS helper to server/sms.ts
- [x] Wire SMS send into adminProjects.create procedure
- [x] Write vitest tests for SMS helper

## Resend Welcome SMS Button in Projects Tab (May 3, 2026)
- [x] Add adminProjects.resendWelcomeSms tRPC procedure
- [x] Add "Resend Welcome SMS" button to Projects tab expanded row
- [x] Write vitest test for resendWelcomeSms procedure

## Sync Customers to Projects (May 3, 2026)
- [x] Add adminProjects.syncFromCustomers server procedure
- [x] Add "Sync Customers" button to Projects tab header
- [x] Skip customers who already have a project (deduplication by email)
- [x] Link new project back to customer record (projectId)

## Fix Ghost Text on Case Study Pages (May 4, 2026)
- [x] Identify all case study page components with ghost/placeholder text (expired hero image URLs)
- [x] Re-upload 4 hero images (MyDojo, Yaeger, Zolamind, HomeUp) to permanent CDN
- [x] Replace expired manuscdn URLs with permanent CloudFront URLs in all 4 case study pages

## Team Lead Role for ezeejoey.ej@gmail.com (May 5, 2026)
- [x] Add 'team_lead' to technician role enum in schema
- [x] Run pnpm db:push to migrate
- [x] Update tab gating: team_lead sees all tabs except Billing and Analytics
- [x] Hide commission dollar amounts from team_lead view (Commissions tab hidden in RepDashboard)
- [x] Add team_lead option to invite form and inline role change dropdown
- [x] Assign team_lead role to ezeejoey.ej@gmail.com in the database (id=1, active)
- [x] Update server procedures: team_lead tier = 3 (same as manager, no financial tabs in UI)

## Forgot Password Flow
- [x] Add resetToken and resetTokenExpiry columns to emailAuth table
- [x] Add forgotPassword tRPC procedure (generates token, sends reset email via Resend)
- [x] Add resetPassword tRPC procedure (validates token, updates password, clears token)
- [x] Create /forgot-password page (email input, success state)
- [x] Create /reset-password page (new password + confirm, show/hide toggle, success redirect)
- [x] Add "Forgot password?" link to Login.tsx sign-in form
- [x] Add "Forgot password?" link to AdminLogin.tsx
- [x] Register /forgot-password and /reset-password routes in App.tsx
- [x] Write vitest tests for forgotPassword and resetPassword procedures (6 tests, all passing)

## Pages Feature (May 7, 2026)
- [x] Add clientPages table to drizzle/schema.ts (id, clientAccountId, title, path, description, status, lastUpdated, sortOrder)
- [x] Create client_pages table in DB via direct SQL
- [x] Add getMyPages tRPC procedure to clientBillingRouter (client: fetch own pages ordered by sortOrder)
- [x] Add adminGetPages tRPC procedure (admin: list pages for a given clientAccountId)
- [x] Add adminAddPage tRPC procedure (admin: create new page record)
- [x] Add adminUpdatePage tRPC procedure (admin: update page fields)
- [x] Add adminDeletePage tRPC procedure (admin: delete a page)
- [x] Wire Pages tab in ClientBilling.tsx: PagesTab component with real data, status badges (live/draft/in_progress), Request Edit button per page
- [x] Add AdminPagesPanel component to AdminDashboard.tsx: Manage Pages button in customer expanded row, add/edit/delete pages UI
- [x] TypeScript: 0 errors (fresh npx tsc --noEmit check)
- [x] All 94 tests pass

## Website Preview Fix (May 7, 2026)
- [x] Replace iframe (blocked by X-Frame-Options) with screenshot-based preview
- [x] Add /api/screenshot server-side proxy endpoint (strips CSP, adds User-Agent)
- [x] Use thum.io as screenshot service (returns real 1440x1080 PNG screenshots)
- [x] Preview fills entire card box (520px height, object-fill)

## Rep Dashboard Fix (May 7, 2026)
- [x] Update admin.verify to also authenticate active technicians via Manus OAuth
- [x] AdminDashboard shows role-filtered tabs for technicians (team_lead sees Leads, Customers, Team, Scripts, Opportunity Pool)
- [x] Redirect unauthenticated users to Manus OAuth login so reps can log in without admin password
- [x] Redirect Manus OAuth users who aren't technicians to admin password page
- [x] Joey (team_lead) can access full robust dashboard via /flowsites-admin-dashboard with Manus OAuth

## Lead Tags & Rep Add Lead
- [ ] Add niche tag field to wizard_submissions schema (Martial Arts, Restaurant, Fitness, Self Defense, Health & Wellness, Other)
- [ ] Migrate DB with pnpm db:push
- [ ] Update admin.getLeads, admin.updateLead, admin.addLead procedures to include tag field
- [ ] Add tag badge display to lead cards in AdminDashboard
- [ ] Add tag filter to Leads tab header in AdminDashboard
- [ ] Add tag selector to Add Lead modal and Edit Lead panel in AdminDashboard
- [ ] Add addLead procedure accessible to reps (repAddLead in repRouter)
- [ ] Add "+ Add Lead" button and modal to RepDashboard leads section

## Add-On Pricing Tab (May 8, 2026)
- [x] Add "Add-On Pricing" tab to AdminDashboard ALL_TABS array (visible to all roles)
- [x] Import CORE_ADDONS, AUTO_ADDONS, INDUSTRY_ADDONS, fmt from client/src/lib/addons.ts
- [x] Render Website Add-Ons section with card grid (label + price)
- [x] Render Automation & Integration Add-Ons section with card grid
- [x] Render Industry-Specific Add-Ons grouped by industry (Martial Arts, Restaurant, Salon, etc.)
- [x] Add "addons" to activeTab state type union
- [x] TypeScript: 0 errors
- [x] All 115 tests pass

## Lead Local Time Display (May 8, 2026)
- [x] Build US state-to-timezone mapping utility (client/src/lib/timezones.ts)
- [x] Build useLocalTime hook that ticks every minute and returns formatted local time + timezone label
- [x] Add local time badge to each lead card in AdminDashboard (collapsed and expanded views)
- [x] Color-code badge: green = business hours (9am-6pm), yellow = early/late (7-9am or 6-8pm), red = outside hours
- [x] Handle leads with no state/city gracefully (show nothing or "Unknown TZ")

## 800.com Integration (May 8, 2026)
- [x] Add EIGHT_HUNDRED_API_KEY and EIGHT_HUNDRED_SENDER_NUMBER secrets
- [x] Build server/800com.ts helper (sendSms, getConversations, getMessages, verifyApiKey)
- [x] Add tRPC procedures: communications.sendSms, communications.getConversations, communications.getMessages
- [x] Add "Text" button to lead card expanded action bar (opens SMS modal)
- [x] Add "Text" button to customer card expanded action bar
- [x] Build SMS modal: text input + send button + conversation history thread view
- [x] Create sms_logs table in DB for audit trail
- [x] Write vitest tests for 800.com helper (16 tests)

## Inbound SMS Webhook (May 8, 2026)
- [x] Register POST /api/800com/webhook route in Express (before json middleware)
- [x] Parse 800.com inbound webhook payload (from, body/message/text, id, timestamp)
- [x] Store inbound message in sms_logs table (direction=inbound)
- [x] Add communications.getLocalMessages tRPC procedure (reads DB, outbound+inbound combined)
- [x] Add communications.getUnreadCount tRPC procedure (last 24h inbound count)
- [x] Update SmsModal to use getLocalMessages with 15s auto-poll (live indicator in header)
- [x] Show unread badge on Text button when new inbound message arrives (last 24h)
- [x] Add sender label and delivery checkmarks to message bubbles
- [x] Add GET /api/800com/webhook for 800.com URL verification challenge
- [x] Write vitest tests for webhook handler (14 tests, 163 total passing)

## SMS Inbox Tab (May 8, 2026)
- [x] Add communications.getInbox tRPC procedure (all messages grouped by contact, sorted newest first)
- [x] Add SMS Inbox tab to AdminDashboard nav (with cyan Inbox icon)
- [x] Build inbox conversation list: contact name (matched from leads/customers), phone, last message preview, timestamp, unread badge
- [x] All/Unread filter toggle in inbox header
- [x] Click conversation row → opens SmsModal for that contact
- [x] Auto-refresh inbox every 30s for new replies
- [x] Right panel shows contact header + "Open Thread" button
- [x] All 163 tests pass

## Outside-Hours SMS Warning Banner (May 8, 2026)
- [x] Add outside-hours warning banner to SmsModal: show lead's local time + caution if outside 9am–6pm
- [x] Color-code: amber for borderline (7–9am or 6–8pm), red for clearly outside hours
- [x] Banner is dismissible per session (rep can close it and still send)
- [x] Banner updates live (re-checks every minute via interval)

## Knowledge Center Tab (May 9, 2026)
- [x] Generate 3D-style illustration images for each knowledge category (SEO, Web Dev, CRM, Automation, Hosting, Analytics, Copywriting, Social Media)
- [x] Build KnowledgeCenter page with search bar, category filter chips, and Wise-style card grid
- [x] Build article detail view (full content with back button)
- [x] Add Knowledge Center tab to AdminDashboard navigation (visible to all roles)
- [x] Write content for 13 articles covering: SEO basics, keyword research, website anatomy, page speed, CRM, lead funnels, marketing automation, webhooks/APIs, analytics, hosting, copywriting, social media, responsive design, Google Ads
- [x] All 163 tests pass

## Ghost Text Fix — Knowledge Center (May 9, 2026)
- [x] Wrap KnowledgeCenter in dark container when dashboard is in light mode (fixes white-on-white ghost text)

## Lessons & Quizzes System (May 9, 2026)
- [x] Add DB tables: lessons, lesson_steps, quiz_questions, user_lesson_progress (created directly via SQL)
- [x] Push schema migrations to DB
- [x] Add tRPC procedures: getLessons, getLesson, submitQuiz, getUserProgress, seedLessons (in server/routers/learningRouter.ts)
- [x] Build LessonViewer component (step-by-step reader with progress bar, Next/Back navigation, quiz at end)
- [x] Add Lessons & Quizzes tab to Knowledge Center with lesson card grid and progress tracking
- [x] Add completion badges to lesson cards (Passed checkmark, progress bar)
- [x] Seed 5 lessons with 5 steps each and 5-question quizzes (SEO, Web Dev, CRM, Automation, Analytics)
- [x] Fix broken server/routers.ts (extracted communicationsRouter and learningRouter to separate files)
- [x] TypeScript: 0 errors (tsc --noEmit exits 0)
- [x] All 163 tests pass

## Ghost Text Audit — Full Site (May 9, 2026)
- [ ] Fix quiz modal: question text and answer options invisible (white text on white card)
- [ ] Fix lesson viewer: check all text colors in step content and navigation
- [ ] Fix article reader: check all text colors in article body
- [ ] Audit all other dashboard pages for ghost text in light mode
- [ ] Fix any other ghost text found across the entire admin dashboard

## Ghost Text Audit — Full Site (May 9, 2026)
- [x] Root cause: dashboard isDark toggle was not syncing the html dark class, so CSS variables always resolved to light mode
- [x] Fix: added useEffect in AdminDashboard to sync document.documentElement.classList dark on mount and on toggle
- [x] Fix: rewrote LessonViewer with explicit dark colors (no semantic CSS variables)
- [x] Fix: KnowledgeCenter wrapped in dark container for light-mode dashboard
- [x] Audit: RepDashboard, AdminScheduling, ClientPortal, ClientBilling — no semantic color variables (clean)
- [x] Audit: Home.tsx uses semantic variables correctly (light mode, dark text on light bg)
- [x] TypeScript: 0 errors after all fixes

## Multi-Item Invoices & Code Transfer (May 9, 2026)
- [ ] Add invoice_items table to schema (invoiceId, description, quantity, unitPrice, amount)
- [ ] Push DB migration
- [ ] Add PRESET_ITEMS constant with Code Transfer ($600) and other common items
- [ ] Update createInvoice tRPC procedure to accept array of line items
- [ ] Update getInvoice/getInvoices procedures to return items with each invoice
- [ ] Update admin billing UI: replace single-amount field with multi-item invoice builder
- [ ] Add "Code Transfer" quick-add preset button in invoice builder
- [ ] Auto-calculate invoice total from line items
- [ ] Update public invoice view (/invoice/:id) to show itemized line items table
- [ ] Write vitest tests for invoice item total calculation

## Multi-Item Invoices & Code Transfer (May 9, 2026)
- [x] Add invoice_items table to DB (created via SQL + added to drizzle/schema.ts)
- [x] Update adminCreateInvoice tRPC procedure to accept optional items array
- [x] Update getInvoiceByShareToken to return items alongside invoice
- [x] Update createSharedInvoiceCheckout to use itemized Stripe line_items when items exist
- [x] Add multi-item invoice builder UI in admin billing section (Quick Add presets + custom rows)
- [x] Add Code Transfer preset at $600 (highlighted in crimson in the preset buttons)
- [x] Add presets: Monthly Hosting & Maintenance, Add-On Page, SEO Setup, Automation Setup, Custom Feature
- [x] Update PublicInvoice page to render itemized line items (falls back to legacy single-line for old invoices)
- [x] Write vitest tests for line item totals, Code Transfer price, discount application (12 tests)
- [x] All 175 tests pass

## Real Analytics in Customer Portal (May 9, 2026)
- [x] Add getAnalytics procedure to clientPortalRouter (PageSpeed scores + DB activity stats)
- [x] Wire analytics tab in ClientPortal.tsx to real data (replace hardcoded TOP_PAGES, TRAFFIC_SOURCES, scores)
- [x] Wire performance tab circular scores to real PageSpeed data
- [x] Add Refresh button with 5-15s loading state for PageSpeed analysis
- [x] Fix TypeScript type errors in KnowledgeCenter.tsx (estimatedMinutes vs durationMinutes)
- [x] All 175 tests pass (18 test files)

## Customer Login System (May 9, 2026)
- [x] Audit current client auth setup (clientPortalPasswords + clientPortalSessions tables already exist)
- [x] clientPortalSessions table already in DB (reused existing mechanism)
- [x] tRPC procedures: clientPortalAuth.login, logout, me, setupPassword, forgotPassword, resetPassword all exist
- [x] Magic link / password reset flow for clients (forgotPassword + resetPassword procedures)
- [x] /client-login page (email + password form, "Forgot password" link) — already existed, fixed use-toast import
- [x] /client-setup page (set password from invite token) — already existed, fixed use-toast import
- [x] /client-reset-password page (reset password from reset token) — already existed, fixed use-toast import
- [x] ClientPortal supports both Manus OAuth and clientPortalAuth session — redirects to /client-login if neither
- [x] Show client name/email in portal sidebar (displayName/displayEmail from portal session or Manus OAuth)
- [x] Add logout button in client portal sidebar (handles both auth methods)
- [x] Add Send Portal Invite button in AdminDashboard (sends setup email to client)
- [x] Add cookie-parser middleware so req.cookies is populated for session reading
- [x] clientPortalAuth.getMyProjectBySession procedure — looks up project by session email
- [x] All 175 tests pass (18 test files)

## Homepage Redesign — AI Business Growth System Positioning (May 9, 2026)
- [x] New hero: "Your Website Should Be Making You Money While You Sleep" headline + animated dashboard visuals
- [x] Core services section: 10 services as business outcomes (AI Receptionists, Automated Lead Follow-Up, CRM, AI Chatbots, Booking Automation, Business Websites, Missed Call Text Back, AI Voice Agents, Sales Automation, Customer Retention)
- [x] How It Works: 4-step process (Build → AI Captures → Automated Follow-Up → You Close)
- [x] Industry sections: Martial Arts, Roofing, Contractors, Med Spas, Insurance, Restaurants, RV Parks, Gyms
- [x] Social proof: testimonials, logos, analytics, before/after, lead growth metrics
- [x] Flagship offer section: "AI Business Growth System" (Website + AI Chatbot + CRM + Lead Capture + Follow-Up + Booking + AI Receptionist)
- [x] Founder branding: subtle operator positioning
- [x] Update Navbar CTAs to "Book a Free Strategy Call"
- [x] Remove excessive glassmorphism/glowing effects
- [x] Premium SaaS visual style (black/white/gray base, tasteful gradients, strong typography)

## Full Visual Homepage Redesign — Stripe/Linear/Vercel Style (May 9, 2026)
- [ ] Redesign index.css: new Inter/Geist font, pure white canvas, near-black text, red accent, new utility classes
- [ ] Rebuild Home.tsx from scratch: completely new layout, sections, visual hierarchy
- [ ] New hero: full-width, asymmetric, bold black type on white, red accent word, floating UI mockup card
- [ ] New services grid: clean icon cards, white bg, subtle borders, hover lift
- [ ] New How It Works: numbered steps, horizontal flow, clean connectors
- [ ] New industry section: horizontal scroll cards with industry icons
- [ ] New flagship offer: feature checklist, pricing anchor, CTA
- [ ] New testimonials: large quote cards, real names, clean layout
- [ ] New portfolio: screenshot cards with hover overlay
- [ ] New footer CTA strip: dark bg, bold headline, red button
- [ ] Update Navbar: clean white, dark text, red CTA button

## Logo Update (May 10, 2026)
- [x] Upload FlowSites logo PNG to static assets CDN
- [x] Update Navbar to use the uploaded logo image for light backgrounds
- [x] Update Footer, AdminDashboard, BookCall, GetStarted logo references
- [x] Set up storage proxy for serving webdev static assets

## Real First-Party Analytics Tracking
- [x] Add page_views and analytics_tokens tables to DB schema
- [x] Create analyticsRouter with track, getToken, getStats, getTopPages, getTrafficSources procedures
- [x] Wire analyticsRouter into appRouter
- [x] Replace hardcoded PERF_CHART data in ClientBilling with real DB queries
- [x] Add stat cards (Page Views, Unique Visitors) to Analytics tab using real data
- [x] Add empty state to Traffic Overview chart when no data recorded yet
- [x] Add Top Pages section powered by real DB data
- [x] Add Tracking Snippet section in Analytics tab with copy-to-clipboard button
- [x] Write vitest tests for analytics helpers (detectDevice, parseUtm)

## Google OAuth for Team Members
- [ ] Set up Google OAuth client credentials (Client ID + Secret)
- [ ] Build Google OAuth callback endpoint for team member login
- [ ] Update AcceptTechInvite page to use Google Sign-In button
- [ ] Update RepDashboard login to use Google Sign-In
- [ ] Store Google sub ID as openId for technicians
- [ ] Test full invite → Google login → rep dashboard flow

## Google OAuth for Team Members
- [x] Replace Manus OAuth with Google OAuth for team member (technician/rep) login
- [x] Build /api/auth/google and /api/auth/google/callback routes
- [x] Update AcceptTechInvite page to show "Sign in with Google" button
- [x] Update RepDashboard to redirect to Google OAuth when unauthenticated
- [x] Auto-activate technician account on first Google sign-in
- [x] Write vitest tests for Google OAuth configuration

## Remove Manus OAuth — Replace with Google Sign-In Everywhere
- [ ] Remove Manus OAuth from all login flows (admin, client portal, rep dashboard)
- [ ] Replace all getLoginUrl() redirects with Google Sign-In
- [ ] Update server auth context to work with Google-issued sessions
- [ ] Remove VITE_OAUTH_PORTAL_URL dependency from frontend

## Team & Invoices Improvements
- [ ] Resend Invite button in Team tab (backend + UI)
- [ ] Mark as Paid button on commission rows in Invoices tab
- [ ] Rep filter dropdown in Invoices tab
- [x] Add Trusted by Brands logo strip section to homepage (below hero, above stats bar)
- [x] Fix analyzer URL input to not require http:// or https:// prefix (auto-prepends protocol)
- [x] Analyzer: show normalized URL hint below input after auto-prepend
- [x] Analyzer: inline validation for clearly invalid URLs (no dot, etc.)
- [x] Analyzer: sticky Re-analyze button at bottom of results
- [x] Analyzer: auto-save leads to DB when analysis completes
- [x] Analyzer: shareable results link at /analyzer/results/:id
- [x] Analyzer: score benchmark comparison in results view
- [x] Analyzer: admin view of all analyzer leads/results
- [x] Unlock tabs for sales_rep: Projects, Change Requests, Messages, Upgrades, Budget Quotes, Invoices, Analytics
- [x] Add repGetClientsForMessaging, repGetMessages, repSendMessage procedures to technicianRouter
- [x] Keep Billing, Team, Partners admin-only

## Confirmed Bookings Tab
- [ ] DB schema: bookings_queue table (prospect info, preferred time, source, status, claimed_by_technician_id)
- [ ] Backend: tRPC procedures (listBookings, claimBooking, updateBookingStatus, addBooking)
- [ ] UI: Confirmed Bookings tab in AdminDashboard with queue view and rep claim flow
- [x] Confirmed Bookings tab: DB table, backend procedures, AdminDashboard UI with claim/status/notes

## 800.com Integration (May 13, 2026)
- [x] Create new 800.com API key (FlowSites CRM Integration) for company ID 334319
- [x] Configure EIGHT_HUNDRED_API_KEY and EIGHT_HUNDRED_SENDER_NUMBER secrets
- [x] Update 800com.ts helper with correct API endpoints (company-scoped)
- [x] Fix getConversations() to use company-scoped endpoint
- [x] Fix getConversationMessages() → getConversationItems() with correct endpoint
- [x] Add contact.submit tRPC procedure for public contact form submissions
- [x] Connect Contact page form to backend via tRPC (was previously a fake timeout)
- [x] Add SMS notification via 800.com when contact form is submitted
- [x] Update phone number to 800.com tracking number (281) 503-8903 across all pages
- [x] Verify 800.com conversations API returns live data (company ID 334319 confirmed)

## Email Blast & Opt-In Page (May 19, 2026)
- [ ] Build /interested opt-in landing page (Name, Phone, Email, Business Name, Website)
- [ ] Wire opt-in form to backend — save to DB and notify admin via email + SMS
- [ ] Send email blast to 198 leads with opt-in link
