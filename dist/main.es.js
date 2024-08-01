var l = Object.defineProperty;
var f = (a, t, r) => t in a ? l(a, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[t] = r;
var n = (a, t, r) => f(a, typeof t != "symbol" ? t + "" : t, r);
const o = [];
class p {
  constructor() {
    n(this, "attributes", /* @__PURE__ */ new Map());
  }
  add(t, r) {
    var e;
    this.attributes.has(t) || this.attributes.set(t, /* @__PURE__ */ new Set()), (e = this.attributes.get(t)) == null || e.add(r);
  }
  remove(t, r) {
    var e;
    this.attributes.has(t) && ((e = this.attributes.get(t)) == null || e.delete(r));
  }
  has(t, r) {
    var e;
    return this.attributes.has(t) && ((e = this.attributes.get(t)) == null ? void 0 : e.has(r)) || !1;
  }
  includes(t) {
    return this.attributes.has(t);
  }
  get(t) {
    return this.attributes.get(t);
  }
  getAll() {
    return Array.from(this.attributes.values());
  }
  clear() {
    this.attributes.clear();
  }
}
class d {
  constructor(t, r = { cache: !0 }, e = r.cache ? /* @__PURE__ */ new Map() : void 0) {
    n(this, "filters", new p());
    this.objects = t, this.options = r, this.cache = e, this.filters.add("name", (s, i) => s.name === i), this.filters.add("uuid", (s, i) => s.uuid === i);
  }
  get(t) {
    var e, s;
    if (typeof t != "string") throw new Error("Invalid query: Query must be a string");
    if (t = t.trim(), t === "") throw new Error("Invalid query: Query must be a non-empty string");
    const r = (e = this.cache) == null ? void 0 : e.get(t);
    if (r) return r;
    try {
      const i = this.parseQuery(t), c = this.executeQuery(this.objects, i);
      return this.options.cache && ((s = this.cache) == null || s.set(t, c)), c;
    } catch (i) {
      throw i instanceof Error ? new Error(`Query execution failed: ${i.message}`) : i;
    }
  }
  parseQuery(t) {
    return t.split(/\s*>\s*|\s+/).map((e) => e.trim()).map((e, s) => {
      try {
        return this.parseSegment(e, s > 0 && t.includes(">"));
      } catch (i) {
        throw i instanceof Error ? new Error(`Invalid segment "${e}": ${i.message}`) : i;
      }
    });
  }
  parseSegment(t, r) {
    const e = t.match(/^(\w+)(?:\[|$)/), s = t.match(/\[([^\]]+?)=['"]([^'"]*)['"]\]/g), i = {};
    if (s)
      for (const c of s) {
        const [, h, u] = c.match(/\[([^\]]+?)=['"]([^'"]*)['"]\]/) || [];
        h && u && (i[h] = u);
      }
    return {
      type: e ? e[1] : null,
      attributes: i,
      isDirectChild: r
    };
  }
  executeQuery(t, r) {
    let e = t;
    for (let s = 0; s < r.length; s++) {
      const i = r[s];
      if (e = this.filterObjects(e, i), e.length === 0)
        return e;
      s < r.length - 1 && !r[s + 1].isDirectChild && (e = this.getAllDescendants(e));
    }
    return e;
  }
  filterObjects(t, r, e = []) {
    for (const s of t)
      this.filterObject(s, r, e);
    return e;
  }
  filterObject(t, r, e = []) {
    e.includes(t) == !1 && this.objectMatchesSegment(t, r) && e.push(t), r.isDirectChild ? t.children.forEach((s) => {
      this.objectMatchesSegment(s, r) && e.includes(s) == !1 && e.push(s);
    }) : t.traverse((s) => {
      e.includes(s) == !1 && s !== t && this.objectMatchesSegment(s, r) && e.push(s);
    });
  }
  objectMatchesSegment(t, r) {
    if (r.type && t.type !== r.type)
      return !1;
    for (let e in r.attributes) {
      let s = r.attributes[e];
      if (this.filters.includes(e)) {
        const i = this.filters.get(e);
        for (let c of i)
          if (c(t, s) == !1)
            return !1;
      }
    }
    return !0;
  }
  getAllDescendants(t, r = []) {
    return t.forEach((e) => {
      e.traverse((s) => {
        s !== e && r.push(s);
      });
    }), r;
  }
  /**
   * This method is called to clear the cache.
   */
  free() {
    var t;
    (t = this.cache) == null || t.clear();
  }
  /**
   * This method is called when the object is disposed.
   * It should be called by the user explicitly.
   */
  dispose() {
    var t;
    (t = this.cache) == null || t.clear(), delete this.cache, this.objects = o;
  }
}
export {
  d as QuerySelector
};
