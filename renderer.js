const { ipcRenderer } = require("electron");

const displayFolderContents = async (folderPath) => {
  try {
    const result = await ipcRenderer.invoke("select-folder", folderPath);
    if (result) {
      const { folderPath, filesAndFolders } = result;
      document.getElementById("folder-path").value = folderPath;

      const fileListElement = document.getElementById("file-list");
      fileListElement.innerHTML = ""; // Clear previous file list

      const createFileTree = (filesAndFolders, parentElement) => {
        filesAndFolders.forEach((item) => {
          const itemElement = document.createElement("div");
          itemElement.style.marginLeft = "5px";

          if (item.type === "folder") {
            const folderToggle = document.createElement("span");
            folderToggle.textContent = "►";
            folderToggle.style.cursor = "pointer";
            folderToggle.style.marginLeft = "4px";
            folderToggle.style.marginRight = "5px";
            folderToggle.addEventListener("click", () => {
              const folderContent =
                itemElement.querySelector(".folder-content");
              if (folderContent.style.display === "none") {
                folderContent.style.display = "block";
                folderToggle.textContent = "▼";
              } else {
                folderContent.style.display = "none";
                folderToggle.textContent = "►";
              }
            });

            const folderLabel = document.createElement("label");
            folderLabel.textContent = item.name;

            const renameInput = document.createElement("input");
            renameInput.type = "text";
            renameInput.value = item.name;
            renameInput.style.display = "none";

            folderLabel.addEventListener("dblclick", () => {
              folderLabel.style.display = "none";
              renameInput.style.display = "inline";
              renameInput.focus();
            });

            renameInput.addEventListener("blur", async () => {
              const newPath = path.join(
                path.dirname(item.path),
                renameInput.value
              );
              const renameResult = await ipcRenderer.invoke(
                "rename-folder",
                item.path,
                newPath
              );
              if (renameResult.success) {
                item.path = newPath;
                folderLabel.textContent = renameInput.value;
              }
              renameInput.style.display = "none";
              folderLabel.style.display = "inline";
            });

            itemElement.appendChild(folderToggle);
            itemElement.appendChild(folderLabel);
            itemElement.appendChild(renameInput);

            const folderContent = document.createElement("div");
            folderContent.classList.add("folder-content");
            folderContent.style.display = "none";
            createFileTree(item.children, folderContent);
            itemElement.appendChild(folderContent);
          } else {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = item.path;
            checkbox.value = item.path;
            checkbox.classList.add("checkbox-class");

            const label = document.createElement("label");
            label.htmlFor = item.path;
            label.appendChild(document.createTextNode(item.name));

            itemElement.appendChild(checkbox);
            itemElement.appendChild(label);

            const folderPath = document.getElementById("folder-path").value;

            // Add event listener to checkbox
            checkbox.addEventListener("change", async () => {
              const selectedFiles = Array.from(
                document.querySelectorAll("#file-list input:checked")
              ).map((checkbox) => checkbox.value);
              const filesContent = await ipcRenderer.invoke(
                "process-files",
                folderPath,
                selectedFiles
              );
              const filesContentElement =
                document.getElementById("files-content");
              filesContentElement.value = filesContent;
            });
          }

          parentElement.appendChild(itemElement);
        });
      };

      createFileTree(filesAndFolders, fileListElement);

      // Add event listener to "Select All" button
      document.getElementById("select-all").addEventListener("click", () => {
        const checkboxes = document.querySelectorAll(
          "#file-list input[type=checkbox]"
        );
        checkboxes.forEach((checkbox) => {
          checkbox.checked = true;
          const event = new Event("change");
          checkbox.dispatchEvent(event);
        });
      });

      // Add event listener to "Deselect All" button
      document
        .getElementById("deselect-all")
        .addEventListener("click", async () => {
          const checkboxes = document.querySelectorAll(
            "#file-list input[type=checkbox]"
          );
          const selectedFiles = [];

          // Deselect all checkboxes without triggering change event
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
            selectedFiles.push(checkbox.value);
          });

          const folderPath = document.getElementById("folder-path").value;

          // Process deselected files
          const filesContent = await ipcRenderer.invoke(
            "process-files",
            folderPath,
            []
          );
          const filesContentElement = document.getElementById("files-content");
          filesContentElement.value = filesContent;
        });

      // Display the error message
      const errorMessageElement = document.getElementById("error-message");
      errorMessageElement.textContent = "";
    }
  } catch (error) {
    console.error(`Failed to display folder contents: ${error.message}`);

    // Clear the file list and files content
    document.getElementById("file-list").innerHTML = "";
    document.getElementById("files-content").value = "";

    // Display the error message
    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = `Failed to display folder contents`;
  }
};

document.getElementById("select-folder").addEventListener("click", async () => {
  displayFolderContents();
});

document.getElementById("folder-path").addEventListener("input", (event) => {
  const folderPath = event.target.value;
  if (folderPath) {
    displayFolderContents(folderPath);
  }
});

// Add event listener for the "Copy Requests" button
document.getElementById("copy-all").addEventListener("click", async () => {
  const requestsElement = document.getElementById("requests");
  const filesContentElement = document.getElementById("files-content");
  try {
    let textToCopy = filesContentElement.value;
    if (requestsElement.value) {
      textToCopy = `${requestsElement.value}\n\n${filesContentElement.value}`;
    }
    await navigator.clipboard.writeText(textToCopy);
    // Optionally, show a notification or alert indicating success
    console.log("Content copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy content to clipboard.", err);
  }
});

// Add dark mode toggle functionality
document.getElementById("toggle-theme").addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
});

// Add refresh button functionality
document.getElementById("refresh-content").addEventListener("click", () => {
  const folderPath = document.getElementById("folder-path").value;
  if (folderPath) {
    displayFolderContents(folderPath);
  }
});
