import crypto from 'crypto';

export const generateReferenceId = (): string => {
  const now = new Date();
  const date = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
    now.getUTCDate(),
  ).padStart(2, '0')}`;
  const time = `${String(now.getUTCHours()).padStart(2, '0')}${String(
    now.getUTCMinutes(),
  ).padStart(2, '0')}`;
  const suffix = crypto.randomInt(100, 999);
  return `UA-${date}-${time}-${suffix}`;
};
