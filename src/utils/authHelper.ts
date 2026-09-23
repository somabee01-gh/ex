import { PersonnelId, ALL_PERSONNEL } from '../types';

const PASSWORDS_STORAGE_KEY = 'excel_accounting_personnel_passwords_v1';
const CURRENT_USER_STORAGE_KEY = 'excel_accounting_current_user_v1';
export const DEFAULT_PASSWORD = '123456';

export type PasswordsMap = Record<PersonnelId, string>;

export function getStoredPasswords(): PasswordsMap {
  try {
    const data = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const result = {} as PasswordsMap;
      ALL_PERSONNEL.forEach((p) => {
        result[p] = parsed[p] || DEFAULT_PASSWORD;
      });
      return result;
    }
  } catch (e) {
    console.warn('Failed to read personnel passwords', e);
  }

  const initial = {} as PasswordsMap;
  ALL_PERSONNEL.forEach((p) => {
    initial[p] = DEFAULT_PASSWORD;
  });
  return initial;
}

export function savePersonnelPassword(personnel: PersonnelId, newPassword: string): void {
  const passwords = getStoredPasswords();
  passwords[personnel] = newPassword;
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  } catch (e) {
    console.error('Failed to save personnel passwords', e);
  }
}

export function resetPersonnelPassword(personnel: PersonnelId): void {
  savePersonnelPassword(personnel, DEFAULT_PASSWORD);
}

export function getStoredCurrentUser(): PersonnelId | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (user && ALL_PERSONNEL.includes(user as PersonnelId)) {
      return user as PersonnelId;
    }
  } catch (e) {
    console.warn('Failed to read current user', e);
  }
  return null;
}

export function saveCurrentUser(user: PersonnelId | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, user);
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}

export function verifyPassword(personnel: PersonnelId, inputPassword: string): boolean {
  const passwords = getStoredPasswords();
  return (passwords[personnel] || DEFAULT_PASSWORD) === inputPassword;
}
