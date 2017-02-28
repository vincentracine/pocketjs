# PocketJS
Pocket is a high performance storage library. It provides an API which resembles MongoDB's proven syntax and provides a 
powerful lightweight abstraction from the complexity of storage. Pocket support multiple methods of storage including
localStorage, Web SQL, Cordova SQLite plugin and IndexedDB.

```js
// Create a new Pocket
var pocket = new Pocket()

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

// Commit collection to database
staffs.commit()

// Restore from database
pocket.restore()
```

## Installation

In your `index.html` file, include the Pocket.js file.
```html
<script type="text/javascript" src="path/to/Pocket.js"></script>
```

Create a new pocket.
```js
var pocket = new Pocket()

// Restore pocket from localStorage
pocket.restore()
```

## How it works
PocketJS is a wrapper for multiple storage API's such as localStorage and Web SQL. It exposes a simple API to make your life easier. Each pocket has two layers. The first layer is a in-memory representation of your data which allows rapid querying and data manipulation. The second layer is your persistent layer which can be any of the supported storage APIs. The first layer, by default, will automatically commit changes to persistent storage in JSON format. You can disable this behaviour at anytime on any collection and only commit data to localStorage when it suits you or
to any other supported storage API e.g. Web SQL. 

## API

### Store
`Store.collection(name)`:  Return collection and if it doesn't exist, create a new collection and return it  
`Store.removeCollection(name)`: Remove a collection from the pocket  
`Store.restore()`: Loads previous pocket from the chosen database  
`Store.destroy()`: Destroys the pocket. Does not commit before destroying  
`Store.commit(name)`: Stores collection to localStorage based on collection name passed as argument  

### Collection
`Collection.insert(document)`:  
`Collection.remove(query)`:  
`Collection.find(query)`:  
`Collection.findOne(query)`:  
`Collection.update(query, patch)`:  
`Collection.size()`:  
`Collection.destroy()`:  
`Collection.commit()`:  


## Comparators

Whenever you manipulate or retrieve data in a pocket, you have the ability to specify a query to filter the records and only affect
specific records.

Queries can be used in the following methods:
* Finding one: `collection.findOne(query)`
* Finding: `collection.find(query)`
* Updating: `collection.update(query, data)`
* Removing: `collection.remove(query)`

### Table of operations
| Operation         | Syntax                            | Description                                           |
| :---------------- | :-------------------------------- | :---------------------------------------------------- |
| Equal             | `age:18` or `age:{ $eq: 18 }`     | True if the key equals a value                        |
| Not equal         | `age:{ $neq: 18 }`                | True if key is not equal to a value                   |
| Or                | `$or:[query, query, ...]`         | True if any of the queries are true                   |
| Greater           | `age:{ $gt: 18 }`                 | True if the key is greater than a value               |
| Greater or equal  | `age:{ $gte: 18 }`                | True if the key is greater than or equal to a value   |
| Less              | `age:{ $lt: 18 }`                 | True if the key is less than a value                  |
| Less or equal     | `age:{ $lte: 18 }`                | True if the key is less than or equal to a value      |

## License
This software is provided free of charge and without restriction under the [MIT License](LICENSE)
