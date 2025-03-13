/**
 * describes the action the user was performing when sign in was initiated
 * depending on the nature of the action, we conditionally perform subtasks
 * or change the eventual redirection destination
 */
type State = {
  slug: string;
} & (
  | {
      action: 'comment';
      comment: string;
    }
  | {
      action: 'like';
      fromProjectPage?: boolean;
    }
);

export function encodeState(state: State): string {
  return Buffer.from(JSON.stringify(state)).toString('base64');
}

export function decodeState(encodedState: string | undefined): State | undefined {
  if (!encodedState) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.from(encodedState, 'base64').toString());
  } catch {
    return undefined;
  }
}
