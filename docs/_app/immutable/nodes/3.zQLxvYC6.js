import '../chunks/NZTpNUN0.js'
import {
  p as j,
  k as G,
  l as F,
  a as f,
  e as M,
  f as _,
  h as w,
  g as e,
  i as g,
  j as u,
  r as S,
  s as Y,
  c as W,
  n as U,
  d as q,
} from '../chunks/C8jWV29K.js'
import { p as H, i as J, s as K, c as I, a as L, d as Q } from '../chunks/CFB23tc5.js'
import { I as V, S as R, F as X, B as Z, o as ee, d as te, A as v } from '../chunks/CuZzhwEb.js'
import { u as P } from '../chunks/BoP6aUrK.js'
var oe = _(
  '<div class="flex items-center justify-center gap-8"><div class="flex w-1/3 flex-col items-center px-2"><!> <!></div> <div class="flex w-1/3 flex-col items-center px-2"><!></div> <div class="flex w-1/3 flex-col items-center gap-2 px-2"><!> <!></div></div>',
)
function re(N, l) {
  j(l, !0)
  const t = () => L(ee, '$optionsStore', $),
    m = () => L(te, '$t', $),
    [$, y] = K(),
    o = H(l, 'component', 7),
    O = g(() => t().ACCORDION_TYPE_OPTIONS.find((a) => a.value === o().properties.outline)),
    C = g(() =>
      t().TEXT_ALIGN_OPTIONS.find((a) =>
        a.value.includes(
          o()
            .properties.label?.class?.split(' ')
            .find((r) => r.startsWith('text-')),
        ),
      ),
    ),
    T = (a) => {
      const r = a.target
      if (!r.files || r.files.length === 0) return
      const b = r.files[0],
        A = new FileReader()
      ;((A.onload = (k) => {
        const x = k.target?.result
        P('image', x, o(), l.onPropertyChange)
      }),
        A.readAsDataURL(b))
    }
  var s = G(),
    n = F(s)
  {
    var i = (a) => {
      var r = oe(),
        b = w(r),
        A = w(b)
      {
        let c = g(() => ({ name: m()('constructor.props.label') }))
        I(
          A,
          () => V,
          (p, d) => {
            d(p, {
              get label() {
                return e(c)
              },
              get value() {
                return o().properties.label.name
              },
              onUpdate: (h) => P('label.name', h, o(), l.onPropertyChange),
              type: 'text',
            })
          },
        )
      }
      var k = u(A, 2)
      {
        let c = g(() => ({ name: m()('constructor.props.align') }))
        I(
          k,
          () => R,
          (p, d) => {
            d(p, {
              get label() {
                return e(c)
              },
              type: 'buttons',
              get value() {
                return e(C)
              },
              get options() {
                return t().TEXT_ALIGN_OPTIONS
              },
              onUpdate: (h) => P('label.class', h.value, o(), l.onPropertyChange),
            })
          },
        )
      }
      S(b)
      var x = u(b, 2),
        z = w(x)
      {
        let c = g(() => ({ name: m()('constructor.props.type') }))
        I(
          z,
          () => R,
          (p, d) => {
            d(p, {
              get label() {
                return e(c)
              },
              type: 'buttons',
              get value() {
                return e(O)
              },
              get options() {
                return t().ACCORDION_TYPE_OPTIONS
              },
              onUpdate: (h) => P('outline', h.value, o(), l.onPropertyChange),
            })
          },
        )
      }
      S(x)
      var B = u(x, 2),
        D = w(B)
      {
        let c = g(() => ({ name: m()('constructor.props.image') }))
        I(
          D,
          () => X,
          (p, d) => {
            d(p, {
              type: 'image',
              get label() {
                return e(c)
              },
              accept: 'image/png, image/jpeg, image/webp',
              onChange: T,
              get currentImage() {
                return o().properties.image
              },
              set currentImage(h) {
                o().properties.image = h
              },
            })
          },
        )
      }
      var E = u(D, 2)
      {
        let c = g(() => ({ name: m()('constructor.props.removeimage') }))
        I(
          E,
          () => Z,
          (p, d) => {
            d(p, {
              get content() {
                return e(c)
              },
              wrapperClass: '!w-auto',
              onClick: () => P('image', '', o(), l.onPropertyChange),
            })
          },
        )
      }
      ;(S(B), S(r), f(a, r))
    }
    J(n, (a) => {
      o() && o().properties && a(i)
    })
  }
  ;(f(N, s), M(), y())
}
var se = _('<div class="flex flex-col"><h1>Содержимое компонента</h1> <h1>Содержимое компонента</h1></div>'),
  ae = _(
    '<h6 class="col-span-10">Содержимое вложенного Accordion 1</h6> <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4> <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>',
    1,
  ),
  ne = _(
    '<h6 class="col-span-10">Содержимое вложенного Accordion 1</h6> <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4> <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>',
    1,
  ),
  le = _(
    '<h6 class="col-span-10">Содержимое вложенного Accordion 1</h6> <h4 class="col-span-10">Содержимое вложенного Accordion 1</h4> <h2 class="col-span-10">Содержимое вложенного Accordion 1</h2>',
    1,
  ),
  ie = _(
    '<!> <!>   <!> <!> <!>  <div class="sticky bottom-0 mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--back-color)]"><h3 class="mb-2 text-lg font-bold">Todo List:</h3> <div class="ml-8 flex flex-col text-left"><h5>1. Разобраться с прикреплением иконки к заголовку как svg поток</h5> <h5>2. Сделать автоматическое масштабирование иконки</h5> <h5>3. Разобраться со сварачиванием 3 и 4 аккордиона (Инна)</h5> <h5>4. Разобраться с прикреплением фона (добавил в isOpen style самого компонента, не уверен в правильности)</h5></div></div>',
    1,
  )
