import '../chunks/NZTpNUN0.js'
import {
  p as ie,
  m as ue,
  k as X,
  l as A,
  a as U,
  e as ce,
  f as B,
  h as L,
  g as t,
  i as a,
  j as d,
  r as V,
  d as J,
  s as ee,
  c as me,
} from '../chunks/C8jWV29K.js'
import { i as G, s as de, c as m, a as Z, d as ge } from '../chunks/CFB23tc5.js'
import { S as j, I as b, f as $, o as ve, d as fe } from '../chunks/CuZzhwEb.js'
var be = B('<!> <!>', 1),
  xe = B('<!> <!> <!>', 1),
  _e = B(
    '<div class="relative flex flex-row items-start justify-center"><div class="flex w-1/3 flex-col items-center px-2"><!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!> <!></div> <div class="flex w-1/3 flex-col px-2"><!> <!> <!></div></div>',
  )
function he(D, e) {
  ie(e, !0)
  const x = () => Z(ve, '$optionsStore', N),
    s = () => Z(fe, '$t', N),
    [N, H] = de()
  let w = ee(!0)
  const I = ue('DeviceVariables')
  let P = a(() => (I && Array.isArray(I) ? I.map((i) => ({ id: i.name, value: i.value, name: `${i.value} | ${i.name}` })) : []))
  const te = a(() =>
      x().COLOR_OPTIONS.find((i) => i.value.includes(e.component.properties.componentClass?.split(' ').find((l) => l.startsWith('bg-')))),
    ),
    re = a(() =>
      x().TEXT_ALIGN_OPTIONS.find((i) => i.value.includes(e.component.properties.label?.class?.split(' ').find((l) => l.startsWith('text-')))),
    ),
    c = (i, l) => {
      const v = JSON.parse(JSON.stringify(e.component.properties))
      if (i === 'regExp')
        try {
          let g
          if (typeof l == 'string') {
            const f = l.match(/^\/(.*)\/([gimsuy]*)$/)
            if (((g = f ? new RegExp(f[1], f[2]) : new RegExp(l)), f === null)) return
            g.test('')
          } else throw new Error('Invalid RegExp type')
          ;((v.regExp = g), J(w, !0))
        } catch (g) {
          ;(console.warn('Invalid RegExp:', g), (v.regExp = typeof l == 'string' ? l : String(l)), J(w, !1))
          return
        }
      const h = i.split('.')
      let _ = v
      for (let g = 0; g < h.length - 1; g++) {
        const f = h[g]
        ;(_[f] || (_[f] = {}), (_ = _[f]))
      }
      ;((_[h[h.length - 1]] = l), e.onPropertyChange(v))
    },
    ne = (i) => {
      let l = e.component.properties.componentClass || ''
      ;((l = l
        .split(' ')
        .filter((v) => !v.startsWith('bg-'))
        .join(' ')),
        i && (l += ` ${i}`),
        c('componentClass', l))
    }
  var Y = X(),
    oe = A(Y)
  {
    var ae = (i) => {
      var l = _e(),
        v = L(l),
        h = L(v)
      {
        let n = a(() => ({ name: s()('constructor.props.variable') })),
          o = a(() => t(P).find((r) => r.value === e.component.properties.id.value))
        m(
          h,
          () => j,
          (r, p) => {
            p(r, {
              get label() {
                return t(n)
              },
              get options() {
                return t(P)
              },
              get value() {
                return t(o)
              },
              onUpdate: (u) => {
                u && u.name && (c('id', u.value), c('eventHandler.Variables', u.value))
              },
            })
          },
        )
      }
      var _ = d(h, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.type') })),
          o = a(() => x().INPUT_TYPE_OPTIONS.find((r) => r.value === (e.component.properties.type || 'text')))
        m(
          _,
          () => j,
          (r, p) => {
            p(r, {
              get label() {
                return t(n)
              },
              get options() {
                return x().INPUT_TYPE_OPTIONS
              },
              type: 'buttons',
              get value() {
                return t(o)
              },
              onUpdate: (u) => c('type', u.value),
            })
          },
        )
      }
      var g = d(_, 2)
      {
        var f = (n) => {
            var o = be(),
              r = A(o)
            {
              let u = a(() => ({ name: s()('constructor.props.maxlength') }))
              m(
                r,
                () => b,
                (C, O) => {
                  O(C, {
                    get label() {
                      return t(u)
                    },
                    get value() {
                      return e.component.properties.maxlength
                    },
                    onUpdate: (S) => c('maxlength', S),
                  })
                },
              )
            }
            var p = d(r, 2)
            {
              let u = a(() => ({ name: s()('constructor.props.regexp') })),
                C = a(() => ({ info: s()('constructor.props.regexp.info') })),
                O = a(() => (t(w) === !1 ? '!border-2 !border-red-400' : ''))
              m(
                p,
                () => b,
                (S, k) => {
                  k(S, {
                    get label() {
                      return t(u)
                    },
                    get value() {
                      return e.component.properties.help.regExp
                    },
                    maxlength: 150,
                    get help() {
                      return t(C)
                    },
                    get componentClass() {
                      return t(O)
                    },
                    onUpdate: (y) => c('help.regExp', y),
                  })
                },
              )
            }
            U(n, o)
          },
          pe = (n) => {
            var o = X(),
              r = A(o)
            {
              var p = (u) => {
                var C = xe(),
                  O = A(C)
                {
                  let y = a(() => ({ name: s()('constructor.props.minnum') }))
                  m(
                    O,
                    () => b,
                    (E, T) => {
                      T(E, {
                        get label() {
                          return t(y)
                        },
                        get value() {
                          return e.component.properties.number.minNum
                        },
                        type: 'number',
                        onUpdate: (R) => {
                          c('number.minNum', Number(R))
                        },
                      })
                    },
                  )
                }
                var S = d(O, 2)
                {
                  let y = a(() => ({ name: s()('constructor.props.maxnum') }))
                  m(
                    S,
                    () => b,
                    (E, T) => {
                      T(E, {
                        get label() {
                          return t(y)
                        },
                        get value() {
                          return e.component.properties.number.maxNum
                        },
                        type: 'number',
                        onUpdate: (R) => {
                          c('number.maxNum', Number(R))
                        },
                      })
                    },
                  )
                }
                var k = d(S, 2)
                {
                  let y = a(() => ({ name: s()('constructor.props.step') }))
                  m(
                    k,
                    () => b,
                    (E, T) => {
                      T(E, {
                        get label() {
                          return t(y)
                        },
                        get value() {
                          return e.component.properties.number.step
                        },
                        type: 'number',
                        onUpdate: (R) => c('number.step', Number(R)),
                      })
                    },
                  )
                }
                U(u, C)
              }
              G(
                r,
                (u) => {
                  e.component.properties.type === 'number' && !e.component.properties.readonly && !e.component.properties.disabled && u(p)
                },
                !0,
              )
            }
            U(n, o)
          }
        G(g, (n) => {
          e.component.properties.type === 'text' || e.component.properties.type === 'password' || e.component.properties.type === 'text-area'
            ? n(f)
            : n(pe, !1)
        })
      }
      V(v)
      var W = d(v, 2),
        z = L(W)
      {
        let n = a(() => ({ name: s()('constructor.props.placeholder') }))
        m(
          z,
          () => b,
          (o, r) => {
            r(o, {
              get label() {
                return t(n)
              },
              get value() {
                return e.component.properties.placeholder
              },
              onUpdate: (p) => c('placeholder', p),
            })
          },
        )
      }
      var q = d(z, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.info') }))
        m(
          q,
          () => b,
          (o, r) => {
            r(o, {
              get label() {
                return t(n)
              },
              get value() {
                return e.component.properties.help.info
              },
              onUpdate: (p) => c('help.info', p),
            })
          },
        )
      }
      var F = d(q, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.readonly') })),
          o = a(() => (e.component.properties.readonly ? 2 : 1))
        m(
          F,
          () => $,
          (r, p) => {
            p(r, {
              get label() {
                return t(n)
              },
              get value() {
                return t(o)
              },
              onChange: (u) => c('readonly', u === 2),
            })
          },
        )
      }
      var le = d(F, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.copy') })),
          o = a(() => (e.component.properties.help.copyButton ? 2 : 1))
        m(
          le,
          () => $,
          (r, p) => {
            p(r, {
              get label() {
                return t(n)
              },
              get value() {
                return t(o)
              },
              onChange: (u) => c('help.copyButton', u === 2),
            })
          },
        )
      }
      V(W)
      var K = d(W, 2),
        M = L(K)
      {
        let n = a(() => ({ name: s()('constructor.props.label') }))
        m(
          M,
          () => b,
          (o, r) => {
            r(o, {
              get label() {
                return t(n)
              },
              get value() {
                return e.component.properties.label.name
              },
              onUpdate: (p) => c('label.name', p),
            })
          },
        )
      }
      var Q = d(M, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.align') }))
        m(
          Q,
          () => j,
          (o, r) => {
            r(o, {
              get label() {
                return t(n)
              },
              type: 'buttons',
              get value() {
                return t(re)
              },
              get options() {
                return x().TEXT_ALIGN_OPTIONS
              },
              onUpdate: (p) => c('label.class', `${e.component.properties.label.class} ${p.value}`),
            })
          },
        )
      }
      var se = d(Q, 2)
      {
        let n = a(() => ({ name: s()('constructor.props.colors') }))
        m(
          se,
          () => j,
          (o, r) => {
            r(o, {
              wrapperClass: 'h-14',
              get label() {
                return t(n)
              },
              type: 'buttons',
              get options() {
                return x().COLOR_OPTIONS
              },
              get value() {
                return t(te)
              },
              onUpdate: (p) => ne(p.value),
            })
          },
        )
      }
      ;(V(K), V(l), U(i, l))
    }
    G(oe, (i) => {
      e.component && e.component.properties && i(ae)
    })
  }
  ;(U(D, Y), ce(), H())
}
var ye = B('<div class="h-50"><!></div> <!>', 1)
function Se(D) {
  let e = ee(
    me({
      id: crypto.randomUUID(),
      type: 'Input',
      component: null,
      properties: {
        id: crypto.randomUUID(),
        wrapperClass: '',
        label: { name: 'Label', class: 'text-center' },
        type: 'text',
        componentClass: 'bg-max !resize-none',
        disabled: !1,
        readonly: !1,
        maxlength: 32,
        number: { minNum: 0, maxNum: 10, step: 1 },
        textareaRows: 1,
        placeholder: '',
        help: { copyButton: !1, info: '', autocomplete: 'off' },
        eventHandler: { Header: 'SET', Argument: 'NoSend', Variables: [] },
      },
      position: { row: 0, col: 0, width: 0, height: 0 },
      parentId: '',
    }),
  )
  const x = (I, P) => {
    J(e, { ...t(e), properties: P.properties ? { ...t(e).properties, ...P.properties } : t(e).properties }, !0)
  }
  var s = ye(),
    N = A(s),
    H = L(N)
  ;(b(
    H,
    ge(() => t(e).properties),
  ),
    V(N))
  var w = d(N, 2)
  ;(he(w, {
    get component() {
      return t(e)
    },
    onPropertyChange: (I) => x(t(e).id, { properties: I }),
  }),
    U(D, s))
}
export { Se as component }
