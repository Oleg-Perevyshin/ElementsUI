import { d as Xt, e as Hr, f as j, a as N, c as ke, b as Xe } from "./Di61MV9l.js"
import {
  C as dr,
  K as ur,
  aE as pr,
  E as ft,
  z as _e,
  v as st,
  B as Lt,
  g as n,
  ay as jr,
  aq as qr,
  M as Ur,
  Z as Jt,
  ab as Mt,
  A as Qe,
  L as vr,
  ag as Dr,
  N as Pt,
  ap as Gr,
  aF as bt,
  aG as wt,
  an as $e,
  X as Zt,
  ak as Fr,
  G as $t,
  ae as mr,
  aH as Qr,
  ao as fr,
  P as Wr,
  aI as Kr,
  aJ as It,
  J as Dt,
  Y as hr,
  aK as Yr,
  a9 as gr,
  aL as Xr,
  ad as Jr,
  aM as Zr,
  y as Gt,
  t as X,
  aN as $r,
  ah as eo,
  aa as to,
  a0 as br,
  aO as ro,
  aP as oo,
  aQ as ao,
  aR as no,
  aS as lo,
  aT as so,
  aU as io,
  ar as co,
  aV as uo,
  a5 as wr,
  aD as po,
  j as De,
  k as Ft,
  aW as xr,
  H as yr,
  am as vo,
  aX as mo,
  p as Oe,
  c as M,
  r as _,
  s as q,
  a as Te,
  f as ve,
  b as Ce,
  e as W,
  u as ne,
  n as dt,
  d as ht,
  h as ct,
  aY as fo,
} from "./CYmiEaEH.js"
import { a as ho, d as Le, s as ce, e as Ke } from "./cfR1Foc9.js"
import { B as go, p as H, i as J, c as ye, a as _r, d as Bt, b as kr } from "./_y1boTp2.js"
import { d as Cr, w as bo, o as Qt, g as wo } from "./DXQ0fkFu.js"
function ut(e, t) {
  return t
}
function xo(e, t, o) {
  for (var a = e.items, u = [], c = t.length, l = 0; l < c; l++) Xr(t[l].e, u, !0)
  var r = c > 0 && u.length === 0 && o !== null
  if (r) {
    var d = o.parentNode
    ;(Jr(d), d.append(o), a.clear(), Pe(e, t[0].prev, t[c - 1].next))
  }
  Zr(u, () => {
    for (var C = 0; C < c; C++) {
      var k = t[C]
      ;(r || (a.delete(k.k), Pe(e, k.prev, k.next)), hr(k.e, !r))
    }
  })
}
function Se(e, t, o, a, u, c = null) {
  var l = e,
    r = { flags: t, items: new Map(), first: null },
    d = (t & pr) !== 0
  if (d) {
    var C = e
    l = _e ? ft(st(C)) : C.appendChild(dr())
  }
  _e && Lt()
  var k = null,
    A = !1,
    R = new Map(),
    z = jr(() => {
      var L = o()
      return Qr(L) ? L : L == null ? [] : mr(L)
    }),
    g,
    w
  function O() {
    ;(yo(w, g, r, R, l, u, t, a, o),
      c !== null &&
        (g.length === 0
          ? k
            ? fr(k)
            : (k = Pt(() => c(l)))
          : k !== null &&
            Wr(k, () => {
              k = null
            })))
  }
  ;(ur(() => {
    ;((w ??= Gt), (g = n(z)))
    var L = g.length
    if (A && L === 0) return
    A = L === 0
    let U = !1
    if (_e) {
      var Z = qr(l) === Ur
      Z !== (L === 0) && ((l = Jt()), ft(l), Mt(!1), (U = !0))
    }
    if (_e) {
      for (var ee = null, T, v = 0; v < L; v++) {
        if (Qe.nodeType === vr && Qe.data === Dr) {
          ;((l = Qe), (U = !0), Mt(!1))
          break
        }
        var f = g[v],
          I = a(f, v)
        ;((T = Vt(Qe, r, ee, null, f, I, v, u, t, o)), r.items.set(I, T), (ee = T))
      }
      L > 0 && ft(Jt())
    }
    if (_e) L === 0 && c && (k = Pt(() => c(l)))
    else if (Gr()) {
      var $ = new Set(),
        Q = $e
      for (v = 0; v < L; v += 1) {
        ;((f = g[v]), (I = a(f, v)))
        var S = r.items.get(I) ?? R.get(I)
        ;(S ? (t & (bt | wt)) !== 0 && Mr(S, f, v, t) : ((T = Vt(null, r, null, null, f, I, v, u, t, o, !0)), R.set(I, T)), $.add(I))
      }
      for (const [P, oe] of r.items) $.has(P) || Q.skipped_effects.add(oe.e)
      Q.oncommit(O)
    } else O()
    ;(U && Mt(!0), n(z))
  }),
    _e && (l = Qe))
}
function yo(e, t, o, a, u, c, l, r, d) {
  var C = (l & Yr) !== 0,
    k = (l & (bt | wt)) !== 0,
    A = t.length,
    R = o.items,
    z = o.first,
    g = z,
    w,
    O = null,
    L,
    U = [],
    Z = [],
    ee,
    T,
    v,
    f
  if (C) for (f = 0; f < A; f += 1) ((ee = t[f]), (T = r(ee, f)), (v = R.get(T)), v !== void 0 && (v.a?.measure(), (L ??= new Set()).add(v)))
  for (f = 0; f < A; f += 1) {
    if (((ee = t[f]), (T = r(ee, f)), (v = R.get(T)), v === void 0)) {
      var I = a.get(T)
      if (I !== void 0) {
        ;(a.delete(T), R.set(T, I))
        var $ = O ? O.next : g
        ;(Pe(o, O, I), Pe(o, I, $), zt(I, $, u), (O = I))
      } else {
        var Q = g ? g.e.nodes_start : u
        O = Vt(Q, o, O, O === null ? o.first : O.next, ee, T, f, c, l, d)
      }
      ;(R.set(T, O), (U = []), (Z = []), (g = O.next))
      continue
    }
    if ((k && Mr(v, ee, f, l), (v.e.f & It) !== 0 && (fr(v.e), C && (v.a?.unfix(), (L ??= new Set()).delete(v))), v !== g)) {
      if (w !== void 0 && w.has(v)) {
        if (U.length < Z.length) {
          var S = Z[0],
            P
          O = S.prev
          var oe = U[0],
            se = U[U.length - 1]
          for (P = 0; P < U.length; P += 1) zt(U[P], S, u)
          for (P = 0; P < Z.length; P += 1) w.delete(Z[P])
          ;(Pe(o, oe.prev, se.next), Pe(o, O, oe), Pe(o, se, S), (g = S), (O = se), (f -= 1), (U = []), (Z = []))
        } else (w.delete(v), zt(v, g, u), Pe(o, v.prev, v.next), Pe(o, v, O === null ? o.first : O.next), Pe(o, O, v), (O = v))
        continue
      }
      for (U = [], Z = []; g !== null && g.k !== T; ) ((g.e.f & It) === 0 && (w ??= new Set()).add(g), Z.push(g), (g = g.next))
      if (g === null) continue
      v = g
    }
    ;(U.push(v), (O = v), (g = v.next))
  }
  if (g !== null || w !== void 0) {
    for (var ie = w === void 0 ? [] : mr(w); g !== null; ) ((g.e.f & It) === 0 && ie.push(g), (g = g.next))
    var ae = ie.length
    if (ae > 0) {
      var D = (l & pr) !== 0 && A === 0 ? u : null
      if (C) {
        for (f = 0; f < ae; f += 1) ie[f].a?.measure()
        for (f = 0; f < ae; f += 1) ie[f].a?.fix()
      }
      xo(o, ie, D)
    }
  }
  ;(C &&
    Dt(() => {
      if (L !== void 0) for (v of L) v.a?.apply()
    }),
    (e.first = o.first && o.first.e),
    (e.last = O && O.e))
  for (var i of a.values()) hr(i.e)
  a.clear()
}
function Mr(e, t, o, a) {
  ;((a & bt) !== 0 && Zt(e.v, t), (a & wt) !== 0 ? Zt(e.i, o) : (e.i = o))
}
function Vt(e, t, o, a, u, c, l, r, d, C, k) {
  var A = (d & bt) !== 0,
    R = (d & Kr) === 0,
    z = A ? (R ? Fr(u, !1, !1) : $t(u)) : u,
    g = (d & wt) === 0 ? l : $t(l),
    w = { i: g, v: z, k: c, a: null, e: null, prev: o, next: a }
  try {
    if (e === null) {
      var O = document.createDocumentFragment()
      O.append((e = dr()))
    }
    return (
      (w.e = Pt(() => r(e, z, g, C), _e)),
      (w.e.prev = o && o.e),
      (w.e.next = a && a.e),
      o === null ? k || (t.first = w) : ((o.next = w), (o.e.next = w.e)),
      a !== null && ((a.prev = w), (a.e.prev = w.e)),
      w
    )
  } finally {
  }
}
function zt(e, t, o) {
  for (var a = e.next ? e.next.e.nodes_start : o, u = t ? t.e.nodes_start : o, c = e.e.nodes_start; c !== null && c !== a; ) {
    var l = gr(c)
    ;(u.before(c), (c = l))
  }
}
function Pe(e, t, o) {
  ;(t === null ? (e.first = o) : ((t.next = o), (t.e.next = o && o.e)), o !== null && ((o.prev = t), (o.e.prev = t && t.e)))
}
function Ye(e, t, o = !1, a = !1, u = !1) {
  var c = e,
    l = ""
  X(() => {
    var r = Gt
    if (l === (l = t() ?? "")) {
      _e && Lt()
      return
    }
    if ((r.nodes_start !== null && ($r(r.nodes_start, r.nodes_end), (r.nodes_start = r.nodes_end = null)), l !== "")) {
      if (_e) {
        Qe.data
        for (var d = Lt(), C = d; d !== null && (d.nodeType !== vr || d.data !== ""); ) ((C = d), (d = gr(d)))
        if (d === null) throw (eo(), to)
        ;(Xt(Qe, C), (c = ft(d)))
        return
      }
      var k = l + ""
      o ? (k = `<svg>${k}</svg>`) : a && (k = `<math>${k}</math>`)
      var A = Hr(k)
      if (((o || a) && (A = st(A)), Xt(st(A), A.lastChild), o || a)) for (; st(A); ) c.before(st(A))
      else c.before(A)
    }
  })
}
function Rt(e, t, ...o) {
  var a = new go(e)
  ur(() => {
    const u = t() ?? null
    a.ensure(u, u && ((c) => u(c, ...o)))
  }, br)
}
function Ir(e) {
  var t,
    o,
    a = ""
  if (typeof e == "string" || typeof e == "number") a += e
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var u = e.length
      for (t = 0; t < u; t++) e[t] && (o = Ir(e[t])) && (a && (a += " "), (a += o))
    } else for (o in e) e[o] && (a && (a += " "), (a += o))
  return a
}
function _o() {
  for (var e, t, o = 0, a = "", u = arguments.length; o < u; o++) (e = arguments[o]) && (t = Ir(e)) && (a && (a += " "), (a += t))
  return a
}
function fe(e) {
  return typeof e == "object" ? _o(e) : (e ?? "")
}
function ko(e, t, o) {
  var a = e == null ? "" : "" + e
  return (t && (a = a ? a + " " + t : t), a === "" ? null : a)
}
function Co(e, t) {
  return e == null ? null : String(e)
}
function K(e, t, o, a, u, c) {
  var l = e.__className
  if (_e || l !== o || l === void 0) {
    var r = ko(o, a)
    ;((!_e || r !== e.getAttribute("class")) && (r == null ? e.removeAttribute("class") : (e.className = r)), (e.__className = o))
  }
  return c
}
function me(e, t, o, a) {
  var u = e.__style
  if (_e || u !== t) {
    var c = Co(t)
    ;((!_e || c !== e.getAttribute("style")) && (c == null ? e.removeAttribute("style") : (e.style.cssText = c)), (e.__style = t))
  }
  return a
}
const Mo = Symbol("is custom element"),
  Io = Symbol("is html")
function et(e) {
  if (_e) {
    var t = !1,
      o = () => {
        if (!t) {
          if (((t = !0), e.hasAttribute("value"))) {
            var a = e.value
            ;(te(e, "value", null), (e.value = a))
          }
          if (e.hasAttribute("checked")) {
            var u = e.checked
            ;(te(e, "checked", null), (e.checked = u))
          }
        }
      }
    ;((e.__on_r = o), Dt(o), lo())
  }
}
function Nt(e, t) {
  var o = zr(e)
  o.value === (o.value = t ?? void 0) || (e.value === t && (t !== 0 || e.nodeName !== "PROGRESS")) || (e.value = t ?? "")
}
function te(e, t, o, a) {
  var u = zr(e)
  ;(_e && ((u[t] = e.getAttribute(t)), t === "src" || t === "srcset" || (t === "href" && e.nodeName === "LINK"))) ||
    (u[t] !== (u[t] = o) &&
      (t === "loading" && (e[ro] = o), o == null ? e.removeAttribute(t) : typeof o != "string" && zo(e).includes(t) ? (e[t] = o) : e.setAttribute(t, o)))
}
function zr(e) {
  return (e.__attributes ??= { [Mo]: e.nodeName.includes("-"), [Io]: e.namespaceURI === oo })
}
var er = new Map()
function zo(e) {
  var t = e.getAttribute("is") || e.nodeName,
    o = er.get(t)
  if (o) return o
  er.set(t, (o = []))
  for (var a, u = e, c = Element.prototype; c !== u; ) {
    a = no(u)
    for (var l in a) a[l].set && o.push(l)
    u = ao(u)
  }
  return o
}
const No = () => performance.now(),
  He = { tick: (e) => requestAnimationFrame(e), now: () => No(), tasks: new Set() }
function Nr() {
  const e = He.now()
  ;(He.tasks.forEach((t) => {
    t.c(e) || (He.tasks.delete(t), t.f())
  }),
    He.tasks.size !== 0 && He.tick(Nr))
}
function Eo(e) {
  let t
  return (
    He.tasks.size === 0 && He.tick(Nr),
    {
      promise: new Promise((o) => {
        He.tasks.add((t = { c: e, f: o }))
      }),
      abort() {
        He.tasks.delete(t)
      },
    }
  )
}
function pt(e, t) {
  wr(() => {
    e.dispatchEvent(new CustomEvent(t))
  })
}
function So(e) {
  if (e === "float") return "cssFloat"
  if (e === "offset") return "cssOffset"
  if (e.startsWith("--")) return e
  const t = e.split("-")
  return t.length === 1
    ? t[0]
    : t[0] +
        t
          .slice(1)
          .map((o) => o[0].toUpperCase() + o.slice(1))
          .join("")
}
function tr(e) {
  const t = {},
    o = e.split(";")
  for (const a of o) {
    const [u, c] = a.split(":")
    if (!u || c === void 0) break
    const l = So(u.trim())
    t[l] = c.trim()
  }
  return t
}
const Ao = (e) => e
function Ee(e, t, o, a) {
  var u = (e & uo) !== 0,
    c = "both",
    l,
    r = t.inert,
    d = t.style.overflow,
    C,
    k
  function A() {
    return wr(() => (l ??= o()(t, a?.() ?? {}, { direction: c })))
  }
  var R = {
      is_global: u,
      in() {
        ;((t.inert = r),
          pt(t, "introstart"),
          (C = Ht(t, A(), k, 1, () => {
            ;(pt(t, "introend"), C?.abort(), (C = l = void 0), (t.style.overflow = d))
          })))
      },
      out(O) {
        ;((t.inert = !0),
          pt(t, "outrostart"),
          (k = Ht(t, A(), C, 0, () => {
            ;(pt(t, "outroend"), O?.())
          })))
      },
      stop: () => {
        ;(C?.abort(), k?.abort())
      },
    },
    z = Gt
  if (((z.transitions ??= []).push(R), ho)) {
    var g = u
    if (!g) {
      for (var w = z.parent; w && (w.f & br) !== 0; ) for (; (w = w.parent) && (w.f & so) === 0; );
      g = !w || (w.f & io) !== 0
    }
    g &&
      co(() => {
        Ft(() => R.in())
      })
  }
}
function Ht(e, t, o, a, u) {
  var c = a === 1
  if (po(t)) {
    var l,
      r = !1
    return (
      Dt(() => {
        if (!r) {
          var O = t({ direction: c ? "in" : "out" })
          l = Ht(e, O, o, a, u)
        }
      }),
      {
        abort: () => {
          ;((r = !0), l?.abort())
        },
        deactivate: () => l.deactivate(),
        reset: () => l.reset(),
        t: () => l.t(),
      }
    )
  }
  if ((o?.deactivate(), !t?.duration)) return (u(), { abort: De, deactivate: De, reset: De, t: () => a })
  const { delay: d = 0, css: C, tick: k, easing: A = Ao } = t
  var R = []
  if (c && o === void 0 && (k && k(0, 1), C)) {
    var z = tr(C(0, 1))
    R.push(z, z)
  }
  var g = () => 1 - a,
    w = e.animate(R, { duration: d, fill: "forwards" })
  return (
    (w.onfinish = () => {
      w.cancel()
      var O = o?.t() ?? 1 - a
      o?.abort()
      var L = a - O,
        U = t.duration * Math.abs(L),
        Z = []
      if (U > 0) {
        var ee = !1
        if (C)
          for (var T = Math.ceil(U / 16.666666666666668), v = 0; v <= T; v += 1) {
            var f = O + L * A(v / T),
              I = tr(C(f, 1 - f))
            ;(Z.push(I), (ee ||= I.overflow === "hidden"))
          }
        ;(ee && (e.style.overflow = "hidden"),
          (g = () => {
            var $ = w.currentTime
            return O + L * A($ / U)
          }),
          k &&
            Eo(() => {
              if (w.playState !== "running") return !1
              var $ = g()
              return (k($, 1 - $), !0)
            }))
      }
      ;((w = e.animate(Z, { duration: U, fill: "forwards" })),
        (w.onfinish = () => {
          ;((g = () => a), k?.(a, 1 - a), u())
        }))
    }),
    {
      abort: () => {
        w && (w.cancel(), (w.effect = null), (w.onfinish = De))
      },
      deactivate: () => {
        u = De
      },
      reset: () => {
        a === 0 && k?.(1, 0)
      },
      t: () => g(),
    }
  )
}
function tt(e, t, o = t) {
  var a = new WeakSet()
  ;(xr(e, "input", async (u) => {
    var c = u ? e.defaultValue : e.value
    if (((c = Et(e) ? St(c) : c), o(c), $e !== null && a.add($e), await vo(), c !== (c = t()))) {
      var l = e.selectionStart,
        r = e.selectionEnd,
        d = e.value.length
      if (((e.value = c ?? ""), r !== null)) {
        var C = e.value.length
        l === r && r === d && C > d ? ((e.selectionStart = C), (e.selectionEnd = C)) : ((e.selectionStart = l), (e.selectionEnd = Math.min(r, C)))
      }
    }
  }),
    ((_e && e.defaultValue !== e.value) || (Ft(t) == null && e.value)) && (o(Et(e) ? St(e.value) : e.value), $e !== null && a.add($e)),
    yr(() => {
      var u = t()
      if (e === document.activeElement) {
        var c = mo ?? $e
        if (a.has(c)) return
      }
      ;(Et(e) && u === St(e.value)) || (e.type === "date" && !u && !e.value) || (u !== e.value && (e.value = u ?? ""))
    }))
}
function Oo(e, t, o = t) {
  ;(xr(e, "change", (a) => {
    var u = a ? e.defaultChecked : e.checked
    o(u)
  }),
    ((_e && e.defaultChecked !== e.checked) || Ft(t) == null) && o(e.checked),
    yr(() => {
      var a = t()
      e.checked = !!a
    }))
}
function Et(e) {
  var t = e.type
  return t === "number" || t === "range"
}
function St(e) {
  return e === "" ? null : +e
}
const To = (e) => e
function Wt(e) {
  const t = e - 1
  return t * t * t + 1
}
function rr(e) {
  const t = typeof e == "string" && e.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/)
  return t ? [parseFloat(t[1]), t[2] || "px"] : [e, "px"]
}
function Lo(e, { delay: t = 0, duration: o = 400, easing: a = To } = {}) {
  const u = +getComputedStyle(e).opacity
  return { delay: t, duration: o, easing: a, css: (c) => `opacity: ${c * u}` }
}
function We(e, { delay: t = 0, duration: o = 400, easing: a = Wt, x: u = 0, y: c = 0, opacity: l = 0 } = {}) {
  const r = getComputedStyle(e),
    d = +r.opacity,
    C = r.transform === "none" ? "" : r.transform,
    k = d * (1 - l),
    [A, R] = rr(u),
    [z, g] = rr(c)
  return {
    delay: t,
    duration: o,
    easing: a,
    css: (w, O) => `
			transform: ${C} translate(${(1 - w) * A}${R}, ${(1 - w) * z}${g});
			opacity: ${d - k * O}`,
  }
}
function gt(e, { delay: t = 0, duration: o = 400, easing: a = Wt, axis: u = "y" } = {}) {
  const c = getComputedStyle(e),
    l = +c.opacity,
    r = u === "y" ? "height" : "width",
    d = parseFloat(c[r]),
    C = u === "y" ? ["top", "bottom"] : ["left", "right"],
    k = C.map((L) => `${L[0].toUpperCase()}${L.slice(1)}`),
    A = parseFloat(c[`padding${k[0]}`]),
    R = parseFloat(c[`padding${k[1]}`]),
    z = parseFloat(c[`margin${k[0]}`]),
    g = parseFloat(c[`margin${k[1]}`]),
    w = parseFloat(c[`border${k[0]}Width`]),
    O = parseFloat(c[`border${k[1]}Width`])
  return {
    delay: t,
    duration: o,
    easing: a,
    css: (L) =>
      `overflow: hidden;opacity: ${Math.min(L * 20, 1) * l};${r}: ${L * d}px;padding-${C[0]}: ${L * A}px;padding-${C[1]}: ${L * R}px;margin-${C[0]}: ${L * z}px;margin-${C[1]}: ${L * g}px;border-${C[0]}-width: ${L * w}px;border-${C[1]}-width: ${L * O}px;min-${r}: 0`,
  }
}
function Po(e, { delay: t = 0, duration: o = 400, easing: a = Wt, start: u = 0, opacity: c = 0 } = {}) {
  const l = getComputedStyle(e),
    r = +l.opacity,
    d = l.transform === "none" ? "" : l.transform,
    C = 1 - u,
    k = r * (1 - c)
  return {
    delay: t,
    duration: o,
    easing: a,
    css: (A, R) => `
			transform: ${d} scale(${1 - C * R});
			opacity: ${r - k * R}
		`,
  }
}
const Kt = "-",
  Bo = (e) => {
    const t = Ro(e),
      { conflictingClassGroups: o, conflictingClassGroupModifiers: a } = e
    return {
      getClassGroupId: (l) => {
        const r = l.split(Kt)
        return (r[0] === "" && r.length !== 1 && r.shift(), Er(r, t) || Vo(l))
      },
      getConflictingClassGroupIds: (l, r) => {
        const d = o[l] || []
        return r && a[l] ? [...d, ...a[l]] : d
      },
    }
  },
  Er = (e, t) => {
    if (e.length === 0) return t.classGroupId
    const o = e[0],
      a = t.nextPart.get(o),
      u = a ? Er(e.slice(1), a) : void 0
    if (u) return u
    if (t.validators.length === 0) return
    const c = e.join(Kt)
    return t.validators.find(({ validator: l }) => l(c))?.classGroupId
  },
  or = /^\[(.+)\]$/,
  Vo = (e) => {
    if (or.test(e)) {
      const t = or.exec(e)[1],
        o = t?.substring(0, t.indexOf(":"))
      if (o) return "arbitrary.." + o
    }
  },
  Ro = (e) => {
    const { theme: t, classGroups: o } = e,
      a = { nextPart: new Map(), validators: [] }
    for (const u in o) jt(o[u], a, u, t)
    return a
  },
  jt = (e, t, o, a) => {
    e.forEach((u) => {
      if (typeof u == "string") {
        const c = u === "" ? t : ar(t, u)
        c.classGroupId = o
        return
      }
      if (typeof u == "function") {
        if (Ho(u)) {
          jt(u(a), t, o, a)
          return
        }
        t.validators.push({ validator: u, classGroupId: o })
        return
      }
      Object.entries(u).forEach(([c, l]) => {
        jt(l, ar(t, c), o, a)
      })
    })
  },
  ar = (e, t) => {
    let o = e
    return (
      t.split(Kt).forEach((a) => {
        ;(o.nextPart.has(a) || o.nextPart.set(a, { nextPart: new Map(), validators: [] }), (o = o.nextPart.get(a)))
      }),
      o
    )
  },
  Ho = (e) => e.isThemeGetter,
  jo = (e) => {
    if (e < 1) return { get: () => {}, set: () => {} }
    let t = 0,
      o = new Map(),
      a = new Map()
    const u = (c, l) => {
      ;(o.set(c, l), t++, t > e && ((t = 0), (a = o), (o = new Map())))
    }
    return {
      get(c) {
        let l = o.get(c)
        if (l !== void 0) return l
        if ((l = a.get(c)) !== void 0) return (u(c, l), l)
      },
      set(c, l) {
        o.has(c) ? o.set(c, l) : u(c, l)
      },
    }
  },
  qt = "!",
  Ut = ":",
  qo = Ut.length,
  Uo = (e) => {
    const { prefix: t, experimentalParseClassName: o } = e
    let a = (u) => {
      const c = []
      let l = 0,
        r = 0,
        d = 0,
        C
      for (let g = 0; g < u.length; g++) {
        let w = u[g]
        if (l === 0 && r === 0) {
          if (w === Ut) {
            ;(c.push(u.slice(d, g)), (d = g + qo))
            continue
          }
          if (w === "/") {
            C = g
            continue
          }
        }
        w === "[" ? l++ : w === "]" ? l-- : w === "(" ? r++ : w === ")" && r--
      }
      const k = c.length === 0 ? u : u.substring(d),
        A = Do(k),
        R = A !== k,
        z = C && C > d ? C - d : void 0
      return { modifiers: c, hasImportantModifier: R, baseClassName: A, maybePostfixModifierPosition: z }
    }
    if (t) {
      const u = t + Ut,
        c = a
      a = (l) =>
        l.startsWith(u)
          ? c(l.substring(u.length))
          : { isExternal: !0, modifiers: [], hasImportantModifier: !1, baseClassName: l, maybePostfixModifierPosition: void 0 }
    }
    if (o) {
      const u = a
      a = (c) => o({ className: c, parseClassName: u })
    }
    return a
  },
  Do = (e) => (e.endsWith(qt) ? e.substring(0, e.length - 1) : e.startsWith(qt) ? e.substring(1) : e),
  Go = (e) => {
    const t = Object.fromEntries(e.orderSensitiveModifiers.map((a) => [a, !0]))
    return (a) => {
      if (a.length <= 1) return a
      const u = []
      let c = []
      return (
        a.forEach((l) => {
          l[0] === "[" || t[l] ? (u.push(...c.sort(), l), (c = [])) : c.push(l)
        }),
        u.push(...c.sort()),
        u
      )
    }
  },
  Fo = (e) => ({ cache: jo(e.cacheSize), parseClassName: Uo(e), sortModifiers: Go(e), ...Bo(e) }),
  Qo = /\s+/,
  Wo = (e, t) => {
    const { parseClassName: o, getClassGroupId: a, getConflictingClassGroupIds: u, sortModifiers: c } = t,
      l = [],
      r = e.trim().split(Qo)
    let d = ""
    for (let C = r.length - 1; C >= 0; C -= 1) {
      const k = r[C],
        { isExternal: A, modifiers: R, hasImportantModifier: z, baseClassName: g, maybePostfixModifierPosition: w } = o(k)
      if (A) {
        d = k + (d.length > 0 ? " " + d : d)
        continue
      }
      let O = !!w,
        L = a(O ? g.substring(0, w) : g)
      if (!L) {
        if (!O) {
          d = k + (d.length > 0 ? " " + d : d)
          continue
        }
        if (((L = a(g)), !L)) {
          d = k + (d.length > 0 ? " " + d : d)
          continue
        }
        O = !1
      }
      const U = c(R).join(":"),
        Z = z ? U + qt : U,
        ee = Z + L
      if (l.includes(ee)) continue
      l.push(ee)
      const T = u(L, O)
      for (let v = 0; v < T.length; ++v) {
        const f = T[v]
        l.push(Z + f)
      }
      d = k + (d.length > 0 ? " " + d : d)
    }
    return d
  }
