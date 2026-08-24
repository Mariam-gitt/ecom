import { useState, useRef, useEffect } from "react";

// A custom hook wrapping the browser's built-in SpeechRecognition —
// this is a real browser API (not a React thing), so most of this hook
// is just "translate a browser API into something React-friendly."
export function useVoiceSearch(onResult) {
  const [isListening, setIsListening] = useState(false);

  // Checked ONCE, lazily (the function form of useState only runs on
  // the very first render) — not every browser supports this API, and
  // it's prefixed differently in different ones (Chrome uses
  // "webkitSpeechRecognition", others may not have it at all).
  const [isSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  // Holds the actual SpeechRecognition object across renders, WITHOUT
  // causing a re-render when it's set — same reasoning as inputRef
  // earlier: this is a real object we need a stable handle to, not
  // something that should trigger a re-draw when it changes.
  const recognitionRef = useRef(null);

  // A SECOND ref, just to hold the latest "onResult" function. Why:
  // ShopPage will pass in a NEW onResult function every render (it's
  // defined inline there). If the effect below depended on [onResult]
  // directly, it would tear down and rebuild the whole SpeechRecognition
  // setup on every keystroke elsewhere in ShopPage — wasteful, and
  // pointless. Storing it in a ref lets us always call the LATEST
  // version, without the effect needing to re-run when it changes.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (!isSupported) return; // nothing to set up if the browser can't do this

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // stop automatically after one phrase
    recognition.interimResults = false; // only fire once, with the final text
    recognition.lang = "en-US";

    // Fires once speech has been converted to text. event.results is a
    // nested structure; [0][0].transcript drills down to the actual
    // recognized string for the first (and only, since continuous is
    // false) result.
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultRef.current(transcript); // always the LATEST callback
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [isSupported]); // runs once — isSupported never changes after mount

  function startListening() {
    if (!recognitionRef.current) return;
    setIsListening(true);
    // .start() is a method on the browser's SpeechRecognition object —
    // this actually turns the microphone on and begins listening.
    recognitionRef.current.start();
  }

  return { isListening, isSupported, startListening };
}
