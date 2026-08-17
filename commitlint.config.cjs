// Conventional Commits, enforced as shipped. Do not disable type-empty,
// subject-empty or header-max-length: with those off every freeform message
// passes, and the green commitlint check gets read as evidence it validated
// something. See docs/atomic-commits.md.
module.exports = {
  extends: ["@commitlint/config-conventional"]
};