function Ko() {
  let e = 0,
    t,
    o,
    a = ""
  for (; e < arguments.length; ) (t = arguments[e++]) && (o = Sr(t)) && (a && (a += " "), (a += o))
  return a
}
const Sr = (e) => {
  if (typeof e == "string") return e
  let t,
    o = ""
  for (let a = 0; a < e.length; a++) e[a] && (t = Sr(e[a])) && (o && (o += " "), (o += t))
  return o
}
function Yo(e, ...t) {
  let o,
    a,
    u,
    c = l
  function l(d) {
    const C = t.reduce((k, A) => A(k), e())
    return ((o = Fo(C)), (a = o.cache.get), (u = o.cache.set), (c = r), r(d))
  }
  function r(d) {
    const C = a(d)
    if (C) return C
    const k = Wo(d, o)
    return (u(d, k), k)
  }
  return function () {
    return c(Ko.apply(null, arguments))
  }
}
const we = (e) => {
    const t = (o) => o[e] || []
    return ((t.isThemeGetter = !0), t)
  },
  Ar = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  Or = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  Xo = /^\d+\/\d+$/,
  Jo = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Zo = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  $o = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  ea = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  ta = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  Je = (e) => Xo.test(e),
  le = (e) => !!e && !Number.isNaN(Number(e)),
  Ue = (e) => !!e && Number.isInteger(Number(e)),
  At = (e) => e.endsWith("%") && le(e.slice(0, -1)),
  Re = (e) => Jo.test(e),
  ra = () => !0,
  oa = (e) => Zo.test(e) && !$o.test(e),
  Tr = () => !1,
  aa = (e) => ea.test(e),
  na = (e) => ta.test(e),
  la = (e) => !G(e) && !F(e),
  sa = (e) => rt(e, Br, Tr),
  G = (e) => Ar.test(e),
  Ge = (e) => rt(e, Vr, oa),
  Ot = (e) => rt(e, pa, le),
  nr = (e) => rt(e, Lr, Tr),
  ia = (e) => rt(e, Pr, na),
  vt = (e) => rt(e, Rr, aa),
  F = (e) => Or.test(e),
  lt = (e) => ot(e, Vr),
  ca = (e) => ot(e, va),
  lr = (e) => ot(e, Lr),
  da = (e) => ot(e, Br),
  ua = (e) => ot(e, Pr),
  mt = (e) => ot(e, Rr, !0),
  rt = (e, t, o) => {
    const a = Ar.exec(e)
    return a ? (a[1] ? t(a[1]) : o(a[2])) : !1
  },
  ot = (e, t, o = !1) => {
    const a = Or.exec(e)
    return a ? (a[1] ? t(a[1]) : o) : !1
  },
  Lr = (e) => e === "position" || e === "percentage",
  Pr = (e) => e === "image" || e === "url",
  Br = (e) => e === "length" || e === "size" || e === "bg-size",
  Vr = (e) => e === "length",
  pa = (e) => e === "number",
  va = (e) => e === "family-name",
  Rr = (e) => e === "shadow",
  ma = () => {
    const e = we("color"),
      t = we("font"),
      o = we("text"),
      a = we("font-weight"),
      u = we("tracking"),
      c = we("leading"),
      l = we("breakpoint"),
      r = we("container"),
      d = we("spacing"),
      C = we("radius"),
      k = we("shadow"),
      A = we("inset-shadow"),
      R = we("text-shadow"),
      z = we("drop-shadow"),
      g = we("blur"),
      w = we("perspective"),
      O = we("aspect"),
      L = we("ease"),
      U = we("animate"),
      Z = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"],
      ee = () => [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "left-top",
        "top-right",
        "right-top",
        "bottom-right",
        "right-bottom",
        "bottom-left",
        "left-bottom",
      ],
      T = () => [...ee(), F, G],
      v = () => ["auto", "hidden", "clip", "visible", "scroll"],
      f = () => ["auto", "contain", "none"],
      I = () => [F, G, d],
      $ = () => [Je, "full", "auto", ...I()],
      Q = () => [Ue, "none", "subgrid", F, G],
      S = () => ["auto", { span: ["full", Ue, F, G] }, Ue, F, G],
      P = () => [Ue, "auto", F, G],
      oe = () => ["auto", "min", "max", "fr", F, G],
      se = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"],
      ie = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"],
      ae = () => ["auto", ...I()],
      D = () => [Je, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...I()],
      i = () => [e, F, G],
      h = () => [...ee(), lr, nr, { position: [F, G] }],
      B = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }],
      p = () => ["auto", "cover", "contain", da, sa, { size: [F, G] }],
      b = () => [At, lt, Ge],
      x = () => ["", "none", "full", C, F, G],
      s = () => ["", le, lt, Ge],
      E = () => ["solid", "dashed", "dotted", "double"],
      V = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      y = () => [le, At, lr, nr],
      Y = () => ["", "none", g, F, G],
      re = () => ["none", le, F, G],
      pe = () => ["none", le, F, G],
      ue = () => [le, F, G],
      ge = () => [Je, "full", ...I()]
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [Re],
        breakpoint: [Re],
        color: [ra],
        container: [Re],
        "drop-shadow": [Re],
        ease: ["in", "out", "in-out"],
        font: [la],
        "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
        "inset-shadow": [Re],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
        radius: [Re],
        shadow: [Re],
        spacing: ["px", le],
        text: [Re],
        "text-shadow": [Re],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", Je, G, F, O] }],
        container: ["container"],
        columns: [{ columns: [le, G, F, r] }],
        "break-after": [{ "break-after": Z() }],
        "break-before": [{ "break-before": Z() }],
        "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        sr: ["sr-only", "not-sr-only"],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }],
        "object-position": [{ object: T() }],
        overflow: [{ overflow: v() }],
        "overflow-x": [{ "overflow-x": v() }],
        "overflow-y": [{ "overflow-y": v() }],
        overscroll: [{ overscroll: f() }],
        "overscroll-x": [{ "overscroll-x": f() }],
        "overscroll-y": [{ "overscroll-y": f() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: $() }],
        "inset-x": [{ "inset-x": $() }],
        "inset-y": [{ "inset-y": $() }],
        start: [{ start: $() }],
        end: [{ end: $() }],
        top: [{ top: $() }],
        right: [{ right: $() }],
        bottom: [{ bottom: $() }],
        left: [{ left: $() }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: [Ue, "auto", F, G] }],
        basis: [{ basis: [Je, "full", "auto", r, ...I()] }],
        "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }],
        "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
        flex: [{ flex: [le, Je, "auto", "initial", "none", G] }],
        grow: [{ grow: ["", le, F, G] }],
        shrink: [{ shrink: ["", le, F, G] }],
        order: [{ order: [Ue, "first", "last", "none", F, G] }],
        "grid-cols": [{ "grid-cols": Q() }],
        "col-start-end": [{ col: S() }],
        "col-start": [{ "col-start": P() }],
        "col-end": [{ "col-end": P() }],
        "grid-rows": [{ "grid-rows": Q() }],
        "row-start-end": [{ row: S() }],
        "row-start": [{ "row-start": P() }],
        "row-end": [{ "row-end": P() }],
        "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }],
        "auto-cols": [{ "auto-cols": oe() }],
        "auto-rows": [{ "auto-rows": oe() }],
        gap: [{ gap: I() }],
        "gap-x": [{ "gap-x": I() }],
        "gap-y": [{ "gap-y": I() }],
        "justify-content": [{ justify: [...se(), "normal"] }],
        "justify-items": [{ "justify-items": [...ie(), "normal"] }],
        "justify-self": [{ "justify-self": ["auto", ...ie()] }],
        "align-content": [{ content: ["normal", ...se()] }],
        "align-items": [{ items: [...ie(), { baseline: ["", "last"] }] }],
        "align-self": [{ self: ["auto", ...ie(), { baseline: ["", "last"] }] }],
        "place-content": [{ "place-content": se() }],
        "place-items": [{ "place-items": [...ie(), "baseline"] }],
        "place-self": [{ "place-self": ["auto", ...ie()] }],
        p: [{ p: I() }],
        px: [{ px: I() }],
        py: [{ py: I() }],
        ps: [{ ps: I() }],
        pe: [{ pe: I() }],
        pt: [{ pt: I() }],
        pr: [{ pr: I() }],
        pb: [{ pb: I() }],
        pl: [{ pl: I() }],
        m: [{ m: ae() }],
        mx: [{ mx: ae() }],
        my: [{ my: ae() }],
        ms: [{ ms: ae() }],
        me: [{ me: ae() }],
        mt: [{ mt: ae() }],
        mr: [{ mr: ae() }],
        mb: [{ mb: ae() }],
        ml: [{ ml: ae() }],
        "space-x": [{ "space-x": I() }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": I() }],
        "space-y-reverse": ["space-y-reverse"],
        size: [{ size: D() }],
        w: [{ w: [r, "screen", ...D()] }],
        "min-w": [{ "min-w": [r, "screen", "none", ...D()] }],
        "max-w": [{ "max-w": [r, "screen", "none", "prose", { screen: [l] }, ...D()] }],
        h: [{ h: ["screen", "lh", ...D()] }],
        "min-h": [{ "min-h": ["screen", "lh", "none", ...D()] }],
        "max-h": [{ "max-h": ["screen", "lh", ...D()] }],
        "font-size": [{ text: ["base", o, lt, Ge] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [{ font: [a, F, Ot] }],
        "font-stretch": [
          {
            "font-stretch": [
              "ultra-condensed",
              "extra-condensed",
              "condensed",
              "semi-condensed",
              "normal",
              "semi-expanded",
              "expanded",
              "extra-expanded",
              "ultra-expanded",
              At,
              G,
            ],
          },
        ],
        "font-family": [{ font: [ca, G, t] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: [u, F, G] }],
        "line-clamp": [{ "line-clamp": [le, "none", F, Ot] }],
        leading: [{ leading: [c, ...I()] }],
        "list-image": [{ "list-image": ["none", F, G] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "list-style-type": [{ list: ["disc", "decimal", "none", F, G] }],
        "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }],
        "placeholder-color": [{ placeholder: i() }],
        "text-color": [{ text: i() }],
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        "text-decoration-style": [{ decoration: [...E(), "wavy"] }],
        "text-decoration-thickness": [{ decoration: [le, "from-font", "auto", F, Ge] }],
        "text-decoration-color": [{ decoration: i() }],
        "underline-offset": [{ "underline-offset": [le, "auto", F, G] }],
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: I() }],
        "vertical-align": [{ align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", F, G] }],
        whitespace: [{ whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] }],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        wrap: [{ wrap: ["break-word", "anywhere", "normal"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", F, G] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: h() }],
        "bg-repeat": [{ bg: B() }],
        "bg-size": [{ bg: p() }],
        "bg-image": [
          { bg: ["none", { linear: [{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, Ue, F, G], radial: ["", F, G], conic: [Ue, F, G] }, ua, ia] },
        ],
        "bg-color": [{ bg: i() }],
        "gradient-from-pos": [{ from: b() }],
        "gradient-via-pos": [{ via: b() }],
        "gradient-to-pos": [{ to: b() }],
        "gradient-from": [{ from: i() }],
        "gradient-via": [{ via: i() }],
        "gradient-to": [{ to: i() }],
        rounded: [{ rounded: x() }],
        "rounded-s": [{ "rounded-s": x() }],
        "rounded-e": [{ "rounded-e": x() }],
        "rounded-t": [{ "rounded-t": x() }],
        "rounded-r": [{ "rounded-r": x() }],
        "rounded-b": [{ "rounded-b": x() }],
        "rounded-l": [{ "rounded-l": x() }],
        "rounded-ss": [{ "rounded-ss": x() }],
        "rounded-se": [{ "rounded-se": x() }],
        "rounded-ee": [{ "rounded-ee": x() }],
        "rounded-es": [{ "rounded-es": x() }],
        "rounded-tl": [{ "rounded-tl": x() }],
        "rounded-tr": [{ "rounded-tr": x() }],
        "rounded-br": [{ "rounded-br": x() }],
        "rounded-bl": [{ "rounded-bl": x() }],
        "border-w": [{ border: s() }],
        "border-w-x": [{ "border-x": s() }],
        "border-w-y": [{ "border-y": s() }],
        "border-w-s": [{ "border-s": s() }],
        "border-w-e": [{ "border-e": s() }],
        "border-w-t": [{ "border-t": s() }],
        "border-w-r": [{ "border-r": s() }],
        "border-w-b": [{ "border-b": s() }],
        "border-w-l": [{ "border-l": s() }],
        "divide-x": [{ "divide-x": s() }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": s() }],
        "divide-y-reverse": ["divide-y-reverse"],
        "border-style": [{ border: [...E(), "hidden", "none"] }],
        "divide-style": [{ divide: [...E(), "hidden", "none"] }],
        "border-color": [{ border: i() }],
        "border-color-x": [{ "border-x": i() }],
        "border-color-y": [{ "border-y": i() }],
        "border-color-s": [{ "border-s": i() }],
        "border-color-e": [{ "border-e": i() }],
        "border-color-t": [{ "border-t": i() }],
        "border-color-r": [{ "border-r": i() }],
        "border-color-b": [{ "border-b": i() }],
        "border-color-l": [{ "border-l": i() }],
        "divide-color": [{ divide: i() }],
        "outline-style": [{ outline: [...E(), "none", "hidden"] }],
        "outline-offset": [{ "outline-offset": [le, F, G] }],
        "outline-w": [{ outline: ["", le, lt, Ge] }],
        "outline-color": [{ outline: i() }],
        shadow: [{ shadow: ["", "none", k, mt, vt] }],
        "shadow-color": [{ shadow: i() }],
        "inset-shadow": [{ "inset-shadow": ["none", A, mt, vt] }],
        "inset-shadow-color": [{ "inset-shadow": i() }],
        "ring-w": [{ ring: s() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: i() }],
        "ring-offset-w": [{ "ring-offset": [le, Ge] }],
        "ring-offset-color": [{ "ring-offset": i() }],
        "inset-ring-w": [{ "inset-ring": s() }],
        "inset-ring-color": [{ "inset-ring": i() }],
        "text-shadow": [{ "text-shadow": ["none", R, mt, vt] }],
        "text-shadow-color": [{ "text-shadow": i() }],
        opacity: [{ opacity: [le, F, G] }],
        "mix-blend": [{ "mix-blend": [...V(), "plus-darker", "plus-lighter"] }],
        "bg-blend": [{ "bg-blend": V() }],
        "mask-clip": [{ "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"] }, "mask-no-clip"],
        "mask-composite": [{ mask: ["add", "subtract", "intersect", "exclude"] }],
        "mask-image-linear-pos": [{ "mask-linear": [le] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": y() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": y() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": i() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": i() }],
        "mask-image-t-from-pos": [{ "mask-t-from": y() }],
        "mask-image-t-to-pos": [{ "mask-t-to": y() }],
        "mask-image-t-from-color": [{ "mask-t-from": i() }],
        "mask-image-t-to-color": [{ "mask-t-to": i() }],
        "mask-image-r-from-pos": [{ "mask-r-from": y() }],
        "mask-image-r-to-pos": [{ "mask-r-to": y() }],
        "mask-image-r-from-color": [{ "mask-r-from": i() }],
        "mask-image-r-to-color": [{ "mask-r-to": i() }],
        "mask-image-b-from-pos": [{ "mask-b-from": y() }],
        "mask-image-b-to-pos": [{ "mask-b-to": y() }],
        "mask-image-b-from-color": [{ "mask-b-from": i() }],
        "mask-image-b-to-color": [{ "mask-b-to": i() }],
        "mask-image-l-from-pos": [{ "mask-l-from": y() }],
        "mask-image-l-to-pos": [{ "mask-l-to": y() }],
        "mask-image-l-from-color": [{ "mask-l-from": i() }],
        "mask-image-l-to-color": [{ "mask-l-to": i() }],
        "mask-image-x-from-pos": [{ "mask-x-from": y() }],
        "mask-image-x-to-pos": [{ "mask-x-to": y() }],
        "mask-image-x-from-color": [{ "mask-x-from": i() }],
        "mask-image-x-to-color": [{ "mask-x-to": i() }],
        "mask-image-y-from-pos": [{ "mask-y-from": y() }],
        "mask-image-y-to-pos": [{ "mask-y-to": y() }],
        "mask-image-y-from-color": [{ "mask-y-from": i() }],
        "mask-image-y-to-color": [{ "mask-y-to": i() }],
        "mask-image-radial": [{ "mask-radial": [F, G] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": y() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": y() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": i() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": i() }],
        "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
        "mask-image-radial-size": [{ "mask-radial": [{ closest: ["side", "corner"], farthest: ["side", "corner"] }] }],
        "mask-image-radial-pos": [{ "mask-radial-at": ee() }],
        "mask-image-conic-pos": [{ "mask-conic": [le] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": y() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": y() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": i() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": i() }],
        "mask-mode": [{ mask: ["alpha", "luminance", "match"] }],
        "mask-origin": [{ "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"] }],
        "mask-position": [{ mask: h() }],
        "mask-repeat": [{ mask: B() }],
        "mask-size": [{ mask: p() }],
        "mask-type": [{ "mask-type": ["alpha", "luminance"] }],
        "mask-image": [{ mask: ["none", F, G] }],
        filter: [{ filter: ["", "none", F, G] }],
        blur: [{ blur: Y() }],
        brightness: [{ brightness: [le, F, G] }],
        contrast: [{ contrast: [le, F, G] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", z, mt, vt] }],
        "drop-shadow-color": [{ "drop-shadow": i() }],
        grayscale: [{ grayscale: ["", le, F, G] }],
        "hue-rotate": [{ "hue-rotate": [le, F, G] }],
        invert: [{ invert: ["", le, F, G] }],
        saturate: [{ saturate: [le, F, G] }],
        sepia: [{ sepia: ["", le, F, G] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none", F, G] }],
        "backdrop-blur": [{ "backdrop-blur": Y() }],
        "backdrop-brightness": [{ "backdrop-brightness": [le, F, G] }],
        "backdrop-contrast": [{ "backdrop-contrast": [le, F, G] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": ["", le, F, G] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [le, F, G] }],
        "backdrop-invert": [{ "backdrop-invert": ["", le, F, G] }],
        "backdrop-opacity": [{ "backdrop-opacity": [le, F, G] }],
        "backdrop-saturate": [{ "backdrop-saturate": [le, F, G] }],
        "backdrop-sepia": [{ "backdrop-sepia": ["", le, F, G] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": I() }],
        "border-spacing-x": [{ "border-spacing-x": I() }],
        "border-spacing-y": [{ "border-spacing-y": I() }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [{ transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", F, G] }],
        "transition-behavior": [{ transition: ["normal", "discrete"] }],
        duration: [{ duration: [le, "initial", F, G] }],
        ease: [{ ease: ["linear", "initial", L, F, G] }],
        delay: [{ delay: [le, F, G] }],
        animate: [{ animate: ["none", U, F, G] }],
        backface: [{ backface: ["hidden", "visible"] }],
        perspective: [{ perspective: [w, F, G] }],
        "perspective-origin": [{ "perspective-origin": T() }],
        rotate: [{ rotate: re() }],
        "rotate-x": [{ "rotate-x": re() }],
        "rotate-y": [{ "rotate-y": re() }],
        "rotate-z": [{ "rotate-z": re() }],
        scale: [{ scale: pe() }],
        "scale-x": [{ "scale-x": pe() }],
        "scale-y": [{ "scale-y": pe() }],
        "scale-z": [{ "scale-z": pe() }],
        "scale-3d": ["scale-3d"],
        skew: [{ skew: ue() }],
        "skew-x": [{ "skew-x": ue() }],
        "skew-y": [{ "skew-y": ue() }],
        transform: [{ transform: [F, G, "", "none", "gpu", "cpu"] }],
        "transform-origin": [{ origin: T() }],
        "transform-style": [{ transform: ["3d", "flat"] }],
        translate: [{ translate: ge() }],
        "translate-x": [{ "translate-x": ge() }],
        "translate-y": [{ "translate-y": ge() }],
        "translate-z": [{ "translate-z": ge() }],
        "translate-none": ["translate-none"],
        accent: [{ accent: i() }],
        appearance: [{ appearance: ["none", "auto"] }],
        "caret-color": [{ caret: i() }],
        "color-scheme": [{ scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"] }],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              F,
              G,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": ["fixed", "content"] }],
        "pointer-events": [{ "pointer-events": ["auto", "none"] }],
        resize: [{ resize: ["none", "", "y", "x"] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": I() }],
        "scroll-mx": [{ "scroll-mx": I() }],
        "scroll-my": [{ "scroll-my": I() }],
        "scroll-ms": [{ "scroll-ms": I() }],
        "scroll-me": [{ "scroll-me": I() }],
        "scroll-mt": [{ "scroll-mt": I() }],
        "scroll-mr": [{ "scroll-mr": I() }],
        "scroll-mb": [{ "scroll-mb": I() }],
        "scroll-ml": [{ "scroll-ml": I() }],
        "scroll-p": [{ "scroll-p": I() }],
        "scroll-px": [{ "scroll-px": I() }],
        "scroll-py": [{ "scroll-py": I() }],
        "scroll-ps": [{ "scroll-ps": I() }],
        "scroll-pe": [{ "scroll-pe": I() }],
        "scroll-pt": [{ "scroll-pt": I() }],
        "scroll-pr": [{ "scroll-pr": I() }],
        "scroll-pb": [{ "scroll-pb": I() }],
        "scroll-pl": [{ "scroll-pl": I() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", F, G] }],
        fill: [{ fill: ["none", ...i()] }],
        "stroke-w": [{ stroke: [le, lt, Ge, Ot] }],
        stroke: [{ stroke: ["none", ...i()] }],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-x",
          "border-color-y",
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
        "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
      orderSensitiveModifiers: [
        "*",
        "**",
        "after",
        "backdrop",
        "before",
        "details-content",
        "file",
        "first-letter",
        "first-line",
        "marker",
        "placeholder",
        "selection",
      ],
    }
  },
  de = Yo(ma)
var fa = j("<div><!></div>"),
  ha = j(
    '<div><button><div class="flex w-full items-center"><span><!></span> <span> </span></div> <div class="w-10 pl-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-[1.1rem] w-[1.1rem] transition-transform duration-250" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12.5s-4.419 6-6 6s-6-6-6-6m12-7s-4.419 6-6 6s-6-6-6-6" color="currentColor"></path></svg></div></button> <!></div>',
  )
function al(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "isOpen", 7, !1),
    u = H(t, "outline", 3, !1),
    c = H(t, "wrapperClass", 3, ""),
    l = H(t, "size", 19, () => ({ width: 1, height: 1 })),
    r = H(t, "label", 19, () => ({ name: "", class: "text-left", icon: null })),
    d = H(t, "image", 3, "")
  const C = () => a(!a())
  var k = ha(),
    A = M(k)
  A.__click = C
  var R = M(A),
    z = M(R)
  K(z, 1, "flex h-7 w-7 shrink-0 items-center justify-center overflow-visible [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full")
  var g = M(z)
  {
    var w = (v) => {
      var f = ke(),
        I = ve(f)
      ;(Ye(I, () => r().icon), N(v, f))
    }
    J(g, (v) => {
      r()?.icon && v(w)
    })
  }
  _(z)
  var O = q(z, 2),
    L = M(O, !0)
  ;(_(O), _(R))
  var U = q(R, 2),
    Z = M(U)
  ;(_(U), _(A))
  var ee = q(A, 2)
  {
    var T = (v) => {
      var f = fa(),
        I = M(f)
      ;(Rt(I, () => t.children ?? De),
        _(f),
        X(() => {
          ;(K(f, 1, `grid w-full p-4 sm:p-3 ${d() ? "gap-x-2" : "gap-2"} ${u() ? "" : "border-t border-(--border-color)"}`),
            me(
              f,
              `grid-template-columns: repeat(${l().width || 10}, minmax(0, 1fr)); 
          grid-template-rows: repeat(${l().height || 2}, ${d() ? "minmax(6.5rem, auto)" : "auto"});
          ${d() ? `background-image: url(${d()}); background-size: cover; background-position: center;` : ""}`,
            ))
        }),
        Ee(
          3,
          f,
          () => gt,
          () => ({ duration: 250 }),
        ),
        N(v, f))
    }
    J(ee, (v) => {
      a() && v(T)
    })
  }
  ;(_(k),
    X(
      (v, f) => {
        ;(te(k, "id", o()),
          K(k, 1, v),
          K(
            A,
            1,
            `flex w-full cursor-pointer items-center justify-between p-4 transition-shadow duration-250
    ${u() ? "border-b border-(--border-color)" : ""}`,
          ),
          K(O, 1, `${f ?? ""} text-lg`),
          ce(L, r()?.name),
          me(Z, `transform: rotate(${a() ? 180 : 0}deg)`))
      },
      [
        () =>
          fe(
            de(
              `${u() ? "border-none" : "rounded-xl hover:shadow-md"} w-full
    border border-(--border-color) bg-(--container-color) p-0 transition-shadow duration-250`,
              c(),
            ),
          ),
        () => de("m-0 w-full cursor-pointer px-3 text-left font-semibold", r().class),
      ],
    ),
    Ee(
      3,
      k,
      () => gt,
      () => ({ duration: 250 }),
    ),
    N(e, k),
    Te())
}
Le(["click"])
const ga = {
  ru: {
    "common.select_tag": "Сделайте выбор",
    "debug.baud_rate_data": "Данные",
    "constructor.props.action.update": "Обновить",
    "constructor.props.action.save": "Сохранить",
    "constructor.props.action.nosend": "Без отправки",
    "constructor.props.action.custom": "Свой аргумент",
    "constructor.props.height.small": "Авто",
    "constructor.props.height.medium": "Средняя",
    "constructor.props.height.large": "Большая",
    "constructor.props.align.left": "Слева",
    "constructor.props.align.center": "По центру",
    "constructor.props.align.right": "Справа",
    "constructor.props.type.main": "Основной",
    "constructor.props.type.sub": "Вложенный",
    "constructor.props.type.text": "Текст",
    "constructor.props.type.password": "Пароль",
    "constructor.props.type.number": "Число",
    "constructor.props.type.textarea": "Область ",
    "constructor.props.type.single": "Простой",
    "constructor.props.type.range": "Диапазон",
    "constructor.props.type.small": "XS",
    "constructor.props.type.base": "S",
    "constructor.props.type.large": "M",
    "constructor.props.type.huge": "L",
    "constructor.props.type.massive": "XL",
    "constructor.props.type.select": "Список",
    "constructor.props.type.buttons": "Группа кнопок",
    "constructor.props.type.selectput": "Список+ввод",
    "constructor.props.valuetype.text": "Строка",
    "constructor.props.valuetype.number": "Число",
    "constructor.props.type.file": "Файл",
    "constructor.props.type.image": "Изображение",
    "constructor.props.type.cover": "Урезанный",
    "constructor.props.type.contain": "Полный",
    "constructor.props.type.square": "Квадрат",
    "constructor.props.type.circle": "Круг",
    "constructor.props.id": "Идентификатор",
    "constructor.props.label": "Текст надписи",
    "constructor.props.label.class": "Стили надписи",
    "constructor.props.wrapperclass": "Стили обёртки",
    "constructor.props.componentclass": "Стили компонента",
    "constructor.props.svgicon": "SVG-иконка (строка)",
    "constructor.props.open": "Разворачивание",
    "constructor.props.defaultcolor": "Первоначальный цвет",
    "constructor.props.file.accept": "Допустимые файлы",
    "constructor.props.imageSize.height": "Высота, rem",
    "constructor.props.imageSize.width": "Ширина, rem",
    "constructor.props.fitmode": "Вид",
    "constructor.props.form": "Форма",
    "constructor.props.type": "Тип",
    "constructor.props.size": "Размер",
    "constructor.props.footer": "Нижняя панель",
    "constructor.props.header": "Заголовок пакета",
    "constructor.props.argument": "Аргумент",
    "constructor.props.argument.info": "Пользовательский аргумент (a-z, A-Z, 0-9, -_!)",
    "constructor.props.variables": "Перечень переменных",
    "constructor.props.variables.info": "Поле для ввода имён переменных, разделенных пробелами",
    "constructor.props.value": "Значение",
    "constructor.props.value.info": "Поле для ввода Value пакета в формате JSON",
    "constructor.props.align": "Выравнивание",
    "constructor.props.align.header": "Выравнивание заголовка",
    "constructor.props.align.content": "Выравнивание контента",
    "constructor.props.image": "Фоновое изображение",
    "constructor.props.labelicon": "Иконка заголовка",
    "constructor.props.removeimage": "Удалить изображение",
    "constructor.props.name": "Текст",
    "constructor.props.height": "Высота",
    "constructor.props.colors": "Цвет фона",
    "constructor.props.outline": "Границы таблицы",
    "constructor.props.textcolors": "Цвет текста",
    "constructor.props.textarea.rows": "Количество строк",
    "constructor.props.autocomplete": "Автозаполнение",
    "constructor.props.maxlength": "Максимальная длина",
    "constructor.props.regexp": "Выражение валидации",
    "constructor.props.regexp.info": "Введите RegExp без /.../ (например: ^\\d+$)",
    "constructor.props.minnum": "Минимальное значение",
    "constructor.props.maxnum": "Максимальное значение",
    "constructor.props.step": "Шаг",
    "constructor.props.rows": "Количество строк",
    "constructor.props.placeholder": "Заполнитель",
    "constructor.props.info": "Подсказка",
    "constructor.props.info.side": "Положение подсказки",
    "constructor.props.info.top": "Вверху",
    "constructor.props.info.bottom": "Внизу",
    "constructor.props.info.left": "Слева",
    "constructor.props.info.right": "Справа",
    "constructor.props.disabled": "Отключить",
    "constructor.props.readonly": "Только для чтения",
    "constructor.props.istest": "Тестовые данные",
    "constructor.props.variable": "Имя переменной",
    "constructor.props.widthMode": "Ширина кнопок",
    "constructor.props.graphdata.title": "Начальные данные ",
    "constructor.props.options.title": "Опции компонента",
    "constructor.props.valuetype": "Тип значения",
    "constructor.props.action": "Действие при переключении",
    "constructor.props.caption.left": "Надпись слева",
    "constructor.props.caption.right": "Надпись справа",
    "constructor.props.bold": "Жирный",
    "constructor.props.italic": "Курсив",
    "constructor.props.background": "Фон",
    "constructor.props.min": "Минимальное значение",
    "constructor.props.max": "Максимальное значение",
    "constructor.props.units": "Единица измерения",
    "constructor.props.optionclass": "Стили кнопки",
    "constructor.props.optionvalue": "Значение",
    "constructor.props.optionname": "Текст",
    "constructor.props.copy": "Копирование",
    "constructor.props.size.height": "Высота сетки",
    "constructor.props.size.width": "Ширина сетки",
    "constructor.props.table.columns": "Колонки таблицы",
    "constructor.props.table.columns.key": "Ключ",
    "constructor.props.table.columns.label": "Название колонки",
    "constructor.props.table.columns.width": "Ширина, %",
    "constructor.props.table.columns.sortable": "Сортировка",
    "constructor.props.table.columns.truncated": "Скрыть",
    "constructor.props.table.columns.alt": "Альтернативное название иконок",
    "constructor.props.table.columns.class": "Стили иконки",
    "constructor.props.table.columns.image.width": "Ширина иконки",
    "constructor.props.table.columns.image.height": "Высота иконки",
    "constructor.props.table.deletecolumn": "Удалить колонку",
    "constructor.props.table.deletebutton": "Удалить кнопку",
    "constructor.props.table.addaction": "Добавить кнопку",
    "constructor.props.table.keys": "Перечень ключей",
    "constructor.props.table.keys.info": "Ключи таблицы, значения которых будут возвращаться",
    "constructor.props.icon.access": "Доступ",
    "constructor.props.icon.common": "Общее",
    "constructor.props.icon.control": "Управление",
    "constructor.props.icon.electronic": "Электроника",
    "constructor.props.icon.image": "Изображение",
    "constructor.props.icon.info": "Информация",
    "constructor.props.icon.network": "Сеть",
    "constructor.props.icon.power": "Питание",
    "constructor.props.icon.settings": "Настройки",
    "constructor.props.autocomplete.on": "Включено",
    "constructor.props.autocomplete.off": "Выключено",
    "constructor.props.autocomplete.name": "Полное имя",
    "constructor.props.autocomplete.honorific-prefix": "Обращение (г-н, г-жа, др.)",
    "constructor.props.autocomplete.given-name": "Имя",
    "constructor.props.autocomplete.additional-name": "Отчество",
    "constructor.props.autocomplete.family-name": "Фамилия",
    "constructor.props.autocomplete.honorific-suffix": "Постфикс (мл., ст.)",
    "constructor.props.autocomplete.nickname": "Псевдоним",
    "constructor.props.autocomplete.username": "Имя пользователя",
    "constructor.props.autocomplete.new-password": "Новый пароль",
    "constructor.props.autocomplete.current-password": "Текущий пароль",
    "constructor.props.autocomplete.one-time-code": "Одноразовый код",
    "constructor.props.autocomplete.organization-title": "Должность",
    "constructor.props.autocomplete.organization": "Организация",
    "constructor.props.autocomplete.street-address": "Адрес, начиная с улицы",
    "constructor.props.autocomplete.address-line1": "Адресная строка 1",
    "constructor.props.autocomplete.address-line2": "Адресная строка 2",
    "constructor.props.autocomplete.address-line3": "Адресная строка 3",
    "constructor.props.autocomplete.address-level4": "Уровень адреса 4",
    "constructor.props.autocomplete.address-level3": "Уровень адреса 3",
    "constructor.props.autocomplete.address-level2": "Населённый пункт",
    "constructor.props.autocomplete.address-level1": "Область, регион или штат",
    "constructor.props.autocomplete.country": "Код страны",
    "constructor.props.autocomplete.country-name": "Страна",
    "constructor.props.autocomplete.postal-code": "Почтовый индекс",
    "constructor.props.autocomplete.cc-name": "Имя владельца карты",
    "constructor.props.autocomplete.cc-given-name": "Имя владельца карты",
    "constructor.props.autocomplete.cc-additional-name": "Отчество владельца карты",
    "constructor.props.autocomplete.cc-family-name": "Фамилия владельца карты",
    "constructor.props.autocomplete.cc-number": "Номер карты",
    "constructor.props.autocomplete.cc-exp": "Срок действия",
    "constructor.props.autocomplete.cc-exp-month": "Месяц срока действия",
    "constructor.props.autocomplete.cc-exp-year": "Год срока действия",
    "constructor.props.autocomplete.cc-csc": "Код безопасности",
    "constructor.props.autocomplete.cc-type": "Тип карты",
    "constructor.props.autocomplete.transaction-currency": "Валюта транзакции",
    "constructor.props.autocomplete.transaction-amount": "Сумма транзакции",
    "constructor.props.autocomplete.language": "Язык",
    "constructor.props.autocomplete.bday": "Дата рождения",
    "constructor.props.autocomplete.bday-day": "День рождения",
    "constructor.props.autocomplete.bday-month": "Месяц рождения",
    "constructor.props.autocomplete.bday-year": "Год рождения",
    "constructor.props.autocomplete.sex": "Пол",
    "constructor.props.autocomplete.url": "URL-адрес",
    "constructor.props.autocomplete.photo": "Фото",
    "constructor.props.autocomplete.email": "Адрес электронной почты",
    "constructor.props.autocomplete.tel": "Полный номер телефона",
    "constructor.props.autocomplete.tel-country-code": "Код страны телефона",
    "constructor.props.autocomplete.tel-national": "Национальный номер телефона",
    "constructor.props.autocomplete.tel-area-code": "Код региона/области",
    "constructor.props.autocomplete.tel-local": "Местный номер",
    "constructor.props.autocomplete.tel-local-prefix": "Префикс местного номера",
    "constructor.props.autocomplete.tel-local-suffix": "Суффикс местного номера",
    "constructor.props.autocomplete.tel-extension": "Добавочный номер",
    "constructor.props.autocomplete.impp": "Мессенджер",
    "constructor.props.autocomplete.fax": "Номер факса",
  },
  en: {},
  zh: {},
}
let ba = "ru"
const wa = bo(ba)
function xa(e, t) {
  return ga[e]?.[t] || t
}
const Yt = Cr(wa, (e) => (t) => xa(e, t)),
  xe = (e, t, o, a, u) => {
    const c = JSON.parse(JSON.stringify(o.properties)),
      l = e.split(".")
    let r = c
    for (let d = 0; d < l.length - 1; d++) {
      const C = l[d]
      ;(r[C] || (r[C] = {}), (r = r[C]))
    }
    ;((r[l[l.length - 1]] = t), a(c, u))
  }
function m() {
  return crypto.randomUUID()
}
const ya = Cr(Yt, (e) => ({
    HEADER_OPTIONS: [
      { id: m(), name: "GET", value: "GET" },
      { id: m(), name: "SET", value: "SET" },
      { id: m(), name: "OK!", value: "OK!" },
      { id: m(), name: "ER!", value: "ER!" },
    ],
    SHORT_ARGUMENT_OPTION: [
      { id: m(), value: "NoSave", name: e("constructor.props.action.update") },
      { id: m(), value: "Save", name: e("constructor.props.action.save") },
      { id: m(), value: "NoSend", name: e("constructor.props.action.nosend") },
    ],
    FULL_ARGUMENT_OPTION: [
      { id: m(), value: "NoSave", name: e("constructor.props.action.update") },
      { id: m(), value: "Save", name: e("constructor.props.action.save") },
      { id: m(), value: "", name: e("constructor.props.action.custom") },
    ],
    INPUT_TYPE_OPTIONS: [
      { id: m(), value: "text", name: e("constructor.props.type.text") },
      { id: m(), value: "password", name: e("constructor.props.type.password") },
      { id: m(), value: "number", name: e("constructor.props.type.number") },
      { id: m(), value: "text-area", name: e("constructor.props.type.textarea") },
    ],
    SELECT_TYPE_OPTIONS: [
      { id: m(), value: "select", name: e("constructor.props.type.select") },
      { id: m(), value: "buttons", name: e("constructor.props.type.buttons") },
      { id: m(), value: "input", name: e("constructor.props.type.selectput") },
    ],
    SELECT_VALUE_TYPE_OPTIONS: [
      { id: m(), value: "text", name: e("constructor.props.valuetype.text") },
      { id: m(), value: "number", name: e("constructor.props.valuetype.number") },
    ],
    SLIDER_TYPE_OPTIONS: [
      { id: m(), value: "single", name: e("constructor.props.type.single") },
      { id: m(), value: "range", name: e("constructor.props.type.range") },
    ],
    TEXTFIELD_SIZE_OPTIONS: [
      { id: m(), value: "small", name: e("constructor.props.type.small") },
      { id: m(), value: "base", name: e("constructor.props.type.base") },
      { id: m(), value: "large", name: e("constructor.props.type.large") },
      { id: m(), value: "huge", name: e("constructor.props.type.huge") },
      { id: m(), value: "massive", name: e("constructor.props.type.massive") },
    ],
    COLOR_OPTIONS: [
      { id: m(), name: "", value: "bg-max", class: "bg-max" },
      { id: m(), name: "", value: "bg-red", class: "bg-red" },
      { id: m(), name: "", value: "bg-yellow", class: "bg-yellow" },
      { id: m(), name: "", value: "bg-green", class: "bg-green" },
      { id: m(), name: "", value: "bg-blue", class: "bg-blue" },
      { id: m(), name: "", value: "bg-purple", class: "bg-purple" },
      { id: m(), name: "", value: "bg-gray", class: "bg-gray" },
    ],
    TEXT_COLOR_OPTIONS: [
      { id: m(), name: "", value: "text-[#333] dark:text-[#e2e3e7]", class: "bg-[var(--shadow-color)] dark:bg-[#e2e3e7] " },
      { id: m(), name: "", value: "text-red-500 dark:text-red-400", class: "bg-red-500 dark:bg-red-400" },
      { id: m(), name: "", value: "text-yellow-500 dark:text-yellow-400", class: "bg-yellow-500 dark:bg-yellow-400" },
      { id: m(), name: "", value: "text-green-500 dark:text-green-400", class: "bg-green-500 dark:bg-green-400" },
      { id: m(), name: "", value: "text-blue-500 dark:text-blue-400", class: "bg-blue-500 dark:bg-blue-400" },
      { id: m(), name: "", value: "text-purple-500 dark:text-purple-400", class: "bg-purple-500 dark:bg-purple-400" },
      { id: m(), name: "", value: "text-gray-500 dark:text-gray-400", class: "bg-gray-500 dark:bg-gray-400" },
    ],
    TEXT_ALIGN_OPTIONS: [
      { id: m(), value: "text-left", name: e("constructor.props.align.left") },
      { id: m(), value: "text-center", name: e("constructor.props.align.center") },
      { id: m(), value: "text-right", name: e("constructor.props.align.right") },
    ],
    ALIGN_OPTIONS: [
      { id: m(), value: "left", name: e("constructor.props.align.left") },
      { id: m(), value: "center", name: e("constructor.props.align.center") },
      { id: m(), value: "right", name: e("constructor.props.align.right") },
    ],
    HEIGHT_OPTIONS: [
      { id: m(), value: "py-1", name: e("constructor.props.height.small") },
      { id: m(), value: "py-2", name: e("constructor.props.height.medium") },
      { id: m(), value: "py-3", name: e("constructor.props.height.large") },
    ],
    ACCORDION_TYPE_OPTIONS: [
      { id: m(), value: !1, name: e("constructor.props.type.main") },
      { id: m(), value: !0, name: e("constructor.props.type.sub") },
    ],
    FILE_ATTACH_TYPE_OPTIONS: [
      { id: m(), value: "file", name: e("constructor.props.type.file") },
      { id: m(), value: "image", name: e("constructor.props.type.image") },
    ],
    FITMODE_OPTIONS: [
      { id: m(), value: "cover", name: e("constructor.props.type.cover") },
      { id: m(), value: "contain", name: e("constructor.props.type.contain") },
    ],
    INFO_SIDE_OPTIONS: [
      { id: m(), value: "top", name: e("constructor.props.info.top") },
      { id: m(), value: "bottom", name: e("constructor.props.info.bottom") },
      { id: m(), value: "left", name: e("constructor.props.info.left") },
      { id: m(), value: "right", name: e("constructor.props.info.right") },
    ],
    FORM_OPTIONS: [
      { id: m(), value: "square", name: e("constructor.props.type.square") },
      { id: m(), value: "circle", name: e("constructor.props.type.circle") },
    ],
    AUTOCOMPLETE_CONSTRUCTOR_OPTIONS: [
      { id: m(), value: "on", name: e("constructor.props.autocomplete.on") },
      { id: m(), value: "off", name: e("constructor.props.autocomplete.off") },
      { id: m(), value: "given-name", name: e("constructor.props.autocomplete.given-name") },
      { id: m(), value: "family-name", name: e("constructor.props.autocomplete.family-name") },
      { id: m(), value: "nickname", name: e("constructor.props.autocomplete.nickname") },
      { id: m(), value: "username", name: e("constructor.props.autocomplete.username") },
      { id: m(), value: "new-password", name: e("constructor.props.autocomplete.new-password") },
      { id: m(), value: "current-password", name: e("constructor.props.autocomplete.current-password") },
      { id: m(), value: "organization-title", name: e("constructor.props.autocomplete.organization-title") },
      { id: m(), value: "country-name", name: e("constructor.props.autocomplete.country-name") },
      { id: m(), value: "address-level1", name: e("constructor.props.autocomplete.address-level1") },
      { id: m(), value: "address-level2", name: e("constructor.props.autocomplete.address-level2") },
      { id: m(), value: "street-address", name: e("constructor.props.autocomplete.street-address") },
      { id: m(), value: "postal-code", name: e("constructor.props.autocomplete.postal-code") },
      { id: m(), value: "email", name: e("constructor.props.autocomplete.email") },
      { id: m(), value: "tel", name: e("constructor.props.autocomplete.tel") },
    ],
    AUTOCOMPLETE_OPTIONS: [
      { id: m(), value: "on", name: e("constructor.props.autocomplete.on") },
      { id: m(), value: "off", name: e("constructor.props.autocomplete.off") },
      { id: m(), value: "name", name: e("constructor.props.autocomplete.name") },
      { id: m(), value: "honorific-prefix", name: e("constructor.props.autocomplete.honorific-prefix") },
      { id: m(), value: "given-name", name: e("constructor.props.autocomplete.given-name") },
      { id: m(), value: "additional-name", name: e("constructor.props.autocomplete.additional-name") },
      { id: m(), value: "family-name", name: e("constructor.props.autocomplete.family-name") },
      { id: m(), value: "honorific-suffix", name: e("constructor.props.autocomplete.honorific-suffix") },
      { id: m(), value: "nickname", name: e("constructor.props.autocomplete.nickname") },
      { id: m(), value: "username", name: e("constructor.props.autocomplete.username") },
      { id: m(), value: "new-password", name: e("constructor.props.autocomplete.new-password") },
      { id: m(), value: "current-password", name: e("constructor.props.autocomplete.current-password") },
      { id: m(), value: "one-time-code", name: e("constructor.props.autocomplete.one-time-code") },
      { id: m(), value: "organization-title", name: e("constructor.props.autocomplete.organization-title") },
      { id: m(), value: "organization", name: e("constructor.props.autocomplete.organization") },
      { id: m(), value: "street-address", name: e("constructor.props.autocomplete.street-address") },
      { id: m(), value: "address-line1", name: e("constructor.props.autocomplete.address-line1") },
      { id: m(), value: "address-line2", name: e("constructor.props.autocomplete.address-line2") },
      { id: m(), value: "address-line3", name: e("constructor.props.autocomplete.address-line3") },
      { id: m(), value: "address-level4", name: e("constructor.props.autocomplete.address-level4") },
      { id: m(), value: "address-level3", name: e("constructor.props.autocomplete.address-level3") },
      { id: m(), value: "address-level2", name: e("constructor.props.autocomplete.address-level2") },
      { id: m(), value: "address-level1", name: e("constructor.props.autocomplete.address-level1") },
      { id: m(), value: "country", name: e("constructor.props.autocomplete.country") },
      { id: m(), value: "country-name", name: e("constructor.props.autocomplete.country-name") },
      { id: m(), value: "postal-code", name: e("constructor.props.autocomplete.postal-code") },
      { id: m(), value: "cc-name", name: e("constructor.props.autocomplete.cc-name") },
      { id: m(), value: "cc-given-name", name: e("constructor.props.autocomplete.cc-given-name") },
      { id: m(), value: "cc-additional-name", name: e("constructor.props.autocomplete.cc-additional-name") },
      { id: m(), value: "cc-family-name", name: e("constructor.props.autocomplete.cc-family-name") },
      { id: m(), value: "cc-number", name: e("constructor.props.autocomplete.cc-number") },
      { id: m(), value: "cc-exp", name: e("constructor.props.autocomplete.cc-exp") },
      { id: m(), value: "cc-exp-month", name: e("constructor.props.autocomplete.cc-exp-month") },
      { id: m(), value: "cc-exp-year", name: e("constructor.props.autocomplete.cc-exp-year") },
      { id: m(), value: "cc-csc", name: e("constructor.props.autocomplete.cc-csc") },
      { id: m(), value: "cc-type", name: e("constructor.props.autocomplete.cc-type") },
      { id: m(), value: "transaction-currency", name: e("constructor.props.autocomplete.transaction-currency") },
      { id: m(), value: "transaction-amount", name: e("constructor.props.autocomplete.transaction-amount") },
      { id: m(), value: "language", name: e("constructor.props.autocomplete.language") },
      { id: m(), value: "bday", name: e("constructor.props.autocomplete.bday") },
      { id: m(), value: "bday-day", name: e("constructor.props.autocomplete.bday-day") },
      { id: m(), value: "bday-month", name: e("constructor.props.autocomplete.bday-month") },
      { id: m(), value: "bday-year", name: e("constructor.props.autocomplete.bday-year") },
      { id: m(), value: "sex", name: e("constructor.props.autocomplete.sex") },
      { id: m(), value: "url", name: e("constructor.props.autocomplete.url") },
      { id: m(), value: "photo", name: e("constructor.props.autocomplete.photo") },
      { id: m(), value: "email", name: e("constructor.props.autocomplete.email") },
      { id: m(), value: "tel", name: e("constructor.props.autocomplete.tel") },
      { id: m(), value: "tel-country-code", name: e("constructor.props.autocomplete.tel-country-code") },
      { id: m(), value: "tel-national", name: e("constructor.props.autocomplete.tel-national") },
      { id: m(), value: "tel-area-code", name: e("constructor.props.autocomplete.tel-area-code") },
      { id: m(), value: "tel-local", name: e("constructor.props.autocomplete.tel-local") },
      { id: m(), value: "tel-local-prefix", name: e("constructor.props.autocomplete.tel-local-prefix") },
      { id: m(), value: "tel-local-suffix", name: e("constructor.props.autocomplete.tel-local-suffix") },
      { id: m(), value: "tel-extension", name: e("constructor.props.autocomplete.tel-extension") },
      { id: m(), value: "impp", name: e("constructor.props.autocomplete.impp") },
      { id: m(), value: "fax", name: e("constructor.props.autocomplete.fax") },
    ],
  })),
  sr = [
    [
      "access",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M9.5 5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM9 9.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-2.39-3C6.61 7.328 5.891 8 5 8s-1.61-.672-1.61-1.5S4.109 5 5 5s1.61.672 1.61 1.5M5 8h-.04c-.92 0-1.72.585-1.94 1.42c-.08.295.16.582.485.582h3c.326 0 .565-.286.486-.582C6.768 8.586 5.971 8 5.051 8h-.04z"/><path fill="currentColor" fill-rule="evenodd" d="M.327 3.64C0 4.282 0 5.12 0 6.8v2.4c0 1.68 0 2.52.327 3.16a3.02 3.02 0 0 0 1.31 1.31c.642.327 1.48.327 3.16.327h6.4c1.68 0 2.52 0 3.16-.327a3 3 0 0 0 1.31-1.31c.327-.642.327-1.48.327-3.16V6.8c0-1.68 0-2.52-.327-3.16a3 3 0 0 0-1.31-1.31c-.642-.327-1.48-.327-3.16-.327h-6.4c-1.68 0-2.52 0-3.16.327a3.02 3.02 0 0 0-1.31 1.31m10.9-.638h-6.4c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819c-.037.45-.038 1.03-.038 1.89v2.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18c.45.036 1.03.037 1.89.037h6.4c.857 0 1.44 0 1.89-.037c.438-.036.663-.101.819-.18c.376-.192.682-.498.874-.874c.08-.156.145-.381.18-.82c.037-.45.038-1.03.038-1.89v-2.4c0-.856-.001-1.44-.038-1.89c-.036-.437-.101-.662-.18-.818a2 2 0 0 0-.874-.874c-.156-.08-.381-.145-.819-.18c-.45-.037-1.03-.038-1.89-.038" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M3 8.5a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" fill-rule="evenodd" d="M4.5 3c1.56 0 2.94.794 3.75 2h5.26a1 1 0 0 1 .807.409l1.49 2.04a.99.99 0 0 1 .033 1.13l-1.26 1.95a.997.997 0 0 1-1.41.276L12.02 10l-1.19.812a1 1 0 0 1-1.13 0L8.51 10h-.258c-.808 1.21-2.18 2-3.75 2a4.5 4.5 0 0 1 0-9zm3.75 6a1 1 0 0 0-.832.444c-.63.94-1.7 1.56-2.91 1.56c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c1.21 0 2.28.616 2.91 1.56c.186.277.498.444.832.444h5.26L15 8.048l-1.26 1.95l-1.15-.805a1 1 0 0 0-1.14-.005L10.26 10l-1.19-.812a1 1 0 0 0-.566-.175h-.258z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M2 8a.997.997 0 0 1 1-1h10a.997.997 0 0 1 1 1v6a.997.997 0 0 1-1 1H3a.997.997 0 0 1-1-1zm3-4c0-.796.316-1.56.879-2.12s1.33-.879 2.12-.879A3 3 0 0 1 10.998 4v2h-6V4zm7 0v2h1a2 2 0 0 1 1.996 1.996v6c0 .53-.211 1.04-.586 1.41s-.884.586-1.41.586H3a2 2 0 0 1-1.996-1.996v-6A2 2 0 0 1 3 6h1V4c0-1.06.421-2.08 1.17-2.83a4.004 4.004 0 0 1 5.66 0C11.58 1.92 12 2.94 12 4" clip-rule="evenodd"/></svg>',
      ],
    ],
    [
      "common",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path fill="currentColor" fill-rule="evenodd" d="M6 1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1c1.66 0 3 1.34 3 3v9c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3V4c0-1.66 1.34-3 3-3M4 4c0-1.1.895-2 2-2h4c1.1 0 2 .895 2 2v9c0 1.1-.895 2-2 2H6c-1.1 0-2-.895-2-2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M9 3.2c0-1.12 0-1.68.218-2.11c.192-.376.498-.682.874-.874c.428-.218.988-.218 2.11-.218h.6c1.12 0 1.68 0 2.11.218c.376.192.682.498.874.874c.218.428.218.988.218 2.11v.6c0 1.12 0 1.68-.218 2.11a2 2 0 0 1-.874.874c-.428.218-.988.218-2.11.218h-.6c-1.12 0-1.68 0-2.11-.218a2 2 0 0 1-.874-.874C9 5.482 9 4.922 9 3.8zM12.2 1h.6c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-.6c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422a17 17 0 0 1-.024-1.23v-.6c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085C11.253 1 11.626 1 12.2 1M.218 4.09C0 4.518 0 5.078 0 6.2v6.6c0 1.12 0 1.68.218 2.11c.192.376.498.682.874.874c.428.218.988.218 2.11.218h6.6c1.12 0 1.68 0 2.11-.218c.376-.192.682-.498.874-.874c.218-.428.218-.988.218-2.11v-.6c0-1.12 0-1.68-.218-2.11a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.11-.218h-2.8v-2.8c0-1.12 0-1.68-.218-2.11a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.11-.218h-.6c-1.12 0-1.68 0-2.11.218a2 2 0 0 0-.874.874zm5.78 2.11V9h-5V6.2c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085c.283-.023.656-.024 1.23-.024h.6c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23zm-5 3.8h5v5h-2.8c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C1 13.749 1 13.376 1 12.802v-2.8zm6 0h2.8c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-2.8v-5z" clip-rule="evenodd"/></svg>',
        `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"\r
  ><path\r
    fill="none"\r
    stroke="currentColor"\r
    stroke-linecap="round"\r
    stroke-linejoin="round"\r
    stroke-width="1.5"\r
    d="M14.44 5.78L4.198 16.02a2 2 0 0 0-.565 1.125l-.553 3.774l3.775-.553A2 2 0 0 0 7.98 19.8L18.22 9.56m-3.78-3.78l2.229-2.23a1.6 1.6 0 0 1 2.263 0l1.518 1.518a1.6 1.6 0 0 1 0 2.263l-2.23 2.23M14.44 5.78l3.78 3.78"\r
  /></svg\r
>\r
`,
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M0 2c0-.465 0-.697.051-.888a1.5 1.5 0 0 1 1.06-1.06C1.302.001 1.534.001 2 .001s.697 0 .888.051c.518.139.922.543 1.06 1.06c.051.191.051.423.051.888s0 .697-.05.888a1.5 1.5 0 0 1-1.06 1.06c-.192.051-.424.051-.889.051s-.697 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C0 2.697 0 2.465 0 2m2 1c-.242 0-.389 0-.501-.005a1 1 0 0 1-.128-.012a.5.5 0 0 1-.354-.354c.001.004-.007-.021-.012-.128C1 2.389 1 2.24 1 2s0-.389.005-.501c.005-.107.013-.132.012-.128a.5.5 0 0 1 .354-.354c-.004.001.021-.007.128-.012C1.611 1 1.759 1 2 1s.389 0 .501.005c.107.005.132.013.128.012a.5.5 0 0 1 .354.354c-.001-.004.007.021.012.128C3 1.611 3 1.759 3 2s0 .389-.005.501a1 1 0 0 1-.012.128a.5.5 0 0 1-.354.354c.004-.001-.021.007-.128.012C2.389 3 2.241 3 2 3M0 8c0-.465 0-.697.051-.888a1.5 1.5 0 0 1 1.06-1.06c.191-.051.423-.051.888-.051s.697 0 .888.051c.518.139.922.543 1.06 1.06c.051.191.051.423.051.888s0 .697-.05.888a1.5 1.5 0 0 1-1.06 1.06c-.192.051-.424.051-.889.051s-.697 0-.888-.051a1.5 1.5 0 0 1-1.06-1.06C0 8.697 0 8.465 0 8m2 1c-.242 0-.389 0-.501-.005a1 1 0 0 1-.128-.012a.5.5 0 0 1-.354-.354c.001.004-.007-.021-.012-.128C1 8.389 1 8.241 1 8s0-.389.005-.501c.005-.107.013-.132.012-.128a.5.5 0 0 1 .354-.354s.028-.007.128-.012C1.611 7 1.759 7 2 7s.389 0 .501.005c.107.005.132.013.128.012a.5.5 0 0 1 .354.354s.007.028.012.128C3 7.611 3 7.759 3 8s0 .389-.005.501a1 1 0 0 1-.012.128a.5.5 0 0 1-.354.354s-.028.007-.128.012C2.389 9 2.241 9 2 9M.051 13.1C0 13.291 0 13.523 0 13.988s0 .698.051.888a1.5 1.5 0 0 0 1.06 1.06c.191.051.423.051.888.051s.697 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06c.051-.191.051-.423.051-.888s0-.698-.05-.888a1.5 1.5 0 0 0-1.06-1.06c-.192-.051-.424-.051-.889-.051s-.697 0-.888.051a1.5 1.5 0 0 0-1.06 1.06m1.45 1.88c.112.005.26.005.501.005s.39 0 .501-.005a.6.6 0 0 0 .128-.012a.5.5 0 0 0 .353-.354c0-.003.007-.034.012-.128c.005-.112.005-.26.005-.5s0-.39-.005-.502c-.005-.1-.012-.128-.012-.128a.5.5 0 0 0-.353-.353s-.028-.007-.128-.011c-.112-.005-.26-.006-.501-.006s-.389 0-.501.006a1 1 0 0 0-.128.011a.5.5 0 0 0-.353.354s-.007.028-.012.128c-.005.112-.005.26-.005.501s0 .39.005.501c.005.107.013.132.012.128a.5.5 0 0 0 .354.354a1 1 0 0 0 .128.012z" clip-rule="evenodd"/><path fill="currentColor" d="M6.5 2a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zM6 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m.5 5.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M10.5 11.9a6.005 6.005 0 0 1-9.48-4.89c0-3.31 2.69-6 6-6a6.005 6.005 0 0 1 4.89 9.48l2.82 2.82a.996.996 0 0 1 0 1.41a.994.994 0 0 1-1.41 0zm1.52-4.89c0 2.76-2.24 5-5 5s-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M6.5 7a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5m3.5.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 1 0z"/><path fill="currentColor" fill-rule="evenodd" d="M8.12 0h-.241c-.402 0-.735 0-1.01.022c-.281.023-.539.072-.782.196a2 2 0 0 0-.874.874c-.124.243-.173.501-.196.782c-.022.271-.022.603-.022 1.01v.121h-3.5a.5.5 0 0 0 0 1h.54l.597 7.16c.063.758.113 1.36.192 1.84c.08.492.196.9.41 1.27c.354.604.88 1.09 1.51 1.39c.386.184.803.265 1.3.304c.487.038 1.09.038 1.85.038h.21c.76 0 1.36 0 1.85-.038c.497-.039.913-.12 1.3-.304a3.5 3.5 0 0 0 1.51-1.39c.216-.368.33-.777.41-1.27c.08-.48.129-1.08.193-1.84l.597-7.16h.54a.5.5 0 0 0 0-1h-3.5v-.12c0-.403 0-.736-.022-1.01c-.023-.282-.072-.54-.196-.783a2 2 0 0 0-.874-.874C9.669.094 9.41.045 9.13.022C8.859 0 8.527 0 8.12 0M3.04 4l.588 7.06c.065.784.112 1.34.184 1.78c.07.432.159.705.287.924a2.5 2.5 0 0 0 1.08.992c.229.11.509.175.945.21c.442.035 1 .035 1.79.035h.167c.787 0 1.35 0 1.79-.035c.436-.034.716-.1.945-.21a2.5 2.5 0 0 0 1.08-.992c.128-.219.217-.493.288-.924c.071-.438.118-.997.184-1.78L12.956 4h-9.91zM6 3h4v-.1c0-.428 0-.719-.019-.944c-.018-.219-.05-.331-.09-.41a1 1 0 0 0-.437-.437c-.078-.04-.19-.072-.41-.09A13 13 0 0 0 8.1 1h-.2c-.428 0-.719 0-.944.019c-.219.018-.331.05-.41.09a1 1 0 0 0-.437.437c-.04.078-.072.19-.09.41C6 2.181 6 2.472 6 2.9z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8 9a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 1.5 0v3.5A.75.75 0 0 1 8 9m-1 3a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/><path fill="currentColor" fill-rule="evenodd" d="m.325 11.6l5.02-9.99c1.1-2.19 4.21-2.19 5.31 0l5.02 9.99c1 2-.436 4.36-2.66 4.36h-10c-2.22 0-3.66-2.36-2.66-4.36zm.894.449l5.02-9.99c.733-1.46 2.79-1.46 3.52 0l5.02 9.99c.676 1.35-.301 2.91-1.76 2.91h-10c-1.46 0-2.44-1.57-1.76-2.91z" clip-rule="evenodd"/></svg>',
      ],
    ],
    [
      "control",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M10.5 7a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 1 5 0m-1 0a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 9.5 7" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M14 7c0 4.5-5 9-6 9s-6-4.5-6-9c0-3.31 2.69-6 6-6s6 2.69 6 6m-1 0c0 1.91-1.08 3.94-2.4 5.56c-.647.794-1.32 1.45-1.87 1.89a5.3 5.3 0 0 1-.731.507l-.052-.028a5.5 5.5 0 0 1-.68-.479c-.552-.446-1.22-1.1-1.87-1.89c-1.32-1.62-2.4-3.65-2.4-5.56c0-2.76 2.24-5 5-5s5 2.24 5 5z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M14.2 5.13a.5.5 0 0 1 .686.02a.5.5 0 0 1 .022.685l-4.93 5.59a2.002 2.002 0 1 1-1.353-1.355l5.57-4.95zM8 2c1.82 0 3.5.608 4.84 1.63l-.765.68A6.96 6.96 0 0 0 7.995 3c-3.87 0-7 3.13-7 7c0 1.1.895 2 2 2h1.03c0 .336.043.672.128 1h-1.16l-.154-.004a3 3 0 0 1-2.85-3c0-4.42 3.58-8 8-8zm7.7 5.9c.182.67.281 1.37.281 2.1c0 1.66-1.34 3-3 3h-1.1q.116-.45.127-.91l.08-.09h.893c1.1 0 2-.895 2-2q-.002-.6-.1-1.17z"/><path fill="currentColor" d="M8 5c.925 0 1.8.251 2.54.671l-.799.71A4.2 4.2 0 0 0 7.991 6c-2.26 0-4 1.81-4 3.5a.5.5 0 0 1-1 0c0-2.31 2.26-4.5 5-4.5z"/></svg>',
      ],
    ],
    [
      "electronic",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M4 1a2.01 2.01 0 0 0-1.74 1.01A2.5 2.5 0 0 0 0 4.5V11c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V4.5c0-1.3-.992-2.37-2.26-2.49A2 2 0 0 0 12 1h-1c-.74 0-1.39.402-1.73 1H6.73C6.384 1.402 5.738 1 5 1zm0 1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm5 1H7v2.5a.5.5 0 0 1-1 0v-.768C5.706 4.902 5.364 5 5 5H4c-.364 0-.706-.097-1-.268V5.5a.5.5 0 0 1-1 0V3.09A1.5 1.5 0 0 0 1 4.5v2A1.5 1.5 0 0 0 2.5 8h11A1.5 1.5 0 0 0 15 6.5v-2c0-.653-.417-1.21-1-1.41V5.5a.5.5 0 0 1-1 0v-.768c-.294.17-.636.268-1 .268h-1c-.364 0-.706-.097-1-.268V5.5a.5.5 0 0 1-1 0zm1 0a1 1 0 0 0 1 1h1a1 1 0 0 0 0-2h-1a1 1 0 0 0-1 1m5 5.5c-.418.314-.937.5-1.5.5h-11c-.563 0-1.08-.186-1.5-.5V11c0 1.1.895 2 2 2h10c1.1 0 2-.895 2-2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M12.5 0a.5.5 0 0 1 .5.5v2.26q.125.11.236.235h2.26a.5.5 0 0 1 .492.41l.008.09a.5.5 0 0 1-.5.5h-1.67c.11.313.17.65.17 1v1h1.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.5v2h1.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-1.5v1c0 .351-.06.688-.171 1h1.67a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5h-2.26a3 3 0 0 1-.234.235L13 15.49a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-1.67c-.312.11-.649.171-1 .171h-1v1.5a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-1.5H7v1.5a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-1.5H5c-.35 0-.687-.06-1-.17v1.67a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-2.26a3 3 0 0 1-.235-.235l-2.26-.001a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5h1.67a3 3 0 0 1-.171-1v-1h-1.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5h1.5v-2h-1.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5h1.5v-1c0-.35.06-.687.17-1H.504a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5h2.26A3 3 0 0 1 3 2.759V.499a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5v1.67c.313-.11.65-.17 1-.17h1v-1.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5v1.5h2v-1.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5v1.5h1c.351 0 .688.06 1 .171V.5a.5.5 0 0 1 .5-.5M11 3H5a2 2 0 0 0-1.996 1.996v6A2 2 0 0 0 5 12.992h6c.53 0 1.04-.211 1.41-.586s.586-.884.586-1.41v-6A2 2 0 0 0 11 3m0 1a.997.997 0 0 1 1 1v6a.997.997 0 0 1-1 1H5a.997.997 0 0 1-1-1V5a.997.997 0 0 1 1-1zm0 1H5v6h6z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M2.28 0h2.49c.098 0 .193 0 .275.005c.089.006.194.02.305.061a1 1 0 0 1 .575.575c.042.11.056.216.061.305c.005.082.005.177.005.275v7.78a2 2 0 1 0 4 0v-7.78c0-.098 0-.193.006-.275c.005-.088.019-.194.06-.305a1 1 0 0 1 .576-.575a1 1 0 0 1 .305-.06C11.019 0 11.115 0 11.213 0h2.5c.126 0 .249 0 .353.008c.114.01.249.032.385.101c.188.096.34.25.437.437c.07.136.091.271.1.385c.008.104.008.227.008.353v7.72c0 3.87-3.13 7-7 7s-7-3.13-7-7v-7.72c0-.126 0-.249.009-.353c.01-.114.031-.249.1-.385c.097-.188.25-.34.438-.437c.136-.069.27-.09.385-.1C2.032 0 2.155 0 2.28 0m-.278 1.01v.007a4 4 0 0 0-.006.288v2.7h3v-2.77c0-.115 0-.178-.003-.224v-.007h-.007A4 4 0 0 0 4.762 1h-2.47c-.148 0-.229 0-.288.005h-.006zM1.996 9V5h3v4c0 1.66 1.34 3 3 3s3-1.34 3-3V5h3v4c0 3.31-2.69 6-6 6s-6-2.69-6-6m12-5V1.3c0-.148 0-.229-.005-.288v-.007h-.007A4 4 0 0 0 13.696 1h-2.47c-.115 0-.178 0-.224.003h-.006v.006a4 4 0 0 0-.004.224v2.77h3z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M2 7.5A1.5 1.5 0 0 1 3.5 6h9A1.5 1.5 0 0 1 14 7.5v1a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 8.5zM3.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M4 2.5a.5.5 0 0 0-1 0V4C1.34 4 0 5.34 0 7v2c0 1.66 1.34 3 3 3v1.5a.5.5 0 0 0 1 0V12h2v1.5a.5.5 0 0 0 1 0V12h2v1.5a.5.5 0 0 0 1 0V12h2v1.5a.5.5 0 0 0 1 0V12c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3V2.5a.5.5 0 0 0-1 0V4h-2V2.5a.5.5 0 0 0-1 0V4H7V2.5a.5.5 0 0 0-1 0V4H4zM3 5c-1.1 0-2 .895-2 2v2c0 1.1.895 2 2 2h10c1.1 0 2-.895 2-2V7c0-1.1-.895-2-2-2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M9 3a.999.999 0 0 0-1.582-.814l-2.54 1.81h-2.38a2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 0 2.5 2.5h2.38l2.54 1.81A1.001 1.001 0 0 0 9 12.993v-10zM2.5 5h2.38a1 1 0 0 0 .581-.186l2.54-1.81v10l-2.54-1.81a1 1 0 0 0-.581-.186H2.5a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5z" clip-rule="evenodd"/><path fill="currentColor" d="M11.5 2.34a.5.5 0 0 1 .663-.246a6.51 6.51 0 0 1 3.79 5.91c0 1.24-.356 2.46-1.03 3.51a6.5 6.5 0 0 1-2.76 2.4a.5.5 0 1 1-.417-.909a5.4 5.4 0 0 0 2.33-2.03a5.51 5.51 0 0 0-.002-5.94a5.5 5.5 0 0 0-2.34-2.03a.5.5 0 0 1-.246-.663z"/><path fill="currentColor" d="M10.6 5.15a.5.5 0 0 1 .683-.183a3.498 3.498 0 0 1 .003 6.06a.5.5 0 0 1-.501-.865a2.5 2.5 0 0 0 1.247-2.165a2.5 2.5 0 0 0-1.251-2.164a.5.5 0 0 1-.183-.683z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="m2.56 3.42l-1.55 9c-.045.263.165.577.546.577h11.3a.54.54 0 0 0 .546-.423l1.55-9c.045-.263-.165-.577-.546-.577h-11.3a.54.54 0 0 0-.546.423M.02 12.25C-.138 13.164.592 14 1.55 14h11.3c.759 0 1.41-.53 1.53-1.25l1.55-9C16.088 2.836 15.358 2 14.4 2H3.1c-.759 0-1.41.53-1.53 1.25z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="m7 11l.167-1h5L12 11zM5.09 4.53a.746.746 0 0 0-1.05-.117a.746.746 0 0 0-.117 1.05l1.54 1.93l-2.44 2.03a.754.754 0 0 0-.096 1.06a.754.754 0 0 0 1.06.096l3-2.5a.745.745 0 0 0 .106-1.04l-2-2.5z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M11.5 1a2.5 2.5 0 0 1 2.385 1.756l1.76 6.14q.134.428.212.866q.107.352.109.738v1c0 .663-.263 1.3-.732 1.77c-.469.469-1.1.732-1.77.732h-11c-.663 0-1.3-.263-1.77-.732a2.5 2.5 0 0 1-.732-1.77v-1c0-.25.037-.499.11-.738a7 7 0 0 1 .211-.866l1.76-6.14A2.5 2.5 0 0 1 4.428 1h7.06zm1.97 8h-11a1.495 1.495 0 0 0-1.418 1.01A6 6 0 0 0 .97 11v.5a1.5 1.5 0 0 0 1.499 1.499h11a1.5 1.5 0 0 0 1.499-1.499V11q0-.499-.081-.99A1.5 1.5 0 0 0 13.468 9zm-.5 1a.997.997 0 0 1 1 1a.997.997 0 0 1-1 1a.997.997 0 0 1-1-1a.997.997 0 0 1 1-1M11.5 2H4.44a1.5 1.5 0 0 0-1.43 1.053l-1.44 5.12c.28-.11.584-.169.904-.169h11c.319 0 .624.06.904.169l-1.44-5.12A1.495 1.495 0 0 0 11.507 2z" clip-rule="evenodd"/></svg>',
      ],
    ],
    [
      "image",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M8 5C6.34 5 5 6.34 5 8s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3M6 8a2 2 0 1 1 4.001-.001A2 2 0 0 1 6 8" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M5.6 1.2A.5.5 0 0 1 6 1h4.5a.5.5 0 0 1 .4.2L12.25 3h1.25A2.5 2.5 0 0 1 16 5.5v6a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 11.5v-6A2.5 2.5 0 0 1 2.5 3h1.75zm.65.8L4.9 3.8a.5.5 0 0 1-.4.2h-2A1.5 1.5 0 0 0 1 5.5v6A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 13.5 4H12a.5.5 0 0 1-.4-.2L10.25 2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M4 1C2.34 1 1 2.34 1 4v7c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zM2 7V5h2v2zm0-3h2V2c-1.1 0-2 .895-2 2m3-2h6v5H5zm7 2V2c1.1 0 2 .895 2 2zm0 1h2v2h-2zm0 3h2v2h-2zm0 3h2c0 1.1-.895 2-2 2zm-1 2H5V8h6zm-7-2v2c-1.1 0-2-.895-2-2zm0-1H2V8h2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M8 9c1.66 0 3-1.34 3-3S9.66 3 8 3S5 4.34 5 6s1.34 3 3 3m0-1a2 2 0 1 0 .001-4.001A2 2 0 0 0 8 8" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M10 11h1.2c1.68 0 2.52 0 3.16-.327a3.02 3.02 0 0 0 1.31-1.31c.327-.642.327-1.48.327-3.16v-.4c0-1.68 0-2.52-.327-3.16a3 3 0 0 0-1.31-1.31c-.642-.327-1.48-.327-3.16-.327H4.8c-1.68 0-2.52 0-3.16.327a3.02 3.02 0 0 0-1.31 1.31c-.327.642-.327 1.48-.327 3.16v.4c0 1.68 0 2.52.327 3.16a3.02 3.02 0 0 0 1.31 1.31C2.282 11 3.12 11 4.8 11H6v3H2.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1H10zm1.2-9H4.8c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C1 4.36.999 4.94.999 5.8v.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18C3.36 10 3.94 10 4.8 10h6.4c.857 0 1.44 0 1.89-.037c.438-.036.663-.101.819-.18c.376-.192.682-.498.874-.874c.08-.156.145-.381.18-.82c.037-.45.038-1.03.038-1.89v-.4c0-.856-.001-1.44-.038-1.89c-.036-.437-.101-.662-.18-.818a2 2 0 0 0-.874-.874c-.156-.08-.381-.145-.819-.18C12.64 2 12.06 2 11.2 2M9 11H7v3h2z" clip-rule="evenodd"/></svg>',
      ],
    ],
    [
      "info",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="m14.9 11.1l-.062-.07a4 4 0 0 1-.201-.255l-.16-.233a7 7 0 0 1-.48-.865c-.47-1-.952-2.55-.952-4.72a4.97 4.97 0 0 0-1.43-3.49a5 5 0 0 0-3.46-1.5a4.97 4.97 0 0 0-3.52 1.35a5 5 0 0 0-1.58 3.43l-.005.217c0 2.17-.482 3.73-.952 4.72c-.236.5-.47.864-.64 1.1l-.06.082l-.171.208l-.032.035a.5.5 0 0 0 .354.852h13a.498.498 0 0 0 .354-.852zM4 5.36l.005-.404c0-1.06.421-2.08 1.17-2.83a4.004 4.004 0 0 1 5.66 0c.75.75 1.17 1.77 1.17 2.83c0 2.33.518 4.02 1.05 5.15c.157.334.314.617.46.85h-11a9 9 0 0 0 .46-.85c.498-1.06.987-2.62 1.04-4.75zm6.4 9.4a.497.497 0 0 0-.1-.7a.5.5 0 0 0-.7.1a1.995 1.995 0 0 1-2.495.589a2 2 0 0 1-.705-.59a.501.501 0 0 0-.895.23a.5.5 0 0 0 .095.37a3 3 0 0 0 2.4 1.2a3 3 0 0 0 2.4-1.2z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8 3.5a.5.5 0 0 0-1 0V8a.5.5 0 0 0 .276.447l3 1.5a.5.5 0 0 0 .447-.895l-2.72-1.36v-4.19z"/><path fill="currentColor" fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8M1 8c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7s-7-3.13-7-7" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Ultimate free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M.75.75v22.5h22.5"/><path d="M14.15 17.358a5.5 5.5 0 0 0 1.487 1.623l.713.519m-12.6 0l.713-.519A5.39 5.39 0 0 0 6.7 14.939l.4-6.979a2.92 2.92 0 0 1 2.95-2.71h.137"/><path d="m9.15 19.5l.713-.519a5.39 5.39 0 0 0 2.237-4.042l.4-6.979a2.92 2.92 0 0 1 2.95-2.71a2.92 2.92 0 0 1 2.955 2.71l.4 6.979a5.39 5.39 0 0 0 2.232 4.042l.713.519"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8 7a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 7m0-1a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" fill-rule="evenodd" d="M8 16c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-1c3.87 0 7-3.13 7-7s-3.13-7-7-7s-7 3.13-7 7s3.13 7 7 7" clip-rule="evenodd"/></svg>',
      ],
    ],
    [
      "network",
      [
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from\r
    Huge Icons by Hugeicons - undefined -->\r
    <g fill="none" stroke="currentColor" stroke-width="1.5">\r
        <path stroke-linecap="round" d="M12 11v9" />\r
        <path d="M14 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z" />\r
        <path stroke-linecap="round" stroke-linejoin="round"\r
            d="M16.959 6C17.619 6.87 18 7.898 18 9s-.381 2.13-1.041 3M7.04 6C6.381 6.87 6 7.898 6 9s.381 2.13 1.041 3m13.275-8C21.38 5.43 22 7.15 22 9s-.62 3.57-1.684 5M3.684 4C2.62 5.43 2 7.15 2 9s.62 3.57 1.684 5" />\r
    </g>\r
</svg>`,
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M0 6c0-3.31 2.69-6 6-6c2.62 0 4.84 1.68 5.66 4.01q.166-.014.337-.014c2.21 0 4 1.79 4 4c0 1.63-.97 3.03-2.36 3.65c-.312.14-.636-.11-.636-.452c0-.222.142-.415.34-.514a2.999 2.999 0 0 0-1.931-5.622a.5.5 0 0 1-.581-.36a5.002 5.002 0 1 0-8.942 4.15a.6.6 0 0 1 .112.346c0 .495-.566.732-.857.332a5.97 5.97 0 0 1-1.14-3.52z"/><path fill="currentColor" d="M5 15.5V8.71L3.85 9.86a.5.5 0 0 1-.707-.707l2-2a.5.5 0 0 1 .35-.147h.006a.5.5 0 0 1 .351.146l2 2a.5.5 0 0 1-.707.707l-1.15-1.15v6.79a.5.5 0 0 1-1 0zM10.5 7a.5.5 0 0 1 .5.5v6.79l1.15-1.15a.5.5 0 0 1 .707.707l-2 2a.5.5 0 0 1-.351.146H10.5a.5.5 0 0 1-.35-.147l-2-2a.5.5 0 0 1 .707-.707l1.15 1.15V7.5a.5.5 0 0 1 .5-.5z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8 0c2.12 0 4.16.843 5.66 2.34C15.16 3.84 16 5.88 16 8a8.02 8.02 0 0 1-2.34 5.66A8 8 0 0 1 8 16a8.02 8.02 0 0 1-5.66-2.34A8 8 0 0 1 0 8c0-2.12.843-4.16 2.34-5.66C3.84.84 5.88 0 8 0m1.76 11H6.23l.05.305c.119.655.266 1.24.43 1.75l.127.365c.365.988.792 1.58 1.16 1.58s.792-.59 1.16-1.58l.126-.365q.274-.863.43-1.75l.05-.305zm-4.54 0H1.68a7.14 7.14 0 0 0 1.94 2.46a7.1 7.1 0 0 0 2.82 1.37c-.531-.868-.953-2.16-1.2-3.71l-.017-.114zm9.11 0h-3.55l-.016.114c-.245 1.54-.667 2.84-1.2 3.71a7 7 0 0 0 2.82-1.37a6.9 6.9 0 0 0 1.94-2.46v-.001zM5.1 6H1.3a7 7 0 0 0-.29 2c0 .695.101 1.37.29 2l3.8-.001l-.038-.459Q4.932 7.77 5.1 6m4.8 0H6.11a19.4 19.4 0 0 0 0 4H9.9c.138-1.33.138-2.67 0-4m4.81 0h-3.8l.04.459q.129 1.77-.04 3.54h3.8a7 7 0 0 0 0-4zM6.43 1.18l-.071.018a7.1 7.1 0 0 0-2.78 1.37a6.9 6.9 0 0 0-1.91 2.43h3.55l.017-.114c.245-1.54.667-2.84 1.2-3.71l-.001-.001zM8 1.005c-.365 0-.792.59-1.16 1.58l-.126.365a14 14 0 0 0-.43 1.75l-.051.305h3.53l-.05-.305a13 13 0 0 0-.43-1.75l-.126-.365c-.341-.922-.736-1.5-1.08-1.57l-.074-.007zm1.57.176l.065.108c.5.866.898 2.12 1.13 3.6l.016.114h3.55a7.14 7.14 0 0 0-1.94-2.46a7.1 7.1 0 0 0-2.82-1.37z"/></svg>',
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">\r
<path     stroke-width="1" fill="currentColor" d="M17 17h5.142a4 4 0 1 0 0-2H17V7h5.142a4 4 0 1 0 0-2H17a2 2 0 0 0-2 2v8H9.858a4 4 0 1 0 0 2H15v8a2 2 0 0 0 2 2h5.142a4 4 0 1 0 0-2H17Zm9-3a2 2 0 1 1-2 2a2 2 0 0 1 2-2m0-10a2 2 0 1 1-2 2a2 2 0 0 1 2-2M6 18a2 2 0 1 1 2-2a2 2 0 0 1-2 2m20 6a2 2 0 1 1-2 2a2 2 0 0 1 2-2"/></svg>`,
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M13 7.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 1 0zM10.5 7a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5m-7.42.62c-.076.184-.076.417-.076.883s0 .699.076.883c.101.245.296.44.541.541c.184.076.417.076.883.076h2c.466 0 .699 0 .883-.076a1 1 0 0 0 .541-.541c.076-.184.076-.417.076-.883s0-.699-.076-.883a1 1 0 0 0-.541-.541c-.184-.076-.417-.076-.883-.076h-2c-.466 0-.699 0-.883.076a1 1 0 0 0-.541.541"/><path fill="currentColor" fill-rule="evenodd" d="M12.9.223a.5.5 0 0 1-.139.693l-4.63 3.08h3.05c1.68 0 2.52 0 3.16.327a3.02 3.02 0 0 1 1.31 1.31c.327.642.327 1.48.327 3.16v1.4c0 1.68 0 2.52-.327 3.16a3 3 0 0 1-1.31 1.31c-.642.327-1.48.327-3.16.327h-6.4c-1.68 0-2.52 0-3.16-.327a3 3 0 0 1-1.31-1.31c-.327-.642-.327-1.48-.327-3.16v-1.4c0-1.68 0-2.52.327-3.16a3.02 3.02 0 0 1 1.31-1.31c.642-.327 1.48-.327 3.16-.327h1.55l5.87-3.92a.5.5 0 0 1 .693.139zm-8.12 4.78c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819c-.037.45-.038 1.03-.038 1.89v1.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18c.45.036 1.03.037 1.89.037h6.4c.857 0 1.44 0 1.89-.037c.438-.036.663-.101.819-.18c.376-.192.682-.498.874-.874c.08-.156.145-.381.18-.82c.037-.45.038-1.03.038-1.89v-1.4c0-.856-.001-1.44-.038-1.89c-.036-.437-.101-.662-.18-.818a2 2 0 0 0-.874-.874c-.156-.08-.381-.145-.819-.18c-.45-.037-1.03-.038-1.89-.038z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M15 3a2.996 2.996 0 0 1-5.34 1.87L5.83 7c.111.313.171.649.171 1s-.06.687-.171 1l3.83 2.13A2.996 2.996 0 0 1 15 13c0 1.66-1.34 3-3 3a2.996 2.996 0 0 1-2.829-4l-3.83-2.13A2.996 2.996 0 0 1 .001 8a2.996 2.996 0 0 1 5.34-1.87L9.171 4A2.996 2.996 0 0 1 12 0c1.66 0 3 1.34 3 3m-1 0a2 2 0 1 1-4.001.001A2 2 0 0 1 14 3M5 8a2 2 0 1 1-4.001.001A2 2 0 0 1 5 8m7 7a2 2 0 1 0 .001-4.001A2 2 0 0 0 12 15" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M.9 6.55C2.52 4.39 5.1 3 8 3s5.48 1.39 7.1 3.55a.5.5 0 0 0 .8-.6A9.85 9.85 0 0 0 8 2C4.77 2 1.9 3.55.1 5.95a.5.5 0 0 0 .799.6z"/><path fill="currentColor" d="M2.9 8.55A6.36 6.36 0 0 1 8 6c2.09 0 3.94 1 5.1 2.55a.5.5 0 0 0 .8-.6A7.36 7.36 0 0 0 8 5C5.59 5 3.44 6.16 2.1 7.95a.5.5 0 0 0 .799.6z"/><path fill="currentColor" d="M8 9c-1.27 0-2.39.608-3.1 1.55a.5.5 0 0 1-.8-.6A4.87 4.87 0 0 1 8 8c1.6 0 3.01.767 3.9 1.95a.5.5 0 0 1-.799.6A3.87 3.87 0 0 0 8.001 9zm0 5a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/></svg>',
      ],
    ],
    [
      "power",
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M15.8.195a.664.664 0 0 0-.94 0l-.293.293a.25.25 0 0 0 0 .354l.587.587a.25.25 0 0 0 .354 0l.293-.293c.26-.26.26-.68 0-.94zM13.3 1.78a.25.25 0 0 1 .354 0l.587.587a.25.25 0 0 1 0 .354l-.587.587a.25.25 0 0 1-.354 0l-.586-.587a.25.25 0 0 1 0-.354zm-1.5 1.88a.25.25 0 0 0-.354 0l-1.53 1.53a.25.25 0 0 0 0 .354l.587.587a.25.25 0 0 0 .354 0l1.53-1.53a.25.25 0 0 0 0-.354zM8.52 6.07a.994.994 0 0 0-1.41 0L3.59 9.59a1.994 1.994 0 1 0 2.82 2.82l3.52-3.52a.994.994 0 0 0 0-1.41zM2.78 13.9a.5.5 0 1 0-.554-.832c-1.31.874-.692 2.92.883 2.92h8.39a.5.5 0 0 0 0-1h-8.39c-.585 0-.815-.759-.328-1.08z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Ultimate free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M12 17.25a6 6 0 0 1-6-6v-4.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v4.5a6 6 0 0 1-6 6"/><path d="M9 16.447v2.3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-2.3M9 5.25V.75m6 4.5V.75m-3 19.5v3"/></g></svg>',
      ],
    ],
    [
      "settings",
      [
        `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"\r
>\r
  <path\r
    fill="currentColor"\r
    fill-rule="evenodd"\r
    d="M5.85.146a.5.5 0 0 0-.707.707l.628.628a5.38 5.38 0 0 0-2.64 2.62l-1.33-.999a.5.5 0 1 0-.6.8l1.58 1.19a5.4 5.4 0 0 0-.141.899l-.144 2.01h-2a.5.5 0 0 0 0 1h1.93l-.001.015c-.08 1.13.18 2.2.69 3.12l-1.84.921a.5.5 0 0 0 .448.895l1.96-.982c1.02 1.24 2.57 2.03 4.31 2.03s3.29-.796 4.31-2.03l1.96.982a.5.5 0 1 0 .447-.895l-1.84-.92c.51-.916.77-1.99.69-3.12V9h1.93a.5.5 0 0 0 0-1h-2l-.144-2.01a5.4 5.4 0 0 0-.141-.899l1.58-1.19a.5.5 0 1 0-.6-.8l-1.33.999a5.4 5.4 0 0 0-2.64-2.62l.628-.628a.5.5 0 0 0-.707-.707l-.981.981Q8.59 1.001 7.985 1c-.606-.001-.79.044-1.17.127L5.834.146zm6.51 5.91l.216 3.03a4.58 4.58 0 0 1-4.58 4.91c-2.66 0-4.76-2.26-4.58-4.91l.216-3.03q.01-.145.03-.288c.191.13.434.279.73.427c.811.406 2.01.803 3.6.803s2.79-.397 3.6-.803c.296-.148.54-.297.73-.427q.02.143.03.288zm-.307-1.33a4.37 4.37 0 0 0-8.1 0q.053.044.133.104c.166.125.422.296.767.468c.689.344 1.74.697 3.15.697s2.46-.353 3.15-.697a5 5 0 0 0 .9-.572"\r
    clip-rule="evenodd"\r
  />\r
</svg>`,
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8.39 1c.699 0 1.4.2 2 .7l2.1 1.8c.1.1.1.3 0 .4s-.1.3 0 .4l.51.45c.098.094.259.08.388-.05c.158-.158.2-.173.399 0l1 .911c.185.181.196.289.096.389l-1.6 1.9c-.11.139-.27.198-.4.1l-.897-.8c-.1-.1-.088-.276 0-.4s.107-.304 0-.4l-.522-.431c-.156-.121-.226-.148-.45.031c-.15.121-.251.105-.351.031c-.1-.073-.086-.062-.195-.152c-.135-.11-.238-.132-.38.021l-2.6 3.2c.3.2.3.6.1.9l-3.79 4.5c-.398.3-.798.5-1.2.5s-.698-.1-.997-.4c-.7-.6-.7-1.5-.2-2.2l3.79-4.5c.1-.1.299-.2.499-.2c.1 0 .299 0 .399.1l2.2-2.6c.399-.4.25-.9-.15-1.3l-.23-.215C7.412 3.185 6.69 3 5.89 3h-.398c-.1 0-.154-.12-.1-.2l.599-.7c.599-.7 1.5-1.1 2.4-1.1zm0-1c-1.2 0-2.4.5-3.09 1.5l-.599.7c-.299.3-.399.8-.2 1.2c.2.4.599.6.998.6h.499c.499 0 .998.2 1.3.5l.2.2l-1.8 2h-.1q-.748 0-1.2.6l-3.79 4.5c-.898 1.1-.799 2.7.3 3.6c.498.4.997.6 1.7.6c.798 0 1.5-.3 1.9-.9l3.79-4.5c.298-.4.398-.9.298-1.4l1.9-2.2c.105-.119.3-.113.3 0c0 .3.2.7.5.9l.897.8q.45.3.898.3c.4 0 .8-.2.998-.5l1.6-1.9c.5-.5.33-1.32-.2-1.8l-.898-.8q-.3-.3-.898-.3h-.1c0-.3-.2-.7-.499-.9l-2.1-1.8c-.699-.7-1.6-1-2.6-1z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" d="M8.2 1H4.8c-.857 0-1.44 0-1.89.038c-.438.035-.663.1-.819.18a2 2 0 0 0-.874.874c-.08.156-.145.38-.18.819C1 3.36.999 3.94.999 4.8v5.4c0 .857.001 1.44.038 1.89c.036.438.101.663.18.819c.192.376.498.682.874.874c.156.08.381.145.819.18c.25.02.54.03.895.034c.13.36.328.702.596 1c-1.42-.002-2.17-.027-2.76-.327a3 3 0 0 1-1.31-1.31c-.327-.642-.327-1.48-.327-3.16V4.8c0-1.68 0-2.52.327-3.16A3.02 3.02 0 0 1 1.641.33c.642-.327 1.48-.327 3.16-.327h3.4c1.68 0 2.52 0 3.16.327a3.02 3.02 0 0 1 1.31 1.31c.24.47.304 1.05.321 1.99a3 3 0 0 0-.359.015a3.1 3.1 0 0 0-.664-.607l-.009-.12c-.036-.438-.1-.663-.18-.82a2 2 0 0 0-.874-.873c-.156-.08-.38-.145-.819-.18c-.45-.037-1.03-.038-1.89-.038z"/><path fill="currentColor" d="M8.07 3H2.5a.5.5 0 0 0 0 1h3.07a3.1 3.1 0 0 1 1.8-.362c.202-.247.441-.463.71-.638zM2.5 6h1.31a3 3 0 0 0-.183 1h-1.12a.5.5 0 0 1 0-1zm.09 3h-.094a.5.5 0 0 0 0 1v-.238q0-.395.094-.762"/><path fill="currentColor" fill-rule="evenodd" d="M10 12c1.1 0 2-.895 2-2c0-1.1-.895-2-2-2c-1.1 0-2 .895-2 2c0 1.1.895 2 2 2m0-1a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M10.2 4h-.474c-.79 0-1.45.575-1.57 1.33a5 5 0 0 0-.211.087a1.59 1.59 0 0 0-2.05.173l-.337.337a1.594 1.594 0 0 0-.173 2.05q-.046.105-.087.211a1.596 1.596 0 0 0-1.33 1.57v.474c0 .793.577 1.45 1.33 1.58q.04.104.085.206a1.6 1.6 0 0 0 .171 2.06l.33.33c.562.562 1.44.62 2.07.168q.098.045.198.083a1.6 1.6 0 0 0 1.58 1.34h.458c.8 0 1.46-.584 1.59-1.35q.098-.039.194-.081c.628.454 1.51.398 2.08-.167l.321-.321c.565-.565.621-1.45.167-2.08q.043-.097.081-.194a1.61 1.61 0 0 0 1.35-1.59v-.458c0-.797-.581-1.46-1.34-1.58a5 5 0 0 0-.082-.2c.45-.625.394-1.5-.17-2.07l-.328-.328a1.6 1.6 0 0 0-2.06-.171a5 5 0 0 0-.206-.086a1.596 1.596 0 0 0-1.58-1.33zM9.13 5.6c0-.329.266-.595.595-.595h.474c.33 0 .598.268.598.598c0 .282.199.521.466.613q.236.081.458.191c.254.125.566.097.766-.103a.6.6 0 0 1 .847 0l.329.329a.603.603 0 0 1 0 .852c-.201.201-.23.513-.106.768q.105.217.184.447c.093.27.334.472.619.472c.333 0 .603.27.603.603v.458a.606.606 0 0 1-.606.606c-.286 0-.528.202-.622.471q-.078.226-.182.439c-.125.257-.097.572.106.774a.605.605 0 0 1 0 .857l-.321.321a.605.605 0 0 1-.857 0c-.202-.202-.517-.231-.774-.106q-.213.104-.439.182c-.27.094-.472.336-.472.622a.606.606 0 0 1-.606.606h-.458a.603.603 0 0 1-.603-.603c0-.285-.202-.527-.472-.619a4 4 0 0 1-.447-.184c-.255-.124-.567-.095-.768.105a.603.603 0 0 1-.852 0l-.329-.329a.6.6 0 0 1 0-.847c.2-.2.228-.512.103-.766a4 4 0 0 1-.191-.458c-.092-.267-.331-.466-.613-.466a.6.6 0 0 1-.598-.598v-.474c0-.329.266-.595.595-.595c.282 0 .52-.199.611-.466a4 4 0 0 1 .193-.466c.124-.252.096-.561-.103-.76a.596.596 0 0 1 0-.842l.337-.337a.596.596 0 0 1 .842 0c.199.199.508.227.76.103q.225-.11.466-.193c.267-.09.466-.329.466-.611z" clip-rule="evenodd"/></svg>',
        `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"\r
  ><path\r
    fill="currentColor"\r
    d="M3 5.75A2.75 2.75 0 0 1 5.75 3h9.965a3.25 3.25 0 0 1 2.298.952l2.035 2.035c.61.61.952 1.437.952 2.299v9.964A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zM5.75 4.5c-.69 0-1.25.56-1.25 1.25v12.5c0 .69.56 1.25 1.25 1.25H6v-5.25A2.25 2.25 0 0 1 8.25 12h7.5A2.25 2.25 0 0 1 18 14.25v5.25h.25c.69 0 1.25-.56 1.25-1.25V8.286c0-.465-.184-.91-.513-1.238l-2.035-2.035a1.75 1.75 0 0 0-.952-.49V7.25a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 7 7.25V4.5zm10.75 15v-5.25a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0-.75.75v5.25zm-8-15v2.75c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75V4.5z"\r
  /></svg\r
>\r
`,
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M8 5C6.34 5 5 6.34 5 8s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3M6 8a2 2 0 1 1 4.001-.001A2 2 0 0 1 6 8" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M8 0C6.9 0 6 .895 6 2v.068a.46.46 0 0 1-.285.423a.45.45 0 0 1-.492-.096a1.924 1.924 0 0 0-2.72 0l-.109.11a1.924 1.924 0 0 0 0 2.72a.45.45 0 0 1 .096.491a.46.46 0 0 1-.424.285h-.068a2 2 0 1 0 0 4h.068c.183 0 .352.112.424.285a.45.45 0 0 1-.096.492a1.924 1.924 0 0 0 0 2.72l.109.11c.751.75 1.97.75 2.72 0a.45.45 0 0 1 .492-.097c.172.072.285.24.285.424v.068a2 2 0 1 0 4 0v-.068c0-.183.112-.352.285-.424a.45.45 0 0 1 .492.096c.751.751 1.97.751 2.72 0l.109-.109a1.924 1.924 0 0 0 0-2.72a.45.45 0 0 1-.096-.492a.46.46 0 0 1 .424-.285H14a2 2 0 1 0 0-4h-.067a.46.46 0 0 1-.424-.285a.45.45 0 0 1 .096-.492a1.924 1.924 0 0 0 0-2.72l-.109-.109a1.924 1.924 0 0 0-2.72 0a.45.45 0 0 1-.492.096a.46.46 0 0 1-.285-.424V2c0-1.1-.895-2-2-2M7 2a1 1 0 0 1 2 0v.068c0 .59.359 1.12.902 1.35c.54.223 1.17.102 1.58-.314a.917.917 0 0 1 1.3 0l.109.11a.93.93 0 0 1 0 1.31a1.45 1.45 0 0 0-.313 1.58c.225.543.756.902 1.35.902h.067a1 1 0 0 1 0 2h-.067a1.47 1.47 0 0 0-1.35.902c-.224.54-.103 1.17.313 1.58c.36.36.36.945 0 1.3l-.109.109a.917.917 0 0 1-1.3 0a1.45 1.45 0 0 0-1.58-.313A1.46 1.46 0 0 0 9 13.934V14a1 1 0 0 1-2 0v-.067a1.47 1.47 0 0 0-.902-1.35a1.45 1.45 0 0 0-1.58.313a.917.917 0 0 1-1.3 0l-.109-.11a.93.93 0 0 1 0-1.31a1.45 1.45 0 0 0 .313-1.58a1.46 1.46 0 0 0-1.35-.901h-.068a1 1 0 0 1 0-2h.068a1.47 1.47 0 0 0 1.35-.902c.224-.54.103-1.17-.313-1.58a.917.917 0 0 1 0-1.3l.109-.11a.93.93 0 0 1 1.31 0a1.45 1.45 0 0 0 1.58.314c.543-.225.902-.756.902-1.35V2z" clip-rule="evenodd"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Qlementine Icons by Olivier Cléro - https://github.com/oclero/qlementine-icons/blob/master/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M15.1 3.12a1 1 0 0 1 .706.71c.452 1.71.032 3.62-1.32 4.97a5.14 5.14 0 0 1-4.87 1.36a.34.34 0 0 0-.148-.006l-.025.008l-5.08 5.08a2.563 2.563 0 0 1-3.62 0a2.563 2.563 0 0 1 0-3.62l5.08-5.08l.008-.025a.34.34 0 0 0-.006-.148a5.16 5.16 0 0 1 1.366-4.88a5.11 5.11 0 0 1 4.97-1.32a1 1 0 0 1 .452 1.674l-2.1 2.1l.383 1.15l1.15.383l2.1-2.1a1 1 0 0 1 .968-.258zM5.81 6.55l.001-.002zm3.62 3.62l.002-.001zm4.34-2.07a4.16 4.16 0 0 1-3.93 1.1c-.396-.096-.827-.023-1.12.265l-5.08 5.08c-.607.608-1.6.608-2.21 0a1.57 1.57 0 0 1 0-2.21l5.08-5.08c.288-.288.361-.721.265-1.12a4.2 4.2 0 0 1-.043-1.78a4.2 4.2 0 0 1 1.14-2.15c.76-.76 1.74-1.16 2.73-1.2a4.3 4.3 0 0 1 1.28.137l-2.1 2.1a1 1 0 0 0-.242 1.02l.383 1.15c.1.299.334.533.632.632l1.15.383a.99.99 0 0 0 1.02-.242l2.1-2.1c.11.418.156.849.137 1.28a4.1 4.1 0 0 1-1.2 2.73z" clip-rule="evenodd"/></svg>',
      ],
    ],
  ]
var _a = Xe(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M5.47 5.47a.75.75 0 0 1 1.06 0l12 12a.75.75 0 1 1-1.06 1.06l-12-12a.75.75 0 0 1 0-1.06"></path><path d="M18.53 5.47a.75.75 0 0 1 0 1.06l-12 12a.75.75 0 0 1-1.06-1.06l12-12a.75.75 0 0 1 1.06 0"></path></g></svg>',
)
function it(e) {
  var t = _a()
  N(e, t)
}
var ka = j('<div class="flex flex-row-reverse justify-between bg-(--field-color) p-1.5"><!></div>'),
  Ca = j(
    '<div class="fixed inset-0 z-60 flex items-center justify-center bg-black/50"><div><div class="flex items-end justify-between bg-(--field-color) px-6 py-3"><h4> </h4> <button class="h-6 w-6 cursor-pointer"><!></button></div> <div class="flex h-full w-full flex-col overflow-auto p-2"><!></div> <!></div></div>',
  )
function ir(e, t) {
  Oe(t, !0)
  let o = H(t, "isOpen", 15, !1),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "onCancel", 3, () => o(!1))
  const c = (C) => {
    C.key === "Escape" && (o(!1), u()())
  }
  Qt(() => (document.addEventListener("keydown", c), () => document.removeEventListener("keydown", c)))
  var l = ke(),
    r = ve(l)
  {
    var d = (C) => {
      var k = Ca(),
        A = M(k),
        R = M(A),
        z = M(R),
        g = M(z, !0)
      _(z)
      var w = q(z, 2)
      w.__click = function (...T) {
        u()?.apply(this, T)
      }
      var O = M(w)
      ;(it(O), _(w), _(R))
      var L = q(R, 2),
        U = M(L)
      ;(Rt(U, () => t.main ?? De), _(L))
      var Z = q(L, 2)
      {
        var ee = (T) => {
          var v = ka(),
            f = M(v)
          ;(Rt(f, () => t.footer ?? De), _(v), N(T, v))
        }
        J(Z, (T) => {
          t.footer && T(ee)
        })
      }
      ;(_(A),
        _(k),
        X(
          (T) => {
            ;(K(A, 1, T), ce(g, t.title))
          },
          [() => fe(de("flex w-300 flex-col overflow-hidden rounded-2xl bg-(--back-color) text-center", a()))],
        ),
        Ee(
          3,
          A,
          () => Po,
          () => ({ duration: 250, start: 0.8 }),
        ),
        Ee(
          3,
          k,
          () => Lo,
          () => ({ duration: 200 }),
        ),
        N(C, k))
    }
    J(r, (C) => {
      o() && C(d)
    })
  }
  ;(N(e, l), Te())
}
Le(["click"])
var Ma = j("<span><!></span>"),
  Ia = j('<div class="text-xs opacity-70"> </div>'),
  za = j('<div class="flex-1"> <!></div>'),
  Na = j(
    '<div class="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg" style="transform: translateX(-50%);"> <div class="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-(--container-color)"></div></div>',
  ),
  Ea = j(
    '<div class="absolute top-full left-1/2 z-50 mt-2 w-max max-w-xs rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg" style="transform: translateX(-50%);"> <div class="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 transform bg-(--container-color)"></div></div>',
  ),
  Sa = j(
    '<div class="absolute top-1/2 right-full z-50 mr-2 w-max max-w-xs rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg" style="transform: translateY(-50%);"> <div class="absolute top-1/2 -right-2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-(--container-color)"></div></div>',
  ),
  Aa = j(
    '<div class="absolute top-1/2 left-full z-50 ml-2 w-max max-w-xs rounded-md bg-(--container-color) px-3 py-1 text-sm shadow-lg" style="transform: translateY(-50%);"> <div class="absolute top-1/2 -left-2 h-2 w-2 translate-x-1/2 -translate-y-1/2 -rotate-45 transform bg-(--container-color)"></div></div>',
  ),
  Oa = j(
    '<div><div class="relative flex w-full grow items-center"><button><span class=" flex flex-row items-center justify-center gap-2"><!> <!></span></button> <!></div></div>',
  )
function Ze(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "componentClass", 3, ""),
    c = H(t, "disabled", 3, !1),
    l = H(t, "content", 19, () => ({ name: "", info: { text: "", side: "top" }, icon: null })),
    r = Ce(!1)
  const d = ne(() => () => {
      const v = de(
          a()
            .split(" ")
            .find((I) => I.startsWith("w-")),
          u()
            .split(" ")
            .find((I) => I.startsWith("w-")),
        ),
        f = de(
          a()
            .split(" ")
            .find((I) => I.startsWith("h-")),
          u()
            .split(" ")
            .find((I) => I.startsWith("h-")),
        )
      return `${v} ${f}`
    }),
    C = () => {
      c() || !t.onClick || t.onClick()
    },
    k = (v) => {
      if (c() || !t.keyBind || !t.onClick) return
      const f = v.key === t.keyBind.key,
        I = t.keyBind.ctrlKey === void 0 || v.ctrlKey === t.keyBind.ctrlKey,
        $ = t.keyBind.shiftKey === void 0 || v.shiftKey === t.keyBind.shiftKey,
        Q = t.keyBind.altKey === void 0 || v.altKey === t.keyBind.altKey,
        S = t.keyBind.metaKey === void 0 || v.metaKey === t.keyBind.metaKey
      f && I && $ && Q && S && (v.preventDefault(), t.onClick())
    }
  Qt(
    () => (
      t.keyBind && window.addEventListener("keydown", k),
      () => {
        t.keyBind && window.removeEventListener("keydown", k)
      }
    ),
  )
  var A = Oa(),
    R = M(A),
    z = M(R)
  z.__click = C
  var g = M(z),
    w = M(g)
  {
    var O = (v) => {
      var f = Ma(),
        I = M(f)
      {
        var $ = (S) => {
            var P = ke(),
              oe = ve(P)
            ;(Ye(oe, () => l().icon), N(S, P))
          },
          Q = (S) => {
            const P = ne(() => l()?.icon)
            var oe = ke(),
              se = ve(oe)
            ;(ye(
              se,
              () => n(P),
              (ie, ae) => {
                ae(ie, {})
              },
            ),
              N(S, oe))
          }
        J(I, (S) => {
          typeof l()?.icon == "string" ? S($) : S(Q, !1)
        })
      }
      ;(_(f),
        X(
          (S) => K(f, 1, S),
          [
            () => `flex items-center justify-center overflow-visible 
            ${l().name ? "h-8 w-8" : `${n(d)()}`} [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full`,
          ],
        ),
        N(v, f))
    }
    J(w, (v) => {
      l()?.icon && v(O)
    })
  }
  var L = q(w, 2)
  {
    var U = (v) => {
      var f = za(),
        I = M(f),
        $ = q(I)
      {
        var Q = (S) => {
          var P = Ia(),
            oe = M(P)
          ;(_(P),
            X(() =>
              ce(oe, `(${t.keyBind.ctrlKey ? "Ctrl+" : ""}${t.keyBind.shiftKey ? "Shift+" : ""}${t.keyBind.altKey ? "Alt+" : ""}${t.keyBind.key ?? ""})`),
            ),
            N(S, P))
        }
        J($, (S) => {
          t.keyBind && S(Q)
        })
      }
      ;(_(f), X(() => ce(I, `${l().name ?? ""} `)), N(v, f))
    }
    J(L, (v) => {
      l().name && v(U)
    })
  }
  ;(_(g), _(z))
  var Z = q(z, 2)
  {
    var ee = (v) => {
        var f = Na(),
          I = M(f)
        ;(dt(),
          _(f),
          X(() => ce(I, `${l().info?.text ?? ""} `)),
          Ee(
            3,
            f,
            () => We,
            () => ({ y: -15, duration: 300 }),
          ),
          N(v, f))
      },
      T = (v) => {
        var f = ke(),
          I = ve(f)
        {
          var $ = (S) => {
              var P = Ea(),
                oe = M(P)
              ;(dt(),
                _(P),
                X(() => ce(oe, `${l().info?.text ?? ""} `)),
                Ee(
                  3,
                  P,
                  () => We,
                  () => ({ y: 15, duration: 300 }),
                ),
                N(S, P))
            },
            Q = (S) => {
              var P = ke(),
                oe = ve(P)
              {
                var se = (ae) => {
                    var D = Sa(),
                      i = M(D)
                    ;(dt(),
                      _(D),
                      X(() => ce(i, `${l().info?.text ?? ""} `)),
                      Ee(
                        3,
                        D,
                        () => We,
                        () => ({ x: 15, duration: 300 }),
                      ),
                      N(ae, D))
                  },
                  ie = (ae) => {
                    var D = ke(),
                      i = ve(D)
                    {
                      var h = (B) => {
                        var p = Aa(),
                          b = M(p)
                        ;(dt(),
                          _(p),
                          X(() => ce(b, `${l().info?.text ?? ""} `)),
                          Ee(
                            3,
                            p,
                            () => We,
                            () => ({ x: -15, duration: 300 }),
                          ),
                          N(B, p))
                      }
                      J(
                        i,
                        (B) => {
                          n(r) && l().info?.side === "right" && B(h)
                        },
                        !0,
                      )
                    }
                    N(ae, D)
                  }
                J(
                  oe,
                  (ae) => {
                    n(r) && l().info?.side === "left" ? ae(se) : ae(ie, !1)
                  },
                  !0,
                )
              }
              N(S, P)
            }
          J(
            I,
            (S) => {
              n(r) && l().info?.side === "bottom" ? S($) : S(Q, !1)
            },
            !0,
          )
        }
        N(v, f)
      }
    J(Z, (v) => {
      n(r) && l().info?.side === "top" ? v(ee) : v(T, !1)
    })
  }
  ;(_(R),
    _(A),
    X(
      (v, f) => {
        ;(K(A, 1, v), te(z, "id", o()), K(z, 1, `${f ?? ""} bg-(--bg-color)`), (z.disabled = c()), te(z, "aria-label", l().name))
      },
      [
        () => fe(de("relative flex w-full flex-col items-center ", a())),
        () =>
          de(
            `relative m-0 inline-block w-full items-center rounded-2xl 
        px-2 py-1 font-semibold  transition duration-200 select-none
        ${l().icon && !l().name ? "bg-transparent p-0" : "bg-blue border border-(--bg-color) "}
        ${c() ? "cursor-not-allowed opacity-50" : "cursor-pointer  active:scale-97"} `,
            u(),
          ),
      ],
    ),
    Ke("mouseenter", z, () => {
      l().info?.text && W(r, !0)
    }),
    Ke("mouseleave", z, () => {
      l().info?.text && W(r, !1)
    }),
    N(e, A),
    Te())
}
Le(["click"])
var Ta = j('<button class="h-8 w-8 cursor-pointer [&amp;_svg]:h-full [&amp;_svg]:max-h-full [&amp;_svg]:w-full [&amp;_svg]:max-w-full"><!></button>'),
  La = j(
    '<div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3"><div class="absolute -top-3.5 bg-(--back-color) px-1"> </div> <div class="grid grid-cols-3 place-items-center gap-2"></div></div>',
  ),
  Pa = j('<div class="grid grid-cols-3"></div>'),
  Ba = j(
    '<div class="flex items-center justify-center gap-8"><div class="flex w-1/3 flex-col items-center px-2"><!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><div class="relative mt-6 flex w-full gap-2"><!> <!> <!></div> <!></div> <div class="flex w-1/3 flex-col items-center gap-2 px-2"><div class="flex"><!> <!></div></div></div>',
  ),
  Va = j('<button class="h-8 w-8 cursor-pointer [&amp;_svg]:h-full [&amp;_svg]:max-h-full [&amp;_svg]:w-full [&amp;_svg]:max-w-full"><!></button>'),
  Ra = j(
    '<div class="relative m-1.5 rounded-xl border-2 border-(--border-color) p-3"><div class="absolute -top-3.5 bg-(--back-color) px-1"> </div> <div class="grid grid-cols-3 place-items-center gap-2"></div></div>',
  ),
  Ha = j('<div class="grid grid-cols-3"></div>'),
  ja = j(
    '<div class="flex items-center justify-center gap-8"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <div class="flex w-full gap-4"><!> <!></div> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!> <div class="relative mt-5 flex w-full gap-2"><!> <!> <!></div> <!> <!></div> <div class="flex w-1/3 flex-col items-center gap-2 px-2"><div class="flex"><!> <!></div></div></div>',
  )
function nl(e, t) {
  Oe(t, !0)
  const o = () => Bt(ya, "$optionsStore", u),
    a = () => Bt(Yt, "$t", u),
    [u, c] = _r(),
    l = H(t, "forConstructor", 3, !0)
  let r = Ce(!1)
  const d = ne(() => o().ACCORDION_TYPE_OPTIONS.find((O) => O.value === t.component.properties.outline)),
    C = ne(() => o().TEXT_ALIGN_OPTIONS.find((O) => O.value.includes(t.component.properties.label?.class?.split(" ").find((L) => L.startsWith("text-"))))),
    k = (O) => {
      const L = O.target
      if (!L.files || L.files.length === 0) return
      const U = L.files[0],
        Z = new FileReader()
      ;((Z.onload = (ee) => {
        const T = ee.target?.result
        xe("image", T, t.component, t.onPropertyChange)
      }),
        Z.readAsDataURL(U))
    }
  let A = ne(() => t.component.properties.image ?? "")
  var R = ke(),
    z = ve(R)
  {
    var g = (O) => {
        var L = Ba(),
          U = M(L),
          Z = M(U)
        {
          let i = ne(() => ({ name: a()("constructor.props.label") }))
          ye(
            Z,
            () => Fe,
            (h, B) => {
              B(h, {
                get label() {
                  return n(i)
                },
                get value() {
                  return t.component.properties.label.name
                },
                onUpdate: (p) => xe("label.name", p, t.component, t.onPropertyChange),
              })
            },
          )
        }
        var ee = q(Z, 2)
        {
          let i = ne(() => ({ name: a()("constructor.props.align") }))
          ye(
            ee,
            () => Tt,
            (h, B) => {
              B(h, {
                get label() {
                  return n(i)
                },
                type: "buttons",
                get value() {
                  return n(C)
                },
                get options() {
                  return o().TEXT_ALIGN_OPTIONS
                },
                onUpdate: (p) => xe("label.class", p.value, t.component, t.onPropertyChange),
              })
            },
          )
        }
        _(U)
        var T = q(U, 2),
          v = M(T),
          f = M(v)
        ye(
          f,
          () => Ze,
          (i, h) => {
            h(i, { content: { name: "Иконка заголовка" }, onClick: () => W(r, !0) })
          },
        )
        var I = q(f, 2)
        {
          var $ = (i) => {
            ir(i, {
              wrapperClass: "w-130",
              get isOpen() {
                return n(r)
              },
              set isOpen(B) {
                W(r, B, !0)
              },
              main: (B) => {
                var p = Pa()
                ;(Se(
                  p,
                  21,
                  () => sr,
                  ut,
                  (b, x) => {
                    var s = La(),
                      E = M(s),
                      V = M(E, !0)
                    _(E)
                    var y = q(E, 2)
                    ;(Se(
                      y,
                      21,
                      () => n(x)[1],
                      ut,
                      (Y, re) => {
                        var pe = Ta()
                        pe.__click = () => {
                          xe("label.icon", n(re), t.component, t.onPropertyChange)
                        }
                        var ue = M(pe)
                        ;(Ye(ue, () => n(re)), _(pe), N(Y, pe))
                      },
                    ),
                      _(y),
                      _(s),
                      X((Y) => ce(V, Y), [() => a()(`constructor.props.icon.${n(x)[0]}`)]),
                      N(b, s))
                  },
                ),
                  _(p),
                  N(B, p))
              },
              $$slots: { main: !0 },
            })
          }
          J(I, (i) => {
            n(r) && i($)
          })
        }
        var Q = q(I, 2)
        {
          var S = (i) => {
            {
              let h = ne(() => ({ icon: it }))
              Ze(i, {
                wrapperClass: "w-8.5 ",
                componentClass: "p-0.5 bg-red",
                get content() {
                  return n(h)
                },
                onClick: () => {
                  xe("label.icon", "", t.component, t.onPropertyChange)
                },
              })
            }
          }
          J(Q, (i) => {
            t.component.properties.label.icon && i(S)
          })
        }
        _(v)
        var P = q(v, 2)
        {
          let i = ne(() => ({ name: a()("constructor.props.type") }))
          ye(
            P,
            () => Tt,
            (h, B) => {
              B(h, {
                get label() {
                  return n(i)
                },
                type: "buttons",
                get value() {
                  return n(d)
                },
                get options() {
                  return o().ACCORDION_TYPE_OPTIONS
                },
                onUpdate: (p) => xe("outline", p.value, t.component, t.onPropertyChange),
              })
            },
          )
        }
        _(T)
        var oe = q(T, 2),
          se = M(oe),
          ie = M(se)
        {
          let i = ne(() => ({ name: a()("constructor.props.image") }))
          ye(
            ie,
            () => cr,
            (h, B) => {
              B(h, {
                type: "image",
                get label() {
                  return n(i)
                },
                accept: "image/png, image/jpeg, image/webp",
                onChange: k,
                get currentImage() {
                  return n(A)
                },
                set currentImage(p) {
                  W(A, p)
                },
              })
            },
          )
        }
        var ae = q(ie, 2)
        {
          var D = (i) => {
            {
              let h = ne(() => ({ icon: it }))
              Ze(i, {
                wrapperClass: "w-8.5 mt-6",
                componentClass: "p-0.5 bg-red",
                get content() {
                  return n(h)
                },
                onClick: () => {
                  xe("image", "", t.component, t.onPropertyChange)
                },
              })
            }
          }
          J(ae, (i) => {
            n(A) && i(D)
          })
        }
        ;(_(se), _(oe), _(L), N(O, L))
      },
      w = (O) => {
        var L = ja(),
          U = M(L),
          Z = M(U)
        {
          let s = ne(() => ({ name: a()("constructor.props.id") }))
          ye(
            Z,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.id
                },
                onUpdate: (y) => xe("id", y, t.component, t.onPropertyChange),
              })
            },
          )
        }
        var ee = q(Z, 2)
        {
          let s = ne(() => ({ name: a()("constructor.props.type") }))
          ye(
            ee,
            () => Tt,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                type: "buttons",
                get value() {
                  return n(d)
                },
                get options() {
                  return o().ACCORDION_TYPE_OPTIONS
                },
                onUpdate: (y) => xe("outline", y.value, t.component, t.onPropertyChange),
              })
            },
          )
        }
        var T = q(ee, 2),
          v = M(T)
        {
          let s = ne(() => ({ name: a()("constructor.props.size.height") }))
          ye(
            v,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.size.height
                },
                onUpdate: (y) => xe("size.height", y, t.component, t.onPropertyChange),
                number: { minNum: 1, maxNum: 1e3, step: 1 },
                type: "number",
              })
            },
          )
        }
        var f = q(v, 2)
        {
          let s = ne(() => ({ name: a()("constructor.props.size.width") }))
          ye(
            f,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.size.width
                },
                onUpdate: (y) => xe("size.width", y, t.component, t.onPropertyChange),
                number: { minNum: 1, maxNum: 1e3, step: 1 },
                type: "number",
              })
            },
          )
        }
        _(T)
        var I = q(T, 2)
        {
          let s = ne(() => ({ name: a()("constructor.props.open") })),
            E = ne(() => (t.component.properties.isOpen ? 2 : 1))
          ye(
            I,
            () => Bn,
            (V, y) => {
              y(V, {
                get label() {
                  return n(s)
                },
                get value() {
                  return n(E)
                },
                onChange: (Y) => xe("isOpen", Y === 2, t.component, t.onPropertyChange),
              })
            },
          )
        }
        _(U)
        var $ = q(U, 2),
          Q = M($)
        {
          let s = ne(() => ({ name: a()("constructor.props.wrapperclass") }))
          ye(
            Q,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.wrapperClass
                },
                onUpdate: (y) => xe("wrapperClass", y, t.component, t.onPropertyChange),
              })
            },
          )
        }
        var S = q(Q, 2),
          P = M(S)
        ye(
          P,
          () => Ze,
          (s, E) => {
            E(s, { content: { name: "Иконка заголовка" }, onClick: () => W(r, !0) })
          },
        )
        var oe = q(P, 2)
        {
          var se = (s) => {
            ir(s, {
              wrapperClass: "w-130",
              get isOpen() {
                return n(r)
              },
              set isOpen(V) {
                W(r, V, !0)
              },
              main: (V) => {
                var y = Ha()
                ;(Se(
                  y,
                  21,
                  () => sr,
                  ut,
                  (Y, re) => {
                    var pe = Ra(),
                      ue = M(pe),
                      ge = M(ue, !0)
                    _(ue)
                    var Me = q(ue, 2)
                    ;(Se(
                      Me,
                      21,
                      () => n(re)[1],
                      ut,
                      (Ie, Ae) => {
                        var ze = Va()
                        ze.__click = () => {
                          xe("label.icon", n(Ae), t.component, t.onPropertyChange)
                        }
                        var Ne = M(ze)
                        ;(Ye(Ne, () => n(Ae)), _(ze), N(Ie, ze))
                      },
                    ),
                      _(Me),
                      _(pe),
                      X((Ie) => ce(ge, Ie), [() => a()(`constructor.props.icon.${n(re)[0]}`)]),
                      N(Y, pe))
                  },
                ),
                  _(y),
                  N(V, y))
              },
              $$slots: { main: !0 },
            })
          }
          J(oe, (s) => {
            n(r) && s(se)
          })
        }
        var ie = q(oe, 2)
        {
          var ae = (s) => {
            {
              let E = ne(() => ({ icon: it }))
              Ze(s, {
                wrapperClass: "w-8.5 ",
                componentClass: "p-0.5 bg-red",
                get content() {
                  return n(E)
                },
                onClick: () => {
                  xe("label.icon", "", t.component, t.onPropertyChange)
                },
              })
            }
          }
          J(ie, (s) => {
            t.component.properties.label.icon && s(ae)
          })
        }
        _(S)
        var D = q(S, 2)
        {
          let s = ne(() => ({ name: a()("constructor.props.label") }))
          ye(
            D,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.label.name
                },
                onUpdate: (y) => xe("label.name", y, t.component, t.onPropertyChange),
              })
            },
          )
        }
        var i = q(D, 2)
        {
          let s = ne(() => ({ name: a()("constructor.props.label.class") }))
          ye(
            i,
            () => Fe,
            (E, V) => {
              V(E, {
                get label() {
                  return n(s)
                },
                get value() {
                  return t.component.properties.label.class
                },
                onUpdate: (y) => xe("label.class", y, t.component, t.onPropertyChange),
              })
            },
          )
        }
        _($)
        var h = q($, 2),
          B = M(h),
          p = M(B)
        {
          let s = ne(() => ({ name: a()("constructor.props.image") }))
          ye(
            p,
            () => cr,
            (E, V) => {
              V(E, {
                type: "image",
                get label() {
                  return n(s)
                },
                accept: "image/png, image/jpeg, image/webp",
                onChange: k,
                get currentImage() {
                  return n(A)
                },
                set currentImage(y) {
                  W(A, y)
                },
              })
            },
          )
        }
        var b = q(p, 2)
        {
          var x = (s) => {
            {
              let E = ne(() => ({ icon: it }))
              Ze(s, {
                wrapperClass: "w-8.5 mt-6",
                componentClass: "p-0.5 bg-red",
                get content() {
                  return n(E)
                },
                onClick: () => {
                  xe("image", "", t.component, t.onPropertyChange)
                },
              })
            }
          }
          J(b, (s) => {
            n(A) && s(x)
          })
        }
        ;(_(B), _(h), _(L), N(O, L))
      }
    J(z, (O) => {
      l() ? O(g) : O(w, !1)
    })
  }
  ;(N(e, R), Te(), c())
}
Le(["click"])
var qa = j("<h5> </h5>"),
  Ua = j('<div class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"></div>'),
  Da = j(
    '<div class="absolute inset-0"></div> <div class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"></div>',
    1,
  ),
  Ga = j('<div class="pointer-events-none absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"></div>'),
  Fa = j(
    '<div><!> <div class="flex w-full flex-row items-center gap-2"><div class="flex w-full flex-col gap-2"><div class="hue-slider relative h-7 w-full cursor-pointer overflow-hidden rounded-full shadow-md" role="slider"><div class="absolute inset-0"></div> <!></div> <div role="slider"><!></div> <div class="white-slider relative mt-4 h-4 w-full cursor-pointer overflow-hidden rounded-full shadow-sm" role="slider"><div class="absolute inset-0 bg-linear-to-r from-black to-white"></div> <!></div></div> <div class="flex w-25 flex-col items-center"><div></div> <div class="w-full text-center font-semibold"> </div></div></div></div>',
  )
