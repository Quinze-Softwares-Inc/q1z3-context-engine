# Q1Z3 context-engine core

Source repository: [Quinze Softwares Inc. / q1z3-context-engine](https://github.com/Quinze-Softwares-Inc/q1z3-context-engine).

Version **0.1.0** is a dependency-free, pure ESM library. It has three small
functions: classify declared source metadata, normalize an exact question, and
select the latest exact audience/question candidate from ordered records.
It runs in modern browsers, Workers and Node.js 18 or later.

The module performs no filesystem, network, model, clock or action operations.
It does not store context, read original files, extract evidence, research facts,
train a model, infer people or topics, perform semantic search, or authorize a
reply. Those capabilities and their permissions belong to the embedding system.
Input records should be plain JSON-like objects; accessor properties and
inherited metadata are ignored. Do not pass objects with executable proxy traps
when treating data as untrusted.

## API

```js
import {
  sourceCategory, normalizeQuestion, chooseExactLesson
} from './index.js';

sourceCategory({kind: 'ai_summary', mime: 'text/plain'}); // 'ai-summary'
normalizeQuestion('  WHAT is  the launch date?  ');      // 'what is the launch date?'

// Synthetic example. The owner store supplies its authoritative newest order.
const newestFirst = [
  {id: 'newer', audience: '@alice', question: 'When is the launch?', mode: 'private'},
  {id: 'older', audience: 'alice', question: 'When is the launch?', mode: 'allow'}
];
const candidate = chooseExactLesson(newestFirst, {
  audience: 'alice', question: ' WHEN is the launch? '
});
candidate.id; // 'newer' — a candidate, never permission to disclose
```

### `sourceCategory(source)`

Returns `text`, `document`, `image`, `ai-summary`, `service-snapshot`, or
`unknown`. A recognized own string `kind` takes priority over `mime`:

| Declared kind | Category |
| --- | --- |
| `text` | `text` |
| `document`, `file` | `document` |
| `image`, `screenshot` | `image` |
| `ai_summary`, `ai-summary` | `ai-summary` |
| `service`, `service_snapshot`, `service-snapshot` | `service-snapshot` |

Without a recognized kind, MIME metadata supplies the fallback: `image/*`
maps to image; `text/*`, JSON, XML and JavaScript map to text; supported PDF,
Word, Office, ODF and RTF declarations map to document. MIME case and parameters
are normalized. Other or malformed declarations return unknown. Names,
extensions, source text, provider names, confidence and sharing flags have no
effect. A category does not establish the real byte format, availability, truth,
ownership or permission of that source.

### `normalizeQuestion(value)`

Requires a primitive string; other inputs throw `TypeError`. Applies Unicode
NFC, trims, collapses whitespace and lowercases. An empty string remains empty.
It retains punctuation, accents and wording. Rephrases and similar topics do
not become matches.

### `chooseExactLesson(lessons, {audience, question})`

Returns the original first matching record, or null. Audiences are ASCII handle
declarations of 3–24 characters, with case and an optional leading `@`
normalized. This does not verify that a handle exists, belongs to a person, or
holds a credential. Questions must match `normalizeQuestion` exactly.

The caller must supply records scoped to **one owner**, in authoritative newest
decision order. The Q1Z3 runtime uses `updated_at DESC, id DESC`, with the query
already restricted to the requested audience and its legacy `@` spelling.
The function does not sort, mutate, copy, infer or check a record's mode, expiry,
source pins or current validity. A newer private, ask, expired or malformed-mode
record is still the exact candidate; it never falls through to an older allow.
Do not prefilter the candidate list to active/allow records. Malformed audience
or question metadata is skipped without coercing it into text.

## Broker-owned authority

Candidate selection is only one step in the existing local broker. Before
model processing or content-bearing dispatch, the embedding application must
independently authenticate the current owner and requester, revalidate the
complete current lesson, mode and expiry, and enforce exact source hashes,
availability, attached service permissions, pause state and recipient scope.
It must retain its conditional writes, cancellation and final primary reads.
A lesson can be revoked between selection and dispatch. This module does not
close that race, grant model authority, contact anyone or recall delivered text.

Q1Z3 adds these mechanical categories to owner-only source projections and
uses this exact selector for its ordered database candidates. Its existing
permission and transport checks remain authoritative. Optional local semantic
selection elsewhere in the application is not implemented by this core.

## Distribution and license

Use the downloaded source directory directly or import its `index.js` from your
own ESM project. This manifest identifies the standalone package; it does not
claim an npm or GitHub publication. The MIT license covers this package's four
files only. It does not license the wider XVoer repository, personal evidence,
third-party artifacts, model weights, provider services or user data.
