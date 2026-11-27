# Profile screen visual completion

## Goal

Complete the existing profile screen so it matches the supplied reference while preserving the current application background and all existing form behavior.

## Scope

- Add a full-width yellow introductory tag above the profile title.
- Add a heading above the avatar controls.
- Add a permanently visible Captain mascot and speech bubble below the avatar controls.
- Keep all product copy in `messages/pl.json` and `messages/en.json`.
- Reuse the existing `Captain`, `tag`, `mascot-line`, and `bubble` visual patterns.
- Add only profile-specific layout CSS needed to match the reference.

## Copy

Polish:

- Introductory tag: `NAJPIERW POZNAJMY KAPITANA`
- Avatar heading: `WYBIERZ SWOJĄ RYBKĘ`
- Captain message: `Dobra ksywka, dobra rybka. Możemy ruszać!`

English receives equivalent translated strings.

## Behavior

The new elements are presentational and always visible. Nickname validation, avatar selection, random selection, submission, routing, and the current page background remain unchanged.

## Verification

- Run TypeScript type checking.
- Run the existing test suite.
- Check the profile screen at mobile and desktop widths.
