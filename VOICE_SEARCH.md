# Voice Search — What's Actually "AI" Here, and What Isn't

> **Update:** everything below this line describes the ORIGINAL,
> backend-less version of this feature, kept as-is for history. A real
> backend and a real LLM call now exist — see
> `BACKEND_AND_VOICE_CHANGES.md` at the project root for what changed
> and why. Short version: speech-to-text (section below) didn't
> change at all; what happens to the transcribed text after that is no
> longer keyword-matching — it's now a real Anthropic API call.

Being upfront: this WAS NOT a real LLM call. There was no backend to
hold an API key safely, so a genuine "AI understands your intent"
search wasn't possible client-side alone. Here's what was real and
what wasn't, at that point in the project's history.

## What's genuinely AI-powered

**Speech-to-text itself.** `window.SpeechRecognition` (or
`webkitSpeechRecognition` in Chrome) is a real browser API backed by
Google's actual speech recognition models. Saying "wireless
headphones" and getting back that exact text as a string is real
machine learning — running in the browser, no API key needed, because
the browser vendor already built and hosts the model.

## What's NOT AI — just string matching

Once we have the transcribed text, deciding what to DO with it
(`handleVoiceResult` in `ShopPage.jsx`) is plain keyword matching:

```js
const matchedCategory = categories.find((c) => c !== "all" && lower.includes(c));
if (lower.includes("cheap")) setSortBy("price-asc");
```

Say "show me cheap electronics" and it works, because "electronics" is
a real category name and "cheap" is a word we specifically check for.
Say "I want something for my kitchen" and it won't understand that at
all — a real LLM would. This is the honest gap between what's built
here and true AI search.

## New files

- `src/hooks/useVoiceSearch.js` — wraps the browser's SpeechRecognition
  API into a React-friendly hook: `{ isListening, isSupported, startListening }`.

## The useRef trick worth understanding

`onResultRef` in `useVoiceSearch.js` solves a specific problem: the
`onResult` function passed in from `ShopPage` is a NEW function every
render. If the setup `useEffect` depended on `[onResult]` directly, it
would tear down and rebuild the whole SpeechRecognition object every
time ShopPage re-rendered for ANY reason — wasteful. Storing the
callback in a ref lets the effect run once, while still always calling
the latest version of the function when speech is recognized.

## Try it

Click the mic icon next to search, allow microphone access when
prompted, then try saying things like:
- "electronics" — sets the category filter
- "cheap jewelry" — sets category AND sorts by price ascending
- anything else — just becomes the search text, same as typing
