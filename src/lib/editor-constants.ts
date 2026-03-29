/**
 * Editor constants — all magic numbers in one place.
 * Change once, applies everywhere.
 */

/** Maximum undo/redo history entries */
export const EDITOR_MAX_HISTORY = 50;

/** Autosave debounce delay in ms */
export const AUTOSAVE_DELAY_MS = 1500;

/** Autosave success status display duration in ms */
export const AUTOSAVE_SAVED_DISPLAY_MS = 2000;

/** Autosave error status display duration in ms */
export const AUTOSAVE_ERROR_DISPLAY_MS = 3000;

/** Editor scale factor applied to the device frame in the preview panel */
export const EDITOR_PREVIEW_SCALE = 0.86;

/**
 * Negative bottom margin (px) that compensates for the scale transform so the
 * device frame does not leave dead whitespace below it.
 * Formula: deviceFrameHeight * (1 - EDITOR_PREVIEW_SCALE) ≈ 98 px at scale 0.86.
 */
export const EDITOR_PREVIEW_SCALE_OFFSET_PX = -98;

/** Width (px) of the preview panel column in the desktop editor layout */
export const EDITOR_PREVIEW_PANEL_WIDTH = 500;