function ll(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "label", 19, () => ({ name: "", class: "" })),
    c = H(t, "value", 19, () => [0, 0, 0]),
    l = H(t, "onChange", 3, () => {})
  const r = ht({ h: 0, s: 100, v: 100 })
  let d = Ce(0),
    C = Ce(100),
    k = Ce("hsv"),
    A = Ce(100)
  ct(() => {
    if (c().length !== 3) return
    const [p, b, x] = c(),
      s = p === b && b === x
    if ((W(k, s ? "white" : "hsv", !0), s)) {
      W(A, Math.round((p / 255) * 100), !0)
      return
    }
    const E = c().map((ge) => ge / 255),
      V = Math.max(...E),
      y = Math.min(...E),
      Y = V - y
    let re = 0
    if (Y !== 0) {
      const [ge, Me, Ie] = E
      ;(V === ge ? (re = ((Me - Ie) / Y) % 6) : V === Me ? (re = (Ie - ge) / Y + 2) : (re = (ge - Me) / Y + 4), (re *= 60), re < 0 && (re += 360))
    }
    const pe = V ? (Y / V) * 100 : 0,
      ue = V * 100
    ;((r.h = Math.round(re)), (r.s = Math.round(pe)), (r.v = Math.round(ue)), W(d, (re / 360) * 100), W(C, ue))
  })
  const R = (p, b, x) => {
      ;((b /= 100), (x /= 100))
      const s = x * b,
        E = s * (1 - Math.abs(((p / 60) % 2) - 1)),
        V = x - s
      let y = 0,
        Y = 0,
        re = 0
      return (
        p < 60
          ? ([y, Y, re] = [s, E, 0])
          : p < 120
            ? ([y, Y, re] = [E, s, 0])
            : p < 180
              ? ([y, Y, re] = [0, s, E])
              : p < 240
                ? ([y, Y, re] = [0, E, s])
                : p < 300
                  ? ([y, Y, re] = [E, 0, s])
                  : ([y, Y, re] = [s, 0, E]),
        [Math.round((y + V) * 255), Math.round((Y + V) * 255), Math.round((re + V) * 255)]
      )
    },
    z = (p, b) => {
      const s = document.querySelector(`.${b}-slider`).getBoundingClientRect()
      let E = { ...r },
        V = n(A)
      b === "hue" || b === "brightness" ? (n(k) === "white" && (r.s = 100), W(k, "hsv")) : W(k, "white")
      const y = (re) => {
          const pe = Math.max(0, Math.min(re.clientX - s.left, s.width)),
            ue = (pe / s.width) * 100
          b === "hue"
            ? (W(d, ue), (E.h = (pe / s.width) * 360), (r.h = E.h))
            : b === "brightness"
              ? (W(C, ue), (E.v = ue), (r.v = E.v))
              : b === "white" && ((V = ue), W(A, V, !0))
        },
        Y = () => {
          if ((window.removeEventListener("mousemove", y), window.removeEventListener("mouseup", Y), n(k) === "hsv")) l()(R(E.h, r.s, E.v))
          else {
            const re = Math.round((V / 100) * 255)
            l()([re, re, re])
          }
        }
      ;(y(p), window.addEventListener("mousemove", y), window.addEventListener("mouseup", Y))
    },
    g = ne(() => () => (n(k) === "white" ? [n(A), n(A), n(A)].map((p) => Math.round((p / 100) * 255)) : R(r.h, r.s, r.v))),
    w = ne(
      () => () =>
        n(g)()
          .map((p) => p.toString(16).padStart(2, "0"))
          .join(" ")
          .toUpperCase(),
    ),
    O = ne(() => () => (n(k) === "white" ? [255, 255, 255].map((p) => Math.round((n(A) / 100) * p)) : R(r.h, r.s, 100))),
    L = ne(() => () => {
      const [p, b, x] = n(g)()
      return (p * 299 + b * 587 + x * 114) / 1e3 > 128 ? "text-black" : "text-white"
    })
  var U = Fa(),
    Z = M(U)
  {
    var ee = (p) => {
      var b = qa(),
        x = M(b, !0)
      ;(_(b),
        X(
          (s) => {
            ;(K(b, 1, s), ce(x, u().name))
          },
          [() => fe(de("w-full px-4 text-center", u().class))],
        ),
        N(p, b))
    }
    J(Z, (p) => {
      u().name && p(ee)
    })
  }
  var T = q(Z, 2),
    v = M(T),
    f = M(v)
  ;(te(f, "aria-valuenow", null), te(f, "tabindex", null), (f.__mousedown = (p) => z(p, "hue")))
  var I = M(f),
    $ = q(I, 2)
  {
    var Q = (p) => {
      var b = Ua()
      ;(X((x) => me(b, x), [() => `left: ${n(d)}%; background: rgb(${R(r.h, 100, 100).join(",")})`]), N(p, b))
    }
    J($, (p) => {
      n(k) === "hsv" && p(Q)
    })
  }
  _(f)
  var S = q(f, 2)
  ;(te(S, "aria-valuenow", null), te(S, "tabindex", null), (S.__mousedown = (p) => z(p, "brightness")))
  var P = M(S)
  {
    var oe = (p) => {
      var b = Da(),
        x = ve(b),
        s = q(x, 2)
      ;(X(
        (E, V) => {
          ;(me(x, E), me(s, V))
        },
        [
          () => `background: linear-gradient(to right, rgb(0,0,0), rgb(${R(r.h, r.s, 100).join(",")}))`,
          () => `left: ${n(C)}%; background: rgb(${R(r.h, r.s, r.v).join(",")})`,
        ],
      ),
        N(p, b))
    }
    J(P, (p) => {
      n(k) === "hsv" && p(oe)
    })
  }
  _(S)
  var se = q(S, 2)
  ;(te(se, "aria-valuenow", null), te(se, "tabindex", null), (se.__mousedown = (p) => z(p, "white")))
  var ie = q(M(se), 2)
  {
    var ae = (p) => {
      var b = Ga()
      ;(X((x) => me(b, x), [() => `left: ${n(A)}%; background: rgb(${[255, 255, 255].map((x) => Math.round((n(A) / 100) * x)).join(",")})`]), N(p, b))
    }
    J(ie, (p) => {
      n(k) === "white" && p(ae)
    })
  }
  ;(_(se), _(v))
  var D = q(v, 2),
    i = M(D),
    h = q(i, 2),
    B = M(h, !0)
  ;(_(h),
    _(D),
    _(T),
    _(U),
    X(
      (p, b, x, s, E) => {
        ;(te(U, "id", o()),
          K(U, 1, p),
          me(I, b),
          K(S, 1, `brightness-slider relative h-4 w-full cursor-pointer overflow-hidden rounded-full ${n(k) === "hsv" ? "shadow-md" : ""}`),
          K(i, 1, x),
          me(i, s),
          ce(B, E))
      },
      [
        () => fe(de("relative flex w-full flex-col items-center", a())),
        () =>
          `background: linear-gradient(to right, ${Array.from({ length: 7 }, (p, b) => {
            const [x, s, E] = R(b * 60, 100, 100)
            return `rgb(${x},${s},${E})`
          }).join(", ")})`,
        () => `flex size-15 flex-col justify-center gap-1 rounded-full px-2 font-mono text-sm shadow-md select-none ${n(L)()}`,
        () => `background: rgb(${n(O)().join(",")})`,
        () => n(w)(),
      ],
    ),
    N(e, U),
    Te())
}
Le(["mousedown"])
var Qa = j("<h5> </h5>"),
  Wa = j('<img alt="Preview"/>'),
  Ka = j('<span class="text-sm text-gray-500">Image</span>'),
  Ya = j('<div class="relative"><button><!></button> <input type="file" class="absolute -z-10 h-0 w-0 overflow-hidden opacity-0"/></div>'),
  Xa = j('<label class="relative inline-block w-full"><input type="file"/></label>'),
  Ja = j("<div><!> <!></div>")
