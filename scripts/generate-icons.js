import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

// Simple "P" logo on black background
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text
    x="${size/2}"
    y="${size * 0.68}"
    font-family="monospace, 'Courier New'"
    font-size="${size * 0.55}"
    font-weight="bold"
    fill="#ffffff"
    text-anchor="middle"
  >P</text>
</svg>
`

// Badge icon (smaller, for notification badge)
const createBadgeSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#ffffff"/>
  <text
    x="${size/2}"
    y="${size * 0.68}"
    font-family="monospace, 'Courier New'"
    font-size="${size * 0.5}"
    font-weight="bold"
    fill="#000000"
    text-anchor="middle"
  >P</text>
</svg>
`

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true })

  // Generate main icons
  const sizes = [192, 512]
  for (const size of sizes) {
    await sharp(Buffer.from(createSvg(size)))
      .png()
      .toFile(join(iconsDir, `icon-${size}.png`))
    console.log(`Created icon-${size}.png`)
  }

  // Generate badge icon (for notifications)
  await sharp(Buffer.from(createBadgeSvg(72)))
    .png()
    .toFile(join(iconsDir, 'badge-72.png'))
  console.log('Created badge-72.png')

  console.log('All icons generated!')
}

generateIcons().catch(console.error)
