# FreeMind-MMX Web

A web-based mind mapping application inspired by `freemind-mmx`. It allows you to create, edit, and organize mind maps directly in your browser, with support for the specific `.mm` (content) and `.mmx` (attributes) file format separation.

## Features

*   **Create Mind Maps:** Start with a root node and expand your ideas.
*   **Edit Nodes:** Double-click any node to edit its text.
*   **Keyboard Shortcuts:**
    *   `Enter`: Add Sibling Node
    *   `Tab` / `Insert`: Add Child Node
    *   `Delete` / `Backspace`: Delete Node
    *   `Space`: Fold/Unfold Node
    *   `Arrow Keys`: Navigate between nodes
*   **MMX Support:**
    *   **Open:** Select both `.mm` and `.mmx` files to load a map with its folded state preserved.
    *   **Save:** Downloads both `.mm` (clean structure) and `.mmx` (volatile attributes) files.
*   **Local Execution:** Runs entirely in the browser with no backend dependency.

## Getting Started

1.  **Run Locally:**
    You can serve the application using any static file server.

    ```bash
    python3 -m http.server 8000
    ```

    Then open `http://localhost:8000` in your browser.

2.  **Using the App:**
    *   Click "New Map" to start fresh.
    *   Use the "Open .mm (and .mmx)" button to load existing maps.
    *   Use "Save (MMX)" to download your work.

## Project Structure

*   `index.html`: The main entry point.
*   `style.css`: Styling for the nodes and connections.
*   `app.js`: Application logic (rendering, events, file I/O).

## License

MIT