function cr(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "label", 19, () => ({ name: "", class: "" })),
    c = H(t, "type", 3, "file"),
    l = H(t, "accept", 3, "*/*"),
    r = H(t, "imageSize", 19, () => ({ height: "10rem", width: "10rem", fitMode: "cover", form: "square" })),
    d = H(t, "disabled", 3, !1),
    C = H(t, "currentImage", 11, ""),
    k = H(t, "onChange", 3, () => {}),
    A = Ce(null),
    R = ne(() => (C() ? (C().startsWith("data:") ? C() : `data:image/png;base64,${C()}`) : null))
  const z = (T) => {
      const v = T.target
      if (!v.files || v.files.length === 0) {
        k()(T, null)
        return
      }
      const f = v.files[0]
      ;(W(A, f, !0), f.type.startsWith("image/") && W(R, URL.createObjectURL(f)), k()(T, f))
    },
    g = () => {
      document.getElementById(o())?.click()
    }
  var w = Ja(),
    O = M(w)
  {
    var L = (T) => {
      var v = Qa(),
        f = M(v, !0)
      ;(_(v),
        X(() => {
          ;(K(v, 1, `${u().class}`), ce(f, u().name))
        }),
        N(T, v))
    }
    J(O, (T) => {
      u().name && T(L)
    })
  }
  var U = q(O, 2)
  {
    var Z = (T) => {
        var v = Ya(),
          f = M(v)
        f.__click = g
        var I = M(f)
        {
          var $ = (P) => {
              var oe = Wa()
              ;(X(
                (se) => {
                  ;(te(oe, "src", se),
                    K(
                      oe,
                      1,
                      `
              h-full w-full
              ${r().fitMode === "cover" ? "object-cover" : "object-contain"}
            `,
                    ))
                },
                [() => n(R) ?? (C()?.startsWith("data:") ? C() : `data:image/png;base64,${C()}`)],
              ),
                N(P, oe))
            },
            Q = (P) => {
              var oe = Ka()
              N(P, oe)
            }
          J(I, (P) => {
            n(R) || C() ? P($) : P(Q, !1)
          })
        }
        _(f)
        var S = q(f, 2)
        ;((S.__change = z),
          _(v),
          X(() => {
            ;(K(
              f,
              1,
              `flex items-center justify-center overflow-hidden ${r().form === "circle" ? "rounded-full" : "rounded-2xl"} 
        bg-(--back-color) shadow-sm transition duration-250 hover:shadow-md
        ${d() ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`,
            ),
              me(f, `height: ${r().height}; width: ${r().width}`),
              (f.disabled = d()),
              te(S, "id", o()),
              te(S, "accept", l()),
              (S.disabled = d()))
          }),
          N(T, v))
      },
      ee = (T) => {
        var v = Xa(),
          f = M(v)
        ;((f.__change = z),
          _(v),
          X(() => {
            ;(te(f, "id", o()),
              K(
                f,
                1,
                `h-8.5 w-full rounded-2xl bg-(--back-color) font-semibold shadow-sm transition duration-250 hover:shadow-md
          ${d() ? "cursor-not-allowed opacity-50" : "cursor-pointer"} invalid:shadow-[0_0_6px(--red-color) file:h-full file:w-1/3 
          file:cursor-pointer file:border-none file:bg-(--blue-color) invalid:border-red-400`,
              ),
              te(f, "accept", l()),
              (f.disabled = d()))
          }),
          N(T, v))
      }
    J(U, (T) => {
      c() === "image" ? T(Z) : T(ee, !1)
    })
  }
  ;(_(w), X((T) => K(w, 1, T), [() => fe(de("flex flex-col items-center", a()))]), N(e, w), Te())
}
Le(["click", "change"])
var Za = j("<h5> </h5>"),
  $a = j('<button style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"> </button>'),
  en = j(
    '<div class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl border border-t-0 border-(--border-color)" style="width: calc(100% - 1.8rem);"></div>',
  ),
  tn = j('<button style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);" aria-haspopup="true"> </button> <!>', 1),
  rn = j('<div class="flex-1"> </div>'),
  on = j('<button><span class="flex flex-row items-center justify-center gap-4"><!></span></button>'),
  an = j('<div class="flex h-full w-full flex-row justify-center rounded-full border border-(--bg-color)"></div>'),
  nn = j('<button style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"> </button>'),
  ln = j(
    '<div class="absolute top-full left-1/2 z-50 -translate-x-1/2 rounded-b-2xl border border-t-0 border-(--border-color)" style="width: calc(100% - 1.8rem);"></div>',
  ),
  sn = j('<input style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"/> <!>', 1),
  cn = j("<div><!> <!></div>")
