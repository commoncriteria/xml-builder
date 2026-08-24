export function deepCopy(obj) {
  const seen = new WeakSet();

  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      if (value && typeof value === "object") {
        if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
          return typeof value.value === "string" ? value.value : undefined;
        }

        if (typeof HTMLElement !== "undefined" && value.target instanceof HTMLElement) {
          return typeof value.target.value === "string" ? value.target.value : undefined;
        }

        if (seen.has(value)) {
          return undefined;
        }

        seen.add(value);
      }

      return value;
    })
  );
}
