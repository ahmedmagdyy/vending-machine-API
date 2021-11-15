import * as bcrypt from 'bcrypt';

export function comparePassword(originalPass: string, hashedPass: string) {
  return bcrypt.compare(originalPass, hashedPass);
}
