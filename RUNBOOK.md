# Runbook: FreeMind-MMX Web

This runbook describes how to deploy and run the FreeMind-MMX Web application locally.

## Prerequisities

*   A modern web browser (Chrome, Firefox, Edge, Safari).
*   Python 3 (recommended for simple local hosting) OR any other static file server (Node.js `http-server`, Nginx, etc.).

## Simplified Local Desktop Hosting

The application is a static web app. It does not require a complex backend.

### Option 1: Python (Recommended)

Most macOS and Linux systems (and many Windows setups) have Python installed.

1.  Open a terminal/command prompt.
2.  Navigate to the project directory:
    ```bash
    cd /path/to/freemind-mmx
    ```
3.  Run the server:
    ```bash
    python3 -m http.server 8000
    ```
4.  Open your browser and go to: [http://localhost:8000](http://localhost:8000)

### Option 2: Opening the File Directly

You can try opening `index.html` directly in your browser. However, some browsers restrict file access (Cross-Origin requests) for local files, which might prevent the "Open" file functionality from working correctly depending on security settings. **Using a local server (Option 1) is strongly recommended.**

## usage

1.  **Creating a Map:** The app starts with a "New Mindmap" node.
2.  **Adding Nodes:**
    *   Select a node.
    *   Press `Tab` to add a child.
    *   Press `Enter` to add a sibling.
3.  **Editing:** Double-click a node to edit text. Press `Enter` to save.
4.  **Saving:** Click "Save (MMX)". Your browser will download two files: `map.mm` and `map.mmx`. Keep them together.
5.  **Opening:** Click "Open .mm (and .mmx)". In the file dialog, select **both** the `.mm` and `.mmx` files (hold Ctrl/Cmd to select multiple).

## Troubleshooting

*   **"Enter" adds a sibling instead of saving text:** This bug has been fixed. Ensure you are using the latest version of `app.js`.
*   **Files don't load:** Ensure you selected the valid `.mm` file. If using `.mmx` as well, ensure both are selected.
