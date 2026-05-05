# E-commerce Dashboard - Bootstrap Version

A complete, responsive e-commerce dashboard template built with **Bootstrap 5**, **vanilla JavaScript**, and **Chart.js**. This is a mirror version of the React application, featuring the same UI, interactions, animations, and functionality.

## 🚀 Features

- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean design with smooth animations and transitions
- **Interactive Charts** - Revenue and sales analytics using Chart.js
- **Mock Data Integration** - All data is mocked for demonstration purposes
- **Nigerian Addresses** - Authentic Nigerian customer and business data
- **Multiple Pages**:
  - Dashboard with statistics and charts
  - Products management
  - Orders tracking
  - Customer management
  - Messaging system
  - Settings configuration
- **Optimized Images** - Uses Unsplash images with optimization parameters
- **No Dependencies** - Only requires Bootstrap and Chart.js via CDN

## 📁 Project Structure

```
bootstrap-version/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Custom styles
├── js/
│   ├── app.js          # Main application logic
│   ├── mock-data.js    # Mock data for demo
│   └── charts.js       # Chart configurations
└── images/             # Image assets (if any)
```

## 🛠️ Installation & Usage

### Option 1: Direct File Opening
Simply open `index.html` in your web browser:

```bash
# On macOS
open bootstrap-version/index.html

# On Windows
start bootstrap-version/index.html

# On Linux
xdg-open bootstrap-version/index.html
```

### Option 2: Using a Local Server
For better performance and to avoid CORS issues:

```bash
# Using Python 3
cd bootstrap-version
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server bootstrap-version -p 8000

# Using PHP
php -S localhost:8000 -t bootstrap-version
```

Then visit `http://localhost:8000` in your browser.

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #4f46e5;      /* Main brand color */
    --secondary-color: #6b7280;    /* Secondary color */
    --success-color: #10b981;      /* Success states */
    --danger-color: #ef4444;       /* Error/danger states */
    --warning-color: #f59e0b;      /* Warning states */
    --info-color: #3b82f6;         /* Info states */
}
```

### Updating Mock Data
Modify the data in `js/mock-data.js`:

```javascript
const mockOrders = [
    {
        id: 'ORD-001',
        customer: 'Customer Name',
        // ... other fields
    }
];
```

### Changing Logo
Update the logo image URL in `index.html`:

```html
<img src="your-logo-url.png" alt="Logo" class="logo-img">
```

## 📱 Responsive Breakpoints

- **Desktop**: ≥ 992px - Full sidebar visible
- **Tablet**: 768px - 991px - Collapsible sidebar
- **Mobile**: < 768px - Hidden sidebar with toggle

## 🔧 Key Functionalities

### Navigation
- Click sidebar items to navigate between pages
- Mobile: Toggle sidebar with hamburger menu
- Active page highlighted in sidebar

### Dashboard
- Real-time statistics cards
- Interactive revenue chart (line graph)
- Sales by category (doughnut chart)
- Recent orders table

### Products
- View all products with images
- Search functionality
- Filter by category
- Add new products via modal
- Edit/Delete actions

### Orders
- Complete order listing
- Status badges (Completed, Processing, Pending, Shipped)
- View order details in modal
- Update order status

### Customers
- Customer list with contact info
- Order history and total spent
- Join date tracking

### Messages
- Inbox-style message list
- Unread message indicators
- Message detail view
- Reply and delete actions

### Settings
- Store configuration form
- Currency selection
- Contact information

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 📝 Notes

1. **All data is mocked** - No real API calls are made
2. **Images from Unsplash** - Optimized for fast loading
3. **Favicon** - Uses the shared favicon from the React version
4. **No build process** - Pure HTML/CSS/JS, ready to use
5. **Nigerian context** - Currency (₦), phone numbers, and addresses are Nigerian

## 🔄 Differences from React Version

| Feature | React Version | Bootstrap Version |
|---------|--------------|-------------------|
| Framework | React 18 | Vanilla JS |
| Styling | Tailwind CSS | Bootstrap 5 |
| State Management | React Hooks | DOM Manipulation |
| Routing | React Router | Page Visibility |
| Build Process | Vite | None |
| Bundle Size | ~150KB | ~50KB |

## 🤝 Contributing

To extend this template:

1. Keep the code vanilla (no frameworks)
2. Maintain responsiveness
3. Use Bootstrap classes where possible
4. Keep mock data realistic
5. Test on multiple devices

## 📄 License

This template is free to use for personal and commercial projects.

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Ensure all files are in correct locations
3. Verify CDN links are accessible
4. Clear browser cache if needed

## 🌟 Quick Tips

- **Performance**: Images are optimized with size parameters
- **SEO**: Add meta tags as needed for your use case
- **Accessibility**: All interactive elements have proper labels
- **Mobile**: Test on actual mobile devices for best results

---

**Built with ❤️ using Bootstrap 5 and Vanilla JavaScript**
