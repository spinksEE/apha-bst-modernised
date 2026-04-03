import { AuthRbacService } from './auth.rbac.service';

describe('AuthRbacService', () => {
  let service: AuthRbacService;

  beforeEach(() => {
    service = new AuthRbacService();
  });

  it('allows write for non-read-only roles', () => {
    expect(service.canWrite('Supervisor')).toBe(true);
    expect(service.canWrite('DataEntry')).toBe(true);
  });

  it('blocks write for read-only role', () => {
    expect(service.canWrite('ReadOnly')).toBe(false);
  });

  it('allows when no requirement provided', () => {
    expect(service.isRoleAllowed('Supervisor')).toBe(true);
  });

  it('blocks when role not in allowed set', () => {
    expect(
      service.isRoleAllowed('DataEntry', { allowedRoles: ['Supervisor'], allowReadOnly: false }),
    ).toBe(false);
  });

  it('blocks read-only when not explicitly allowed', () => {
    expect(
      service.isRoleAllowed('ReadOnly', { allowedRoles: ['ReadOnly'], allowReadOnly: false }),
    ).toBe(false);
  });

  it('allows read-only when explicitly allowed', () => {
    expect(
      service.isRoleAllowed('ReadOnly', { allowedRoles: ['ReadOnly'], allowReadOnly: true }),
    ).toBe(true);
  });
});
