/* Named consts for GitHub API response codes as documented in https://docs.github.com/en/rest */

export const HTTP = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  FOUND: 302,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422
} as const