function Tt(e, t) {
  Oe(t, !0)
  const o = () => Bt(Yt, "$t", a),
    [a, u] = _r()
  let c = Ce(!1),
    l,
    r = Ce(""),
    d = Ce(ht([])),
    C = H(t, "id", 19, () => crypto.randomUUID()),
    k = H(t, "wrapperClass", 3, ""),
    A = H(t, "disabled", 3, !1),
    R = H(t, "label", 19, () => ({ name: "", class: "" })),
    z = H(t, "type", 3, "select"),
    g = H(t, "value", 15),
    w = H(t, "options", 19, () => [])
  const O = (Q) => {
    l && !l.contains(Q.target) && W(c, !1)
  }
  Qt(
    () => (
      (z() === "select" || z() === "input") && document.addEventListener("click", O),
      z() === "input" && W(r, g()?.name ?? "", !0),
      () => {
        ;(z() === "select" || z() === "input") && document.removeEventListener("click", O)
      }
    ),
  )
  const L = (Q) => {
      ;(Q.stopPropagation(), A() || (W(c, !n(c)), W(d, [], !0)))
    },
    U = (Q, S) => {
      ;(S.stopPropagation(), A() || (g(Q), W(c, !1), W(r, Q.name?.toString() ?? "", !0), W(d, [], !0), t.onUpdate?.(g())))
    },
    Z = (Q) => {
      if ((W(r, Q, !0), Q.trim() === "")) (W(c, !1), W(d, [], !0))
      else if (
        (W(
          d,
          w().filter((P) => (P.name?.toString() || "").toLowerCase().includes(Q.toLowerCase())),
          !0,
        ),
        W(c, n(d).length > 0),
        !w().some((P) => P.name?.toString() === n(r)))
      ) {
        const P = { id: `input-${n(r)}`, name: n(r), value: n(r) }
        ;(g(P), t.onUpdate?.(P))
      }
    }
  var ee = cn(),
    T = M(ee)
  {
    var v = (Q) => {
      var S = Za(),
        P = M(S, !0)
      ;(_(S),
        X(
          (oe) => {
            ;(K(S, 1, oe), ce(P, R().name))
          },
          [() => fe(de("w-full px-4", R().class))],
        ),
        N(Q, S))
    }
    J(T, (Q) => {
      R().name && Q(v)
    })
  }
  var f = q(T, 2)
  {
    var I = (Q) => {
        var S = tn(),
          P = ve(S)
        P.__click = L
        var oe = M(P, !0)
        _(P)
        var se = q(P, 2)
        {
          var ie = (ae) => {
            var D = en()
            ;(Se(
              D,
              23,
              w,
              (i) => i.id,
              (i, h, B) => {
                var p = $a()
                p.__click = (x) => U(n(h), x)
                var b = M(p, !0)
                ;(_(p),
                  X(
                    (x, s) => {
                      ;(te(p, "id", n(h).id), Nt(p, x), K(p, 1, s), (p.disabled = A()), ce(b, n(h).name))
                    },
                    [
                      () => (n(h)?.value ? String(n(h).value) : ""),
                      () =>
                        fe(
                          de(
                            `flex h-full w-full cursor-pointer items-center justify-center p-1 duration-250 hover:bg-(--field-color)
              ${n(B) === w().length - 1 ? "rounded-b-2xl" : ""} `,
                            n(h).class,
                          ),
                        ),
                    ],
                  ),
                  N(i, p))
              },
            ),
              _(D),
              Ee(
                3,
                D,
                () => gt,
                () => ({ duration: 250 }),
              ),
              N(ae, D))
          }
          J(se, (ae) => {
            n(c) && ae(ie)
          })
        }
        ;(X(
          (ae, D, i) => {
            ;(te(P, "id", C()), Nt(P, ae), K(P, 1, D), te(P, "aria-expanded", n(c)), (P.disabled = A()), ce(oe, i))
          },
          [
            () => (g()?.value ? String(g().value) : ""),
            () =>
              fe(
                de(
                  `w-full rounded-2xl border border-(--border-color) p-1 text-center duration-250
        ${A() ? "opacity-50" : "cursor-pointer hover:shadow-lg"}`,
                  g()?.class,
                ),
              ),
            () => g()?.name || o()("common.select_tag"),
          ],
        ),
          N(Q, S))
      },
      $ = (Q) => {
        var S = ke(),
          P = ve(S)
        {
          var oe = (ie) => {
              var ae = an()
              ;(Se(
                ae,
                23,
                w,
                (D) => D.id,
                (D, i, h) => {
                  var B = on()
                  B.__click = (s) => U(n(i), s)
                  var p = M(B),
                    b = M(p)
                  {
                    var x = (s) => {
                      var E = rn(),
                        V = M(E, !0)
                      ;(_(E), X(() => ce(V, n(i).name)), N(s, E))
                    }
                    J(b, (s) => {
                      n(i).name && s(x)
                    })
                  }
                  ;(_(p),
                    _(B),
                    X(
                      (s) => {
                        ;(te(B, "id", n(i).id), K(B, 1, `${s ?? ""} bg-(--bg-color)`), (B.disabled = n(i).disabled))
                      },
                      [
                        () =>
                          de(
                            `m-0 inline-block min-w-0 flex-1 items-center px-2 py-1 font-semibold shadow-sm transition-all duration-300 select-none
            ${n(i).disabled || A() ? "opacity-50" : "cursor-pointer hover:shadow-md"}
            ${n(i).value === g()?.value && g() !== null ? "z-10 py-1 shadow-[0_0_10px_var(--shadow-color)] hover:shadow-[0_0_15px_var(--shadow-color)]" : ""}  
            ${w().length > 0 && n(h) === 0 ? "rounded-l-2xl" : ""} ${n(h) === w().length - 1 ? "rounded-r-2xl" : ""}`,
                            n(i).class,
                          ),
                      ],
                    ),
                    N(D, B))
                },
              ),
                _(ae),
                X(() => te(ae, "id", C())),
                N(ie, ae))
            },
            se = (ie) => {
              var ae = ke(),
                D = ve(ae)
              {
                var i = (h) => {
                  var B = sn(),
                    p = ve(B)
                  ;(et(p),
                    (p.__input = (s) => Z(s.currentTarget.value)),
                    (p.__click = (s) => {
                      n(r) == "" && (W(d, w(), !0), W(c, !0))
                    }))
                  var b = q(p, 2)
                  {
                    var x = (s) => {
                      var E = ln()
                      ;(Se(
                        E,
                        23,
                        () => n(d),
                        (V) => V.id,
                        (V, y, Y) => {
                          var re = nn()
                          re.__click = (ue) => U(n(y), ue)
                          var pe = M(re, !0)
                          ;(_(re),
                            X(
                              (ue, ge) => {
                                ;(te(re, "id", n(y).id), Nt(re, ue), K(re, 1, ge), (re.disabled = A()), ce(pe, n(y).name))
                              },
                              [
                                () => (n(y)?.value ? String(n(y).value) : ""),
                                () =>
                                  fe(
                                    de(
                                      `flex h-full w-full cursor-pointer items-center justify-center p-1 duration-250 hover:bg-(--field-color)
              ${n(Y) === n(d).length - 1 ? "rounded-b-2xl" : ""} `,
                                      n(y).class,
                                    ),
                                  ),
                              ],
                            ),
                            N(V, re))
                        },
                      ),
                        _(E),
                        Ee(
                          3,
                          E,
                          () => gt,
                          () => ({ duration: 250 }),
                        ),
                        N(s, E))
                    }
                    J(b, (s) => {
                      n(c) && s(x)
                    })
                  }
                  ;(X(() => {
                    ;(K(
                      p,
                      1,
                      `w-full appearance-none rounded-2xl border px-4 py-1 text-center transition-shadow
          outline-none hover:shadow-md focus:border-blue-400
          [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
          ${A() ? "cursor-not-allowed opacity-50" : "cursor-text"} border-(--border-color)`,
                    ),
                      te(p, "id", C()),
                      (p.disabled = A()))
                  }),
                    tt(
                      p,
                      () => n(r),
                      (s) => W(r, s),
                    ),
                    N(h, B))
                }
                J(
                  D,
                  (h) => {
                    z() === "input" && h(i)
                  },
                  !0,
                )
              }
              N(ie, ae)
            }
          J(
            P,
            (ie) => {
              z() === "buttons" ? ie(oe) : ie(se, !1)
            },
            !0,
          )
        }
        N(Q, S)
      }
    J(f, (Q) => {
      z() === "select" ? Q(I) : Q($, !1)
    })
  }
  ;(_(ee),
    kr(
      ee,
      (Q) => (l = Q),
      () => l,
    ),
    X((Q) => K(ee, 1, Q), [() => fe(de("bg-max relative flex w-full flex-col items-center ", k()))]),
    N(e, ee),
    Te(),
    u())
}
Le(["click", "input"])
var dn = j("<h5> </h5>"),
  un = j('<input style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"/>'),
  pn = j('<textarea style="background: color-mix(in srgb, var(--bg-color), var(--back-color) 70%);"></textarea>'),
  vn = Xe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0"></path><path d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7"></path></g></svg>',
  ),
  mn = Xe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="round" d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243"></path><path d="m4 4l16 16"></path></g></svg>',
  ),
  fn = j('<button type="button" class="absolute right-2 flex cursor-pointer border-none bg-transparent"><!></button>'),
  hn = j('<div class="absolute top-1/2 right-10 -translate-y-1/2 transform rounded-md bg-(--green-color) px-2 py-1 text-sm shadow-lg">✓</div>'),
  gn = j(
    '<button type="button" aria-label="Копировать текст"><svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"></path><path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3"></path></g></svg></button> <!>',
    1,
  ),
  bn = j(
    '<div class="absolute right-0 flex h-full w-8 flex-col items-center justify-center rounded-r-2xl border-l border-(--border-color)"><button class="flex h-1/2 w-full items-center rounded-tr-2xl border-b border-(--border-color) pl-2 transition-colors duration-150 hover:bg-(--gray-color)/30 active:bg-(--gray-color)/10" aria-label="Увеличить">+</button> <button class="flex h-1/2 w-full items-center rounded-br-2xl pl-2 transition-colors duration-150 hover:bg-(--gray-color)/30 active:bg-(--gray-color)/10" aria-label="Уменьшить">−</button></div>',
  ),
  wn = j('<div class="absolute top-1/2 left-10 z-50 w-auto -translate-y-1/2 rounded bg-(--container-color) px-2 py-1 shadow-lg"> </div>'),
  xn = j(
    '<button type="button"><svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-width="1.3"></circle><path stroke-width="1.5" d="M12 16v-4.5"></path><path stroke-width="1.8" d="M12 8.012v-.01"></path></g></svg></button> <!>',
    1,
  ),
  yn = j("<div><!> <div><!> <!> <!> <!> <!></div></div>")
