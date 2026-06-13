function hexToRgb(hex: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error('Expected a #rrggbb hex color')
  }

  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

function linearizeSrgbChannel(channel: number) {
  const normalized = channel / 255

  if (normalized <= 0.04045) {
    return normalized / 12.92
  }

  return ((normalized + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)

  return (
    0.2126 * linearizeSrgbChannel(r) +
    0.7152 * linearizeSrgbChannel(g) +
    0.0722 * linearizeSrgbChannel(b)
  )
}

export function contrastRatio(hex1: string, hex2: string): number {
  const luminance1 = relativeLuminance(hex1)
  const luminance2 = relativeLuminance(hex2)
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}
