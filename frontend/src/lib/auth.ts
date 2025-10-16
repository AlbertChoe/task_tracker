export function saveTokenToCookie(token: string) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + 24*60*60*1000).toUTCString()
  document.cookie = `ttt_token=${token}; expires=${expires}; path=/`
}
export function clearTokenCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'ttt_token=; Max-Age=0; path=/'
}
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|; )ttt_token=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