function he(N, l) {
  j(l, !0)
  let t = Y(
    W({
      id: crypto.randomUUID(),
      type: 'Accordion',
      component: null,
      properties: {
        id: crypto.randomUUID(),
        isOpen: !0,
        outline: !0,
        size: { height: 1, width: 1 },
        label: { name: ',kdf,;sdedfewfrterg', class: 'text-center', icon: null },
        image: '',
        children: void 0,
      },
      position: { row: 0, col: 0, width: 0, height: 0 },
      parentId: '',
    }),
  )
  const m = (s, n) => {
    q(
      t,
      {
        ...e(t),
        position: n.position ? { ...e(t).position, ...n.position } : e(t).position,
        parentId: n.parentId ?? e(t).parentId,
        properties: n.properties ? { ...e(t).properties, ...n.properties } : e(t).properties,
      },
      !0,
    )
  }
  var $ = ie(),
    y = F($)
  v(
    y,
    Q(() => e(t).properties, {
      children: (s, n) => {
        var i = se()
        f(s, i)
      },
      $$slots: { default: !0 },
    }),
  )
  var o = u(y, 2)
  re(o, {
    get component() {
      return e(t)
    },
    onPropertyChange: (s) => m(e(t).id, { properties: s }),
  })
  var O = u(o, 2)
  v(O, {
    label: { name: 'Accordion MAIN' },
    size: { width: 5 },
    isOpen: !1,
    wrapperClass: 'w-1/2',
    children: (s, n) => {
      v(s, {
        label: { name: 'Accordion 1 SUB', class: '' },
        isOpen: !1,
        outline: !0,
        wrapperClass: ' col-span-5',
        children: (i, a) => {
          var r = ae()
          ;(U(4), f(i, r))
        },
        $$slots: { default: !0 },
      })
    },
    $$slots: { default: !0 },
  })
  var C = u(O, 2)
  v(C, {
    label: { name: 'Accordion MAIN', class: 'text-center' },
    isOpen: !1,
    children: (s, n) => {
      v(s, {
        label: { name: 'Accordion 1 SUB', class: '' },
        isOpen: !1,
        outline: !0,
        wrapperClass: 'col-span-5',
        children: (i, a) => {
          var r = ne()
          ;(U(4), f(i, r))
        },
        $$slots: { default: !0 },
      })
    },
    $$slots: { default: !0 },
  })
  var T = u(C, 2)
  ;(v(T, {
    label: { name: 'Accordion MAIN', class: 'text-right' },
    isOpen: !1,
    children: (s, n) => {
      v(s, {
        label: { name: 'Accordion 1 SUB', class: '' },
        isOpen: !1,
        outline: !0,
        wrapperClass: 'col-span-5',
        children: (i, a) => {
          var r = le()
          ;(U(4), f(i, r))
        },
        $$slots: { default: !0 },
      })
    },
    $$slots: { default: !0 },
  }),
    U(2),
    f(N, $),
    M())
}
export { he as component }
