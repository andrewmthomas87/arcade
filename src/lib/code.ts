const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const CODE_LENGTH = 4;

export function generateRandomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const i = Math.trunc(Math.random() * ALPHABET.length);
    code += ALPHABET.charAt(i);
  }

  return code;
}
