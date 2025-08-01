#!/usr/bin/env python3
"""
Simple development server with cache-busting headers
Run with: python3 dev-server.py
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse

class CacheBustingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache-control headers for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # Parse the URL
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Add cache-busting parameter for CSS and JS files
        if path.endswith('.css') or path.endswith('.js'):
            if '?' not in self.path:
                self.path += '?v=' + str(int(os.path.getmtime('.' + path)))
        
        return super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    
    with socketserver.TCPServer(("", PORT), CacheBustingHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        print("Files will be served with cache-busting headers")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")