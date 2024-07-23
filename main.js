const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
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

ipcMain.handle("select-folder", async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => fs.statSync(path.join(folderPath, file)).isFile());
    return { folderPath, files };
  }
  return null;
});

ipcMain.handle("process-files", async (event, folderPath, selectedFiles) => {
  let outputContent = "";

  selectedFiles.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isFile()) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      outputContent += `${file}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
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
