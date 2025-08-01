# Troubleshooting: Not Seeing Changes

If you're not seeing changes on your live server or local machine, follow these steps:

## Quick Fixes

### 1. **Hard Refresh Your Browser**
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R` (Mac)

### 2. **Clear Browser Cache**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. **Use the Cache Clearing Tool**
Open `clear-cache.html` in your browser and use the buttons to clear cache.

## Development Server

### Option 1: Python Development Server
```bash
python3 dev-server.py
```
Then visit: http://localhost:8000

### Option 2: Simple HTTP Server
```bash
python3 -m http.server 8000
```

### Option 3: Node.js Live Server
```bash
npx live-server --port=8000
```

## Common Issues and Solutions

### Issue: CSS changes not appearing
**Solution:**
1. Check if CSS file is being cached
2. Add version parameter: `css/style.css?v=1.0.1`
3. Clear browser cache
4. Check browser's Network tab to see if file is being loaded

### Issue: JavaScript changes not appearing
**Solution:**
1. Check if JS file is being cached
2. Add version parameter: `js/script.js?v=1.0.1`
3. Clear browser cache
4. Check browser console for errors

### Issue: Changes not appearing on live server
**Solution:**
1. Check server cache settings
2. Upload `.htaccess` file to server
3. Contact hosting provider about cache settings
4. Use CDN with cache-busting

### Issue: Local development changes not visible
**Solution:**
1. Use the Python development server: `python3 dev-server.py`
2. Check file permissions
3. Ensure you're editing the correct files
4. Check for syntax errors in console

## File Structure
```
your-project/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # CSS styles
├── js/
│   └── script.js      # JavaScript
├── .htaccess          # Apache cache control
├── dev-server.py      # Development server
├── clear-cache.html   # Cache clearing tool
└── TROUBLESHOOTING.md # This file
```

## Version Management

When making changes, update the version parameters in `index.html`:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/style.css?v=1.0.2">

<!-- JavaScript -->
<script src="js/script.js?v=1.0.2"></script>
```

## Browser Developer Tools

1. **Network Tab:** Check if files are being cached
2. **Console Tab:** Look for JavaScript errors
3. **Sources Tab:** Verify file contents
4. **Application Tab:** Clear storage and cache

## Server-Side Solutions

### Apache (.htaccess)
The `.htaccess` file prevents caching during development.

### Nginx
Add to your nginx configuration:
```nginx
location ~* \.(css|js)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## Still Having Issues?

1. Check file permissions
2. Verify file paths are correct
3. Look for syntax errors in browser console
4. Try a different browser
5. Check if your hosting provider has aggressive caching
6. Use browser's incognito/private mode for testing

## Contact

If you're still experiencing issues, check:
- Browser console for errors
- Network tab for failed requests
- File modification timestamps
- Server error logs