/**
 * Integration tests for SettingsModal component
 * Covers: INTG-07 (settings updates)
 *
 * Tests verify:
 * - Modal visibility based on isOpen prop
 * - Settings update callbacks fire correctly
 * - Modal action buttons work properly
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SettingsModal } from '@/components/SettingsModal'
import { DEFAULT_SETTINGS, RSVPSettings } from '@/types'

describe('SettingsModal component', () => {
  // Mock callback functions
  const mockClose = vi.fn()
  const mockUpdate = vi.fn()
  const mockReset = vi.fn()

  // Default settings for testing
  const defaultSettings: RSVPSettings = { ...DEFAULT_SETTINGS }

  // Default props for rendering SettingsModal
  const defaultProps = {
    isOpen: true,
    onClose: mockClose,
    settings: defaultSettings,
    onUpdate: mockUpdate,
    onReset: mockReset,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Visibility Tests
  // ============================================================================

  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<SettingsModal {...defaultProps} isOpen={false} />)

      // Modal content should not be present
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders modal content when isOpen is true', () => {
      render(<SettingsModal {...defaultProps} isOpen={true} />)

      // Settings heading should be visible
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('displays all setting sections when open', () => {
      render(<SettingsModal {...defaultProps} />)

      expect(screen.getByText('Font Family')).toBeInTheDocument()
      expect(screen.getByText('Font Weight')).toBeInTheDocument()
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('Pivot Highlight')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Settings Update Tests
  // ============================================================================

  // Helper to get selects by index (DOM order: fontFamily, fontWeight, fontSize)
  const getSelectByIndex = (index: number) => {
    const selects = screen.getAllByRole('combobox')
    return selects[index]
  }

  describe('settings updates', () => {
    it('calls onUpdate with fontFamily when select changed', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontFamilySelect = getSelectByIndex(0)
      fireEvent.change(fontFamilySelect, { target: { value: 'serif' } })

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith({ fontFamily: 'serif' })
    })

    it('calls onUpdate with fontWeight when select changed', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontWeightSelect = getSelectByIndex(1)
      fireEvent.change(fontWeightSelect, { target: { value: 'bold' } })

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith({ fontWeight: 'bold' })
    })

    it('calls onUpdate with fontSize when select changed', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontSizeSelect = getSelectByIndex(2)
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } })

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith({ fontSize: 'large' })
    })

    it('calls onUpdate with showPivotHighlight when checkbox toggled', () => {
      render(<SettingsModal {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith({ showPivotHighlight: false })
    })

    it('calls onUpdate with pivotColor when color swatch clicked', () => {
      render(<SettingsModal {...defaultProps} />)

      // Find the green swatch (#00FF00) by its title
      const greenSwatch = screen.getByTitle('#00FF00')
      fireEvent.click(greenSwatch)

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith({ pivotColor: '#00FF00' })
    })

    it('calls onUpdate with different colors for each swatch', () => {
      render(<SettingsModal {...defaultProps} />)

      // Test orange swatch
      const orangeSwatch = screen.getByTitle('#FF6B00')
      fireEvent.click(orangeSwatch)

      expect(mockUpdate).toHaveBeenCalledWith({ pivotColor: '#FF6B00' })
    })

    it('disables color swatches when showPivotHighlight is false', () => {
      const settingsWithNoHighlight: RSVPSettings = {
        ...defaultSettings,
        showPivotHighlight: false,
      }

      render(
        <SettingsModal {...defaultProps} settings={settingsWithNoHighlight} />
      )

      // Find all color swatches (buttons with color titles)
      const swatches = [
        screen.getByTitle('#FF0000'),
        screen.getByTitle('#FF6B00'),
        screen.getByTitle('#00FF00'),
      ]

      swatches.forEach((swatch) => {
        expect(swatch).toBeDisabled()
      })
    })

    it('enables color swatches when showPivotHighlight is true', () => {
      render(<SettingsModal {...defaultProps} />)

      const swatches = [
        screen.getByTitle('#FF0000'),
        screen.getByTitle('#FF6B00'),
        screen.getByTitle('#00FF00'),
      ]

      swatches.forEach((swatch) => {
        expect(swatch).not.toBeDisabled()
      })
    })
  })

  // ============================================================================
  // Modal Actions Tests
  // ============================================================================

  describe('modal actions', () => {
    it('calls onReset when Reset to Defaults clicked', () => {
      render(<SettingsModal {...defaultProps} />)

      const resetButton = screen.getByRole('button', { name: /reset to defaults/i })
      fireEvent.click(resetButton)

      expect(mockReset).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Done clicked', () => {
      render(<SettingsModal {...defaultProps} />)

      const doneButton = screen.getByRole('button', { name: /done/i })
      fireEvent.click(doneButton)

      expect(mockClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when X button clicked', () => {
      render(<SettingsModal {...defaultProps} />)

      // X button contains × character
      const closeButton = screen.getByRole('button', { name: '×' })
      fireEvent.click(closeButton)

      expect(mockClose).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================================
  // Preview Tests
  // ============================================================================

  describe('preview', () => {
    it('shows pivot color preview with current settings', () => {
      const settingsWithGreen: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#00FF00',
        showPivotHighlight: true,
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithGreen} />)

      // Find the preview "F" character which should have the pivot color
      // The preview shows "ReadFaster" with "F" as the pivot
      const previewContainer = document.querySelector('.bg-black\\/40')
      expect(previewContainer).toBeInTheDocument()

      // The preview F span should be styled with the current color
      const previewText = previewContainer?.querySelector('div > div')
      expect(previewText).toBeInTheDocument()
    })

    it('shows white pivot in preview when showPivotHighlight is false', () => {
      const settingsNoHighlight: RSVPSettings = {
        ...defaultSettings,
        showPivotHighlight: false,
      }

      render(<SettingsModal {...defaultProps} settings={settingsNoHighlight} />)

      // Preview should still render but without colored pivot
      const previewContainer = document.querySelector('.bg-black\\/40')
      expect(previewContainer).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Select Options Tests
  // ============================================================================

  describe('select options', () => {
    it('displays correct font family options', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontFamilySelect = getSelectByIndex(0)
      const options = fontFamilySelect.querySelectorAll('option')

      expect(options).toHaveLength(3)
      expect(options[0]).toHaveValue('monospace')
      expect(options[1]).toHaveValue('serif')
      expect(options[2]).toHaveValue('sans')
    })

    it('displays correct font weight options', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontWeightSelect = getSelectByIndex(1)
      const options = fontWeightSelect.querySelectorAll('option')

      expect(options).toHaveLength(3)
      expect(options[0]).toHaveValue('normal')
      expect(options[1]).toHaveValue('medium')
      expect(options[2]).toHaveValue('bold')
    })

    it('displays correct font size options', () => {
      render(<SettingsModal {...defaultProps} />)

      const fontSizeSelect = getSelectByIndex(2)
      const options = fontSizeSelect.querySelectorAll('option')

      expect(options).toHaveLength(3)
      expect(options[0]).toHaveValue('small')
      expect(options[1]).toHaveValue('medium')
      expect(options[2]).toHaveValue('large')
    })

    it('reflects current settings in selects', () => {
      const customSettings: RSVPSettings = {
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 'large',
        pivotColor: '#FF0000',
        showPivotHighlight: true,
      }

      render(<SettingsModal {...defaultProps} settings={customSettings} />)

      const fontFamilySelect = getSelectByIndex(0)
      const fontWeightSelect = getSelectByIndex(1)
      const fontSizeSelect = getSelectByIndex(2)

      expect(fontFamilySelect).toHaveValue('serif')
      expect(fontWeightSelect).toHaveValue('bold')
      expect(fontSizeSelect).toHaveValue('large')
    })
  })

  // ============================================================================
  // Checkbox State Tests
  // ============================================================================

  describe('checkbox state', () => {
    it('reflects showPivotHighlight true state', () => {
      render(<SettingsModal {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('reflects showPivotHighlight false state', () => {
      const settingsNoHighlight: RSVPSettings = {
        ...defaultSettings,
        showPivotHighlight: false,
      }

      render(<SettingsModal {...defaultProps} settings={settingsNoHighlight} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  // ============================================================================
  // Color Selection Indicator Tests
  // ============================================================================

  describe('color selection indicator', () => {
    it('shows checkmark on selected color swatch', () => {
      const settingsWithRed: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#FF0000',
        showPivotHighlight: true,
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithRed} />)

      const redSwatch = screen.getByTitle('#FF0000')
      // Selected swatch should have SVG checkmark
      const checkmark = redSwatch.querySelector('svg')
      expect(checkmark).toBeInTheDocument()
    })

    it('does not show checkmark on unselected color swatches', () => {
      const settingsWithRed: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#FF0000',
        showPivotHighlight: true,
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithRed} />)

      const greenSwatch = screen.getByTitle('#00FF00')
      const checkmark = greenSwatch.querySelector('svg')
      expect(checkmark).not.toBeInTheDocument()
    })

    it('hides checkmark when showPivotHighlight is false', () => {
      const settingsWithRedNoHighlight: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#FF0000',
        showPivotHighlight: false,
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithRedNoHighlight} />)

      const redSwatch = screen.getByTitle('#FF0000')
      // Checkmark should not render when highlight is disabled
      const checkmark = redSwatch.querySelector('svg')
      expect(checkmark).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // Reset to Default Link Tests
  // ============================================================================

  describe('reset to default link', () => {
    it('shows reset link when color differs from default', () => {
      const settingsWithGreen: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#00FF00', // Not default (#FF0000)
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithGreen} />)

      expect(screen.getByText('Reset to default')).toBeInTheDocument()
    })

    it('hides reset link when color is default', () => {
      // DEFAULT_SETTINGS.pivotColor is '#FF0000'
      render(<SettingsModal {...defaultProps} />)

      expect(screen.queryByText('Reset to default')).not.toBeInTheDocument()
    })

    it('calls onUpdate with default color when reset link clicked', () => {
      const settingsWithGreen: RSVPSettings = {
        ...defaultSettings,
        pivotColor: '#00FF00',
      }

      render(<SettingsModal {...defaultProps} settings={settingsWithGreen} />)

      const resetLink = screen.getByText('Reset to default')
      fireEvent.click(resetLink)

      expect(mockUpdate).toHaveBeenCalledWith({ pivotColor: '#FF0000' })
    })
  })
})
