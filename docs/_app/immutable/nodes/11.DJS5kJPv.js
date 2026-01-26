import { c as be, a as M, f as X } from "../chunks/Di61MV9l.js"
import { p as ue, i as ye, f as ee, a as ve, c as _, g as t, u as l, s as u, r as f, e as te, t as ae, b as Ce, d as he } from "../chunks/CYmiEaEH.js"
import { p as Pe, i as Oe, a as Te, c as v, d as le, s as we } from "../chunks/_y1boTp2.js"
import { C as Ee, f as Ue } from "../chunks/BSX-LnOW.js"
import { u as i, S as T, I as O, t as Se, B as W, e as se, f as xe, o as Ie, g as Le } from "../chunks/CnAfG7ip.js"
import { s as ie } from "../chunks/cfR1Foc9.js"
import { B as pe, a as ce } from "../chunks/COiuPzCY.js"
var Ne = X('<div class="m-0 flex items-end justify-around gap-2 border-gray-400"><!> <!> <!> <!></div>'),
  Ae = X(
    '<div class="relative mb-4 flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!> <!></div></div> <hr class="border-gray-400"/> <div class="space-y-4"><div class="m-0 flex items-center justify-center gap-2"><h4> </h4> <!></div> <!></div>',
    1,
  ),
  He = X('<div class="m-0 flex items-end justify-around gap-2 border-gray-400"><!> <!> <!> <!></div>'),
  Ve = X(
    '<div class="relative mb-4 flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!> <!></div></div> <hr class="border-gray-400"/> <div class="space-y-4"><div class="m-0 flex items-center justify-center gap-2"><h4> </h4> <!></div> <!></div>',
    1,
  )
