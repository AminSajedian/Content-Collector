const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const ignore = require("ignore");

// Dynamically import electron-context-menu
(async () => {
  const contextMenu = (await import("electron-context-menu")).default;

  contextMenu({
    showCopyImageAddress: true,
    showSaveImageAs: true,
  });
})();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 720,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("select-folder", async (event, folderPath) => {
  try {
    if (!folderPath) {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      folderPath = result.filePaths[0];
    }

    if (!folderPath) {
      return null;
    }

    const getFilesAndFolders = (folderPath) => {
      const items = fs.readdirSync(folderPath);
      return items.map((item) => {
        const itemPath = path.join(folderPath, item);
        const isDirectory = fs.statSync(itemPath).isDirectory();
        return {
          name: item,
          path: itemPath,
          type: isDirectory ? "folder" : "file",
          children: isDirectory ? getFilesAndFolders(itemPath) : [],
        };
      });
    };

    const filesAndFolders = getFilesAndFolders(folderPath);
    return { folderPath, filesAndFolders };
  } catch (error) {
    console.error(
      `Error occurred in handler for 'select-folder': ${error.message}`
    );
    throw error;
  }
});

// ipcMain.handle("process-files", async (event, selectedFiles) => {
//   let outputContent = "";

//   selectedFiles.forEach((file) => {
//     if (fs.statSync(file).isFile()) {
//       const fileContent = fs.readFileSync(file, "utf-8");
//       outputContent += `${path.basename(
//         file
//       )}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
//     }
//   });

//   return outputContent;
// });

ipcMain.handle("process-files", async (event, folderPath, selectedFiles) => {
  let outputContent = "";

  selectedFiles.forEach((file) => {
    if (fs.statSync(file).isFile()) {
      const fileContent = fs.readFileSync(file, "utf-8");

      // Get the folder path (assuming the first selected file belongs to the selected folder)
      // const folderPath = path.dirname(selectedFiles[0]);

      // Calculate relative path
      const relativeFilePath = path.relative(folderPath, file);

      // Append relative file path and content to output
      outputContent += `${relativeFilePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    }
  });

  return outputContent;
});

ipcMain.handle("get-non-ignored-files", async (event, folderPath) => {
  const gitignorePath = path.join(folderPath, ".gitignore");
  let ig = ignore();

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    ig = ignore().add(gitignoreContent);
  }

  const files = fs.readdirSync(folderPath).filter((file) => {
    const relativeFilePath = path.relative(
      folderPath,
      path.join(folderPath, file)
    );
    return (
      fs.statSync(path.join(folderPath, file)).isFile() &&
      file !== ".gitignore" &&
      !ig.ignores(relativeFilePath)
    );
  });

  return files;
});

ipcMain.handle("rename-folder", async (event, oldPath, newPath) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (error) {
    console.error(`Error occurred while renaming folder: ${error.message}`);
    return { success: false, error: error.message };
  }
});
