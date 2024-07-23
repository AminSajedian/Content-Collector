const path = require('path');
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const fs = require("fs");
const ignore = require("ignore");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 680,
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
  // Remove the default menu
  // Menu.setApplicationMenu(null);
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

function getFilesAndFolders(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results.push({
        name: file,
        path: filePath,
        type: 'folder',
        children: getFilesAndFolders(filePath) // Recursively get subfolder content
      });
    } else {
      results.push({
        name: file,
        path: filePath,
        type: 'file'
      });
    }
  });

  return results;
}

ipcMain.handle("select-folder", async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const filesAndFolders = getFilesAndFolders(folderPath);
    return { folderPath, filesAndFolders };
  }
  return null;
});

ipcMain.handle("process-files", async (event, selectedFiles) => {
  let outputContent = "";

  selectedFiles.forEach((file) => {
    if (fs.statSync(file).isFile()) {
      const fileContent = fs.readFileSync(file, "utf-8");
      outputContent += `${path.basename(file)}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
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