function De(z, e) {
  ue(e, !0)
  const s = () => le(Ie, "$optionsStore", H),
    p = () => le(Le, "$t", H),
    [H, V] = Te(),
    ne = Pe(e, "forConstructor", 3, !0),
    w = ye("DeviceVariables")
  let L = l(() => (w && Array.isArray(w) ? w : [])),
    N = l(() =>
      e.component.properties.options[0] && typeof e.component.properties.options[0].value == "number"
        ? s().SELECT_VALUE_TYPE_OPTIONS[1]
        : s().SELECT_VALUE_TYPE_OPTIONS[0],
    ),
    me = l(() => s().HEADER_OPTIONS.find((h) => h.value === e.component.properties.eventHandler.Header) ?? { id: "", name: "", value: "", class: "!w-1/4" }),
    oe = l(() => s().SELECT_TYPE_OPTIONS.find((h) => h.value === e.component.properties.type))
  const de = l(() => s().TEXT_ALIGN_OPTIONS.find((h) => h.value.includes(e.component.properties.label?.class?.split(" ").find((E) => E.startsWith("text-")))))
  var re = be(),
    ge = ee(re)
  {
    var _e = (h) => {
        var E = Ae(),
          U = ee(E),
          S = _(U),
          D = _(S)
        {
          let o = l(() => ({ name: p()("constructor.props.variable") })),
            a = l(() => t(L).find((n) => n.value === e.component.properties.id))
          v(
            D,
            () => T,
            (n, r) => {
              r(n, {
                get label() {
                  return t(o)
                },
                get options() {
                  return t(L)
                },
                get value() {
                  return t(a)
                },
                onUpdate: (c) => {
                  ;(i("id", c.value, e.component, e.onPropertyChange), i("eventHandler.Variables", c.value, e.component, e.onPropertyChange))
                },
              })
            },
          )
        }
        var F = u(D, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.argument") })),
            a = l(
              () =>
                s().FULL_ARGUMENT_OPTION.find((n) => n.value === e.component.properties.eventHandler.Argument) ??
                s().FULL_ARGUMENT_OPTION.find((n) => n.value === ""),
            )
          v(
            F,
            () => T,
            (n, r) => {
              r(n, {
                get label() {
                  return t(o)
                },
                type: "buttons",
                get value() {
                  return t(a)
                },
                get options() {
                  return s().FULL_ARGUMENT_OPTION
                },
                onUpdate: (c) => {
                  i("eventHandler.Argument", c.value, e.component, e.onPropertyChange)
                },
              })
            },
          )
        }
        var R = u(F, 2)
        {
          let o = l(() => (t(me).value === "SET" ? "mt-1" : "")),
            a = l(() => e.component.properties.eventHandler.Argument == "Save" || e.component.properties.eventHandler.Argument == "NoSave"),
            n = l(() => ({ info: p()("constructor.props.argument.info"), autocomplete: "on", regExp: /^[a-zA-Z0-9\-_]{0,32}$/ }))
          v(
            R,
            () => O,
            (r, c) => {
              c(r, {
                get wrapperClass() {
                  return `${t(o) ?? ""} `
                },
                get value() {
                  return e.component.properties.eventHandler.Argument
                },
                maxlength: 32,
                get disabled() {
                  return t(a)
                },
                get help() {
                  return t(n)
                },
                onUpdate: (P) => i("eventHandler.Argument", P, e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(S)
        var A = u(S, 2),
          Y = _(A)
        {
          let o = l(() => ({ name: p()("constructor.props.type") }))
          v(
            Y,
            () => T,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                type: "buttons",
                get value() {
                  return t(oe)
                },
                get options() {
                  return s().SELECT_TYPE_OPTIONS
                },
                onUpdate: (r) => i("type", r.value, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var Z = u(Y, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.valuetype") }))
          v(
            Z,
            () => T,
            (a, n) => {
              n(a, {
                wrapperClass: "h-14",
                get label() {
                  return t(o)
                },
                type: "buttons",
                get options() {
                  return s().SELECT_VALUE_TYPE_OPTIONS
                },
                get value() {
                  return t(N)
                },
                onUpdate: (r) => {
                  te(N, r)
                  const c = [...(e.component.properties?.options || [])],
                    P = r.value
                  ;(c.forEach((d) => {
                    P === "number" ? (d.value = d.value !== void 0 ? Number(d.value) : 0) : (d.value = d.value !== void 0 ? String(d.value) : "")
                  }),
                    i("options", c, e.component, e.onPropertyChange))
                },
              })
            },
          )
        }
        f(A)
        var j = u(A, 2),
          B = _(j)
        {
          let o = l(() => ({ name: p()("constructor.props.label") }))
          v(
            B,
            () => O,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.label.name
                },
                onUpdate: (r) => i("label.name", r, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var q = u(B, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.align") }))
          v(
            q,
            () => T,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                type: "buttons",
                get value() {
                  return t(de)
                },
                get options() {
                  return s().TEXT_ALIGN_OPTIONS
                },
                onUpdate: (r) => i("label.class", Se(e.component.properties.label.class, r.value), e.component, e.onPropertyChange),
              })
            },
          )
        }
        ;(f(j), f(U))
        var k = u(U, 4),
          x = _(k),
          I = _(x),
          J = _(I, !0)
        f(I)
        var K = u(I, 2)
        {
          let o = l(() => ({ icon: pe }))
          v(
            K,
            () => W,
            (a, n) => {
              n(a, {
                wrapperClass: "w-8",
                get content() {
                  return t(o)
                },
                onClick: () => {
                  const r = {
                      id: crypto.randomUUID(),
                      name: `Option ${e.component.properties?.options.length + 1}`,
                      value: e.component.properties?.options.length + 1,
                      class: "bg-max",
                    },
                    c = [...(e.component.properties?.options || []), r]
                  i("options", c, e.component, e.onPropertyChange)
                },
              })
            },
          )
        }
        f(x)
        var Q = u(x, 2)
        ;(se(
          Q,
          19,
          () => e.component.properties.options || [],
          (o) => o.id,
          (o, a, n) => {
            var r = Ne(),
              c = _(r)
            {
              let b = l(() => ({ name: p()("constructor.props.optionname") }))
              v(
                c,
                () => O,
                (y, g) => {
                  g(y, {
                    get label() {
                      return t(b)
                    },
                    wrapperClass: "!w-3/10",
                    get value() {
                      return t(a).name
                    },
                    onUpdate: (m) => {
                      const C = [...(e.component.properties?.options || [])]
                      ;((C[t(n)].name = m), i("options", C, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var P = u(c, 2)
            {
              let b = l(() => ({ name: p()("constructor.props.optionvalue") }))
              v(
                P,
                () => O,
                (y, g) => {
                  g(y, {
                    get label() {
                      return t(b)
                    },
                    wrapperClass: "!w-3/10",
                    get value() {
                      return t(a).value
                    },
                    get type() {
                      return t(N).value
                    },
                    onUpdate: (m) => {
                      const C = [...(e.component.properties?.options || [])]
                      ;((C[t(n)].value = m), i("options", C, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var d = u(P, 2)
            {
              let b = l(() => ({ name: p()("constructor.props.colors") })),
                y = l(() =>
                  s().COLOR_OPTIONS.find((g) =>
                    g.value.includes(
                      t(a)
                        .class.split(" ")
                        .find((m) => m.startsWith("bg-")),
                    ),
                  ),
                )
              v(
                d,
                () => T,
                (g, m) => {
                  m(g, {
                    wrapperClass: "w-80 h-14.5",
                    get label() {
                      return t(b)
                    },
                    type: "buttons",
                    get options() {
                      return s().COLOR_OPTIONS
                    },
                    get value() {
                      return t(y)
                    },
                    onUpdate: (C) => {
                      const G = [...(e.component.properties?.options || [])]
                      ;((G[t(n)].class = C.value), i("options", G, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var $ = u(d, 2)
            {
              let b = l(() => ({ icon: ce }))
              v(
                $,
                () => W,
                (y, g) => {
                  g(y, {
                    wrapperClass: "w-8",
                    get content() {
                      return t(b)
                    },
                    onClick: () => {
                      const m = [...(e.component.properties?.options || [])]
                      ;(m.splice(t(n), 1), i("options", m, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            ;(f(r), M(o, r))
          },
        ),
          f(k),
          ae((o) => ie(J, o), [() => p()("constructor.props.options.title")]),
          M(h, E))
      },
      fe = (h) => {
        var E = Ve(),
          U = ee(E),
          S = _(U),
          D = _(S)
        {
          let o = l(() => ({ name: p()("constructor.props.id") }))
          v(
            D,
            () => O,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.id
                },
                onUpdate: (r) => i("id", r, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var F = u(D, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.wrapperclass") }))
          v(
            F,
            () => O,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.wrapperClass
                },
                onUpdate: (r) => i("wrapperClass", r, e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(S)
        var R = u(S, 2),
          A = _(R)
        {
          let o = l(() => ({ name: p()("constructor.props.label") }))
          v(
            A,
            () => O,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.label.name
                },
                onUpdate: (r) => i("label.name", r, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var Y = u(A, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.label.class") }))
          v(
            Y,
            () => O,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                get value() {
                  return e.component.properties.label.class
                },
                onUpdate: (r) => i("label.class", r, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var Z = u(Y, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.disabled") })),
            a = l(() => (e.component.properties.disabled ? 2 : 1))
          v(
            Z,
            () => xe,
            (n, r) => {
              r(n, {
                wrapperClass: "bg-blue",
                get label() {
                  return t(o)
                },
                get value() {
                  return t(a)
                },
                onChange: (c) => i("disabled", c === 2, e.component, e.onPropertyChange),
              })
            },
          )
        }
        f(R)
        var j = u(R, 2),
          B = _(j)
        {
          let o = l(() => ({ name: p()("constructor.props.type") }))
          v(
            B,
            () => T,
            (a, n) => {
              n(a, {
                get label() {
                  return t(o)
                },
                type: "buttons",
                get value() {
                  return t(oe)
                },
                get options() {
                  return s().SELECT_TYPE_OPTIONS
                },
                onUpdate: (r) => i("type", r.value, e.component, e.onPropertyChange),
              })
            },
          )
        }
        var q = u(B, 2)
        {
          let o = l(() => ({ name: p()("constructor.props.valuetype") }))
          v(
            q,
            () => T,
            (a, n) => {
              n(a, {
                wrapperClass: "h-14",
                get label() {
                  return t(o)
                },
                type: "buttons",
                get options() {
                  return s().SELECT_VALUE_TYPE_OPTIONS
                },
                get value() {
                  return t(N)
                },
                onUpdate: (r) => {
                  te(N, r)
                  const c = [...(e.component.properties?.options || [])],
                    P = r.value
                  ;(c.forEach((d) => {
                    P === "number" ? (d.value = d.value !== void 0 ? Number(d.value) : 0) : (d.value = d.value !== void 0 ? String(d.value) : "")
                  }),
                    i("options", c, e.component, e.onPropertyChange))
                },
              })
            },
          )
        }
        ;(f(j), f(U))
        var k = u(U, 4),
          x = _(k),
          I = _(x),
          J = _(I, !0)
        f(I)
        var K = u(I, 2)
        {
          let o = l(() => ({ icon: pe }))
          v(
            K,
            () => W,
            (a, n) => {
              n(a, {
                wrapperClass: "w-8",
                get content() {
                  return t(o)
                },
                onClick: () => {
                  const r = {
                      id: crypto.randomUUID(),
                      name: `Option ${e.component.properties?.options.length + 1}`,
                      value: e.component.properties?.options.length + 1,
                      class: "bg-max",
                    },
                    c = [...(e.component.properties?.options || []), r]
                  i("options", c, e.component, e.onPropertyChange)
                },
              })
            },
          )
        }
        f(x)
        var Q = u(x, 2)
        ;(se(
          Q,
          19,
          () => e.component.properties.options || [],
          (o) => o.id,
          (o, a, n) => {
            var r = He(),
              c = _(r)
            {
              let b = l(() => ({ name: p()("constructor.props.optionname") }))
              v(
                c,
                () => O,
                (y, g) => {
                  g(y, {
                    get label() {
                      return t(b)
                    },
                    wrapperClass: "!w-3/10",
                    get value() {
                      return t(a).name
                    },
                    onUpdate: (m) => {
                      const C = [...(e.component.properties?.options || [])]
                      ;((C[t(n)].name = m), i("options", C, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var P = u(c, 2)
            {
              let b = l(() => ({ name: p()("constructor.props.optionvalue") }))
              v(
                P,
                () => O,
                (y, g) => {
                  g(y, {
                    get label() {
                      return t(b)
                    },
                    wrapperClass: "!w-3/10",
                    get value() {
                      return t(a).value
                    },
                    get type() {
                      return t(N).value
                    },
                    onUpdate: (m) => {
                      const C = [...(e.component.properties?.options || [])]
                      ;((C[t(n)].value = m), i("options", C, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var d = u(P, 2)
            {
              let b = l(() => ({ name: p()("constructor.props.colors") })),
                y = l(() =>
                  s().COLOR_OPTIONS.find((g) =>
                    g.value.includes(
                      t(a)
                        .class.split(" ")
                        .find((m) => m.startsWith("bg-")),
                    ),
                  ),
                )
              v(
                d,
                () => T,
                (g, m) => {
                  m(g, {
                    wrapperClass: "w-80 h-14.5",
                    get label() {
                      return t(b)
                    },
                    type: "buttons",
                    get options() {
                      return s().COLOR_OPTIONS
                    },
                    get value() {
                      return t(y)
                    },
                    onUpdate: (C) => {
                      const G = [...(e.component.properties?.options || [])]
                      ;((G[t(n)].class = C.value), i("options", G, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            var $ = u(d, 2)
            {
              let b = l(() => ({ icon: ce }))
              v(
                $,
                () => W,
                (y, g) => {
                  g(y, {
                    wrapperClass: "w-8",
                    get content() {
                      return t(b)
                    },
                    onClick: () => {
                      const m = [...(e.component.properties?.options || [])]
                      ;(m.splice(t(n), 1), i("options", m, e.component, e.onPropertyChange))
                    },
                  })
                },
              )
            }
            ;(f(r), M(o, r))
          },
        ),
          f(k),
          ae((o) => ie(J, o), [() => p()("constructor.props.options.title")]),
          M(h, E))
      }
    Oe(ge, (h) => {
      ne() ? h(_e) : h(fe, !1)
    })
  }
  ;(M(z, re), ve(), V())
}
function Fe(z, e) {
  ue(e, !0)
  let s = Ce(
      he({
        id: crypto.randomUUID(),
        type: "Select",
        component: null,
        properties: {
          id: crypto.randomUUID(),
          wrapperClass: "bg-max",
          disabled: !1,
          label: { name: "Label", class: "text-center" },
          type: "select",
          options: [{ id: crypto.randomUUID(), value: "1", name: "Option 1", class: "bg-max" }],
          eventHandler: { Header: "SET", Argument: "", Variables: [] },
        },
        position: { row: 0, col: 0, width: 0, height: 0 },
        parentId: "",
      }),
    ),
    p = l(
      () => `
<UI.Select
${Ue(t(s).properties)} 
  onUpdate={() => {}}
/>`,
    )
  const H = (V) => {
    te(s, { ...t(s), properties: V.properties ? { ...t(s).properties, ...V.properties } : t(s).properties }, !0)
  }
  ;(Ee(z, {
    get codeText() {
      return t(p)
    },
    component: (w) => {
      T(
        w,
        we(() => t(s).properties, {
          onUpdate: (L) => {
            H({ properties: { value: L } })
          },
        }),
      )
    },
    componentProps: (w) => {
      De(w, {
        get component() {
          return t(s)
        },
        onPropertyChange: (L) => H({ properties: L }),
        forConstructor: !1,
      })
    },
  }),
    ve())
}
export { Fe as component }
