export type InstagramData = {
  followers: string[];
  following: string[];
};

function cleanUsername(
  username: string
): string {
  return username
    .trim()
    .replace(/^@/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function isValidUsername(
  username: string
): boolean {
  if (!username) {
    return false;
  }

  if (username.length > 100) {
    return false;
  }

  if (
    username.includes(" ") ||
    username.includes("http://") ||
    username.includes("https://")
  ) {
    return false;
  }

  return true;
}

/*
 * FOLLOWING
 *
 * Instagram folosește:
 *
 * {
 *   "relationships_following": [
 *     {
 *       "title": "username",
 *       "string_list_data": [
 *         {
 *           "href": "...",
 *           "timestamp": ...
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Username-ul este în "title".
 */
export function extractFollowingUsernames(
  data: unknown
): string[] {
  const result: string[] = [];

  if (
    typeof data !== "object" ||
    data === null
  ) {
    return result;
  }

  const root =
    data as Record<string, unknown>;

  const relationships =
    root.relationships_following;

  if (!Array.isArray(relationships)) {
    return result;
  }

  for (const item of relationships) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const entry =
      item as Record<string, unknown>;

    if (
      typeof entry.title !== "string"
    ) {
      continue;
    }

    const username =
      cleanUsername(entry.title);

    if (
      isValidUsername(username)
    ) {
      result.push(username);
    }
  }

  return [
    ...new Set(result),
  ];
}

/*
 * FOLLOWERS
 *
 * Followers pot apărea ca array:
 *
 * [
 *   {
 *     "title": "username",
 *     "string_list_data": [
 *       {
 *         "value": "username",
 *         ...
 *       }
 *     ]
 *   }
 * ]
 *
 * sau într-un obiect.
 *
 * Pentru followers folosim "value" când există.
 * Dacă nu există, folosim "title".
 */
export function extractFollowerUsernames(
  data: unknown
): string[] {
  const result: string[] = [];

  function walk(value: unknown) {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }

      return;
    }

    if (
      typeof value !== "object" ||
      value === null
    ) {
      return;
    }

    const object =
      value as Record<string, unknown>;

    /*
     * Prioritate pentru string_list_data[].value
     */
    if (
      Array.isArray(
        object.string_list_data
      )
    ) {
      for (
        const item of object.string_list_data
      ) {
        if (
          !item ||
          typeof item !== "object"
        ) {
          continue;
        }

        const entry =
          item as Record<string, unknown>;

        if (
          typeof entry.value === "string"
        ) {
          const username =
            cleanUsername(entry.value);

          if (
            isValidUsername(username)
          ) {
            result.push(username);
          }
        }
      }
    }

    /*
     * Dacă nu există value, folosim title.
     */
    if (
      typeof object.title === "string"
    ) {
      const username =
        cleanUsername(object.title);

      if (
        isValidUsername(username)
      ) {
        result.push(username);
      }
    }

    for (
      const [key, child] of Object.entries(
        object
      )
    ) {
      if (
        key === "string_list_data" ||
        key === "title"
      ) {
        continue;
      }

      walk(child);
    }
  }

  walk(data);

  return [
    ...new Set(result),
  ];
}

export function extractUsernames(
  data: unknown
): string[] {
  return extractFollowerUsernames(data);
}

export function extractUsernamesFromHtml(
  html: string
): string[] {
  const result: string[] = [];

  const regex =
    /https?:\/\/(?:www\.)?instagram\.com\/(?:_u\/)?([^"'/?#<>\s]+)/gi;

  let match: RegExpExecArray | null;

  while (
    (match = regex.exec(html)) !== null
  ) {
    const username =
      cleanUsername(match[1]);

    if (
      isValidUsername(username)
    ) {
      result.push(username);
    }
  }

  return [
    ...new Set(result),
  ];
}

export function parseInstagramData(
  followersData: unknown,
  followingData: unknown
): InstagramData {
  return {
    followers:
      extractFollowerUsernames(
        followersData
      ),

    following:
      extractFollowingUsernames(
        followingData
      ),
  };
}