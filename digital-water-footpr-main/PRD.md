# Planning Guide

An AI-driven web application that empowers users to understand the hidden water costs of their consumption by capturing or uploading product images and receiving instant water footprint estimates.

**Experience Qualities**:
1. **Educational** - Users discover the invisible environmental impact of everyday items through immediate, visual feedback that transforms abstract water consumption into tangible numbers.
2. **Trustworthy** - Clean, scientific presentation with clear confidence scores and data sources builds credibility for the ML estimates and encourages behavior change.
3. **Effortless** - Frictionless image capture and instant results make environmental consciousness as simple as taking a photo.

**Complexity Level**: Light Application (multiple features with basic state)
  - The app requires authentication, image processing, historical tracking, and admin capabilities, but operates entirely client-side with local persistence, making it a focused tool rather than a complex platform.

## Essential Features

### User Authentication
- **Functionality**: JWT-based sign up, login, and role-based access control
- **Purpose**: Personalize water footprint tracking and enable admin management of reference data
- **Trigger**: Landing page with sign in/sign up options
- **Progression**: Enter credentials → Validate → Generate JWT token → Store in KV → Route to dashboard
- **Success criteria**: Users can create accounts, log in securely, persist sessions across page reloads, and admin users see additional management features

### Image-based Estimation
- **Functionality**: Capture photos via device camera or upload existing images, then receive water footprint estimates
- **Purpose**: Make invisible water consumption visible through ML-powered analysis
- **Trigger**: Click "Analyze Product" button or camera icon
- **Progression**: Select camera/upload → Capture/choose image → Preview → Submit → ML processing → Display results (product name, liters, confidence)
- **Success criteria**: Successfully processes images from both camera and file upload, returns realistic estimates with confidence scores, saves results to history

### History & Analytics
- **Functionality**: View all past analyses with aggregated statistics and trends
- **Purpose**: Track personal water footprint over time and identify high-impact consumption patterns
- **Trigger**: Navigate to "History" tab
- **Progression**: Load user's estimation history → Display as cards/table → Show summary stats (total analyses, total liters, top 5 products)
- **Success criteria**: Persistent storage of all analyses, accurate aggregation, sortable/filterable views

### Admin Water Coefficients
- **Functionality**: Manage reference database of water consumption values per product type
- **Purpose**: Enable fine-tuning of ML estimates and maintain accurate water footprint data
- **Trigger**: Admin role accessing "Coefficients" management panel
- **Progression**: View coefficient table → Add/edit/delete entries → Update base water values → Changes reflect in future estimates
- **Success criteria**: Only admin users can access, CRUD operations persist to KV storage, UI prevents invalid data entry

## Edge Case Handling

- **No Camera Access**: Gracefully fall back to file upload with clear messaging if camera permissions denied
- **Invalid Image Format**: Client-side validation rejects non-image files before processing
- **Duplicate Sessions**: JWT expiration and refresh logic prevent stale authentication states
- **Missing ML Model**: Placeholder estimator returns sensible defaults with lower confidence scores
- **Empty History**: Show encouraging empty state prompting first analysis
- **Unauthorized Admin Access**: Route guards and UI conditionals hide admin features from standard users

## Design Direction

The interface should evoke scientific precision tempered with approachable environmentalism - imagine a research lab's clarity merged with the calm, purposeful aesthetic of a sustainability app, using clean data visualization, generous whitespace, and confident typography that makes complex information digestible without feeling sterile.

## Color Selection

Triadic (three equally spaced colors) - Using water blue, earth green, and warm terracotta to represent the cycle of water through agriculture and industry, evoking environmental awareness while maintaining visual energy and distinction between UI zones.

- **Primary Color**: Deep Ocean Blue (oklch(0.45 0.15 240)) - Represents water itself, used for primary actions and communicates trust and environmental focus
- **Secondary Colors**: 
  - Forest Green (oklch(0.55 0.12 150)) - Sustainability and growth, used for success states and positive metrics
  - Terracotta (oklch(0.60 0.10 40)) - Earth and agriculture, used for warning states and high water usage alerts
