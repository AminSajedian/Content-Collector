# Content Collector App

The **Content Collector** app is an Electron-based tool designed to enhance productivity by simplifying the process of selecting project files and preparing their content for quick copy-paste into chatbots or other interfaces. This convenient application streamlines file handling and sharing by allowing users to easily select files from a folder and compile their contents for efficient use. Below is a detailed breakdown of the app's components, functionality, and code structure.

## Project Structure

### `index.html`

The `index.html` file is the main HTML file that defines the structure and layout of the app's user interface. 

- **Key Features:**
  - Includes a button to select a folder.
  - Contains an input field to display the folder path.
  - Features sections for listing files and displaying output.
  - Utilizes basic CSS for styling the elements and layout.

### `main.js`

The `main.js` file is the main process script for the Electron application.

- **Responsibilities:**
  - Sets up the Electron application.
  - Creates the main application window.
  - Handles inter-process communication (IPC) between the main and renderer processes.
  - Uses Electron's dialog module to open a directory selection dialog.
  - Reads and processes files from the selected folder.

### `package.json`

The `package.json` file defines the project's metadata, dependencies, and build configuration.

- **Key Components:**
  - Specifies scripts for starting, cleaning, packing, and building the Electron application.
  - Includes dependencies such as `electron`, `electron-builder`, and other necessary packages.

### `renderer.js`

The `renderer.js` file is the renderer process script that interacts with the Document Object Model (DOM) and handles user interface events.

- **Responsibilities:**
  - Uses IPC to communicate with the main process for folder selection and file processing.
  - Dynamically updates the file list based on user selection.
  - Processes and displays the content of the selected files.

## Summary

The **Content Collector** app is structured to separate concerns between the user interface (handled by `index.html` and `renderer.js`) and the application logic (handled by `main.js`). The `package.json` file ensures proper management of dependencies and build scripts. This modular approach facilitates maintenance and scalability of the application.

## Task List

- [ ] **Fix bug having multiple subfolders**: Modify functionality when a user select a folder with a log of subfolders.
- [ ] **Improve UI Design**: Update the design for better user experience and responsiveness.
- [ ] **Add Unit Tests**: Write unit tests for critical components and functions.
- [ ] **Create User Documentation**: Prepare a detailed user guide and documentation.
- [ ] **Add Dark Mode**: Implement a dark mode theme for the application.
- [ ] **Support Multiple Languages**: Add localization support for different languages.
- [ ] **update folder icon button**: Add border around the folder icon and so on to make it clear that this is a button.
