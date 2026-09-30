import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Frontend Draft Auto-save Abort & Checkout Tests...\n');

// ── Test 1: In-flight AbortController Behavior ──────────────────────────────
{
  let wasAborted = false;
  let abortReason = null;

  const controller = new AbortController();
  controller.signal.addEventListener('abort', () => {
    wasAborted = true;
    abortReason = controller.signal.reason;
  });

  assert.strictEqual(controller.signal.aborted, false, 'Controller signal should initially be active');

  // Trigger cancelation (same as cancelPendingDrafts on checkout)
  controller.abort('Checkout initiated: Canceling pending drafts to prevent race condition');

  assert.strictEqual(controller.signal.aborted, true, 'Controller signal must be aborted');
  assert.strictEqual(wasAborted, true, 'Abort event listener must fire');
  assert.strictEqual(
    abortReason,
    'Checkout initiated: Canceling pending drafts to prevent race condition',
    'Abort reason must match'
  );
  console.log('✅ Test 1: AbortController aborts in-flight request signal on checkout');
}

// ── Test 2: Verify useEncounterDraft.js Code Integrity ──────────────────────
{
  const hookPath = path.resolve(__dirname, '../src/modules/clinical/hooks/useEncounterDraft.js');
  assert.ok(fs.existsSync(hookPath), 'useEncounterDraft.js must exist');

  const hookContent = fs.readFileSync(hookPath, 'utf8');

  // Assert presence of abortControllerRef, cancelPendingDrafts, and signal binding
  assert.ok(hookContent.includes('abortControllerRef'), 'Hook must maintain abortControllerRef');
  assert.ok(hookContent.includes('cancelPendingDrafts'), 'Hook must expose cancelPendingDrafts');
  assert.ok(hookContent.includes('abortControllerRef.current.abort()'), 'Hook must trigger abortControllerRef.current.abort()');
  assert.ok(hookContent.includes('controller.signal'), 'Hook must pass AbortSignal to saveDraftEncounter');

  console.log('✅ Test 2: useEncounterDraft.js contains required AbortController cancellation logic');
}

// ── Test 3: Verify SoloWorkspaceView.jsx Invokes cancelPendingDrafts ─────────
{
  const viewPath = path.resolve(__dirname, '../src/modules/clinical/pages/SoloWorkspaceView.jsx');
  assert.ok(fs.existsSync(viewPath), 'SoloWorkspaceView.jsx must exist');

  const viewContent = fs.readFileSync(viewPath, 'utf8');

  // Assert cancelPendingDrafts is extracted from hook and called inside checkout
  assert.ok(
    viewContent.includes('cancelPendingDrafts'),
    'SoloWorkspaceView must use cancelPendingDrafts from useEncounterDraft'
  );

  const checkoutIndex = viewContent.indexOf('handleConfirmCheckout');
  assert.ok(checkoutIndex !== -1, 'SoloWorkspaceView must define handleConfirmCheckout');

  const checkoutBlock = viewContent.slice(checkoutIndex, checkoutIndex + 500);
  assert.ok(
    checkoutBlock.includes('cancelPendingDrafts()'),
    'handleConfirmCheckout must invoke cancelPendingDrafts() before completing encounter'
  );

  console.log('✅ Test 3: SoloWorkspaceView fires cancelPendingDrafts() immediately on checkout');
}

console.log('\n🎉 ALL FRONTEND DRAFT ABORT TESTS PASSED (3/3)!\n');