- **Accent Color**: Bright Aqua (oklch(0.75 0.13 200)) - Draws attention to CTAs and important data points, represents fresh water
- **Foreground/Background Pairings**:
  - Background (White oklch(0.98 0 0)): Dark Gray text (oklch(0.25 0 0)) - Ratio 14.2:1 ✓
  - Card (Light Blue oklch(0.96 0.02 240)): Dark text (oklch(0.25 0 0)) - Ratio 13.5:1 ✓
  - Primary (Deep Ocean oklch(0.45 0.15 240)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Forest Green oklch(0.55 0.12 150)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Accent (Bright Aqua oklch(0.75 0.13 200)): Dark text (oklch(0.25 0 0)) - Ratio 6.8:1 ✓
  - Muted (Light Gray oklch(0.92 0 0)): Medium Gray text (oklch(0.50 0 0)) - Ratio 4.9:1 ✓

## Font Selection

Typography should balance scientific credibility with approachable readability, using a clean geometric sans-serif that conveys precision for data while remaining warm enough for consumer-facing education.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold / 32px / -0.02em tracking / 1.2 line-height
  - H2 (Section Header): Inter SemiBold / 24px / -0.01em tracking / 1.3 line-height
  - H3 (Card Title): Inter Medium / 18px / 0 tracking / 1.4 line-height
  - Body (Content): Inter Regular / 16px / 0 tracking / 1.6 line-height
  - Caption (Metadata): Inter Regular / 14px / 0 tracking / 1.5 line-height
  - Data (Numbers): Inter SemiBold / 28px / -0.01em tracking / 1.2 line-height

## Animations

Animations should feel like water flowing - smooth, purposeful transitions that guide the eye without creating unnecessary wait times, with micro-interactions that reward user actions and reinforce the environmental narrative through organic, fluid motion.

- **Purposeful Meaning**: Estimation results fade in with a gentle upward float (like bubbles rising), confidence meters fill with liquid-like easing, history cards stagger in to suggest accumulation over time
- **Hierarchy of Movement**: 
  - Critical: Estimation result appearance (300ms spring animation)
  - Important: Page transitions (250ms ease-out)
  - Subtle: Hover states and button presses (150ms ease-in-out)
  - Ambient: Background metric updates (500ms gentle fade)

## Component Selection

- **Components**:
  - **Card**: Primary container for estimation results, history items, and coefficient entries - add subtle border and shadow for depth
  - **Button**: Primary actions (Analyze, Submit) use solid primary color; secondary actions (Cancel, Back) use ghost variant
  - **Input**: Text fields for authentication and coefficient management with floating labels
  - **Tabs**: Navigate between Dashboard, History, and Admin sections
  - **Table**: Display water coefficients in admin panel with sortable columns
  - **Dialog**: Confirmation modals for delete actions and auth forms
  - **Progress**: Show confidence scores as horizontal bars
  - **Avatar**: Display user profile in header
  - **Badge**: Tag product categories and confidence levels
  - **ScrollArea**: History list when items exceed viewport
  
- **Customizations**:
  - Camera capture component (custom) - overlays video stream with capture button
  - Water droplet loader (custom) - animated SVG for estimation processing
  - Summary dashboard cards (custom) - metric displays with icons from Phosphor
  
- **States**:
  - Buttons: Default → Hover (lift with shadow) → Active (slight scale down) → Disabled (reduced opacity + no interaction)
  - Inputs: Default → Focused (accent border + subtle glow) → Error (destructive border + shake animation) → Filled (border remains visible)
  - Cards: Default → Hover (subtle lift, border brightens)
  
- **Icon Selection**:
  - Camera (image capture), Upload (file select), Drop (water), ChartBar (analytics), Shield (admin), SignOut (logout), Plus (add coefficient), Pencil (edit), Trash (delete), Clock (history)
  
- **Spacing**:
  - Page padding: p-6 md:p-8
  - Card padding: p-6
  - Section gaps: gap-8
  - Element groups: gap-4
  - Inline elements: gap-2
  
- **Mobile**:
  - Tabs collapse to bottom navigation bar on mobile
  - Table transforms to stacked cards on screens < 768px
  - Camera button becomes prominent FAB on mobile
  - History cards switch from 2-column grid to single column
  - Header condenses to hamburger menu with user avatar
