import { Star } from "lucide-react";

// A small, purely presentational component — no state, no context, just
// props in, JSX out. "rate" is a number like 3.7, "count" is how many
// reviews it's based on (both come straight from the API's product.rating).
export default function StarRating({ rate, count }) {
  // Build an array [0, 1, 2, 3, 4] just so we can .map() over it 5
  // times — a common trick for "repeat this element N times" when you
  // don't have real data to loop over, only a count.
  const stars = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center gap-1">
      {stars.map((i) => (
        <Star
          key={i}
          size={13}
          // Fill the star solid if its position is within the rating,
          // otherwise just show the outline. Math.round rounds 3.7 up
          // to 4 filled stars, for example.
          className={
            i < Math.round(rate)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300"
          }
        />
      ))}
      {/* Only show the count if it was actually passed in */}
      {count != null && (
        <span className="text-xs text-neutral-400 ml-1">({count})</span>
      )}
    </div>
  );
}
