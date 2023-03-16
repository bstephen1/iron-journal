import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig: import('jest').Config = {
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  // don't put spaces after commas in the braces here
  collectCoverageFrom: ['**/*.{ts,tsx,js}'],
  // can't seem to tell jest to ignore any folder that starts with a dot...
  coveragePathIgnorePatterns: [
    'node_modules',
    'coverage',
    '.next',
    '.config',
    'middleware',
    'styles',
  ],
  coverageReporters: ['html', 'text-summary', ['text', { skipFull: true }]],
  // todo: turn on when tests are more robust
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
