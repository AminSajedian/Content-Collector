const { ipcRenderer } = require("electron");

document.getElementById("select-folder").addEventListener("click", async () => {
  const result = await ipcRenderer.invoke("select-folder");
  if (result) {
    const { folderPath, files } = result;
    document.getElementById("folder-path").value = folderPath;

    const fileListElement = document.getElementById("file-list");
    fileListElement.innerHTML = ""; // Clear previous file list

    files.forEach((file) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = file;
      checkbox.value = file;

      const label = document.createElement("label");
      label.htmlFor = file;
      label.appendChild(document.createTextNode(file));

      const div = document.createElement("div");
      div.appendChild(checkbox);
      div.appendChild(label);

      fileListElement.appendChild(div);

      // Add event listener to checkbox
      checkbox.addEventListener("change", async () => {
        const selectedFiles = Array.from(
          document.querySelectorAll("#file-list input:checked")
        ).map((checkbox) => checkbox.value);
        const outputContent = await ipcRenderer.invoke(
          "process-files",
          folderPath,
          selectedFiles
        );
        const outputElement = document.getElementById("output");
        outputElement.value = outputContent;
        document.getElementById("copy-output").disabled =
          selectedFiles.length === 0;
      });
    });

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
    document.getElementById("deselect-all").addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(
        "#file-list input[type=checkbox]"
      );
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        const event = new Event("change");
        checkbox.dispatchEvent(event);
      });
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