function Fe(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "label", 19, () => ({ name: "", class: "" })),
    c = H(t, "disabled", 3, !1),
    l = H(t, "readonly", 3, !1),
    r = H(t, "value", 15),
    d = H(t, "type", 3, "text"),
    C = H(t, "placeholder", 3, ""),
    k = H(t, "componentClass", 3, ""),
    A = H(t, "maxlength", 3, 100),
    R = H(t, "textareaRows", 3, 3),
    z = H(t, "number", 19, () => ({ minNum: -1e6, maxNum: 1e6, step: 1 })),
    g = H(t, "help", 19, () => ({ info: "", autocomplete: "off", copyButton: !1, regExp: "^[\\s\\S]*$" })),
    w = H(t, "onUpdate", 3, () => {}),
    O = Ce(!1),
    L = Ce(!1),
    U = Ce(!1)
  ct(() => {
    d() === "number" && (r() === void 0 || r() === null || r() === "") && r(z().minNum)
  })
  const Z = (b) => {
    if (b instanceof RegExp) return b
    const x = b.match(/^\/(.*)\/([gimsuy]*)$/)
    return x ? new RegExp(x[1], x[2]) : new RegExp(b)
  }
  let ee = ne(() => () => Z(g().regExp ?? "")),
    T = ne(() => n(ee)().test(typeof r() == "string" ? r() : String(r())))
  const v = (b) => {
    if (d() === "number") {
      const x = typeof b == "string" ? parseFloat(b.replace(",", ".")) : Number(b)
      isNaN(x) ? w()?.(b) : w()?.(x)
    } else w()?.(b)
  }
  var f = yn(),
    I = M(f)
  {
    var $ = (b) => {
      var x = dn(),
        s = M(x, !0)
      ;(_(x),
        X(
          (E) => {
            ;(K(x, 1, E), ce(s, u().name))
          },
          [() => fe(de("w-full px-4 text-center", u().class))],
        ),
        N(b, x))
    }
    J(I, (b) => {
      u().name && b($)
    })
  }
  var Q = q(I, 2),
    S = M(Q)
  {
    var P = (b) => {
        var x = un()
        ;(et(x),
          (x.__input = (s) => v(s.currentTarget.value)),
          X(
            (s) => {
              ;(K(x, 1, s),
                te(x, "id", o()),
                te(x, "placeholder", C()),
                (x.disabled = c()),
                te(x, "autocomplete", g()?.autocomplete),
                te(x, "type", d() === "password" ? (n(O) ? "text" : "password") : d() === "number" ? "number" : "text"),
                te(x, "maxlength", A()),
                te(x, "min", z()?.minNum),
                te(x, "max", z()?.maxNum),
                te(x, "step", z()?.step),
                (x.readOnly = l()))
            },
            [
              () =>
                fe(
                  de(
                    `w-full rounded-2xl border px-4 py-1 text-center transition-all duration-300 outline-none focus:border-blue-400
              [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden
              ${n(T) ? "border-(--border-color)" : "border-red-400 shadow-[0_0_6px_var(--red-color)]"}
              ${c() ? "opacity-50" : "hover:shadow-md"} 
              ${l() ? "" : "hover:shadow-md"}
              ${g()?.info ? "pl-8" : ""} 
              ${g().copyButton || d() === "password" || (d() === "number" && !l()) ? "pr-8" : ""}`,
                    k(),
                  ),
                ),
            ],
          ),
          tt(x, r),
          N(b, x))
      },
      oe = (b) => {
        var x = ke(),
          s = ve(x)
        {
          var E = (V) => {
            var y = pn()
            ;(fo(y),
              (y.__input = (Y) => v(Y.currentTarget.value)),
              X(
                (Y) => {
                  ;(K(y, 1, Y),
                    te(y, "id", o()),
                    (y.disabled = c()),
                    te(y, "maxlength", A()),
                    te(y, "rows", R()),
                    te(y, "placeholder", C()),
                    (y.readOnly = l()))
                },
                [
                  () =>
                    fe(
                      de(
                        `h-full w-full resize-y rounded-2xl border border-(--border-color) px-2 py-1 text-center font-mono outline-none focus:border-blue-400
            ${n(T) ? "border-(--border-color)" : "border-red-400 shadow-[0_0_6px_var(--red-color)]"}
            ${c() ? "opacity-50" : "hover:shadow-md"} 
            ${l() ? "" : "hover:shadow-md"}
            ${g()?.info ? "pl-8" : ""}
            ${g().copyButton ? "pr-8" : ""}`,
                        k(),
                      ),
                    ),
                ],
              ),
              tt(y, r),
              N(V, y))
          }
          J(
            s,
            (V) => {
              d() === "text-area" && V(E)
            },
            !0,
          )
        }
        N(b, x)
      }
    J(S, (b) => {
      d() === "text" || d() === "password" || d() === "number" ? b(P) : b(oe, !1)
    })
  }
  var se = q(S, 2)
  {
    var ie = (b) => {
      var x = fn()
      x.__click = () => W(O, !n(O))
      var s = M(x)
      {
        var E = (y) => {
            var Y = vn()
            N(y, Y)
          },
          V = (y) => {
            var Y = mn()
            N(y, Y)
          }
        J(s, (y) => {
          n(O) ? y(E) : y(V, !1)
        })
      }
      ;(_(x), X(() => te(x, "aria-label", n(O) ? "Скрыть пароль" : "Показать пароль")), N(b, x))
    }
    J(se, (b) => {
      d() === "password" && !c() && b(ie)
    })
  }
  var ae = q(se, 2)
  {
    var D = (b) => {
      var x = gn(),
        s = ve(x)
      s.__click = (y) => {
        ;(y.preventDefault(), navigator.clipboard.writeText(r()), W(U, !0), setTimeout(() => W(U, !1), 1e3))
      }
      var E = q(s, 2)
      {
        var V = (y) => {
          var Y = hn()
          ;(Ee(
            3,
            Y,
            () => We,
            () => ({ x: 10, duration: 200 }),
          ),
            N(y, Y))
        }
        J(E, (y) => {
          n(U) && y(V)
        })
      }
      ;(X(() => K(s, 1, `absolute right-2 flex cursor-pointer border-none bg-transparent ${d() === "text-area" ? "top-2" : ""}`)), N(b, x))
    }
    J(ae, (b) => {
      g().copyButton && (d() === "text" || d() === "text-area") && b(D)
    })
  }
  var i = q(ae, 2)
  {
    var h = (b) => {
      var x = bn(),
        s = M(x)
      s.__click = () => {
        if (!(!z().maxNum || !z().step)) {
          if (Number(r()) + z().step >= z().maxNum) {
            ;(r(z().maxNum), w()?.(r()))
            return
          }
          ;(r(Number(r()) + (z().step ?? 1)), w()?.(r()))
        }
      }
      var E = q(s, 2)
      ;((E.__click = () => {
        if (!(z().minNum === null || z().minNum === void 0 || !z().step)) {
          if (Number(r()) - z().step <= z().minNum) {
            ;(r(z().minNum), w()?.(r()))
            return
          }
          ;(r(Number(r()) - (z().step ?? 1)), w()?.(r()))
        }
      }),
        _(x),
        N(b, x))
    }
    J(i, (b) => {
      d() === "number" && !l() && !c() && b(h)
    })
  }
  var B = q(i, 2)
  {
    var p = (b) => {
      var x = xn(),
        s = ve(x),
        E = q(s, 2)
      {
        var V = (y) => {
          var Y = wn(),
            re = M(Y, !0)
          ;(_(Y),
            X(() => ce(re, g()?.info)),
            Ee(
              3,
              Y,
              () => We,
              () => ({ x: -15, duration: 250 }),
            ),
            N(y, Y))
        }
        J(E, (y) => {
          n(L) && y(V)
        })
      }
      ;(X(() => {
        ;(K(s, 1, `button-info absolute left-2 flex border-none bg-transparent ${d() === "text-area" ? "top-2" : ""} ${c() ? "opacity-50" : "cursor-pointer"}`),
          te(s, "aria-label", n(L) ? "Скрыть инфо" : "Показать инфо"))
      }),
        Ke("mouseenter", s, () => W(L, !0)),
        Ke("mouseleave", s, () => W(L, !1)),
        N(b, x))
    }
    J(B, (b) => {
      g().info && b(p)
    })
  }
  ;(_(Q),
    _(f),
    X(
      (b) => {
        ;(K(f, 1, b), K(Q, 1, `relative flex w-full items-center ${d() === "text-area" ? "h-full" : ""}`))
      },
      [() => fe(de(`bg-max ${d() === "text-area" ? "h-full" : ""} relative flex w-full flex-col items-center`, a()))],
    ),
    N(e, f),
    Te())
}
Le(["input", "click"])
var _n = Xe(
  '<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><g stroke="currentColor" stroke-linecap="round" stroke-width="1.5" fill="none"><line x1="8" y1="11" x2="8" y2="13"></line><line x1="12" y1="9" x2="12" y2="15"></line><line x1="16" y1="6" x2="16" y2="18"></line></g></svg>',
)
function kn(e) {
  var t = _n()
  N(e, t)
}
var Cn = Xe(
  '<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><g stroke="currentColor" stroke-linecap="round" stroke-width="1.5" fill="none"><line x1="8" y1="6" x2="8" y2="18"></line><line x1="12" y1="9" x2="12" y2="15"></line><line x1="16" y1="11" x2="16" y2="13"></line></g></svg>',
)
function Mn(e) {
  var t = Cn()
  N(e, t)
}
var In = Xe(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1.75rem" height="1.75rem" viewBox="0 0 24 24"><g stroke="currentColor" stroke-linecap="round" stroke-width="1.5" fill="none"><line x1="4" y1="11" x2="4" y2="13"></line><line x1="8" y1="9" x2="8" y2="15"></line><line x1="12" y1="6" x2="12" y2="18"></line><line x1="16" y1="9" x2="16" y2="15"></line><line x1="20" y1="11" x2="20" y2="13"></line></g></svg>',
)
function zn(e) {
  var t = In()
  N(e, t)
}
var Nn = j("<h5> </h5>"),
  En = j(
    '<div role="button"><div class="absolute h-full rounded-full bg-(--bg-color)"></div></div> <input type="range"/> <div class="pointer-events-none absolute z-40 rounded-full bg-(--field-color)"><!></div> <input type="range"/> <div class="pointer-events-none absolute z-40 rounded-full bg-(--field-color)"><!></div>',
    1,
  ),
  Sn = j(
    '<div role="button"><div></div></div> <input type="range" class="absolute z-20 h-full w-full appearance-none svelte-17e64va"/> <div class="pointer-events-none absolute z-30 rounded-full bg-(--field-color)"><!></div>',
    1,
  ),
  An = j(
    '<div style="background-color: var(--bg-color)"><button>−</button> <span class="inline-block text-center tabular-nums"> </span> <button>+</button></div>',
  ),
  On = j(
    '<div style="background-color: var(--bg-color)"><button>−</button> <span class="inline-block text-center tabular-nums"> </span> <button>+</button></div>',
  ),
  Tn = j("<div><!> <div><!></div> <div><!></div></div>")
