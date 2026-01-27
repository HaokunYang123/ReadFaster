# Phase 2: Pivot Customization - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

User can customize pivot letter highlight appearance via settings modal — select color from preset swatches and toggle highlighting on/off. Both settings persist across sessions.

</domain>

<decisions>
## Implementation Decisions

### Color preset design
- 5-6 vibrant (saturated) colors — bold, high contrast palette
- Display as horizontal row of swatches
- Selected swatch shows checkmark inside
- Red remains the default color

### Settings placement
- Own section labeled "Pivot Highlight"
- Appears after reading speed settings
- Includes inline preview of a sample word showing current pivot style

### Apply behavior
- Changes apply immediately on click (no save button)
- Inline preview updates live as user clicks swatches
- Reset button below swatches row — resets color only, not toggle state
- Reset button hidden when color is already default
- Color swatches disabled/grayed when highlighting is toggled off

### Toggle interaction
- Checkbox control (not switch)
- Label: "Show pivot highlight"
- Positioned above color swatches
- When off: pivot letter has same style as other letters (no distinction)

### Claude's Discretion
- Exact colors in the 5-6 preset palette
- Swatch sizing and spacing
- Preview word sample text
- Checkbox styling to match existing UI

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-pivot-customization*
*Context gathered: 2026-01-27*
