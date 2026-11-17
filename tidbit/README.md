# tidbit.

**Big stories. Small bites.** A mobile-first social news app: swipe through short-form news from verified publishers, with the context, sources and multiple perspectives a trustworthy news product needs.

> All publishers, towns, people and stories in this build are **fictional demo content**, and every one is labelled "Demo" in the app. None of it is real news.

## Launch video

https://github.com/user-attachments/assets/1bd4de6e-7a5f-4616-8aa0-a4cd15b5556b

A 20-second tour of the app (with sound). Every publisher and story in it is fictional demo content. You can also [download the video](docs/launch-video.mp4).

## What's in Phase 1

- **Onboarding:** welcome screen, sign up / log in (email and password), interests, location (no GPS), publishers to follow, "what matters most", gesture tutorial
- **Home feed:** full-screen vertical feed with For You, Following, Trending (local / national / global) and Local tabs. Works with swipe, scroll wheel and keyboard (↑/↓, J/K), remembers your place, and preloads the next card
- **Post formats:** motion stories (timed, video-style, tap to pause, speed control), quick reads, multi-slide explainers, data/infographic posts and breaking-news timelines with confirmed/unconfirmed labels
- **Engagement:** likes, threaded comments (top/newest, like, reply, delete, report), bookmarks with collections, reposts with commentary, share (copy link, native share, social links), follow publishers and people
- **Polls:** single choice, multiple choice, yes/no and 1–5 scale. One vote per person, enforced in the database. Results animate in and are labelled as non-representative
- **Recommendations:** a transparent, rules-based weighted score (below), diversity rules, "Why am I seeing this?", Not interested, Show more / less, Hide publisher, "Explore outside my bubble", and a reset
- **Story context:** related coverage, "See other perspectives" (labelled reporting / analysis / opinion / unconfirmed, with no political labels), a timeline, sources and correction history
- **Discover and search:** trending, categories, recommended publishers, around the world, explainers, deep dives, good news. Search covers stories, publishers, people and topics, with filters
- **Profiles:** reader profiles with private-by-default likes, saved and poll tabs. Publisher profiles with Latest / Motion / Articles / Popular / Polls / About
- **Inbox:** replies, comment likes, new followers, reposts, breaking news and posts from publishers you follow, all respecting your notification settings
- **Settings:** account (email, password, delete), personalization, feed preferences, notifications, privacy (private profile, block/mute, JSON data export) and dark/light/system appearance
- **Moderation (basic):** admin-only report queue (dismiss / remove, with an audit log) and news tips. Roles are enforced on the server

### For You ranking weights

| Signal | Weight |
| --- | --- |
| Interest relevance | 25% |
| Recent engagement (likes, saves, shares, "more like this", completed non-distressing posts) | 15% |
| Freshness | 15% |
| Credibility and source quality | 15% |
| Publisher follows | 10% |
| Geographic relevance | 10% |
| Diversity and discovery | 10% |

After scoring, a re-rank avoids back-to-back posts from one publisher, repeated coverage of the same story, and runs of distressing news. Outrage, replays and heated comments are not ranking signals. The weights live in [`shared/types.ts`](shared/types.ts).

## Not built yet (later phases)

- **Phase 2, publisher platform:** publisher applications and verification review, the publishing studio (uploads, scheduling, poll builder), analytics, the corrections workflow, and real video with captions and mute
- **Phase 3, advanced discovery:** semantic story clustering, richer trending, push and email notifications
- **Phase 4, production:** hosted auth (Google/Apple sign-in, email verification, password reset), media storage and streaming, monitoring, backups and accessibility audits

The UI never shows controls for these: features that aren't built either don't appear or say plainly that they're coming later.

## Run it locally

You need [Node.js](https://nodejs.org) 24 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs on port 3001. The SQLite database is created and seeded automatically in `data/tidbit.db`.

```bash
npm run reset-db     # delete the local database (demo data is re-seeded on next start)
npm run typecheck    # type-check client and server
npm run build && npm start   # production build served by the API server on port 3001
```

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Reader | `reader@tidbit.demo` | `tidbit-demo` |
| Publisher (The Daily Brief) | `publisher@tidbit.demo` | `tidbit-demo` |
| Moderator | `admin@tidbit.demo` | `tidbit-demo` |

These accounts are seeded only into your local database, for development testing.

## Tech stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, React Router, TanStack Query, Radix UI dialogs, lucide icons, Sonner toasts
- **Backend:** Node.js + Express 5, written in TypeScript and run directly by Node
- **Database:** SQLite via Node's built-in `node:sqlite` (no native build step), with foreign keys, unique constraints, indexes and a trigger enforcing one vote per single-answer poll
- **Auth:** scrypt password hashing, http-only session cookies, server-side role checks, rate limits and JSON-only mutations

The schema follows the relational model in the original spec, so it can move to PostgreSQL (for example on Supabase) when the app is hosted.

## Project structure

```
server/            Express API, database schema, seed data, ranking
  db.ts            schema and helpers
  seed-data.ts     fictional demo publishers, posts, polls and comments
  ranking.ts       For You, Trending and Local ranking
  api-*.ts         route handlers
shared/types.ts    types and ranking weights shared by client and server
src/
  components/      feed card, post formats, polls, sheets, UI primitives
  pages/           one file per route
  lib/             API client, session, optimistic updates, formatting
```

## Design

Midnight navy `#101827`, dark slate `#192435`, electric teal `#35D5B1` for active states and coral `#FF786B` for breaking news only. Headlines use Manrope and body text uses Inter. Placeholder artwork is generated in the browser from each post's topic, so no third-party media is used.
