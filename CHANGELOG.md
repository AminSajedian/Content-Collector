# Changelog

All notable changes to this project will be documented in this file.

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
