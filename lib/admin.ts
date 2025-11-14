const ADMIN_EMAIL = 'enkhbold470@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

