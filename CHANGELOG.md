# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2024-09-21

### Updated

- Updated UI and removed unnessesary space of files content.

## [1.2.0] - 2024-09-10

### Added

- Updated UI and removed unnessesary space of files content.
- Added subfolder files path to the Files Content display.
- Enabled right-click feature for copying and pasting text.
- Added dark mode theme to the application.
- Added delay to path modification checking.
- Added a loading feature (refresh button) to show the user that the app is processing files.
- Resolved the bug with multiple subfolders.
- Enabled users to rename folders within the app.

### Updated

- Changed the place of "Select All" and "Deselect All" buttons.
- Improved UI Design with updated headings, spacing, and button styles.
- Added a border around the folder icon button to clarify that it's a button.
- Resolved the "Failed to display folder contents" error.

## [1.1.0] - 2024-07-23

### Added

- Added sticky "Select All" and "Deselect All" buttons to the top of the file list area to ensure they remain visible while scrolling.
- Introduced a `resize-y` class to the `textarea` for requests to allow vertical resizing only.

### Fixed

- Adjusted padding and layout for the `.file-list-area` to ensure it accommodates the sticky buttons correctly.

## [1.0.0] - 2024-07-20

### Initial Release

- Created the initial version of the Content Collector application.
- Implemented core features including:
  - Folder path input with folder selection button.
  - Requests input area with a copy button.
  - File list display with "Select All" and "Deselect All" buttons.
  - Files content display area with a readonly `textarea`.
