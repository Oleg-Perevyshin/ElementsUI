import { c as R, a as A, f as V } from "../chunks/Di61MV9l.js"
import { p as j, i as k, f as B, a as E, c as x, g as t, u as r, r as b, n as F, s as w, b as Y, d as q, e as z } from "../chunks/CYmiEaEH.js"
import { p as J, i as K, a as M, c as h, d as Q, s as W } from "../chunks/_y1boTp2.js"
import { C as X, f as Z } from "../chunks/BSX-LnOW.js"
import { G as $ } from "../chunks/0UdDw6P-.js"
import { u as m, S as ee, I as y, f as te, g as re } from "../chunks/CnAfG7ip.js"
var ae = V(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!></div> <div class="flex w-1/3 flex-col px-2"></div> <div class="flex w-1/3 flex-col px-2"></div></div>',
  ),
  oe = V(
    '<div class="relative mb-2 flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!></div> <div class="flex w-1/3 flex-col px-2"><!></div></div>',
  )
function ne(P, e) {
  j(e, !0)
  const p = () => Q(re, "$t", a),
    [a, U] = M(),
    I = J(e, "forConstructor", 3, !0)
  console.log(e.component.properties.streamingData)
  const i = k("DeviceVariables")
  let T = r(() => (i && Array.isArray(i) ? i : []))
  var d = R(),
    S = B(d)
  {
    var H = (v) => {
        var c = ae(),
          u = x(c),
          C = x(u)
        {
          let D = r(() => ({ name: p()("constructor.props.variable") })),
            _ = r(() => t(T).find((f) => f.value === e.component.properties.id))
          h(
            C,
            () => ee,
            (f, G) => {
              G(f, {
                get label() {
                  return t(D)
                },
                get options() {
                  return t(T)
                },
                get value() {
                  return t(_)
                },
                onUpdate: (g) => {
                  ;(m("id", g.value, e.component, e.onPropertyChange, g.name?.split("—")[1].trim()),
                    m("eventHandler.Variables", g.value, e.component, e.onPropertyChange))
                },
              })
            },
          )
        }
        ;(b(u), F(4), b(c), A(v, c))
      },
      O = (v) => {
        var c = oe(),
          u = x(c),
          C = x(u)
        {
          let o = r(() => ({ name: p()("constructor.props.id") }))
          h(
            C,
            () => y,
            (n, s) => {
              s(n, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.id
                },
                onUpdate: (l) => m("id", l, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var D = w(C, 2)
        {
          let o = r(() => ({ name: p()("constructor.props.wrapperclass") }))
          h(
            D,
            () => y,
            (n, s) => {
              s(n, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.wrapperClass
                },
                onUpdate: (l) => m("wrapperClass", l, e.component, e.onPropertyChange),
              })
            },
          )
        }
        b(u)
        var _ = w(u, 2),
          f = x(_)
        {
          let o = r(() => ({ name: p()("constructor.props.label") }))
          h(
            f,
            () => y,
            (n, s) => {
              s(n, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.label.name
                },
                onUpdate: (l) => m("label.name", l, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var G = w(f, 2)
        {
          let o = r(() => ({ name: p()("constructor.props.label.class") }))
          h(
            G,
            () => y,
            (n, s) => {
              s(n, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.label.class
                },
                onUpdate: (l) => m("label.class", l, e.component, e.onPropertyChange),
              })
            },
          )
        }
        b(_)
        var g = w(_, 2),
          L = x(g)
        {
          let o = r(() => ({ name: p()("constructor.props.istest") })),
            n = r(() => (e.component.properties.isTest ? 2 : 1))
          h(
            L,
            () => te,
            (s, l) => {
              l(s, {
                wrapperClass: "bg-blue",
                get label() {
                  return t(o)
                },
                get value() {
                  return t(n)
                },
                onChange: (N) => m("isTest", N === 2, e.component, e.onPropertyChange),
              })
            },
          )
        }
        ;(b(g), b(c), A(v, c))
      }
    K(S, (v) => {
      I() ? v(H) : v(O, !1)
    })
  }
  ;(A(P, d), E(), U())
}
function de(P, e) {
  j(e, !0)
  const p = [
    { name: "Roll", value: 0 },
    { name: "Pitch", value: 0 },
    { name: "Yaw", value: 0 },
  ]
  let a = Y(
      q({
        id: crypto.randomUUID(),
        type: "Graph",
        component: null,
        properties: {
          id: crypto.randomUUID(),
          wrapperClass: "",
          label: { name: "Label", class: "text-center" },
          streamingData: { data: p },
          isTest: !0,
          eventHandler: { Header: "SET", Argument: "NoSave", Variables: [] },
        },
        position: { row: 0, col: 0, width: 0, height: 0 },
        parentId: "",
      }),
    ),
    U = r(
      () => `
<UI.Graph
${Z(t(a).properties)} 
/>`,
    )
  const I = (i) => {
    z(a, { ...t(a), properties: i.properties ? { ...t(a).properties, ...i.properties } : t(a).properties }, !0)
  }
  ;(X(P, {
    get codeText() {
      return t(U)
    },
    component: (d) => {
      $(
        d,
        W(() => t(a).properties),
      )
    },
    componentProps: (d) => {
      ne(d, {
        get component() {
          return t(a)
        },
        onPropertyChange: (S) => I({ properties: S }),
        forConstructor: !1,
      })
    },
  }),
    E())
}
export { de as component }
