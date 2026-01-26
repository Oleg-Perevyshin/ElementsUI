import { f as g, a as w } from "./Di61MV9l.js"
import { p as _, t as h, a as k, c as l, r as o } from "./CYmiEaEH.js"
import { s as z } from "./cfR1Foc9.js"
import { d as i, t as m, s as y, b as c } from "./CnAfG7ip.js"
import { p as a } from "./_y1boTp2.js"
var C = g("<div><p> </p></div>")
function M(x, e) {
  _(e, !0)
  let p = a(e, "id", 19, () => crypto.randomUUID()),
    n = a(e, "wrapperClass", 3, ""),
    d = a(e, "background", 3, !1),
    s = a(e, "content", 19, () => ({ name: "", class: "", size: "base" }))
  const f = { small: "text-sm", base: "text-base", large: "text-2xl", huge: "text-4xl", massive: "text-5xl" }
  var t = C(),
    r = l(t),
    u = l(r, !0)
  ;(o(r),
    o(t),
    h(
      (b, v) => {
        ;(y(t, "id", p()), c(t, 1, b), c(r, 1, v), z(u, s().name))
      },
      [
        () => i(m(`relative flex w-full flex-col items-center ${d() ? "rounded-2xl bg-(--back-color) px-6 py-2" : ""}`, n())),
        () => i(m(`w-full text-center ${f[s().size ?? "base"]}`, s().class)),
      ],
    ),
    w(x, t),
    k())
}
export { M as T }