function sl(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "label", 19, () => ({ name: "", class: "" })),
    c = H(t, "type", 3, "single"),
    l = H(t, "value", 7, 0),
    r = H(t, "number", 19, () => ({ minNum: 0, maxNum: 10, step: 1 })),
    d = H(t, "disabled", 3, !1),
    C = H(t, "onUpdate", 3, () => {})
  const k = ne(() => c() === "range" || (Array.isArray(l()) && l().length === 2)),
    R = `${String(r().maxNum ?? 100).length + 1}ch`
  let z = ne(() => (!n(k) && typeof l() == "number" ? l() : r().minNum)),
    g = ne(() => (n(k) && Array.isArray(l()) ? l()[0] : r().minNum)),
    w = ne(() => (n(k) && Array.isArray(l()) ? l()[1] : r().maxNum))
  const O = ne(() => ((n(z) - r().minNum) / (r().maxNum - r().minNum)) * 100),
    L = ne(() => ((n(g) - r().minNum) / (r().maxNum - r().minNum)) * 100),
    U = ne(() => ((n(w) - r().minNum) / (r().maxNum - r().minNum)) * 100)
  ct(() => {
    ;(l() === void 0 || l() === null) && (c() === "single" && !l() && l(r().minNum), c() === "range" && !l() && l([r().minNum, r().maxNum]))
  })
  const Z = (D, i) => {
    const h = i === "increment" ? r().step : -r().step
    n(k) && D !== "single"
      ? (D === "lower" ? W(g, Math.max(r().minNum, Math.min(n(g) + h, n(w)))) : W(w, Math.min(r().maxNum, Math.max(n(w) + h, n(g)))), C()([n(g), n(w)]))
      : (W(z, Math.max(r().minNum, Math.min(n(z) + h, r().maxNum))), C()(n(z)))
  }
  ct(() => {
    Array.isArray(l()) ? (W(g, l()[0]), W(w, l()[1])) : typeof l() == "number" && W(z, l())
  })
  let ee = Ce("lower")
  const T = (D) => {
    D.stopPropagation()
    const h = D.currentTarget.getBoundingClientRect(),
      B = ((D.clientX - h.left) / h.width) * 100,
      p = r().minNum + (B / 100) * (r().maxNum - r().minNum),
      b = Math.round((p - r().minNum) / r().step) * r().step + r().minNum
    if (n(k)) {
      const x = Math.abs(b - n(g)),
        s = Math.abs(b - n(w))
      ;(W(ee, x < s ? "lower" : "upper", !0),
        n(ee) === "lower" ? W(g, Math.max(r().minNum, Math.min(b, n(w)))) : W(w, Math.min(r().maxNum, Math.max(b, n(g)))),
        C()([n(g), n(w)]))
    } else (W(z, Math.max(r().minNum, Math.min(b, r().maxNum))), C()(n(z)))
  }
  var v = Tn(),
    f = M(v)
  {
    var I = (D) => {
      var i = Nn(),
        h = M(i, !0)
      ;(_(i),
        X(
          (B) => {
            ;(K(i, 1, B), ce(h, u().name))
          },
          [() => fe(de("w-full px-4 text-center", u().class))],
        ),
        N(D, i))
    }
    J(f, (D) => {
      u().name && D(I)
    })
  }
  var $ = q(f, 2),
    Q = M($)
  {
    var S = (D) => {
        var i = En(),
          h = ve(i)
        ;(te(h, "tabindex", null),
          (h.__keydown = function (...y) {}),
          (h.__click = function (...y) {
            ;(d() ? void 0 : T)?.apply(this, y)
          }))
        var B = M(h)
        _(h)
        var p = q(h, 2)
        ;(et(p),
          (p.__input = function (...y) {
            ;(d()
              ? void 0
              : (Y) => {
                  const re = Math.min(Number(Y.target.value), n(w))
                  ;(W(g, re), W(ee, "lower"))
                }
            )?.apply(this, y)
          }),
          (p.__mouseup = function (...y) {
            ;(d() ? void 0 : () => C()([n(g), n(w)]))?.apply(this, y)
          }))
        var b = q(p, 2),
          x = M(b)
        ;(kn(x), _(b))
        var s = q(b, 2)
        ;(et(s),
          (s.__input = function (...y) {
            ;(d()
              ? void 0
              : (Y) => {
                  const re = Math.max(Number(Y.target.value), n(g))
                  ;(W(w, re), W(ee, "upper"))
                }
            )?.apply(this, y)
          }),
          (s.__mouseup = function (...y) {
            ;(d() ? void 0 : () => C()([n(g), n(w)]))?.apply(this, y)
          }))
        var E = q(s, 2),
          V = M(E)
        ;(Mn(V),
          _(E),
          X(() => {
            ;(K(h, 1, `absolute h-full w-full rounded-full bg-(--gray-color) ${d() ? "" : "cursor-pointer"}`),
              me(B, `left: ${n(L)}%; right: ${100 - n(U)}%;`),
              te(p, "min", r().minNum),
              te(p, "max", r().maxNum),
              te(p, "step", r().step),
              (p.disabled = d()),
              K(p, 1, `absolute h-full w-full appearance-none bg-transparent ${n(ee) === "lower" ? "z-30" : "z-20"}`, "svelte-17e64va"),
              me(b, `left: calc(${n(L)}% + 0rem); top: 50%; transform: translateY(-50%)`),
              te(s, "min", r().minNum),
              te(s, "max", r().maxNum),
              te(s, "step", r().step),
              (s.disabled = d()),
              K(s, 1, `absolute h-full w-full appearance-none bg-transparent ${n(ee) === "upper" ? "z-30" : "z-20"}`, "svelte-17e64va"),
              me(E, `left: calc(${n(U)}% - 2rem); top: 50%; transform: translateY(-50%)`))
          }),
          tt(
            p,
            () => n(g),
            (y) => W(g, y),
          ),
          tt(
            s,
            () => n(w),
            (y) => W(w, y),
          ),
          N(D, i))
      },
      P = (D) => {
        var i = Sn(),
          h = ve(i)
        ;(te(h, "tabindex", null),
          (h.__keydown = function (...s) {}),
          (h.__click = function (...s) {
            ;(d() ? void 0 : T)?.apply(this, s)
          }))
        var B = M(h)
        _(h)
        var p = q(h, 2)
        ;(et(p),
          (p.__input = function (...s) {
            ;(d()
              ? void 0
              : (E) => {
                  W(z, Number(E.target.value))
                }
            )?.apply(this, s)
          }),
          (p.__mouseup = function (...s) {
            ;(d() ? void 0 : () => C()(n(z)))?.apply(this, s)
          }))
        var b = q(p, 2),
          x = M(b)
        ;(zn(x),
          _(b),
          X(() => {
            ;(K(h, 1, `absolute h-full w-full rounded-full bg-(--gray-color) ${d() ? "" : "cursor-pointer"}`),
              K(B, 1, `absolute z-10 h-full ${n(O) === 100 ? " rounded-full" : "rounded-l-full"}`),
              me(B, `width: ${n(O)}%; background-color: var(--bg-color)`),
              te(p, "min", r().minNum),
              te(p, "max", r().maxNum),
              te(p, "step", r().step),
              (p.disabled = d()),
              me(b, `left: clamp(1rem, ${n(O)}%, calc(100% - 1rem)); top: 50%; transform: translate(-50%, -50%)`))
          }),
          tt(
            p,
            () => n(z),
            (s) => W(z, s),
          ),
          N(D, i))
      }
    J(Q, (D) => {
      n(k) ? D(S) : D(P, !1)
    })
  }
  _($)
  var oe = q($, 2),
    se = M(oe)
  {
    var ie = (D) => {
        var i = ke(),
          h = ve(i)
        ;(Se(
          h,
          16,
          () => ["lower", "upper"],
          (B) => B,
          (B, p, b, x) => {
            var s = An(),
              E = M(s)
            E.__click = function (...re) {
              ;(d() ? void 0 : () => Z(p, "decrement"))?.apply(this, re)
            }
            var V = q(E, 2),
              y = M(V, !0)
            _(V)
            var Y = q(V, 2)
            ;((Y.__click = function (...re) {
              ;(d() ? void 0 : () => Z(p, "increment"))?.apply(this, re)
            }),
              _(s),
              X(() => {
                ;(K(s, 1, `flex items-center justify-center gap-2 rounded-full px-2 ${d() ? "opacity-70" : ""}`),
                  K(E, 1, `h-full w-4 ${d() ? "" : "cursor-pointer"}`),
                  (E.disabled = d() || (p === "lower" ? n(g) <= r().minNum : n(w) <= n(g))),
                  me(V, `width: ${R}`),
                  ce(y, p === "lower" ? n(g) : n(w)),
                  K(Y, 1, `h-full w-4 ${d() ? "" : "cursor-pointer"}`),
                  (Y.disabled = d() || (p === "lower" ? n(g) >= n(w) : n(w) >= r().maxNum)))
              }),
              N(B, s))
          },
        ),
          N(D, i))
      },
      ae = (D) => {
        var i = On(),
          h = M(i)
        h.__click = function (...x) {
          ;(d() ? void 0 : () => Z("single", "decrement"))?.apply(this, x)
        }
        var B = q(h, 2),
          p = M(B, !0)
        _(B)
        var b = q(B, 2)
        ;((b.__click = function (...x) {
          ;(d() ? void 0 : () => Z("single", "increment"))?.apply(this, x)
        }),
          _(i),
          X(() => {
            ;(K(i, 1, `flex items-center justify-center gap-2 rounded-full px-2 ${d() ? "opacity-70" : ""}`),
              K(h, 1, `h-full w-4 ${d() ? "" : "cursor-pointer"}`),
              (h.disabled = d() || n(z) <= r().minNum),
              me(B, `width: ${R}`),
              ce(p, n(z)),
              K(b, 1, `h-full w-4 ${d() ? "" : "cursor-pointer"}`),
              (b.disabled = d() || n(z) >= r().maxNum))
          }),
          N(D, i))
      }
    J(se, (D) => {
      n(k) ? D(ie) : D(ae, !1)
    })
  }
  ;(_(oe),
    _(v),
    X(
      (D) => {
        ;(K(v, 1, D),
          te($, "id", o()),
          K($, 1, `relative flex h-7 w-full justify-center rounded-full ${d() ? "cursor-not-allowed opacity-50" : ""}`),
          K(oe, 1, `mt-2 flex w-full ${n(k) ? "justify-between" : "justify-center"} gap-2`))
      },
      [() => fe(de("relative flex w-full flex-col items-center ", a()))],
    ),
    N(e, v),
    Te())
}
Le(["keydown", "click", "input", "mouseup"])
var Ln = j("<h5> </h5>"),
  Pn = j(
    '<div><!> <div class="relative flex w-full grow items-center justify-center bg-transparent"><button> </button> <label><input type="checkbox" class="absolute left-1/2 h-full w-full -translate-x-1/2 cursor-pointer appearance-none rounded-md"/> <span><span></span></span></label> <button> </button></div></div>',
  )
