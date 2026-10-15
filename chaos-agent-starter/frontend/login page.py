"""
CHAOS Agent - Login & Authentication Server

This script provides a lightweight local web server for the CHAOS Agent
authentication and login interface.

Usage:
    python "login page.py" [--port PORT]

By default, this serves the login page on http://localhost:5000 and opens it
in your default browser.
"""

from __future__ import annotations

import argparse
import http.server
import os
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Directory where this file and login.html live
CURRENT_DIR = Path(__file__).resolve().parent
HTML_FILE = CURRENT_DIR / "login.html"
DEFAULT_PORT = 5000


class AuthServerHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler that routes root queries to login.html."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(CURRENT_DIR), **kwargs)

    def do_GET(self) -> None:
        # Route default root / to login.html
        if self.path in ("/", "/login", "/login/"):
            self.path = "/login.html"
        return super().do_GET()

    def log_message(self, format: str, *args) -> None:
        # Clean logging format
        sys.stdout.write(f"[CHAOS Auth Server] {self.address_string()} - {format % args}\n")


def open_browser(url: str, delay_seconds: float = 0.5) -> None:
    """Opens the web browser after a short delay to ensure server startup."""
    def _open() -> None:
        time.sleep(delay_seconds)
        try:
            webbrowser.open(url)
        except Exception as err:
            print(f"[Warning] Could not auto-launch browser: {err}")

    thread = threading.Thread(target=_open, daemon=True)
    thread.start()


def start_server(port: int = DEFAULT_PORT, auto_open: bool = True) -> None:
    """Starts the local HTTP server to host the login page."""
    # Ensure login.html exists
    if not HTML_FILE.exists():
        print(f"[Error] Required file not found: {HTML_FILE}")
        sys.exit(1)

    url = f"http://localhost:{port}/login.html"

    # Allow reuse of port to prevent 'Address already in use' errors
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(("", port), AuthServerHandler) as httpd:
            print("=" * 60)
            print("  CHAOS Agent - Login Page Server")
            print("=" * 60)
            print(f"  Local URL : {url}")
            print(f"  Serving   : {CURRENT_DIR}")
            print("  Press Ctrl+C to stop the server.")
            print("=" * 60)

            if auto_open:
                open_browser(url)

            httpd.serve_forever()

    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            print(f"[Error] Port {port} is already in use. Try: python \"login page.py\" --port {port + 1}")
        else:
            print(f"[Error] Failed to start server on port {port}: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[CHAOS Auth Server] Server stopped gracefully.")
        sys.exit(0)


def main() -> None:
    parser = argparse.ArgumentParser(description="CHAOS Agent Login Page Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to serve on (default: 5000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open the browser automatically")

    args = parser.parse_args()
    start_server(port=args.port, auto_open=not args.no_browser)


if __name__ == "__main__":
    main()
