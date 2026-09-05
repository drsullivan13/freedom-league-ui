# National Freedom League UI

A mobile-first fantasy football dashboard for weekly Freedom Points rankings,
real matchup records, team scores, rank movement, and shareable Tuesday recaps.

## Stack

- Next.js 16 App Router and React 19
- Tailwind CSS 4
- Server-side adapter for `fantasy-sports-hub`
- `ImageResponse` recap images with native Web Share support

## Configuration

Create `.env.local`:

```bash
FANTASY_SPORTS_API_URL=http://localhost:5001
LEAGUE_TYPE=football
LEAGUE_ID=248873
```

Only the Next.js server calls the fantasy API. Do not expose ESPN cookies through
`NEXT_PUBLIC_*` variables.

## Development

```bash
npm install
npm run dev
```

The app runs at <http://localhost:3000>. Start `fantasy-sports-hub` separately
on port 5001.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
# or all three
npm run check
```

## Sharing

The recap image is generated at `/api/recap?season=YYYY&week=N`. On supported
phones, **Share recap** opens the native share sheet so the image can be sent
through Messages. Save-image and copy-text actions remain available as
fallbacks.
