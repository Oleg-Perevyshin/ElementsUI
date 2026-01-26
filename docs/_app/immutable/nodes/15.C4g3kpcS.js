import { c as ee, a as z, f as W } from "../chunks/Di61MV9l.js"
import { p as J, i as te, f as ne, a as K, c as _, g as t, u as r, s as v, r as f, b as oe, d as re, e as ae } from "../chunks/CYmiEaEH.js"
import { p as le, i as ce, a as se, c as p, d as q, s as ie } from "../chunks/_y1boTp2.js"
import { C as pe, f as ue } from "../chunks/BSX-LnOW.js"
import { T as de } from "../chunks/H79yRWWV.js"
import { u as s, S as T, I as L, t as y, f as P, o as me, g as ve } from "../chunks/CnAfG7ip.js"
var ge = W(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!></div></div>',
  ),
  _e = W(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!></div></div>',
  )
function fe(R, e) {
  J(e, !0)
  const u = () => q(me, "$optionsStore", X),
    l = () => q(ve, "$t", X),
    [X, I] = se(),
    j = le(e, "forConstructor", 3, !0),
    b = te("DeviceVariables")
  let C = r(() => (b && Array.isArray(b) ? b : [])),
    k = r(() => u().TEXTFIELD_SIZE_OPTIONS.find((m) => m.value === e.component.properties.content.size))
  const G = r(() => u().TEXT_ALIGN_OPTIONS.find((m) => m.value.includes(e.component.properties.content?.class?.split(" ").find((g) => g.startsWith("text-"))))),
    Z = r(() => u().TEXT_COLOR_OPTIONS.find((m) => m.value.includes(e.component.properties.wrapperClass?.split(" ").find((g) => g.startsWith("text-"))))),
    B = r(() => e.component.properties.content?.class?.split(" ").find((m) => m.startsWith("font-bold"))),
    H = r(() => e.component.properties.content?.class?.split(" ").find((m) => m.startsWith("italic")))
  var M = ee(),
    Q = ne(M)
  {
    var Y = (m) => {
        var g = ge(),
          x = _(g),
          O = _(x)
        {
          let i = r(() => ({ name: l()("constructor.props.variable") })),
            d = r(() => t(C).find((n) => n.value === e.component.properties.id))
          p(
            O,
            () => T,
            (n, o) => {
              o(n, {
                get label() {
                  return t(i)
                },
                get options() {
                  return t(C)
                },
                get value() {
                  return t(d)
                },
                onUpdate: (a) => {
                  ;(s("id", a.value, e.component, e.onPropertyChange, a.name?.split("—")[1].trim()),
                    s("eventHandler.Variables", a.value, e.component, e.onPropertyChange))
                },
              })
            },
          )
        }
        var w = v(O, 2)
        {
          let i = r(() => ({ name: l()("constructor.props.label") }))
          p(
            w,
            () => L,
            (d, n) => {
              n(d, {
                get label() {
                  return t(i)
                },
                get value() {
                  return e.component.properties.content.name
                },
                onUpdate: (o) => s("content.name", o, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var V = v(w, 2)
        {
          let i = r(() => ({ name: l()("constructor.props.size") }))
          p(
            V,
            () => T,
            (d, n) => {
              n(d, {
                get label() {
                  return t(i)
                },
                type: "buttons",
                get value() {
                  return t(k)
                },
                get options() {
                  return u().TEXTFIELD_SIZE_OPTIONS
                },
                onUpdate: (o) => s("content.size", o.value, e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(x)
        var h = v(x, 2),
          S = _(h)
        {
          let i = r(() => ({ name: l()("constructor.props.align") }))
          p(
            S,
            () => T,
            (d, n) => {
              n(d, {
                get label() {
                  return t(i)
                },
                type: "buttons",
                get value() {
                  return t(G)
                },
                get options() {
                  return u().TEXT_ALIGN_OPTIONS
                },
                onUpdate: (o) => s("content.class", y(e.component.properties.content.class, o.value), e.component, e.onPropertyChange),
              })
            },
          )
        }
        var A = v(S, 2)
        {
          let i = r(() => ({ name: l()("constructor.props.textcolors") }))
          p(
            A,
            () => T,
            (d, n) => {
              n(d, {
                wrapperClass: "!h-14",
                get label() {
                  return t(i)
                },
                type: "buttons",
                get options() {
                  return u().TEXT_COLOR_OPTIONS
                },
                get value() {
                  return t(Z)
                },
                onUpdate: (o) => s("wrapperClass", y(e.component.properties.wrapperClass, o.value), e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(h)
        var E = v(h, 2),
          F = _(E)
        {
          let i = r(() => ({ name: l()("constructor.props.bold") })),
            d = r(() => (t(B) ? 2 : 1))
          p(
            F,
            () => P,
            (n, o) => {
              o(n, {
                get label() {
                  return t(i)
                },
                get value() {
                  return t(d)
                },
                onChange: (a) =>
                  s("content.class", `${e.component.properties.content.class} ${a === 2 ? "font-bold" : "font-normal"}`, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var U = v(F, 2)
        {
          let i = r(() => ({ name: l()("constructor.props.italic") })),
            d = r(() => (t(H) ? 2 : 1))
          p(
            U,
            () => P,
            (n, o) => {
              o(n, {
                get label() {
                  return t(i)
                },
                get value() {
                  return t(d)
                },
                onChange: (a) =>
                  s("content.class", `${e.component.properties.content.class} ${a === 2 ? "italic" : "not-italic"}`, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var D = v(U, 2)
        {
          let i = r(() => ({ name: l()("constructor.props.background") })),
            d = r(() => (e.component.properties.background ? 2 : 1))
          p(
            D,
            () => P,
            (n, o) => {
              o(n, {
                get label() {
                  return t(i)
                },
                get value() {
                  return t(d)
                },
                onChange: (a) => s("background", a === 2, e.component, e.onPropertyChange),
              })
            },
          )
        }
        ;(f(E), f(g), z(m, g))
      },
      $ = (m) => {
        var g = _e(),
          x = _(g),
          O = _(x)
        {
          let n = r(() => ({ name: l()("constructor.props.id") }))
          p(
            O,
            () => L,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                get value() {
                  return e.component.properties.id
                },
                onUpdate: (c) => s("id", c, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var w = v(O, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.wrapperclass") }))
          p(
            w,
            () => L,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                get value() {
                  return e.component.properties.wrapperClass
                },
                onUpdate: (c) => s("wrapperClass", c, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var V = v(w, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.textcolors") }))
          p(
            V,
            () => T,
            (o, a) => {
              a(o, {
                wrapperClass: "!h-14",
                get label() {
                  return t(n)
                },
                type: "buttons",
                get options() {
                  return u().TEXT_COLOR_OPTIONS
                },
                get value() {
                  return t(Z)
                },
                onUpdate: (c) => s("wrapperClass", y(e.component.properties.wrapperClass, c.value), e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(x)
        var h = v(x, 2),
          S = _(h)
        {
          let n = r(() => ({ name: l()("constructor.props.label") }))
          p(
            S,
            () => L,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                get value() {
                  return e.component.properties.content.name
                },
                onUpdate: (c) => s("content.name", c, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var A = v(S, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.size") }))
          p(
            A,
            () => T,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                type: "buttons",
                get value() {
                  return t(k)
                },
                get options() {
                  return u().TEXTFIELD_SIZE_OPTIONS
                },
                onUpdate: (c) => s("content.size", c.value, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var E = v(A, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.componentclass") }))
          p(
            E,
            () => L,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                get value() {
                  return e.component.properties.content.class
                },
                onUpdate: (c) => s("content.class", c, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var F = v(E, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.align") }))
          p(
            F,
            () => T,
            (o, a) => {
              a(o, {
                get label() {
                  return t(n)
                },
                type: "buttons",
                get value() {
                  return t(G)
                },
                get options() {
                  return u().TEXT_ALIGN_OPTIONS
                },
                onUpdate: (c) => s("content.class", y(e.component.properties.content.class, c.value), e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(h)
        var U = v(h, 2),
          D = _(U)
        {
          let n = r(() => ({ name: l()("constructor.props.bold") })),
            o = r(() => (t(B) ? 2 : 1))
          p(
            D,
            () => P,
            (a, c) => {
              c(a, {
                get label() {
                  return t(n)
                },
                get value() {
                  return t(o)
                },
                onChange: (N) =>
                  s("content.class", y(`${e.component.properties.content.class} ${N === 2 ? "font-bold" : "font-normal"}`), e.component, e.onPropertyChange),
              })
            },
          )
        }
        var i = v(D, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.italic") })),
            o = r(() => (t(H) ? 2 : 1))
          p(
            i,
            () => P,
            (a, c) => {
              c(a, {
                get label() {
                  return t(n)
                },
                get value() {
                  return t(o)
                },
                onChange: (N) =>
                  s("content.class", y(`${e.component.properties.content.class} ${N === 2 ? "italic" : "not-italic"}`), e.component, e.onPropertyChange),
              })
            },
          )
        }
        var d = v(i, 2)
        {
          let n = r(() => ({ name: l()("constructor.props.background") })),
            o = r(() => (e.component.properties.background ? 2 : 1))
          p(
            d,
            () => P,
            (a, c) => {
              c(a, {
                get label() {
                  return t(n)
                },
                get value() {
                  return t(o)
                },
                onChange: (N) => s("background", N === 2, e.component, e.onPropertyChange),
              })
            },
          )
        }
        ;(f(U), f(g), z(m, g))
      }
    ce(Q, (m) => {
      j() ? m(Y) : m($, !1)
    })
  }
  ;(z(R, M), K(), I())
}
var Ce = W("<div><!></div>")
function Ie(R, e) {
  J(e, !0)
  let u = oe(
      re({
        id: crypto.randomUUID(),
        type: "TextField",
        component: null,
        properties: {
          id: crypto.randomUUID(),
          wrapperClass: "text-[#333] dark:text-[#e2e3e7]",
          content: { name: "Supporting text", class: "text-center", size: "large" },
        },
        position: { row: 0, col: 0, width: 0, height: 0 },
        parentId: "",
      }),
    ),
    l = r(
      () => `
<UI.TextField
${ue(t(u).properties)} 
/>`,
    )
  const X = (I) => {
    ae(u, { ...t(u), properties: I.properties ? { ...t(u).properties, ...I.properties } : t(u).properties }, !0)
  }
  ;(pe(R, {
    get codeText() {
      return t(l)
    },
    component: (b) => {
      var C = Ce(),
        k = _(C)
      ;(de(
        k,
        ie(() => t(u).properties),
      ),
        f(C),
        z(b, C))
    },
    componentProps: (b) => {
      fe(b, {
        get component() {
          return t(u)
        },
        onPropertyChange: (C) => X({ properties: C }),
        forConstructor: !1,
      })
    },
  }),
    K())
}
export { Ie as component }
