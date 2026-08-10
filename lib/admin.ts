const ADMIN_EMAIL = '53986637+enkhbold470@users.noreply.github.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

