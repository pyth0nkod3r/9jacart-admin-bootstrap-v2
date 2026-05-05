# AdminHub - Bootstrap Version

A complete admin dashboard built with **Bootstrap 5** and **vanilla JavaScript**, mirroring the React AdminHub application. This version provides full parity in UI, features, and data handling using pure HTML/CSS/JS without any SPA framework.

## 🚀 Features

- **Pure HTML/CSS/JS** - No build process, no SPA framework
- **Bootstrap 5** - Modern, responsive UI components
- **Shared Layout** - Sidebar and navbar injected via JavaScript
- **Mock JWT Auth** - Token-based authentication with expiry
- **Theme System** - 5 color palettes (forest, ocean, sunset, midnight, minimal)
- **Toast Notifications** - Success/error feedback system
- **Mock API Surface** - Mirrors React apiService with simulated delays
- **Full Page Coverage**:
  - Dashboard overview
  - Orders management
  - Waitlist management
  - Contacts management
  - Vendor signups (with approve/suspend flows)
  - Buyer signups (with toggle status)
  - Business categories (detail + create)
  - Product categories (detail + create)
  - Buyer messages (with reply)
  - Vendor messages (with reply)
  - Commission change
- **Responsive Design** - Works on desktop, tablet, and mobile

## 📁 Project Structure

```
bootstrap-version/
├── index.html              # Login page
├── dashboard.html          # Dashboard overview
├── orders.html             # Orders list
├── waitlist.html           # Waitlist list
├── contacts.html           # Contacts list
├── vendor-signups.html     # Vendor signups list
├── buyer-signups.html      # Buyer signups list
├── business-categories.html # Business categories list
├── product-categories.html  # Product categories list
├── buyer-messages.html     # Buyer messages list
├── vendor-messages.html    # Vendor messages list
├── commission-change.html  # Commission change page
├── contact-detail.html     # Contact detail page
├── waitlist-detail.html    # Waitlist detail page
├── vendor-signup-detail.html # Vendor signup detail page
├── buyer-signup-detail.html  # Buyer signup detail page
├── business-category-detail.html # Business category detail page
├── business-category-create.html # Business category create page
├── product-category-detail.html  # Product category detail page
├── product-category-create.html  # Product category create page
├── buyer-message-detail.html    # Buyer message detail page
├── vendor-message-detail.html   # Vendor message detail page
├── css/
│   └── style.css            # Custom styles + theme tokens
├── js/
│   ├── config.js             # App configuration
│   ├── auth.js               # Mock JWT authentication
│   ├── guard.js              # Auth guard
│   ├── layout.js             # Shared layout injection
│   ├── api.js                # Mock API surface
│   ├── mock-data.js          # Mock data
│   ├── notifications.js      # Notification counts + toasts
│   ├── app.js                # Main app initialization
│   └── pages/                # Page-specific scripts
│       ├── _utils.js         # Shared utilities
│       ├── dashboard.js
│       ├── orders.js
│       ├── waitlist.js
│       ├── contacts.js
│       ├── vendor-signups.js
│       ├── buyer-signups.js
│       ├── business-categories.js
│       ├── product-categories.js
│       ├── buyer-messages.js
│       ├── vendor-messages.js
│       ├── commission-change.js
│       ├── contact-detail.js
│       ├── waitlist-detail.js
│       ├── vendor-signup-detail.js
│       ├── buyer-signup-detail.js
│       ├── business-category-detail.js
│       ├── business-category-create.js
│       ├── product-category-detail.js
│       ├── product-category-create.js
│       ├── buyer-message-detail.js
│       └── vendor-message-detail.js
└── ../public/favicon.svg     # Shared favicon
```

## 🛠️ Installation & Usage

### Using a Local Server

```bash
cd bootstrap-version/9jacart-admin-bootstrap-v2
python3 -m http.server 8765
```

Then visit `http://localhost:8765` in your browser.

### Login Credentials

- **Email**: admin@adminhub.ng
- **Password**: password

## 🎨 Theme System

The app supports 5 color themes selectable via the top navbar dropdown:

- **Forest** (default) - Green-based natural palette
- **Ocean** - Blue-based maritime palette
- **Sunset** - Orange/warm sunset palette
- **Midnight** - Purple-based night palette
- **Minimal** - Monochrome grayscale palette

Themes use OKLCH color space for modern color handling.

## 🔧 Key Functionalities

### Authentication
- Mock JWT token with 24-hour expiry
- Auto-redirect to login on token expiry
- Protected route guard

### Navigation
- Sidebar with active page highlighting
- Mobile-responsive sidebar toggle
- Notification badges on menu items

### Detail Pages
- Contact Detail - View contact message and info
- Waitlist Detail - View waitlist entry with business info
- Vendor Signup Detail - Approve/suspend/unsuspend flows, document viewing
- Buyer Signup Detail - Toggle active status
- Business Category Detail - Edit/save/delete category
- Product Category Detail - Edit/save/delete category
- Buyer Message Detail - View conversation, reply
- Vendor Message Detail - View conversation, reply

### Create Pages
- Business Category Create - Create new business category
- Product Category Create - Create new product category

## 🔄 Differences from React Version

| Feature | React Version | Bootstrap Version |
|---------|--------------|-------------------|
| Framework | React 18 | Vanilla JS |
| Styling | Tailwind CSS | Bootstrap 5 |
| State Management | React Hooks | DOM Manipulation |
| Routing | React Router | Page navigation |
| Build Process | Vite | None |
| Dark Mode | Removed | Not implemented |
| Theme System | 5 palettes + dark | 5 palettes only |

## 📝 Notes

1. **All data is mocked** - No real API calls are made
2. **Shared favicon** - Uses `../public/favicon.svg`
3. **No SPA** - Each page is a separate HTML file
4. **No dark mode** - Light mode only, per parity plan
5. **Nigerian context** - Currency (₦), phone numbers, and addresses

## 📄 License

This project is free to use for personal and commercial projects.

---

**Built with ❤️ using Bootstrap 5 and Vanilla JavaScript**
