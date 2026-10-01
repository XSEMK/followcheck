function normalizeUsername(username: string): string {
  return username
    .trim()
    .replace(/^@/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

export function findNotFollowingBack(
  following: string[],
  followers: string[]
): string[] {
  const followersSet = new Set(
    followers.map((username) =>
      normalizeUsername(username)
    )
  );

  const result: string[] = [];

  for (const username of following) {
    const normalized = normalizeUsername(username);

    if (
      normalized &&
      !followersSet.has(normalized) &&
      !result.includes(normalized)
    ) {
      result.push(normalized);
    }
  }

  return result;
}

export function findNotFollowedByYou(
  following: string[],
  followers: string[]
): string[] {
  const followingSet = new Set(
    following.map((username) =>
      normalizeUsername(username)
    )
  );

  const result: string[] = [];

  for (const username of followers) {
    const normalized = normalizeUsername(username);

    if (
      normalized &&
      !followingSet.has(normalized) &&
      !result.includes(normalized)
    ) {
      result.push(normalized);
    }
  }

  return result;
}