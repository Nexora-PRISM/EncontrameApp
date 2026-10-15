import { resolveShortcutAvailability } from '@/lib/emergency-shortcut';

describe('atalho de emergência', () => {
  it('só oferece o atalho no Android com o módulo pronto', () => {
    expect(resolveShortcutAvailability({ os: 'ios', modulePresent: true, supported: true })).toBe('android-only');
    expect(resolveShortcutAvailability({ os: 'web', modulePresent: false, supported: false })).toBe('android-only');
    expect(resolveShortcutAvailability({ os: 'android', modulePresent: false, supported: false })).toBe(
      'needs-update',
    );
    expect(resolveShortcutAvailability({ os: 'android', modulePresent: true, supported: null })).toBe('needs-update');
    expect(resolveShortcutAvailability({ os: 'android', modulePresent: true, supported: false })).toBe('unsupported');
    expect(resolveShortcutAvailability({ os: 'android', modulePresent: true, supported: true })).toBe('available');
  });
});
