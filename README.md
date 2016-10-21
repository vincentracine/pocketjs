# PocketJS
Pocket is a wrapper for the window.localStorage. It provides helpful methods which utilise MongoDB's proven syntax and provides a powerful lightweight abstraction from the complexity of managing and querying local storage.

```js
// Create a new Pocket
var pocket = Pocket.new()

// Add a collection
var staffs = pocket.collection('staff')

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
staffs.remove({ name:'Foo Bar' })

// Update item
staffs.update({ name:'Foo Bar' }, { age:19 })

// Commit collection to localStorage
staffs.commit()

// Commit entire pocket to localStorage
pocket.commit()

// Restore localStorage
pocket.restoreStore()
```

## Installation

In your `index.html` file, include the Pocket.js file.
```html
<script type="text/javascript" src="path/to/Pocket.js"></script>
```

Create a new pocket.
```js
var pocket = Pocket.new();

// Restore pocket from localStorage
pocket.restoreStore()
```

## How it works
Pocket is a wrapper for the window.localStorage object and exposes a simple API to make your life easier. Pocket works 
on two layers. The first layer is a in-memory representation of your data which allows rapid querying and data manipulation. 
The second layer is localStorage and is persistent. The first layer, by default, automatically commits changes to localStorage 
in JSON format. You can disable this behaviour at anytime on any collection and only commit data to localStorage when it suits you. 

## API

### Store
`Store.collection(name)`:  Return collection and if it doesn't exist, create a new collection and return it
`Store.addCollection(name)`: Add a collection to the pocket
`Store.removeCollection(name)`: Remove a collection from the pocket
`Store.restoreStore()`: Loads previous pocket from localStorage
`Store.destroy()`: Destroys the pocket. Does not commit before destroying
`Store.commit(name)`: Stores collection to localStorage based on collection name passed as argument

### Collection
`Collection.insert(document)`: 
`Collection.remove(query)`:
`Collection.find(query)`:
`Collection.findOne(query)`:
`Collection.update(query, obj)`:
`Collection.size()`:
`Collection.destroy()`:
`Collection.commit()`:

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
| Or                | `$or:[query, query, ...]`         | True is any of the queries are true                   |
| Greater           | `age:{ $gt: 18 }`                 | True if the key is greater than a value               |
| Greater or equal  | `age:{ $gte: 18 }`                | True if the key is greater than or equal to a value   |
| Less              | `age:{ $lt: 18 }`                 | True if the key is less than a value                  |
| Less or equal     | `age:{ $lte: 18 }`                | True if the key is less than or equal to a value      |

## License
This software is provided free of charge and without restriction under the [MIT License](LICENSE)
