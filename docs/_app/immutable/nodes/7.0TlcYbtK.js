import { c as X, a as z, f as W } from "../chunks/Di61MV9l.js"
import { p as B, f as Y, a as G, c as S, g as t, u as n, s as u, r as I, b as Z, d as $, e as ee } from "../chunks/CYmiEaEH.js"
import { p as te, i as k, a as re, c as p, d as q, s as oe } from "../chunks/_y1boTp2.js"
import { C as ne, f as ae } from "../chunks/BSX-LnOW.js"
import { u as c, I as y, S as A, o as ie, g as le, F as se } from "../chunks/CnAfG7ip.js"
var pe = W('<div class="flex gap-4"><!> <!></div> <div class="flex gap-4"><!> <!></div>', 1),
  ce = W(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!></div></div>',
  )
function me(T, e) {
  B(e, !0)
  const r = () => q(le, "$t", C),
    d = () => q(ie, "$optionsStore", C),
    [C, U] = re(),
    v = te(e, "forConstructor", 3, !0)
  var O = X(),
    g = Y(O)
  {
    var m = (P) => {
      var x = ce(),
        w = S(x),
        E = S(w)
      {
        let a = n(() => ({ name: r()("constructor.props.id") }))
        p(
          E,
          () => y,
          (i, o) => {
            o(i, {
              get label() {
                return t(a)
              },
              get value() {
                return e.component.properties.id
              },
              onUpdate: (l) => c("id", l, e.component, e.onPropertyChange),
            })
          },
        )
      }
      var M = u(E, 2)
      {
        let a = n(() => ({ name: r()("constructor.props.wrapperclass") }))
        p(
          M,
          () => y,
          (i, o) => {
            o(i, {
              get label() {
                return t(a)
              },
              get value() {
                return e.component.properties.wrapperClass
              },
              onUpdate: (l) => c("wrapperClass", l, e.component, e.onPropertyChange),
            })
          },
        )
      }
      var N = u(M, 2)
      {
        let a = n(() => ({ name: r()("constructor.props.label") }))
        p(
          N,
          () => y,
          (i, o) => {
            o(i, {
              get label() {
                return t(a)
              },
              get value() {
                return e.component.properties.label.name
              },
              onUpdate: (l) => c("label.name", l, e.component, e.onPropertyChange),
            })
          },
        )
      }
      var J = u(N, 2)
      {
        let a = n(() => ({ name: r()("constructor.props.label.class") }))
        p(
          J,
          () => y,
          (i, o) => {
            o(i, {
              get label() {
                return t(a)
              },
              get value() {
                return e.component.properties.label.class
              },
              onUpdate: (l) => c("label.class", l, e.component, e.onPropertyChange),
            })
          },
        )
      }
      I(w)
      var D = u(w, 2),
        R = S(D)
      {
        let a = n(() => ({ name: r()("constructor.props.file.accept") }))
        p(
          R,
          () => y,
          (i, o) => {
            o(i, {
              get label() {
                return t(a)
              },
              get value() {
                return e.component.properties.accept
              },
              onUpdate: (l) => c("accept", l, e.component, e.onPropertyChange),
            })
          },
        )
      }
      var L = u(R, 2)
      {
        let a = n(() => ({ name: r()("constructor.props.type") })),
          i = n(() => d().FILE_ATTACH_TYPE_OPTIONS.find((o) => o.value.includes(e.component.properties.type)))
        p(
          L,
          () => A,
          (o, l) => {
            l(o, {
              get label() {
                return t(a)
              },
              type: "buttons",
              get value() {
                return t(i)
              },
              get options() {
                return d().FILE_ATTACH_TYPE_OPTIONS
              },
              onUpdate: (F) => c("type", F.value, e.component, e.onPropertyChange),
            })
          },
        )
      }
      var K = u(L, 2)
      {
        var Q = (a) => {
          var i = pe(),
            o = Y(i),
            l = S(o)
          {
            let f = n(() => ({ name: r()("constructor.props.imageSize.height") })),
              h = n(() => e.component.properties.imageSize.height.replace("rem", ""))
            p(
              l,
              () => y,
              (s, _) => {
                _(s, {
                  get label() {
                    return t(f)
                  },
                  type: "number",
                  get value() {
                    return t(h)
                  },
                  onUpdate: (b) => c("imageSize.height", `${b}rem`, e.component, e.onPropertyChange),
                })
              },
            )
          }
          var F = u(l, 2)
          {
            let f = n(() => ({ name: r()("constructor.props.imageSize.width") })),
              h = n(() => e.component.properties.imageSize.width.replace("rem", ""))
            p(
              F,
              () => y,
              (s, _) => {
                _(s, {
                  get label() {
                    return t(f)
                  },
                  type: "number",
                  get value() {
                    return t(h)
                  },
                  onUpdate: (b) => c("imageSize.width", `${b}rem`, e.component, e.onPropertyChange),
                })
              },
            )
          }
          I(o)
          var j = u(o, 2),
            H = S(j)
          {
            let f = n(() => ({ name: r()("constructor.props.fitmode") })),
              h = n(() => d().FITMODE_OPTIONS.find((s) => s.value.includes(e.component.properties.imageSize.fitMode)))
            p(
              H,
              () => A,
              (s, _) => {
                _(s, {
                  get label() {
                    return t(f)
                  },
                  type: "buttons",
                  get value() {
                    return t(h)
                  },
                  get options() {
                    return d().FITMODE_OPTIONS
                  },
                  onUpdate: (b) => c("imageSize.fitMode", b.value, e.component, e.onPropertyChange),
                })
              },
            )
          }
          var V = u(H, 2)
          {
            let f = n(() => ({ name: r()("constructor.props.form") })),
              h = n(() => d().FORM_OPTIONS.find((s) => s.value.includes(e.component.properties.imageSize.form)))
            p(
              V,
              () => A,
              (s, _) => {
                _(s, {
                  get label() {
                    return t(f)
                  },
                  type: "buttons",
                  get value() {
                    return t(h)
                  },
                  get options() {
                    return d().FORM_OPTIONS
                  },
                  onUpdate: (b) => c("imageSize.form", b.value, e.component, e.onPropertyChange),
                })
              },
            )
          }
          ;(I(j), z(a, i))
        }
        k(K, (a) => {
          e.component.properties.type === "image" && a(Q)
        })
      }
      ;(I(D), I(x), z(P, x))
    }
    k(g, (P) => {
      v() || P(m)
    })
  }
  ;(z(T, O), G(), U())
}
function he(T, e) {
  B(e, !0)
  let r = Z(
      $({
        id: crypto.randomUUID(),
        type: "FileAttach",
        component: null,
        properties: {
          id: crypto.randomUUID(),
          wrapperClass: "",
          label: { name: "", class: "" },
          accept: "*/*",
          type: "image",
          imageSize: { height: "10rem", width: "10rem", fitMode: "cover", form: "square" },
          disabled: !1,
          onChange: () => {},
        },
        position: { row: 0, col: 0, width: 0, height: 0 },
        parentId: "",
      }),
    ),
    d = n(
      () => `
<UI.FileAttach
${ae(t(r).properties)} 
  onChange={() => {}}
/>`,
    )
  const C = (v) => {
      ee(r, { ...t(r), properties: v.properties ? { ...t(r).properties, ...v.properties } : t(r).properties }, !0)
    },
    U = (v) => {
      const g = v.target.files?.[0]
      if (!g) return
      const m = new FileReader()
      ;((m.onload = () => {
        const P = m.result
        C({ properties: { currentImage: P } })
      }),
        m.readAsDataURL(g))
    }
  ;(ne(T, {
    get codeText() {
      return t(d)
    },
    component: (g) => {
      se(
        g,
        oe(() => t(r).properties, { onChange: (m) => U(m) }),
      )
    },
    componentProps: (g) => {
      me(g, {
        get component() {
          return t(r)
        },
        onPropertyChange: (m) => C({ properties: m }),
        forConstructor: !1,
      })
    },
  }),
    G())
}
export { he as component }
