import { c as ne, a as I, f as H } from "../chunks/Di61MV9l.js"
import { p as me, i as _e, f as M, a as ie, c as B, g as e, u as n, s as m, r as V, e as pe, b as de, d as xe } from "../chunks/CYmiEaEH.js"
import { p as ye, i as G, a as he, c as u, d as ce, s as Oe } from "../chunks/_y1boTp2.js"
import { S as D, I as b, f as Q, t as Ne, o as Ue, g as Ce } from "../chunks/CnAfG7ip.js"
import { C as Te, f as Pe } from "../chunks/BSX-LnOW.js"
var Ie = H("<!> <!>", 1),
  Ee = H("<!> <!> <!>", 1),
  we = H(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!> <!></div></div>',
  ),
  Se = H("<!> <!> <!>", 1),
  Re = H("<!> <!> <!>", 1),
  Ae = H(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!> <!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!> <!> <!> <!></div></div>',
  )
function Le(oe, t) {
  me(t, !0)
  const f = () => ce(Ue, "$optionsStore", J),
    p = () => ce(Ce, "$t", J),
    [J, X] = he(),
    le = ye(t, "forConstructor", 3, !0)
  let j = de(!0)
  const R = _e("DeviceVariables")
  let Z = n(() => (R && Array.isArray(R) ? R : []))
  const $ = n(() => f().COLOR_OPTIONS.find((x) => x.value.includes(t.component.properties.componentClass?.split(" ").find((g) => g.startsWith("bg-"))))),
    ve = n(() => f().TEXT_ALIGN_OPTIONS.find((x) => x.value.includes(t.component.properties.label?.class?.split(" ").find((g) => g.startsWith("text-"))))),
    s = (x, g, T) => {
      const E = JSON.parse(JSON.stringify(t.component.properties))
      if (x === "regExp")
        try {
          let O
          if (typeof g == "string") {
            const N = g.match(/^\/(.*)\/([gimsuy]*)$/)
            if (((O = N ? new RegExp(N[1], N[2]) : new RegExp(g)), N === null)) return
            O.test("")
          } else throw new Error("Invalid RegExp type")
          ;((E.regExp = O), pe(j, !0))
        } catch (O) {
          ;(console.warn("Invalid RegExp:", O), (E.regExp = typeof g == "string" ? g : String(g)), pe(j, !1))
          return
        }
      const w = x.split(".")
      let S = E
      for (let O = 0; O < w.length - 1; O++) {
        const N = w[O]
        ;(S[N] || (S[N] = {}), (S = S[N]))
      }
      ;((S[w[w.length - 1]] = g), t.onPropertyChange(E, T))
    },
    se = (x) => {
      let g = t.component.properties.componentClass || ""
      ;((g = g
        .split(" ")
        .filter((T) => !T.startsWith("bg-"))
        .join(" ")),
        x && (g += ` ${x}`),
        s("componentClass", g))
    }
  var ue = ne(),
    ge = M(ue)
  {
    var be = (x) => {
        var g = we(),
          T = B(g),
          E = B(T)
        {
          let i = n(() => ({ name: p()("constructor.props.variable") })),
            d = n(() => e(Z).find((c) => c.value === t.component.properties.id))
          u(
            E,
            () => D,
            (c, v) => {
              v(c, {
                get label() {
                  return e(i)
                },
                get options() {
                  return e(Z)
                },
                get value() {
                  return e(d)
                },
                onUpdate: (r) => {
                  ;(s("id", r.value, r.name?.split("—")[1].trim()), s("eventHandler.Variables", r.value))
                },
              })
            },
          )
        }
        var w = m(E, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.type") })),
            d = n(() => f().INPUT_TYPE_OPTIONS.find((c) => c.value === (t.component.properties.type || "text")))
          u(
            w,
            () => D,
            (c, v) => {
              v(c, {
                get label() {
                  return e(i)
                },
                get options() {
                  return f().INPUT_TYPE_OPTIONS
                },
                type: "buttons",
                get value() {
                  return e(d)
                },
                onUpdate: (r) => s("type", r.value),
              })
            },
          )
        }
        var S = m(w, 2)
        {
          var O = (i) => {
              var d = Ie(),
                c = M(d)
              {
                let r = n(() => ({ name: p()("constructor.props.maxlength") }))
                u(
                  c,
                  () => b,
                  (a, o) => {
                    o(a, {
                      get label() {
                        return e(r)
                      },
                      type: "number",
                      number: { minNum: 1, maxNum: 1e6, step: 1 },
                      get value() {
                        return t.component.properties.maxlength
                      },
                      onUpdate: (l) => s("maxlength", l),
                    })
                  },
                )
              }
              var v = m(c, 2)
              {
                let r = n(() => ({ name: p()("constructor.props.regexp") })),
                  a = n(() => ({ info: p()("constructor.props.regexp.info") })),
                  o = n(() => (e(j) === !1 ? "!border-2 !border-red-400" : ""))
                u(
                  v,
                  () => b,
                  (l, _) => {
                    _(l, {
                      get label() {
                        return e(r)
                      },
                      get value() {
                        return t.component.properties.help.regExp
                      },
                      maxlength: 150,
                      get help() {
                        return e(a)
                      },
                      get componentClass() {
                        return e(o)
                      },
                      onUpdate: (C) => s("help.regExp", C),
                    })
                  },
                )
              }
              I(i, d)
            },
            N = (i) => {
              var d = ne(),
                c = M(d)
              {
                var v = (r) => {
                  var a = Ee(),
                    o = M(a)
                  {
                    let C = n(() => ({ name: p()("constructor.props.minnum") }))
                    u(
                      o,
                      () => b,
                      (y, h) => {
                        h(y, {
                          get label() {
                            return e(C)
                          },
                          get value() {
                            return t.component.properties.number.minNum
                          },
                          type: "number",
                          onUpdate: (U) => {
                            s("number.minNum", Number(U))
                          },
                        })
                      },
                    )
                  }
                  var l = m(o, 2)
                  {
                    let C = n(() => ({ name: p()("constructor.props.maxnum") }))
                    u(
                      l,
                      () => b,
                      (y, h) => {
                        h(y, {
                          get label() {
                            return e(C)
                          },
                          get value() {
                            return t.component.properties.number.maxNum
                          },
                          type: "number",
                          onUpdate: (U) => {
                            s("number.maxNum", Number(U))
                          },
                        })
                      },
                    )
                  }
                  var _ = m(l, 2)
                  {
                    let C = n(() => ({ name: p()("constructor.props.step") }))
                    u(
                      _,
                      () => b,
                      (y, h) => {
                        h(y, {
                          get label() {
                            return e(C)
                          },
                          get value() {
                            return t.component.properties.number.step
                          },
                          type: "number",
                          onUpdate: (U) => s("number.step", Number(U)),
                        })
                      },
                    )
                  }
                  I(r, a)
                }
                G(
                  c,
                  (r) => {
                    t.component.properties.type === "number" && !t.component.properties.readonly && !t.component.properties.disabled && r(v)
                  },
                  !0,
                )
              }
              I(i, d)
            }
          G(S, (i) => {
            t.component.properties.type === "text" || t.component.properties.type === "password" || t.component.properties.type === "text-area"
              ? i(O)
              : i(N, !1)
          })
        }
        V(T)
        var k = m(T, 2),
          W = B(k)
        {
          let i = n(() => ({ name: p()("constructor.props.placeholder") }))
          u(
            W,
            () => b,
            (d, c) => {
              c(d, {
                get label() {
                  return e(i)
                },
                get value() {
                  return t.component.properties.placeholder
                },
                onUpdate: (v) => s("placeholder", v),
              })
            },
          )
        }
        var z = m(W, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.info") }))
          u(
            z,
            () => b,
            (d, c) => {
              c(d, {
                get label() {
                  return e(i)
                },
                get value() {
                  return t.component.properties.help.info
                },
                onUpdate: (v) => s("help.info", v),
              })
            },
          )
        }
        var q = m(z, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.readonly") })),
            d = n(() => (t.component.properties.readonly ? 2 : 1))
          u(
            q,
            () => Q,
            (c, v) => {
              v(c, {
                get label() {
                  return e(i)
                },
                get value() {
                  return e(d)
                },
                onChange: (r) => s("readonly", r === 2),
              })
            },
          )
        }
        var ae = m(q, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.copy") })),
            d = n(() => (t.component.properties.help.copyButton ? 2 : 1))
          u(
            ae,
            () => Q,
            (c, v) => {
              v(c, {
                get label() {
                  return e(i)
                },
                get value() {
                  return e(d)
                },
                onChange: (r) => s("help.copyButton", r === 2),
              })
            },
          )
        }
        V(k)
        var ee = m(k, 2),
          te = B(ee)
        {
          let i = n(() => ({ name: p()("constructor.props.label") }))
          u(
            te,
            () => b,
            (d, c) => {
              c(d, {
                get label() {
                  return e(i)
                },
                get value() {
                  return t.component.properties.label.name
                },
                onUpdate: (v) => s("label.name", v),
              })
            },
          )
        }
        var F = m(te, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.align") }))
          u(
            F,
            () => D,
            (d, c) => {
              c(d, {
                get label() {
                  return e(i)
                },
                type: "buttons",
                get value() {
                  return e(ve)
                },
                get options() {
                  return f().TEXT_ALIGN_OPTIONS
                },
                onUpdate: (v) => s("label.class", Ne(t.component.properties.label.class, v.value)),
              })
            },
          )
        }
        var K = m(F, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.autocomplete") })),
            d = n(() => f().AUTOCOMPLETE_CONSTRUCTOR_OPTIONS.find((c) => c.value === (t.component.properties.help.autocomplete || "off")))
          u(
            K,
            () => D,
            (c, v) => {
              v(c, {
                get label() {
                  return e(i)
                },
                get options() {
                  return f().AUTOCOMPLETE_CONSTRUCTOR_OPTIONS
                },
                get value() {
                  return e(d)
                },
                onUpdate: (r) => s("help.autocomplete", r.value),
              })
            },
          )
        }
        var re = m(K, 2)
        {
          let i = n(() => ({ name: p()("constructor.props.colors") }))
          u(
            re,
            () => D,
            (d, c) => {
              c(d, {
                wrapperClass: "h-14",
                get label() {
                  return e(i)
                },
                type: "buttons",
                get options() {
                  return f().COLOR_OPTIONS
                },
                get value() {
                  return e($)
                },
                onUpdate: (v) => se(v.value),
              })
            },
          )
        }
        ;(V(ee), V(g), I(x, g))
      },
      fe = (x) => {
        var g = Ae(),
          T = B(g),
          E = B(T)
        {
          let r = n(() => ({ name: p()("constructor.props.id") }))
          u(
            E,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.id
                },
                onUpdate: (l) => s("id", l),
              })
            },
          )
        }
        var w = m(E, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.wrapperclass") }))
          u(
            w,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.wrapperClass
                },
                onUpdate: (l) => s("wrapperClass", l),
              })
            },
          )
        }
        var S = m(w, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.label") }))
          u(
            S,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.label.name
                },
                onUpdate: (l) => s("label.name", l),
              })
            },
          )
        }
        var O = m(S, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.label.class") }))
          u(
            O,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.label.class
                },
                onUpdate: (l) => s("label.class", l),
              })
            },
          )
        }
        var N = m(O, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.componentclass") }))
          u(
            N,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.componentClass
                },
                onUpdate: (l) => s("componentClass", l),
              })
            },
          )
        }
        var k = m(N, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.colors") }))
          u(
            k,
            () => D,
            (a, o) => {
              o(a, {
                wrapperClass: "h-14",
                get label() {
                  return e(r)
                },
                type: "buttons",
                get options() {
                  return f().COLOR_OPTIONS
                },
                get value() {
                  return e($)
                },
                onUpdate: (l) => se(l.value),
              })
            },
          )
        }
        V(T)
        var W = m(T, 2),
          z = B(W)
        {
          let r = n(() => ({ name: p()("constructor.props.value") }))
          u(
            z,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.value
                },
                onUpdate: (l) => s("value", l),
              })
            },
          )
        }
        var q = m(z, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.type") })),
            a = n(() => f().INPUT_TYPE_OPTIONS.find((o) => o.value === (t.component.properties.type || "text")))
          u(
            q,
            () => D,
            (o, l) => {
              l(o, {
                get label() {
                  return e(r)
                },
                get options() {
                  return f().INPUT_TYPE_OPTIONS
                },
                type: "buttons",
                get value() {
                  return e(a)
                },
                onUpdate: (_) => s("type", _.value),
              })
            },
          )
        }
        var ae = m(q, 2)
        {
          var ee = (r) => {
              var a = Se(),
                o = M(a)
              {
                let y = n(() => ({ name: p()("constructor.props.maxlength") }))
                u(
                  o,
                  () => b,
                  (h, U) => {
                    U(h, {
                      get label() {
                        return e(y)
                      },
                      type: "number",
                      number: { minNum: 1, maxNum: 1e6, step: 1 },
                      get value() {
                        return t.component.properties.maxlength
                      },
                      onUpdate: (P) => s("maxlength", P),
                    })
                  },
                )
              }
              var l = m(o, 2)
              {
                let y = n(() => ({ name: p()("constructor.props.regexp") })),
                  h = n(() => ({ info: p()("constructor.props.regexp.info") })),
                  U = n(() => (e(j) === !1 ? "!border-2 !border-red-400" : ""))
                u(
                  l,
                  () => b,
                  (P, A) => {
                    A(P, {
                      get label() {
                        return e(y)
                      },
                      get value() {
                        return t.component.properties.help.regExp
                      },
                      maxlength: 150,
                      get help() {
                        return e(h)
                      },
                      get componentClass() {
                        return e(U)
                      },
                      onUpdate: (L) => s("help.regExp", L),
                    })
                  },
                )
              }
              var _ = m(l, 2)
              {
                var C = (y) => {
                  var h = ne(),
                    U = M(h)
                  {
                    let P = n(() => ({ name: p()("constructor.props.textarea.rows") }))
                    u(
                      U,
                      () => b,
                      (A, L) => {
                        L(A, {
                          get label() {
                            return e(P)
                          },
                          type: "number",
                          number: { minNum: 1, maxNum: 1e6, step: 1 },
                          get value() {
                            return t.component.properties.textareaRows
                          },
                          onUpdate: (Y) => s("textareaRows", Y),
                        })
                      },
                    )
                  }
                  I(y, h)
                }
                G(_, (y) => {
                  t.component.properties.type === "text-area" && y(C)
                })
              }
              I(r, a)
            },
            te = (r) => {
              var a = ne(),
                o = M(a)
              {
                var l = (_) => {
                  var C = Re(),
                    y = M(C)
                  {
                    let P = n(() => ({ name: p()("constructor.props.minnum") }))
                    u(
                      y,
                      () => b,
                      (A, L) => {
                        L(A, {
                          get label() {
                            return e(P)
                          },
                          get value() {
                            return t.component.properties.number.minNum
                          },
                          type: "number",
                          onUpdate: (Y) => {
                            s("number.minNum", Number(Y))
                          },
                        })
                      },
                    )
                  }
                  var h = m(y, 2)
                  {
                    let P = n(() => ({ name: p()("constructor.props.maxnum") }))
                    u(
                      h,
                      () => b,
                      (A, L) => {
                        L(A, {
                          get label() {
                            return e(P)
                          },
                          get value() {
                            return t.component.properties.number.maxNum
                          },
                          type: "number",
                          onUpdate: (Y) => {
                            s("number.maxNum", Number(Y))
                          },
                        })
                      },
                    )
                  }
                  var U = m(h, 2)
                  {
                    let P = n(() => ({ name: p()("constructor.props.step") }))
                    u(
                      U,
                      () => b,
                      (A, L) => {
                        L(A, {
                          get label() {
                            return e(P)
                          },
                          get value() {
                            return t.component.properties.number.step
                          },
                          type: "number",
                          onUpdate: (Y) => s("number.step", Number(Y)),
                        })
                      },
                    )
                  }
                  I(_, C)
                }
                G(
                  o,
                  (_) => {
                    t.component.properties.type === "number" && !t.component.properties.readonly && !t.component.properties.disabled && _(l)
                  },
                  !0,
                )
              }
              I(r, a)
            }
          G(ae, (r) => {
            t.component.properties.type === "text" || t.component.properties.type === "password" || t.component.properties.type === "text-area"
              ? r(ee)
              : r(te, !1)
          })
        }
        V(W)
        var F = m(W, 2),
          K = B(F)
        {
          let r = n(() => ({ name: p()("constructor.props.placeholder") }))
          u(
            K,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.placeholder
                },
                onUpdate: (l) => s("placeholder", l),
              })
            },
          )
        }
        var re = m(K, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.info") }))
          u(
            re,
            () => b,
            (a, o) => {
              o(a, {
                get label() {
                  return e(r)
                },
                get value() {
                  return t.component.properties.help.info
                },
                onUpdate: (l) => s("help.info", l),
              })
            },
          )
        }
        var i = m(re, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.autocomplete") })),
            a = n(() => f().AUTOCOMPLETE_OPTIONS.find((o) => o.value === (t.component.properties.help.autocomplete || "off")))
          u(
            i,
            () => D,
            (o, l) => {
              l(o, {
                get label() {
                  return e(r)
                },
                get options() {
                  return f().AUTOCOMPLETE_OPTIONS
                },
                get value() {
                  return e(a)
                },
                onUpdate: (_) => s("help.autocomplete", _.value),
              })
            },
          )
        }
        var d = m(i, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.readonly") })),
            a = n(() => (t.component.properties.readonly ? 2 : 1))
          u(
            d,
            () => Q,
            (o, l) => {
              l(o, {
                get label() {
                  return e(r)
                },
                get value() {
                  return e(a)
                },
                onChange: (_) => s("readonly", _ === 2),
              })
            },
          )
        }
        var c = m(d, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.copy") })),
            a = n(() => (t.component.properties.help.copyButton ? 2 : 1))
          u(
            c,
            () => Q,
            (o, l) => {
              l(o, {
                get label() {
                  return e(r)
                },
                get value() {
                  return e(a)
                },
                onChange: (_) => s("help.copyButton", _ === 2),
              })
            },
          )
        }
        var v = m(c, 2)
        {
          let r = n(() => ({ name: p()("constructor.props.disabled") })),
            a = n(() => (t.component.properties.disabled ? 2 : 1))
          u(
            v,
            () => Q,
            (o, l) => {
              l(o, {
                get label() {
                  return e(r)
                },
                get value() {
                  return e(a)
                },
                onChange: (_) => s("disabled", _ === 2),
              })
            },
          )
        }
        ;(V(F), V(g), I(x, g))
      }
    G(ge, (x) => {
      le() ? x(be) : x(fe, !1)
    })
  }
  ;(I(oe, ue), ie(), X())
}
var Be = H("<div><!></div>")
function He(oe, t) {
  me(t, !0)
  let f = de(
      xe({
        id: crypto.randomUUID(),
        type: "Input",
        component: null,
        properties: {
          id: crypto.randomUUID(),
          label: { name: "Label", class: "text-center" },
          componentClass: "bg-max resize-none",
          type: "text",
          maxlength: 32,
          number: { minNum: 0, maxNum: 10, step: 1 },
          textareaRows: 5,
          help: { copyButton: !1, info: "", autocomplete: "off" },
          eventHandler: { Header: "SET", Argument: "NoSend", Variables: [] },
        },
        position: { row: 0, col: 0, width: 0, height: 0 },
        parentId: "",
      }),
    ),
    p = n(
      () => `
<UI.Input
${Pe(e(f).properties)} 
  onUpdate={() => {}}
/>`,
    )
  const J = (X) => {
    pe(f, { ...e(f), properties: X.properties ? { ...e(f).properties, ...X.properties } : e(f).properties }, !0)
  }
  ;(Te(oe, {
    get codeText() {
      return e(p)
    },
    component: (j) => {
      var R = Be(),
        Z = B(R)
      ;(b(
        Z,
        Oe(() => e(f).properties, {
          onUpdate: ($) => {
            J({ properties: { value: $ } })
          },
        }),
      ),
        V(R),
        I(j, R))
    },
    componentProps: (j) => {
      Le(j, {
        get component() {
          return e(f)
        },
        onPropertyChange: (R) => J({ properties: R }),
        forConstructor: !1,
      })
    },
  }),
    ie())
}
export { He as component }
