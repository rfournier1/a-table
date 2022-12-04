export function useCookie(name: string): string | undefined {
  if (!window?.document?.cookie) {
    return undefined;
  }
  const value = `; ${window.document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}
