import { j as l, k as y, l as w, m as x, o as k, h as z, q as A } from "./CYmiEaEH.js"
function h(e, n, t) {
  if (e == null) return (n(void 0), t && t(void 0), l)
  const r = y(() => e.subscribe(n, t))
  return r.unsubscribe ? () => r.unsubscribe() : r
}
const f = []
function j(e, n) {
  return { subscribe: B(e, n).subscribe }
}
function B(e, n = l) {
  let t = null
  const r = new Set()
  function c(u) {
    if (w(e, u) && ((e = u), t)) {
      const o = !f.length
      for (const s of r) (s[1](), f.push(s, e))
      if (o) {
        for (let s = 0; s < f.length; s += 2) f[s][0](f[s + 1])
        f.length = 0
      }
    }
  }
  function a(u) {
    c(u(e))
  }
  function b(u, o = l) {
    const s = [u, o]
    return (
      r.add(s),
      r.size === 1 && (t = n(c, a) || l),
      u(e),
      () => {
        ;(r.delete(s), r.size === 0 && t && (t(), (t = null)))
      }
    )
  }
  return { set: c, update: a, subscribe: b }
}
function M(e, n, t) {
  const r = !Array.isArray(e),
    c = r ? [e] : e
  if (!c.every(Boolean)) throw new Error("derived() expects stores as input, got a falsy value")
  const a = n.length < 2
  return j(t, (b, u) => {
    let o = !1
    const s = []
    let p = 0,
      d = l
    const g = () => {
        if (p) return
        d()
        const i = n(r ? s[0] : s, b, u)
        a ? b(i) : (d = typeof i == "function" ? i : l)
      },
      m = c.map((i, _) =>
        h(
          i,
          (q) => {
            ;((s[_] = q), (p &= ~(1 << _)), o && g())
          },
          () => {
            p |= 1 << _
          },
        ),
      )
    return (
      (o = !0),
      g(),
      function () {
        ;(x(m), d(), (o = !1))
      }
    )
  })
}
function S(e) {
  let n
  return (h(e, (t) => (n = t))(), n)
}
function C(e) {
  ;(A === null && k(),
    z(() => {
      const n = y(e)
      if (typeof n == "function") return n
    }))
}
export { M as d, S as g, C as o, h as s, B as w }
