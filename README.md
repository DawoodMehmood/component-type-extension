# **Nextjs Component Identifier**

The **Nextjs Component Identifier** is a Visual Studio Code extension designed to help developers working on **Next.js projects**. It visually distinguishes between **client-side** and **server-side** components in the VS Code file explorer, enhancing productivity and clarity.

---

## **Features**

- **Dynamic Decorations**:
  - Adds a **`C` (orange)** badge for client-side components.
  - Adds an **`S` (blue)** badge for server-side components.
  - Displays a tooltip when you hover over the file:
    - **Client-Side Component**
    - **Server-Side Component**
- **Automatic Detection**:
  - Automatically identifies client-side and server-side files in `src` folders of your Nextjs project.
- **Real-Time Updates**:
  - Decorations update dynamically whenever files are saved, created, or deleted.

---

## **Getting Started**

### **Installation**
1. Open **Visual Studio Code**.
2. Go to the **Extensions** view by clicking the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X`.
3. Search for **Nextjs Component Identifier**.
4. Click **Install**.

---

### **Usage**
1. Open a **Next.js project** in VS Code.
2. Ensure your project has a `next.config.js` or `next.config.mjs` file.
3. The extension will automatically decorate files in the `src` folder:
   - **Orange (C)**: Client-Side.
   - **Blue (S)**: Server-Side.
   - Hovering over the file will display one of the following tooltips:
     - **Client Side Component**
     - **Server Side Component**

---

### **Commands**

| Command                                   | Description                                   |
|-------------------------------------------|-----------------------------------------------|
| `Scan for Client/Server Components` | Manually trigger the file scan and decorations. |

---

## **Screenshots**

### **Client and Server Side File Decorations**
![File Decorations](https://via.placeholder.com/600x300?text=Add+a+screenshot+of+decorations)

---

## **Requirements**
- **Next.js Projects**:
  - Must have a `next.config.js` or `next.config.mjs` file.
  - Decorations are applied only in `src` folders.

---

## **Known Issues**
- **Git Decorations**:
  - If Git decorations are enabled, they might override the extension’s color changes but 'C'/'S' badge will still appear. Disable Git decorations in VS Code settings to see the colors as well:
    ```json
    "git.decorations.enabled": false
    ```

---

## **Release Notes**

### **1.0.0**
- Initial release.
- Automatic decoration for `src` folders in Next.js projects.
- Dynamic updates for saved, added, or deleted files.

---

## **Contributing**

If you encounter a bug or have suggestions for new features:
1. Fork the repository: [GitHub Repository](https://github.com/DawoodMehmood/component-type-extension)
2. Create a pull request with detailed changes.

---

## **License**
This extension is licensed under the [MIT License](LICENSE).

---

## **Support**
For issues or questions, please open an issue on the [GitHub Repository](https://github.com/DawoodMehmood/component-type-extension).
