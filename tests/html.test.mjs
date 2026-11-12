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

test("ссылки: только свой фрагмент (#id) и mailto:, javascript: и внешние адреса выбрасываются", () => {
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", " jav&#x09;ascript:alert(1)", "&#x6A;avascript:alert(1)", "vbscript:x"]) {
    assert.equal(sanitizeHtml(`<a href="${href}">l</a>`), "<a>l</a>", href)
  }
  assert.equal(sanitizeHtml('<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>'), "<svg><a><text>x</text></a></svg>")
  assert.equal(sanitizeHtml('<a href="https://e.com/?a=1&amp;b=2">l</a>'), "<a>l</a>")
  assert.equal(sanitizeHtml('<a href="//evil.example/x">l</a>'), "<a>l</a>")
  assert.equal(sanitizeHtml('<a href="mailto:a@b.c">m</a><a href="#top">t</a>'), '<a href="mailto:a@b.c">m</a><a href="#top">t</a>')
  assert.equal(sanitizeHtml('<svg><use xlink:href="mailto:a@b.c"/></svg>'), "<svg><use /></svg>")
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
  assert.equal(sanitizeHtml('<rect style="fill: #f00; stroke-width: 2"/>'), '<rect style="fill: #f00; stroke-width: 2" />')
  assert.equal(sanitizeHtml('<rect fill="url(#g)"/>'), '<rect fill="url(#g)" />')
})

test("текст: одиночные & и < экранируются, сущности остаются", () => {
  assert.equal(sanitizeHtml("<p>a &amp; b & c < d</p>"), "<p>a &amp; b &amp; c &lt; d</p>")
  assert.equal(escapeHtml(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;")
})

test("накрыть страницу нельзя: position, inset, z-index в style и классы fixed/inset/z выбрасываются", () => {
  assert.equal(sanitizeHtml('<a href="#x" style="position:fixed;inset:0;z-index:9999;color:red">l</a>'), '<a href="#x" style="color:red">l</a>')
  assert.equal(sanitizeHtml('<div style="position:absolute;top:0">s</div>'), "<div>s</div>")
  assert.equal(sanitizeHtml('<div style="transform:scale(50)">s</div>'), "<div>s</div>")
  assert.equal(sanitizeHtml('<span class="fixed inset-0 z-50 md:absolute !top-0 -translate-x-1 font-bold">s</span>'), '<span class="font-bold">s</span>')
  assert.equal(sanitizeHtml('<span class="fixed">s</span>'), "<span>s</span>")
  assert.equal(sanitizeHtml('<svg style="width:44px;height:20px"></svg>'), '<svg style="width:44px; height:20px"></svg>')
})
