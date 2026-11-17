import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Figma Make writes imports with a pinned version, e.g. "sonner@2.0.3".
// Outside Figma, resolve them to the package installed from package.json.
function versionedImportResolver() {
  const versioned = /^((?:@[^/@]+\/)?[^/@]+)@\d[^/]*(\/.*)?$/
  return {
    name: 'versioned-import-resolver',
    enforce: 'pre' as const,
    async resolveId(id: string, importer?: string) {
      const m = versioned.exec(id)
      if (!m) return null
      return this.resolve(m[1] + (m[2] ?? ''), importer, { skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    versionedImportResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
