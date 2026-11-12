import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach, vi } from 'vitest'
afterEach(() => cleanup())
if (!window.matchMedia)
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
if (!HTMLDialogElement.prototype.showModal)
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
if (!HTMLDialogElement.prototype.close)
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
