export function createDbUserId(linkedinUserId: string): string {
  return `${linkedinUserId}${Array.from({ length: 12 - linkedinUserId.length }, () => '_').join('')}`;
}
