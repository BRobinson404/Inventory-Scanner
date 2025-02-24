# Moebiz Inventory Scanner

This project is a mobile-first, in-house inventory scanning tool designed for Moebiz. It allows technicians to scan inventory items (using either manual input or the device's camera), logs the scanned data, and generates a CSV file for upload to e-automate.

## Project Structure

- **scanner.html**  
  The main HTML file that serves as the scanning interface. It includes:
  - A login welcome message (with technician name loaded from `localStorage`).
  - A manual barcode input field.
  - A scan log that displays scanned items.
  - Buttons to add a manual scan, start the camera-based scanner, export the scan log as a CSV file, and log out.
  - Integration with the QuaggaJS library for live barcode scanning via the mobile camera.

- **scannerModule.js**  
  A JavaScript module that encapsulates the camera-based barcode scanning functionality using QuaggaJS. It exports:
  - `initScanner(callback)`: Initializes and starts the camera scanner.
  - `stopScanner()`: Stops the scanning process.

## Prerequisites

- **Modern Browser**: Ensure you are using a browser that supports ES modules (e.g., latest Chrome, Firefox, or Edge).
- **Internet Connection**: To load QuaggaJS from the CDN, you need an active internet connection. Alternatively, you can download and serve the library locally.
- **Local Server**: Since ES modules require a server context, use a local server (e.g., using [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code, or Python's `http.server`) to run the application.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/moebiz-inventory-scanner.git
   cd moebiz-inventory-scanner
