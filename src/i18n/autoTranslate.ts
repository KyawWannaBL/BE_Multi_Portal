import type { Lang } from "./translations";
import { dictLookup } from "./translations";

const nodeOriginalText = new WeakMap<Node, string>();
const elemOriginalAttrs = new WeakMap<Element, Map<string, string>>();

function isCodeLike(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  // IDs, codes, emails, URLs
  if (/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(t)) return true;
  if (/https?:\/\//i.test(t)) return true;
  if (/^[A-Z0-9_-]{6,}$/.test(t)) return true;
  // Too many digits / punctuation
  const letters = (t.match(/[A-Za-z]/g) ?? []).length;
  const digits = (t.match(/[0-9]/g) ?? []).length;
  if (digits > 0 && letters > 0 && t.length <= 12) return true;
  return false;
}

function transliterateWord(word: string): string {
  const w = word.toLowerCase();
  const table: Record<string, string> = {
    a: "အ",
    b: "ဘ",
    c: "စ",
    d: "ဒ",
    e: "ဧ",
    f: "ဖ",
    g: "ဂ",
    h: "ဟ",
    i: "အိုင်",
    j: "ဂျ",
    k: "က",
    l: "လ",
    m: "မ",
    n: "န",
    o: "အို",
    p: "ပ",
    q: "ကွ",
    r: "ရ",
    s: "ဆ",
    t: "တ",
    u: "ယူ",
    v: "ဗ",
    w: "ဝ",
    x: "အက်စ်",
    y: "ဝိုင်",
    z: "ဇ",
  };

  let out = "";
  for (const ch of w) {
    if (/[a-z]/.test(ch)) out += table[ch] ?? ch;
    else out += ch;
  }
  return out || word;
}

function transliteratePhrase(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => (/\s+/.test(token) ? token : transliterateWord(token)))
    .join("");
}

/**
 * Translate a short UI phrase.
 * - Exact dictionary match first
 * - Word-by-word dictionary match second
 * - Myanmar-script transliteration fallback
 */
export function translateText(text: string, lang: Lang): string {
  if (lang === "en") return text;
  const exact = dictLookup(text);
  if (exact) return exact;

  const tokens = text.split(/(\s+)/);
  let anyTranslated = false;
  const mapped = tokens.map((tok) => {
    if (/\s+/.test(tok)) return tok;
    const d = dictLookup(tok);
    if (d) {
      anyTranslated = true;
      return d;
    }
    return tok;
  });

  const joined = mapped.join("");
  if (anyTranslated) return joined;

  return transliteratePhrase(text);
}

function shouldSkipNode(node: Node): boolean {
  if (node.nodeType !== Node.TEXT_NODE) return true;
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest("[data-no-translate]")) return true;
  const tag = parent.tagName.toLowerCase();
  if (["script", "style", "noscript", "code", "pre"].includes(tag)) return true;
  if (parent.closest("code,pre")) return true;
  return false;
}

function translateTextNode(node: Node, lang: Lang) {
  if (shouldSkipNode(node)) return;
  const raw = node.nodeValue ?? "";
  if (!raw.trim()) return;

  // preserve original
  if (!nodeOriginalText.has(node)) nodeOriginalText.set(node, raw);

  const original = nodeOriginalText.get(node) ?? raw;
  if (isCodeLike(original)) return;

  node.nodeValue = translateText(original, lang);
}

function translateElementAttrs(el: Element, lang: Lang) {
  if (el.closest("[data-no-translate]")) return;

  const attrs = ["placeholder", "title", "aria-label"];
  for (const attr of attrs) {
    const v = el.getAttribute(attr);
    if (!v) continue;
    if (isCodeLike(v)) continue;

    let map = elemOriginalAttrs.get(el);
    if (!map) {
      map = new Map();
      elemOriginalAttrs.set(el, map);
    }
    if (!map.has(attr)) map.set(attr, v);

    const original = map.get(attr) ?? v;
    el.setAttribute(attr, lang === "en" ? original : translateText(original, lang));
  }
}

export type AutoTranslateOptions = {
  root: HTMLElement;
  lang: Lang;
};

export function applyAutoTranslate({ root, lang }: AutoTranslateOptions) {
  // translate existing
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null = walker.nextNode();
  while (n) {
    translateTextNode(n, lang);
    n = walker.nextNode();
  }

  // attributes
  const elems = root.querySelectorAll("*");
  elems.forEach((el) => translateElementAttrs(el, lang));
}

export function observeAutoTranslate({ root, lang }: AutoTranslateOptions) {
  applyAutoTranslate({ root, lang });

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData" && m.target) {
        translateTextNode(m.target, lang);
      } else if (m.type === "childList") {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node, lang);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyAutoTranslate({ root: node as HTMLElement, lang });
          }
        });
      } else if (m.type === "attributes" && m.target instanceof Element) {
        translateElementAttrs(m.target, lang);
      }
    }
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label"],
  });

  return () => observer.disconnect();
}
