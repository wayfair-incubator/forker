/* Named consts for GitHub API response codes as documented in https://docs.github.com/en/rest */

export class HTTP {
  static readonly OK = 200
  static readonly CREATED = 201
  static readonly ACCEPTED = 202
  static readonly NO_CONTENT = 204
  static readonly FOUND = 302
  static readonly FORBIDDEN = 403
  static readonly NOT_FOUND = 404
}
