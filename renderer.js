const { ipcRenderer } = require("electron");

document.getElementById("select-folder").addEventListener("click", async () => {
  const result = await ipcRenderer.invoke("select-folder");
  if (result) {
    const { folderPath, filesAndFolders } = result;
    document.getElementById("folder-path").value = folderPath;

    const fileListElement = document.getElementById("file-list");
    fileListElement.innerHTML = ""; // Clear previous file list

    const createFileTree = (filesAndFolders, parentElement) => {
      filesAndFolders.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.style.marginLeft = "20px";

        if (item.type === "folder") {
          const folderToggle = document.createElement("button");
          folderToggle.textContent = "►";
          folderToggle.style.marginRight = "5px";
          folderToggle.addEventListener("click", () => {
            const folderContent = itemElement.querySelector(".folder-content");
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

          itemElement.appendChild(folderToggle);
          itemElement.appendChild(folderLabel);

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

          const label = document.createElement("label");
          label.htmlFor = item.path;
          label.appendChild(document.createTextNode(item.name));

          itemElement.appendChild(checkbox);
          itemElement.appendChild(label);

          // Add event listener to checkbox
          checkbox.addEventListener("change", async () => {
            const selectedFiles = Array.from(
              document.querySelectorAll("#file-list input:checked")
            ).map((checkbox) => checkbox.value);
            const outputContent = await ipcRenderer.invoke(
              "process-files",
              selectedFiles
            );
            const outputElement = document.getElementById("output");
            outputElement.value = outputContent;
            document.getElementById("copy-output").disabled =
              selectedFiles.length === 0;
          });
        }

        parentElement.appendChild(itemElement);
      });
    };

    createFileTree(filesAndFolders, fileListElement);

    // Add event listener to "Select All" button
    document.getElementById("select-all").addEventListener("click", () => {
      const checkboxes = document.querySelectorAll("#file-list input[type=checkbox]");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        const event = new Event("change");
        checkbox.dispatchEvent(event);
      });
    });

    // Add event listener to "Deselect All" button
    document.getElementById("deselect-all").addEventListener("click", async () => {
      const checkboxes = document.querySelectorAll("#file-list input[type=checkbox]");
      const selectedFiles = [];
    
      // Deselect all checkboxes without triggering change event
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        selectedFiles.push(checkbox.value);
      });
    
      // Process deselected files
      const outputContent = await ipcRenderer.invoke("process-files", []);
      const outputElement = document.getElementById("output");
      outputElement.value = outputContent;
      document.getElementById("copy-output").disabled = true;
    });    

    // Add event listener to "Select Non-Ignored Files" button
    // document
    //   .getElementById("select-non-ignored")
    //   .addEventListener("click", async () => {
    //     const nonIgnoredFiles = await ipcRenderer.invoke(
    //       "get-non-ignored-files",
    //       folderPath
    //     );
    //     const checkboxes = document.querySelectorAll(
    //       "#file-list input[type=checkbox]"
    //     );
    //     checkboxes.forEach((checkbox) => {
    //       checkbox.checked = nonIgnoredFiles.includes(checkbox.value);
    //       const event = new Event("change");
    //       checkbox.dispatchEvent(event);
    //     });
    //   });
  }
});

document.getElementById("copy-output").addEventListener("click", async () => {
  const outputElement = document.getElementById("output");
  try {
    await navigator.clipboard.writeText(outputElement.value);
    alert("Output copied to clipboard!");
  } catch (err) {
    alert("Failed to copy output to clipboard.");
  }
});