function Bn(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "disabled", 3, !1),
    u = H(t, "wrapperClass", 3, ""),
    c = H(t, "label", 19, () => ({ name: "", class: "", captionLeft: "", captionRight: "" })),
    l = H(t, "height", 3, "2rem"),
    r = H(t, "value", 15),
    d = H(t, "onChange", 3, () => {})
  const C = [1, 2]
  let k = ne(() => r() === C[1]),
    A = ne(() => (n(k) ? `translateX(calc(${l()}))` : "translateX(0)"))
  ct(() => {
    ;(r() === void 0 || r() === null) && r(C[0])
  })
  const R = () => {
      if (a()) return
      const S = n(k) ? C[1] : C[0]
      ;(r(S), d()(S))
    },
    z = (S) => {
      a() || r() === S || (r(S), d()(S))
    },
    g = ne(() =>
      Math.max(c().captionLeft?.length ?? 0, c().captionRight?.length ?? 0) > 0
        ? `${Math.max(c().captionLeft?.length ?? 0, c().captionRight?.length ?? 0)}ch`
        : "auto",
    )
  var w = Pn(),
    O = M(w)
  {
    var L = (S) => {
      var P = Ln(),
        oe = M(P, !0)
      ;(_(P),
        X(
          (se) => {
            ;(K(P, 1, se), ce(oe, c().name))
          },
          [() => fe(de("w-full px-4 text-center", c().class))],
        ),
        N(S, P))
    }
    J(O, (S) => {
      c().name && S(L)
    })
  }
  var U = q(O, 2),
    Z = M(U)
  Z.__click = () => z(1)
  var ee = M(Z, !0)
  _(Z)
  var T = q(Z, 2),
    v = M(T)
  ;(et(v), (v.__change = R))
  var f = q(v, 2),
    I = M(f)
  ;(_(f), _(T))
  var $ = q(T, 2)
  $.__click = () => z(2)
  var Q = M($, !0)
  ;(_($),
    _(U),
    _(w),
    X(
      (S) => {
        ;(K(w, 1, S),
          K(Z, 1, `mr-2 ${a() ? "opacity-60" : "cursor-pointer"}`),
          me(Z, `width: ${n(g) ?? ""}; text-align: end;`),
          ce(ee, c().captionLeft),
          K(
            T,
            1,
            `relative flex items-center justify-between rounded-full border
      ${n(k) ? "border-(--bg-color)" : "border-(--gray-color)"}
      ${a() ? "opacity-60" : ""}`,
          ),
          te(v, "id", o()),
          (v.disabled = a()),
          K(
            f,
            1,
            `relative flex items-center rounded-full transition-all duration-250
        ${n(k) ? "bg-(--bg-color)" : "bg-(--gray-color)"}
        ${a() ? "" : "cursor-pointer"}`,
          ),
          me(f, `width: ${`calc(${l()} * 2)`}; height: ${l() ?? ""};`),
          K(
            I,
            1,
            `absolute rounded-full bg-(--back-color) transition-all duration-250
          ${a() ? "opacity-60" : "cursor-pointer"}`,
          ),
          me(I, `width: ${`calc(${l()} * 0.75)`}; height: ${`calc(${l()} * 0.75)`}; margin: 0 ${`calc(${l()} * 0.1)`}; transform: ${n(A) ?? ""};`),
          K($, 1, `ml-2 ${a() ? "opacity-60" : "cursor-pointer"}`),
          me($, `width: ${n(g) ?? ""}; text-align: start;`),
          ce(Q, c().captionRight))
      },
      [() => fe(de("bg-blue relative flex w-full flex-col items-center justify-center", u()))],
    ),
    Oo(
      v,
      () => n(k),
      (S) => W(k, S),
    ),
    N(e, w),
    Te())
}
Le(["click", "change"])
var Vn = j("<h5> </h5>"),
  Rn = j('<button class="inline-block cursor-pointer font-bold transition-transform duration-75 hover:scale-110 active:scale-95">↑↓</button>'),
  Hn = j("<div><span> </span> <!></div>"),
  jn = j("<button> </button>"),
  qn = j('<div class="flex w-full flex-col gap-1"></div>'),
  Un = j('<img loading="lazy"/>'),
  Dn = j('<div class="flex items-center justify-center"><!></div>'),
  Gn = j('<button class="w-full cursor-pointer overflow-hidden text-left text-ellipsis whitespace-nowrap"><!></button>'),
  Fn = j('<div class="rounded-md bg-(--green-color) shadow-lg">✓</div>'),
  Qn = Xe(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"></path><path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3"></path></g></svg>',
  ),
  Wn = j(
    '<button class="mx-2 flex cursor-pointer border-none bg-transparent text-2xl" aria-label="Копировать текст"><div class=" size-5 text-sm [&amp;_svg]:h-full [&amp;_svg]:max-h-full [&amp;_svg]:w-full [&amp;_svg]:max-w-full"><!></div></button>',
  ),
  Kn = j('<div role="columnheader"><!></div> <!>', 1),
  Yn = j("<div><!></div>"),
  Xn = j('<div class="fixed z-50 w-max max-w-min rounded-md px-2 py-1 text-sm whitespace-pre-wrap shadow-lg" role="tooltip"><!></div>'),
  Jn = j('<div class="flex h-8 items-center justify-center bg-(--bg-color)"><h5> </h5></div>'),
  Zn = j(
    '<div><!> <div><div class="grid font-semibold"></div> <div class="flex-1 overflow-y-auto bg-(--container-color)/50"><div class="grid min-w-0"></div></div> <!> <!></div></div>',
  )
function il(e, t) {
  Oe(t, !0)
  let o = H(t, "id", 19, () => crypto.randomUUID()),
    a = H(t, "wrapperClass", 3, ""),
    u = H(t, "label", 19, () => ({ name: "", class: "" })),
    c = H(t, "body", 23, () => []),
    l = H(t, "header", 19, () => []),
    r = H(t, "footer", 3, ""),
    d = H(t, "outline", 3, !1),
    C = H(t, "cursor", 3, null),
    k = H(t, "getData", 3, () => {}),
    A = H(t, "modalData", 15),
    R = { key: null, direction: null }
  const z = (i) => {
    ;(R.key === i ? (R.direction = R.direction === "asc" ? "desc" : "asc") : ((R.key = i), (R.direction = "asc")),
      c(
        [...c()].sort((h, B) => {
          const p = h[i],
            b = B[i]
          if (typeof p == "number" && typeof b == "number") return R.direction === "asc" ? p - b : b - p
          if (p instanceof Date && b instanceof Date) return R.direction === "asc" ? p.getTime() - b.getTime() : b.getTime() - p.getTime()
          const x = String(p).toLowerCase(),
            s = String(b).toLowerCase(),
            E = x.match(/\d+/g)?.[0] || "",
            V = s.match(/\d+/g)?.[0] || ""
          if (E && V) {
            const Y = parseInt(E, 10) - parseInt(V, 10)
            if (Y !== 0) return R.direction === "asc" ? Y : -Y
          }
          const y = x.localeCompare(s)
          return R.direction === "asc" ? y : -y
        }),
      ))
  }
  let g = Ce(null)
  function w() {
    if (!n(g)) return
    const { scrollTop: i, clientHeight: h, scrollHeight: B } = n(g)
    i + h >= B - 50 && C() !== null && t.loader && !wo(t.loader) && k()()
  }
  function O(i, h) {
    if (h.onClick) h.onClick(i)
    else if (h.eventHandler && t.onClick) {
      let B = {}
      ;(h.eventHandler.Variables.forEach((p) => {
        B[p] = i[p]
      }),
        (h.eventHandler.Value = JSON.stringify(B)),
        t.onClick(h.eventHandler))
    }
  }
  let L = Ce(ht({ x: "", y: -1 })),
    U = Ce(ht({ show: !1, text: "", x: 0, y: 0 }))
  const Z = async (i, h) => {
      A({ isOpen: !0, rawData: i, formattedData: h ? h(i) : (i ?? "") })
    },
    ee = (i, h, B) => {
      W(U, { show: !0, text: B ? B(h) : (h ?? ""), x: i.clientX, y: i.clientY }, !0)
    },
    T = () => {
      n(U).show = !1
    },
    v = (i, h) => !!(typeof i.image?.src == "function" ? i.image.src(h) : i.image?.src)
  var f = Zn(),
    I = M(f)
  {
    var $ = (i) => {
      var h = Vn(),
        B = M(h, !0)
      ;(_(h),
        X(
          (p) => {
            ;(K(h, 1, p), ce(B, u().name))
          },
          [() => fe(de("w-full px-4 text-center", u().class))],
        ),
        N(i, h))
    }
    J(I, (i) => {
      u().name && i($)
    })
  }
  var Q = q(I, 2),
    S = M(Q)
  ;(Se(
    S,
    22,
    l,
    (i) => i,
    (i, h, B) => {
      var p = Hn(),
        b = M(p),
        x = M(b, !0)
      _(b)
      var s = q(b, 2)
      {
        var E = (V) => {
          var y = Rn()
          ;((y.__click = () => z(h.key)), N(V, y))
        }
        J(s, (V) => {
          h.sortable && V(E)
        })
      }
      ;(_(p),
        X(
          (V) => {
            ;(K(p, 1, V), ce(x, h.label?.name))
          },
          [
            () =>
              fe(
                de(
                  `justify-center border-l ${d() && n(B) !== 0 ? " border-(--border-color)" : "border-transparent"} ${h.align?.header === "center" ? "flex justify-center text-center" : h.align?.header === "right" ? "flex justify-end text-right" : "flex justify-start text-left"} bg-(--bg-color) p-2 text-left`,
                  h.label?.class,
                ),
              ),
          ],
        ),
        N(i, p))
    },
  ),
    _(S))
  var P = q(S, 2),
    oe = M(P)
  ;(Se(
    oe,
    22,
    c,
    (i) => i,
    (i, h, B) => {
      var p = ke(),
        b = ve(p)
      ;(Se(
        b,
        18,
        l,
        (x) => x,
        (x, s, E) => {
          var V = Yn(),
            y = M(V)
          {
            var Y = (pe) => {
                var ue = qn()
                ;(Se(
                  ue,
                  20,
                  () => s.buttons,
                  (ge) => ge,
                  (ge, Me) => {
                    var Ie = jn()
                    Ie.__click = () => O(h, Me)
                    var Ae = M(Ie, !0)
                    ;(_(Ie),
                      X(
                        (ze, Ne) => {
                          ;(K(Ie, 1, `${ze ?? ""} bg-(--bg-color)`), ce(Ae, Ne))
                        },
                        [
                          () =>
                            de(`cursor-pointer rounded-full 
                           px-4 py-1 font-medium transition-shadow outline-none select-none hover:shadow-md
                          ${typeof Me.class == "function" ? Me.class(h) : Me.class}`),
                          () => (typeof Me.name == "function" ? Me.name(h) : Me.name),
                        ],
                      ),
                      N(ge, Ie))
                  },
                ),
                  _(ue),
                  N(pe, ue))
              },
              re = (pe) => {
                var ue = ke(),
                  ge = ve(ue)
                {
                  var Me = (Ae) => {
                      var ze = Dn(),
                        Ne = M(ze)
                      {
                        var xt = (je) => {
                            var Be = Un()
                            ;(X(
                              (at, be) => {
                                ;(te(Be, "src", at), te(Be, "alt", s.image.alt ?? "Image"), K(Be, 1, be))
                              },
                              [
                                () => (typeof s.image?.src == "function" ? s.image.src(h) : s.image?.src || ""),
                                () => fe(de(`h-full w-full object-cover ${s.image.class || ""}`)),
                              ],
                            ),
                              N(je, Be))
                          },
                          yt = (je) => {
                            var Be = ke(),
                              at = ve(Be)
                            {
                              var be = (he) => {
                                var Ve = ke(),
                                  nt = ve(Ve)
                                ;(ye(
                                  nt,
                                  () => s.image.defaultIcon,
                                  (_t, kt) => {
                                    kt(_t, {})
                                  },
                                ),
                                  N(he, Ve))
                              }
                              J(
                                at,
                                (he) => {
                                  s.image.defaultIcon && he(be)
                                },
                                !0,
                              )
                            }
                            N(je, Be)
                          }
                        J(Ne, (je) => {
                          v(s, h) ? je(xt) : je(yt, !1)
                        })
                      }
                      ;(_(ze), X(() => me(ze, `width: ${s.image.width || "5rem"}; height: ${s.image.height || "5rem"};`)), N(Ae, ze))
                    },
                    Ie = (Ae) => {
                      var ze = Kn(),
                        Ne = ve(ze)
                      ;((Ne.__mousemove = function (...be) {
                        ;(s.overflow?.truncated
                          ? (he) => {
                              ;((n(U).x = he.clientX), (n(U).y = he.clientY))
                            }
                          : void 0
                        )?.apply(this, be)
                      }),
                        te(Ne, "tabindex", null))
                      var xt = M(Ne)
                      {
                        var yt = (be) => {
                            var he = Gn()
                            he.__click = (nt) => {
                              ;(nt.stopPropagation(), Z(h[s.key], s.overflow?.formatting))
                            }
                            var Ve = M(he)
                            ;(Ye(Ve, () => h[s.key]), _(he), N(be, he))
                          },
                          je = (be) => {
                            var he = ke(),
                              Ve = ve(he)
                            ;(Ye(Ve, () => h[s.key]), N(be, he))
                          }
                        J(xt, (be) => {
                          s.overflow?.modal ? be(yt) : be(je, !1)
                        })
                      }
                      _(Ne)
                      var Be = q(Ne, 2)
                      {
                        var at = (be) => {
                          var he = Wn()
                          he.__click = (qe) => {
                            ;(qe.preventDefault(),
                              navigator.clipboard.writeText(h[s.key]),
                              W(L, { x: s.key, y: n(B) }, !0),
                              setTimeout(() => W(L, { x: "", y: -1 }, !0), 1e3))
                          }
                          var Ve = M(he),
                            nt = M(Ve)
                          {
                            var _t = (qe) => {
                                var Ct = Fn()
                                N(qe, Ct)
                              },
                              kt = (qe) => {
                                var Ct = Qn()
                                N(qe, Ct)
                              }
                            J(nt, (qe) => {
                              n(L).y === n(B) && n(L).x === s.key ? qe(_t) : qe(kt, !1)
                            })
                          }
                          ;(_(Ve), _(he), N(be, he))
                        }
                        J(Be, (be) => {
                          s.overflow?.copy && be(at)
                        })
                      }
                      ;(X(() =>
                        K(
                          Ne,
                          1,
                          `w-full max-w-full wrap-break-word ${s.overflow?.truncated ? "overflow-hidden text-ellipsis whitespace-nowrap" : "whitespace-normal "}`,
                        ),
                      ),
                        Ke("mouseenter", Ne, function (...be) {
                          ;(s.overflow?.truncated ? (he) => ee(he, h[s.key], s.overflow?.formatting) : void 0)?.apply(this, be)
                        }),
                        Ke("mouseleave", Ne, function (...be) {
                          ;(s.overflow?.truncated ? T : void 0)?.apply(this, be)
                        }),
                        N(Ae, ze))
                    }
                  J(
                    ge,
                    (Ae) => {
                      s.image ? Ae(Me) : Ae(Ie, !1)
                    },
                    !0,
                  )
                }
                N(pe, ue)
              }
            J(y, (pe) => {
              s.buttons ? pe(Y) : pe(re, !1)
            })
          }
          ;(_(V),
            X(() =>
              K(
                V,
                1,
                `relative flex w-full min-w-0 items-center px-2 py-1 wrap-break-word
              ${n(B) % 2 ? "bg-(--back-color)/40" : "bg-[#edeef3] dark:bg-[#1f2a3a]"}
              ${s.align?.content === "center" ? "flex justify-center text-center" : s.align?.content === "right" ? "flex justify-end text-right" : "flex justify-start text-left"}
              border-t
              ${n(E) !== 0 ? " border-l " : ""}
              ${d() ? "border-(--border-color)" : "border-transparent"}  `,
              ),
            ),
            N(x, V))
        },
      ),
        N(i, p))
    },
  ),
    _(oe),
    _(P),
    kr(
      P,
      (i) => W(g, i),
      () => n(g),
    ))
  var se = q(P, 2)
  {
    var ie = (i) => {
      var h = Xn(),
        B = M(h)
      ;(Ye(B, () => n(U).text),
        _(h),
        X(() =>
          me(
            h,
            `background: color-mix(in srgb, var(--yellow-color) 30%, var(--back-color)); transform: translateX(-50%); left: ${n(U).x + 10}px; top: ${n(U).y + 10}px;`,
          ),
        ),
        Ee(
          3,
          h,
          () => We,
          () => ({ y: 10, duration: 200 }),
        ),
        N(i, h))
    }
    J(se, (i) => {
      n(U).show && i(ie)
    })
  }
  var ae = q(se, 2)
  {
    var D = (i) => {
      var h = Jn(),
        B = M(h),
        p = M(B, !0)
      ;(_(B), _(h), X(() => ce(p, r())), N(i, h))
    }
    J(ae, (i) => {
      r() && i(D)
    })
  }
  ;(_(Q),
    _(f),
    X(
      (i, h, B) => {
        ;(te(f, "id", o()),
          K(f, 1, i),
          K(Q, 1, `flex h-full flex-col overflow-hidden rounded-xl border ${d() ? " border-(--border-color)" : "border-transparent"} `),
          me(S, h),
          me(oe, B))
      },
      [
        () => fe(de("bg-blue flex h-full w-full flex-col overflow-hidden", a())),
        () =>
          `grid-template-columns: ${l()
            .map((i) => i.width || "minmax(0, 1fr)")
            .join(" ")};`,
        () =>
          `grid-template-columns: ${l()
            .map((i) => i.width || "minmax(0, 1fr)")
            .join(" ")};`,
      ],
    ),
    Ke("scroll", P, w),
    N(e, f),
    Te())
}
Le(["click", "mousemove"])
export {
  al as A,
  Ze as B,
  ll as C,
  cr as F,
  Fe as I,
  ir as M,
  Tt as S,
  il as T,
  nl as a,
  K as b,
  me as c,
  fe as d,
  Se as e,
  Bn as f,
  Yt as g,
  sl as h,
  ut as i,
  Rt as j,
  Ee as k,
  Lo as l,
  Ye as m,
  ya as o,
  te as s,
  de as t,
  xe as u,
}
