# Vite Configuration Rules

Build tool governance for the NAM Conference Survey application ensuring fast development, optimized production builds, and consistent environment configuration using Vite 5.

## Context

*Applies to:* Vite configuration files, build scripts, and development workflows
*Level:* Tactical - Build configuration and optimization standards
*Audience:* Frontend developers, DevOps engineers, build maintainers

## Core Principles

1. **Development Speed:** Sub-second HMR, instant server startup, optimized dependency pre-bundling
2. **Production Efficiency:** Minimal bundle sizes, optimal caching, tree-shaking effectiveness
3. **Environment Parity:** Consistent behavior between development and production builds
4. **Plugin Discipline:** Essential plugins only, well-maintained and performance-tested

## Rules

### Must Have (Critical)

- **RULE-001:** vite.config.ts MUST be TypeScript with explicit typing for all configuration objects
- **RULE-002:** Production builds MUST exclude source maps and enable all optimizations
- **RULE-003:** Development server MUST proxy API calls to backend without CORS issues
- **RULE-004:** Environment variables MUST use VITE_ prefix and be validated at build time
- **RULE-005:** Bundle analysis MUST be available via rollup-plugin-bundle-analyzer in development
- **RULE-006:** Build output MUST use content-based hashing for all static assets

### Should Have (Important)

- **RULE-101:** Dependencies SHOULD be pre-bundled in optimizeDeps for consistent development performance
- **RULE-102:** Chunks SHOULD be manually configured for vendor, admin, and main application code
- **RULE-103:** CSS SHOULD be code-split per route for optimal loading performance
- **RULE-104:** Public assets SHOULD be optimized and use appropriate cache headers

### Could Have (Preferred)

- **RULE-201:** PWA plugin COULD be configured for offline survey completion capabilities
- **RULE-202:** Bundle analyzer COULD be integrated into CI/CD for automated size monitoring

## Configuration Patterns

### Base Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
  ],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },

  // Development server
  server: {
    port: 3000,
    host: '0.0.0.0', // Docker compatibility
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Production Optimization
```typescript
// Production-specific configuration
build: {
  outDir: 'dist',
  sourcemap: false, // No source maps in production
  assetsDir: 'assets',
  
  rollupOptions: {
    output: {
      // Manual chunking for optimal caching
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        mantine: ['@mantine/core', '@mantine/form', '@mantine/hooks'],
        admin: ['@mantine/notifications'], // Admin-only features
      },
      
      // Asset naming with content hash
      chunkFileNames: 'assets/[name].[hash].js',
      entryFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]',
    },
  },
  
  // Build optimizations
  minify: 'terser',
  cssCodeSplit: true,
  reportCompressedSize: false, // Faster builds
},
```

### Environment Variables
```typescript
// Environment variable validation
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // Validate required environment variables
  const requiredEnvVars = ['VITE_API_URL'];
  for (const envVar of requiredEnvVars) {
    if (!env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // ... rest of config
  };
});
```

### Development Optimization
```typescript
// Development-specific optimizations
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    '@mantine/core',
    '@mantine/hooks',
    'react-router-dom',
  ],
  exclude: ['@vite/client', '@vite/env'],
},

// CSS preprocessing
css: {
  devSourcemap: true,
  preprocessorOptions: {
    scss: {
      additionalData: `@import "@/styles/variables.scss";`,
    },
  },
},
```

## Plugin Management

### Essential Plugins Only
```typescript
// Approved plugin list
const approvedPlugins = [
  '@vitejs/plugin-react',        // Core React support
  'rollup-plugin-bundle-analyzer', // Bundle analysis (dev only)
  'vite-plugin-pwa',            // PWA capabilities (optional)
];

// Plugin configuration
plugins: [
  react({
    fastRefresh: true,
    jsxImportSource: '@emotion/react', // If using Emotion
  }),
  
  // Bundle analyzer (development only)
  process.env.NODE_ENV === 'development' && bundleAnalyzer({
    analyzerMode: 'server',
    openAnalyzer: false,
  }),
].filter(Boolean),
```

## Performance Targets

### Development Performance
- **Server startup:** <1 second
- **HMR updates:** <100ms
- **Dependency pre-bundling:** <30 seconds (first time)
- **Page reload:** <500ms

### Build Performance
- **Development build:** <10 seconds
- **Production build:** <60 seconds
- **Bundle size:** <500KB gzipped total
- **Vendor chunk:** <200KB gzipped

## Build Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "tsc && vite build --mode production",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html",
    "preview": "vite preview --port 3000",
    "type-check": "tsc --noEmit"
  }
}
```

## Quality Gates

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Build and analyze bundle
  run: |
    npm run build
    npm run build:analyze
    # Fail if bundle size exceeds limits
```

### Code Review Checklist
- [ ] New plugins are in approved list and necessary
- [ ] Environment variables follow VITE_ prefix convention
- [ ] Build optimizations don't break development workflow
- [ ] Manual chunks are logical and optimize caching
- [ ] No hardcoded URLs or environment-specific values

## Troubleshooting

### Common Issues
```typescript
// Fix: HMR not working in Docker
server: {
  watch: {
    usePolling: true, // For Docker file watching
  },
},

// Fix: Large dependency causing slow builds
optimizeDeps: {
  exclude: ['large-package'], // Exclude problematic packages
},

// Fix: CSS import issues
css: {
  postcss: {
    plugins: [autoprefixer()],
  },
},
```

## Related Rules

- rules/performance-rules.md - Bundle size limits and optimization targets
- rules/typescript-rules.md - TypeScript configuration integration
- knowledge/docker-setup.md - Container-specific Vite configuration

---

## TL;DR

*Key Principles:*
- Fast development (HMR <100ms), optimized production builds
- TypeScript configuration with environment validation
- Manual chunking for optimal caching (vendor/admin/main)

*Critical Rules:*
- Must use TypeScript configuration with explicit typing
- Must exclude source maps and optimize for production
- Must proxy API calls properly for development
- Must validate environment variables at build time

*Quick Decision Guide:*
Adding a new plugin or changing config? Ask: **"Does this improve development speed or production performance without breaking the other?"** If it only serves convenience, reconsider.
