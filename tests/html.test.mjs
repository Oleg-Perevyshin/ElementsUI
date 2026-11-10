/* tests/html.test.mjs - очистка HTML перед {@html} (sanitizeHtml) против типовых XSS и подгрузки внешних ресурсов */
import { test } from "node:test"
import assert from "node:assert/strict"
import { sanitizeHtml, escapeHtml } from "../dist/html.js"

const BS = String.fromCharCode(92)

test("script, style, iframe и foreignObject выбрасываются вместе с содержимым", () => {
  assert.equal(sanitizeHtml("<b>ok</b><script>alert(1)</script>x"), "<b>ok</b>x")
  assert.equal(sanitizeHtml("<style>*{}</style><iframe src=x></iframe>t"), "t")
  assert.equal(sanitizeHtml('<svg><script>alert(1)</script><path d="M0 0"/></svg>'), '<svg><path d="M0 0" /></svg>')
  assert.equal(sanitizeHtml("<svg><foreignObject><img src=x onerror=alert(1)></foreignObject></svg>"), "<svg></svg>")
  assert.ok(!sanitizeHtml("<<script>script>alert(1)<</script>/script>").includes("<script"))
})

test("обработчики on* и неразрешённые теги отбрасываются", () => {
  assert.equal(sanitizeHtml("<img src=x onerror=alert(1)>"), "")
  assert.equal(sanitizeHtml('<span onclick="alert(1)" class="c">t</span>'), '<span class="c">t</span>')
  assert.equal(sanitizeHtml("<svg onload=alert(1)></svg>"), "<svg></svg>")
})

test("ссылки: javascript: в любом написании нельзя, http(s) и свой фрагмент можно", () => {
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", " jav&#x09;ascript:alert(1)", "&#x6A;avascript:alert(1)", "vbscript:x"]) {
    assert.equal(sanitizeHtml(`<a href="${href}">l</a>`), "<a>l</a>", href)
  }
  assert.equal(sanitizeHtml('<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>'), "<svg><a><text>x</text></a></svg>")
  assert.equal(sanitizeHtml('<a href="https://e.com/?a=1&amp;b=2">l</a>'), '<a href="https://e.com/?a=1&amp;b=2">l</a>')
  assert.equal(sanitizeHtml('<svg><use href="http://evil/x.svg#a"/><use href="#a"/></svg>'), '<svg><use /><use href="#a" /></svg>')
})

test("стили: url() на внешний ресурс и expression() нельзя, в том числе через сущности и CSS-экранирование", () => {
  for (const style of [
    "background:url(http://evil/x.png)",
    "background:url&#40;http://evil/x&#41;",
    "background:u&#x72;l(http://evil)",
    `x:${BS}75rl(http://evil)`,
    "behavior:expression(alert(1))",
    "@import 'http://evil'",
  ]) {
    assert.equal(sanitizeHtml(`<div style="${style}">s</div>`), "<div>s</div>", style)
  }
  assert.equal(sanitizeHtml('<div style="color:red">s</div>'), '<div style="color:red">s</div>')
  assert.equal(sanitizeHtml('<rect fill="url(#g)"/>'), '<rect fill="url(#g)" />')
})

test("текст: одиночные & и < экранируются, сущности остаются", () => {
  assert.equal(sanitizeHtml("<p>a &amp; b & c < d</p>"), "<p>a &amp; b &amp; c &lt; d</p>")
  assert.equal(escapeHtml(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;")
})
