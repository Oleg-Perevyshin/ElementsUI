import { b as w, a as j, f as C } from "./Di61MV9l.js"
import { t as _, c as p, r as d, s as h, e as y, b as $, g as b, u as S } from "./CYmiEaEH.js"
import { s as z } from "./cfR1Foc9.js"
import { j as x, k, B as O, l as T } from "./CnAfG7ip.js"
import { c as V } from "./_y1boTp2.js"
var A = w(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"></path><path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3"></path></g></svg>',
)
function B(i) {
  var o = A()
  j(i, o)
}
const H = (i) => {
  const o = (e) => {
      if (typeof e == "string") return e.replace(/\s+/g, " ").trim()
      if (Array.isArray(e)) return e.map((t) => o(t))
      if (e !== null && typeof e == "object") {
        const t = {}
        for (const [r, n] of Object.entries(e)) t[r] = o(n)
        return t
      }
      return e
    },
    a = o(i),
    c = JSON.stringify(a, null, 2),
    f = JSON.parse(c),
    l = (e, t = 0) => {
      if (typeof e == "string") return `'${e}'`
      if (typeof e == "number") return String(e)
      if (typeof e == "boolean") return String(e)
      if (e === null) return "''"
      if (Array.isArray(e)) return `[${e.map((n) => l(n, t + 1)).join(", ")}]`
      if (typeof e == "object") {
        const r = Object.entries(e)
        return r.length === 0
          ? "{}"
          : "{ " +
              r
                .map(([g, u]) => {
                  const v = l(u, t + 1)
                  return `${g}: ${v}`
                })
                .join(", ") +
              " }"
      } else return String(e)
    },
    s = [],
    m = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/
  for (const [e, t] of Object.entries(f)) {
    if (e === "eventHandler") continue
    if (e === "id" && m.test(t)) {
      s.push(`  ${e}=crypto.randomUUID()`)
      continue
    }
    let r = l(t)
    ;(typeof t == "object" && t !== null ? (r = `{${r}}`) : (typeof t == "boolean" || typeof t == "number") && (r = `{${r}}`),
      typeof t == "string" ? s.push(`  ${e}=${r}`) : t === null ? s.push(`${e}=''`) : s.push(`  ${e}=${r}`))
  }
  return s.join(`
`)
}
var E = C(
  '<div class="flex h-[calc(100vh-9rem)] flex-col"><div class="flex-1 overflow-y-auto"><!></div> <div class="border-t border-gray-500"></div> <div class="max-h-[70%]"><!> <div class="relative mt-3"><!> <pre class="overflow-x-auto"> </pre></div></div></div>',
)
function I(i, o) {
  let a = $(!1)
  var c = E(),
    f = p(c),
    l = p(f)
  ;(x(l, () => o.component), d(f))
  var s = h(f, 4),
    m = p(s)
  x(m, () => o.componentProps)
  var e = h(m, 2),
    t = p(e)
  {
    let g = S(() => ({ icon: b(a) ? '<div class="rounded-md bg-(--green-color) shadow-lg px-1">✓</div>' : B }))
    V(
      t,
      () => O,
      (u, v) => {
        v(u, {
          wrapperClass: "absolute top-3 right-5 w-6",
          get content() {
            return b(g)
          },
          onClick: () => {
            ;(y(a, !0), setTimeout(() => y(a, !1), 1e3), navigator.clipboard.writeText(o.codeText))
          },
        })
      },
    )
  }
  var r = h(t, 2),
    n = p(r)
  ;(d(r),
    d(e),
    d(s),
    d(c),
    _(() =>
      z(
        n,
        `${o.codeText ?? ""}
  `,
      ),
    ),
    k(
      3,
      s,
      () => T,
      () => ({ duration: 200 }),
    ),
    j(i, c))
}
export { I as C, H as f }
