# @parche/astro-collections

A page for every entry of a collection of plain data (products, courses,
places), rendered by a widget or a Parche pattern that takes the entry's
fields as props. The collection holds only data; the page's structure is the
widget's.

```js
createCollectionPages({
  products: { path: '/products/%slug%', widget: 'pattern/product-page', layout: 'store' },
})
```

See `docs-wip/collections.md` in the repository.
