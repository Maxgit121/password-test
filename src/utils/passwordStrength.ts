import zxcvbn from 'zxcvbn';

export interface PasswordStrength {
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  label: string;
  color: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const result = zxcvbn(password);
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#32D74B'];
  
  return {
    score: result.score,
    feedback: result.feedback,
    label: labels[result.score],
    color: colors[result.score]
  };
};

export const generatePassword = (
  length: number = 16,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string => {
  if (length < 8) length = 8;
  if (length > 100) length = 100;
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  
  if (chars === '') chars = lowercase + numbers;
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};