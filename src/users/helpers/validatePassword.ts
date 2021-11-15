const VALIDATION_MESSAGES = {
  charLength: 'At least 10 characters',
  uppercase: 'At lease one upppercase letter',
  lowercase: 'At least one lowercase letter',
  digit: 'At least one digit',
  symbol: 'At least one symbol',
  passwordsMatch: 'Passwords need to match',
};

export function validatePassword(
  password: string,
  confirmPassword: string,
): string[] {
  const valState = [];
  // Password validation
  // Min of 10 characters
  if (!password || password.length < 10) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.charLength,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.charLength,
    });
  }

  // at least one capital case letter
  if (!password.match(/[A-Z]+/g)) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.uppercase,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.uppercase,
    });
  }
  // at least one small case letter
  if (!password.match(/[a-z]+/g)) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.lowercase,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.lowercase,
    });
  }
  // at least one number
  if (!password.match(/[0-9]+/g)) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.digit,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.digit,
    });
  }
  // at least one special character
  if (!password.match(/[!@#$%^&*(),.?":{}|<>]/g)) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.symbol,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.symbol,
    });
  }
  if (password !== confirmPassword) {
    valState.push({
      valid: false,
      message: VALIDATION_MESSAGES.passwordsMatch,
    });
  } else {
    valState.push({
      valid: true,
      message: VALIDATION_MESSAGES.passwordsMatch,
    });
  }
  return valState
    .map(({ message, valid }) => (valid ? null : message))
    .filter((message) => message !== null);
}
