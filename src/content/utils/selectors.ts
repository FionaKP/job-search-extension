/**
 * DOM Selector Utilities
 * Helpers for extracting content from web pages
 */

export function selectText(doc: Document, selector: string): string | null {
  try {
    const el = doc.querySelector(selector);
    return el?.textContent?.trim() || null;
  } catch {
    return null;
  }
}

export function selectAttr(doc: Document, selector: string, attr: string): string | null {
  try {
    const el = doc.querySelector(selector);
    return el?.getAttribute(attr) || null;
  } catch {
    return null;
  }
}

export function selectAll(doc: Document, selector: string): string[] {
  try {
    return Array.from(doc.querySelectorAll(selector))
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => Boolean(text));
  } catch {
    return [];
  }
}

/**
 * Try multiple selectors in order, return first match
 */
export function selectFirst(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const result = selectText(doc, selector);
    if (result) return result;
  }
  return null;
}

/**
 * Try multiple selectors for an attribute, return first match
 */
export function selectFirstAttr(doc: Document, selectors: string[], attr: string): string | null {
  for (const selector of selectors) {
    const result = selectAttr(doc, selector, attr);
    if (result) return result;
  }
  return null;
}
