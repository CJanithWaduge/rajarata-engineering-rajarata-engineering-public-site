export type PhoneContact =
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'ready'; number: string; displayNumber: string; href: string };

export function parsePhoneNumber(value: unknown): PhoneContact {
  if (value === undefined || value === '') return { status: 'missing' };
  if (typeof value !== 'string') return { status: 'invalid' };

  const displayNumber = value.trim();
  if (!displayNumber) return { status: 'missing' };

  const number = displayNumber.replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(number)) return { status: 'invalid' };

  return {
    status: 'ready',
    number,
    displayNumber,
    href: `tel:${number}`,
  };
}
