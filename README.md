## Update Dec 2020 ##
This library is still being **actively** used by myself and others. I have not needed to make any bug fixes or changes as of yet. I've been using this library across countless production builds for both personal products (https://www.automify.co.uk/ and https://www.statusapp.io/) and companies I've worked for.

# PocketJS
Pocket is a high performance web storage library. It provides an API which resembles MongoDB's proven syntax and provides a 
powerful lightweight abstraction from the complexity of web storage. Pocket supports multiple methods of storage including
localStorage and Web SQL. Currently working on offering IndexDB support.

```js
// Create a new Pocket
var pocket = new Pocket()

// Add a collection
var staffs = pocket.collection('staff')

// Add a item to the collection
staffs.insert({ name:'Foo Bar', age:18 })
staffs.insert({ name:'Baz Foo', age:34 })

// Add an array of items
staffs.insert([{ name:'Pete Johnson', age:44 }, { name: "Joe Bloggs", age: 19 }])

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

In your `index.html` file, include the Pocket.js file (ES5).
```html
<script type="text/javascript" src="path/to/Pocket.js"></script>
```

If using ES6 (Browserify), do this:
```js
// Run in terminal
npm install pocketjs

// Include it in JS file
const Pocket = require('pocketjs')
```

Create a new pocket.
```js
var pocket = new Pocket()

// Restore pocket from storage
pocket.restore()
```

Create a new pocket without auto commit.
```js
var pocket = new Pocket({ autoCommit: false })
```

Create a new pocket using WebSQL.
```js
var pocket = new Pocket({ driver: Pocket.Drivers.WEBSQL })
```

Create a new pocket using specific database name.
```js
var pocket = new Pocket({ dbname: "MyCoolApp" })
```

## How it works
PocketJS is a wrapper for multiple storage API's such as localStorage and Web SQL. It exposes a simple API to make your 
life easier. Each pocket has two layers. The first layer is a in-memory representation of your data which allows rapid 
querying and data manipulation. The second layer is your persistent layer which can be any of the supported storage APIs. 
The first layer, by default, will automatically commit changes to persistent storage in JSON format. You can disable 
this behaviour at anytime on any collection and only commit data to localStorage when it suits you or to any other 
supported storage API e.g. Web SQL. 

## API
For usage examples, please see the [PocketSpec.js](tests/spec/PocketSpec.js) test file.

### Store
`Store.collection(name)`:  Return collection and if it doesn't exist, create a new collection and return it  
`Store.removeCollection(name)`: Remove a collection from the pocket  
`Store.restore()`: Loads previous pocket from the chosen database  
`Store.destroy()`: Destroys the pocket. Does not commit before destroying  
`Store.commit(name)`: Stores collection to localStorage based on collection name passed as argument  

### Collection
`Collection.insert(document)`  
`Collection.remove(query)`  
`Collection.find(query)`  
`Collection.findOne(query)`  
`Collection.update(query, patch)`  
`Collection.size()`  
`Collection.destroy()`  
`Collection.commit()`  


## Comparators

Whenever you manipulate or retrieve data in a pocket, you have the ability to specify a query to filter the records and only affect
specific records.

Queries can be used in the following methods:
* Finding one: `Collection.findOne(query)`
* Finding: `Collection.find(query)`
* Updating: `Collection.update(query, data)`
* Removing: `Collection.remove(query)`

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
| String contains   | `address:{ $contains: "London" }` | True if the key contains a substring equal to a value |
| In                | `age:{ $in: [16,17,18] }`         | True if the key exists within the array               |
| Not in            | `age:{ $nin: [16,17,18] }`        | True if the key does not exist within the array       |
| Type              | `age:{ $type: "number" }`         | True if the key data type equals specified data type  |

### Accessing nested keys
Just like MongoDB, you are able to access nested object properties and array indexes using a string. Array indexes
can be accessed by simply putting the index as demonstrated in the example below.
 
```js
Collection.update({ _id: 1234  }, { "profile.settings.3.active": true })
```

## License
This software is provided free of charge and without restriction under the [MIT License](LICENSE)
