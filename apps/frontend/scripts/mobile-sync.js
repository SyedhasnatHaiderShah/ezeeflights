/**
 * mobile-sync.js
 * 
 * Synchronizes the core pages from the main app to the (mobile) directory.
 * This is the "Semi-Automated" part of the Manual-First plan.
 */

const { execSync } = require('child_process');

const routesToSync = [
  '/',
  '/flights',
  '/flights/booking',
  '/profile',
  '/hotels',
  '/dashboard',
  '/my-trips',
];

console.log('[MobileSync] Starting synchronization...');

routesToSync.forEach(route => {
  try {
    // We use the pull-to-mobile script for each route to keep logic consistent
    execSync(`node scripts/pull-to-mobile.js ${route}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`[MobileSync] Failed to sync ${route}:`, error.message);
  }
});

console.log('[MobileSync] Sync complete.');
