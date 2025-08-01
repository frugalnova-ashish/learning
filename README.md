# Pharma Connect - Management Panel Dashboard

A complete, fully functional pharmacy management dashboard with modern UI/UX design, authentication system, and responsive layout.

## 🚀 Features

### ✅ Authentication System
- **Login/Logout functionality** with session management
- **Multiple user credentials** (admin, manager, user)
- **Persistent login state** using localStorage
- **Security features** with form validation

### ✅ Dashboard Overview
- **Real-time statistics** for sales, revenue, and expenses
- **Interactive cards** with hover effects and animations
- **Top-selling drugs** section with rankings
- **Notifications & alerts** system
- **Recent orders** with status indicators

### ✅ Navigation & UI
- **Responsive sidebar** navigation with mobile toggle
- **Professional design** with modern color scheme
- **Smooth animations** and transitions
- **Keyboard shortcuts** (Alt+D, Alt+S, Alt+O, Alt+L)
- **Toast notifications** system

### ✅ Technical Features
- **Mobile-responsive** design
- **Cross-browser compatibility**
- **Performance optimized**
- **Clean, semantic HTML5**
- **Modern CSS3** with animations
- **jQuery-powered** interactions

## 🛠️ Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Styling and animations
- **TailwindCSS** - Utility-first CSS framework
- **Bootstrap 5** - Component library
- **JavaScript (ES6+)** - Core functionality
- **jQuery** - DOM manipulation and AJAX
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

## 📁 Project Structure

```
pharma-connect/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Custom CSS styles
├── js/
│   └── script.js       # JavaScript functionality
└── README.md           # Project documentation
```

## 🚀 Quick Setup

### Option 1: Direct File Access
1. **Clone or download** the project files
2. **Open `index.html`** in any modern web browser
3. **Login** with demo credentials:
   - Username: `admin` / Password: `admin123`
   - Username: `manager` / Password: `manager123`
   - Username: `user` / Password: `user123`

### Option 2: Local Web Server (Recommended)

#### Using Python (if installed):
```bash
# Navigate to project directory
cd pharma-connect

# Python 3
python -m http.server 8000

# Python 2
python -SimpleHTTPServer 8000

# Open browser: http://localhost:8000
```

#### Using Node.js (if installed):
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd pharma-connect

# Start server
http-server -p 8000

# Open browser: http://localhost:8000
```

#### Using PHP (if installed):
```bash
# Navigate to project directory
cd pharma-connect

# Start PHP server
php -S localhost:8000

# Open browser: http://localhost:8000
```

#### Using Live Server (VS Code Extension):
1. Install **Live Server** extension in VS Code
2. Right-click on `index.html`
3. Select **"Open with Live Server"**

## 🎯 Usage Guide

### Login Process
1. **Open the application** in your browser
2. **Enter credentials** (see demo credentials above)
3. **Click "Sign In"** to access the dashboard

### Navigation
- **Sidebar Menu**: Click any menu item to navigate
- **Mobile Menu**: Use hamburger button on mobile devices
- **Keyboard Shortcuts**:
  - `Alt + D` - Dashboard
  - `Alt + S` - Stock
  - `Alt + O` - Orders
  - `Alt + L` - Logout

### Dashboard Features
- **Statistics Cards**: View sales, revenue, and expense data
- **Top-Selling Drugs**: Monitor best-performing products
- **Notifications**: Click bell icon for alerts
- **User Menu**: Click user avatar for profile options

## 🎨 Customization

### Colors & Branding
Edit `css/style.css` to customize:
```css
/* Primary colors */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Data & Content
Edit `js/script.js` to customize:
- Dashboard statistics
- User credentials
- Navigation items
- Notification messages

## 📱 Browser Support

- ✅ **Chrome** 80+ (Recommended)
- ✅ **Firefox** 75+
- ✅ **Safari** 13+
- ✅ **Edge** 80+
- ⚠️ **Internet Explorer** (Not supported)

## 🔧 Development

### Adding New Pages
1. **HTML**: Add new page section in `index.html`
```html
<div id="new-page" class="page-content hidden">
    <h2>New Page Title</h2>
    <!-- Page content -->
</div>
```

2. **Navigation**: Add menu item
```html
<a href="#" class="nav-item" data-page="new-page">
    <i class="fas fa-icon"></i>
    <span>New Page</span>
</a>
```

3. **JavaScript**: Add page handling in `script.js`
```javascript
function loadNewPageData() {
    // Load page-specific data
}
```

### Adding Authentication
To integrate with a real backend:
1. **Replace** `validateCredentials()` function
2. **Update** login endpoint in `handleLogin()`
3. **Add** JWT token handling
4. **Implement** role-based access control

## 🚦 Performance Tips

1. **Enable browser caching** for static assets
2. **Minify CSS/JS** for production
3. **Optimize images** and use WebP format
4. **Use CDN** for external libraries
5. **Implement lazy loading** for large datasets

## 🔒 Security Considerations

⚠️ **Important**: This is a demo application. For production use:

1. **Never store credentials** in frontend code
2. **Use HTTPS** for all communications
3. **Implement proper authentication** with backend
4. **Validate all user inputs** on server-side
5. **Use secure session management**
6. **Implement rate limiting** for login attempts

## 🐛 Troubleshooting

### Common Issues:

**Q: Dashboard not loading properly**
- Ensure all files are in correct directories
- Check browser console for JavaScript errors
- Verify internet connection for CDN resources

**Q: Styles not appearing correctly**
- Clear browser cache
- Check if CSS file is loading properly
- Ensure TailwindCSS CDN is accessible

**Q: Login not working**
- Verify credentials (case-sensitive)
- Check browser's localStorage support
- Clear localStorage if needed: `localStorage.clear()`

## 📈 Future Enhancements

Potential improvements for production use:
- [ ] Real API integration
- [ ] Advanced user roles & permissions
- [ ] Data visualization charts
- [ ] Export functionality
- [ ] Advanced search & filtering
- [ ] Real-time updates with WebSockets
- [ ] Mobile app development
- [ ] Advanced reporting system

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/NewFeature`)
3. **Commit** changes (`git commit -m 'Add NewFeature'`)
4. **Push** to branch (`git push origin feature/NewFeature`)
5. **Open** a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Support

For questions or support:
- 📧 **Email**: support@pharmaconnect.com
- 💬 **Issues**: Create an issue on GitHub
- 📖 **Documentation**: Check this README

---

**Made with ❤️ for the pharmaceutical industry**

*Last updated: January 2024*
