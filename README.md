# PocketJS
Pocket.js is a wrapper for the window.localStorage. It provides helpful methods which utilise MongoDB's proven syntax and provides a powerful lightweight abstraction from the complexity of managing and querying local storage.

```js
// Create a new Pocket
var store = Pocket.new()

// Add a collection
var staffs = store.collection('staff')

// Add a item to the collection
staffs.insert({ name:'Foo Bar', age:18 })
staffs.insert({ name:'Baz Foo', age:34 })

// Get all items from a collection
staffs.find().length //2

// Query for specific items
staffs.find({ age:{ $gt:18 }}) //[{ _id:'...', name:'Baz Foo', age:34 }]

// Get one item
staffs.findOne({ name:'Foo Bar' }).age //18

// Remove all items from a collection
staffs.remove()

// Remove item
staffs.remove({ name:'Foo Bar' });

// Update item
staffs.update({ name:'Foo Bar' }, { age:19 });
```

## Installation

In your `index.html` file, include the Pocket.js file.
```html
<script type="text/javascript" src="path/to/Pocket.js"></script>
```

Create a new instance of Pocket.js.
```js
var store = Pocket.new();
```

## Comparators

Whenever you manipulate data in a pocket, you are able to pass a query so that only items which match the query are affected.

When:
* Finding one: `collection.findOne(query)`
* Finding: `collection.find(query)`
* Updating: `collection.update(query, data)`
* Removing: `collection.remove(query)`

### Table of operations
| Operation         | Syntax                            | Description                                           |
| :---------------- | :-------------------------------- | :---------------------------------------------------- |
| Equal             | `age:18` or `age:{ $eq: 18 }`     | True if the key equals a value                        |
| Not equal         | `age:{ $neq: 18 }`                | True if key is not equal to a value                   |
| Or                | `$or:[{ age: 18 },{ age: 19 }]`   | True is any of the conditions match                   |
| Greater           | `age:{ $gt: 18 }`                 | True if the key is greater than a value               |
| Greater or equal  | `age:{ $gte: 18 }`                | True if the key is greater than or equal to a value   |
| Less              | `age:{ $lt: 18 }`                 | True if the key is less than a value                  |
| Less or equal     | `age:{ $lte: 18 }`                | True if the key is less than or equal to a value      |

## License
This software is provided free of charge and without restriction under the [MIT License](LICENSE)
