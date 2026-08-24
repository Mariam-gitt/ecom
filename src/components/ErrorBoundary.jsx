import { Component } from "react";

// Error boundaries MUST be class components — hooks don't support this
// "catch a crash in my children" behavior, even in modern React. This
// is the one deliberate exception to an otherwise hooks-only app.
export class ErrorBoundary extends Component {
  // A class component's "state" works differently from useState — it's
  // one object, set directly like this instead of via a hook call.
  state = { hasError: false };

  // React calls this AUTOMATICALLY, on its own, if any component
  // rendered inside <ErrorBoundary> throws an error during rendering.
  // We don't call this ourselves — React does.
  static getDerivedStateFromError() {
    // Returning this object tells React: "update my state to
    // hasError: true", which triggers a re-render of THIS component.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // Show a fallback UI instead of letting the crash take down the
      // entire page.
      return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-sm font-medium mb-1">Something went wrong.</p>
          <p className="text-xs text-neutral-400">
            Try refreshing the page.
          </p>
        </div>
      );
    }
    // No error so far -> render children completely normally.
    return this.props.children;
  }
}
