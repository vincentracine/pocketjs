/**
 * Pocket.js is a wrapper for the window.localStorage. It provides helpful methods which
 * takes the form of MongoDB's proven syntax and provides a powerful lightweight abstraction from the complexity
 * of managing and querying local storage.
 *
 * The Store provides an in-memory layer for speed.
 *
 * @file A wrapper for native local storage
 * @author Vincent Racine vincentracine@hotmail.co.uk
 * @license MIT
 */
window.Pocket = (function(pocket){

	'use strict';

		/**
		 * Prefixes are used for detecting storage state
		 * @type {{default: string}}
		 */
	var prefixes = {'default':'db.'},
		/**
		 * Pocket version
		 * @type {string}
		 */
		version = '1.0.0';

	/**
	 * Checks a value if of type array
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isArray(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	}

	/**
	 * Checks a value if of type object
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isObject(value){
		return Object.prototype.toString.call(value) === '[object Object]';
	}

	/**
	 * Formats a DB query
	 * @param {object|string|number} [query] DB query to format
	 */
	function formatQuery(query){
		if(query === undefined){
			query = {};
		}
		if(typeof query === 'string' || typeof query === 'number'){
			query = { _id:query };
		}
		return query;
	}

	/**
	 * Recursively merge properties of two objects
	 * @param obj1 original object
	 * @param obj2 object to be merged
	 */
	function MergeRecursive(obj1, obj2) {

		for (var p in obj2) {
			try {
				// Property in destination object set; update its value.
				if ( obj2[p].constructor==Object ) {
					obj1[p] = MergeRecursive(obj1[p], obj2[p]);

				} else {
					obj1[p] = obj2[p];

				}

			} catch(e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p];

			}
		}

		return obj1;
	}

	/**
	 * Comparison operators
	 * @see https://docs.mongodb.org/manual/reference/operator/query-comparison/
	 */
	var StoreOps = {
		/**
		 * Equality test
		 *
		 * @example
		 * Examples.find({ forename: { $eq: 'Foo' } });
		 *
		 * @example
		 * Examples.find({ forename: 'Foo' }); // Shorthand
		 * Examples.find({ forename: { $eq: 'Foo' } });
		 *
		 * @param a
		 * @param b
		 * @return {boolean} result
		 */
		'$eq': function(a,b){
			return a == b;
		},

		/**
		 * Inequality test
		 *
		 * @example
		 * Examples.find({ forename: { $ne: 'Foo' } });
		 *
		 * @param a
		 * @param b
		 * @return {boolean} result
		 */
		'$ne': function(a,b){
			return a != b;
		},

		/**
		 * Or test
		 *
		 * @example
		 * Examples.find({ $or: [{ name:'Foo' },{ name:'Bar' }] });
		 *
		 * @param a
		 * @param b
		 */
		'$or': function(a,b){
			// Throw an error if not passed an array of possibilities
			if(!isArray(b)){
				throw new Error('$or Operator expects an Array')
			}

			var i;

			if(isObject(a)){
				for (i = 0; i < b.length; i++) {
					if(compare(a, b[i])){
						return true;
					}
				}
			}else{
				// Test each value from array of possibilities
				for (i = b.length; i >= 0; i--) {
					if(this.$eq(a,b[i])){
						// Satisfied, return true
						return true;
					}
				}
			}

			// Failed to satisfy, return false
			return false;
		},

		/**
		 * Greater than test
		 *
		 * @example
		 * Examples.find({ age: { $gt: 17 } });
		 *
		 * @param a
		 * @param b
		 */
		'$gt': function(a,b){
			return a > b;
		},

		/**
		 * Greater than or equal test
		 *
		 * @example
		 * Examples.find({ age: { $gte: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$gte': function(a,b){
			return a >= b;
		},

		/**
		 * Less than test
		 *
		 * @example
		 * Examples.find({ age: { $lt: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$lt': function(a,b){
			return a < b;
		},

		/**
		 * Less than or equal test
		 *
		 * @example
		 * Examples.find({ age: { $lte: 18 } });
		 *
		 * @param a
		 * @param b
		 */
		'$lte': function(a,b){
			return a <= b;
		},

		/**
		 * Contains test for strings
		 *
		 * @example
		 * Examples.find({ name: { $contains: "foo" } });
		 *
		 * @param a
		 * @param b
		 */
		'$contains': function(a,b){
			return a.indexOf(b) > -1;
		}
	};

	/**
	 * Finds documents which are valid based on a query
	 *
	 * @param document
	 * @param query
	 * @returns {boolean} valid
	 */
	function compare(document, query){
		var keys = Object.keys(query),
			condition,
			operator;

		for (var i = 0; i < keys.length; i++) {
			// Extract the condition for the query to be satisfied
			condition = { name: keys[i], value: query[keys[i]] };

			// Check to see that the document has the field from the query
			if(!document.hasOwnProperty(condition.name) && typeof StoreOps[condition.name] !== 'function'){
				return false;
			}

			if(typeof StoreOps[condition.name] === 'function'){
				return StoreOps[condition.name](document, condition.value)
			}else if(typeof condition.value === 'object'){
				operator = Object.keys(condition.value)[0];
				if(typeof StoreOps[operator] === 'function'){
					return StoreOps[operator](document[condition.name], condition.value[operator])
				}else{
					throw new Error("Unrecognised operator '" + operator + "'");
				}
			}else{
				// Test to see if the document value for the property is equal the query
				return StoreOps.$eq(document[condition.name], condition.value);
			}
		}

		return true;
	}

	/**
	 * Generates an id with a extremely low chance of collision
	 * @returns {string} ID
	 */
	var generateUniqueIdentifier = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	};

	/**
	 * Checks whether localStorage is supported or not
	 * @returns {boolean} result
	 */
	function localStorageAvailable(){
		try{
			return ('localStorage' in window && window.localStorage !== null);
		}catch(e){
			return false;
		}
	}

	// Test and make sure local storage is supported
	if(!localStorageAvailable()){
		throw new Error('localStorage is not supported');
	}

	/**
	 * Store Object
	 *
	 * @example
	 * var store = new Store();
	 *
	 * @returns {Store}
	 */
	function Store(options){
		this.version = version;
		this.collections = {};
		this.options = options || {};
		return this;
	}
	Store.prototype = {

		/**
		 * Retrieve a collection from the store.
		 * If the collection does not exist, one will be created
		 * using the name passed to the function
		 *
		 * @example
		 * var Examples = Store.collection('example');
		 *
		 * @param {string} name Collection name
		 * @param {object} [options] Options when creating a new collection
		 * @returns {Collection}
		 */
		collection: function(name, options){
			if(arguments.length){
				var collection = this.collections[name];
			}else{
				throw new Error('Expected a collection name');
			}

			return collection || this.addCollection(name, options);
		},

		/**
		 * Adds a collection to the store
		 *
		 * @example
		 * Store.addCollection('example');
		 *
		 * @param {string} name Collection name
		 * @param {object} [options] Options when creating a new collection
		 * @returns {Collection}
		 */
		addCollection: function(name, options){
			// Create collection
			var collection = new Collection(name, options || this.options);
			// Add collection to Store
			this.collections[name] = collection;
			// return the collection
			return collection;
		},

		/**
		 * Removes a collection from the store
		 *
		 * @example
		 * Store.removeCollection('example');
		 *
		 * @param {string} name Collection name
		 * @returns {Store}
		 */
		removeCollection: function(name){
			var collection = this.collections[name];
			if(collection) {
				collection.destroy();
				window.localStorage.removeItem(prefixes.default + name);
				window.localStorage.removeItem(prefixes.secure + name);
				delete this.collections[name];
			}
			return this;
		},

		/**
		 * Retrieves JSON from localStorage and loads it into memory
		 */
		restoreStore: function(){
			var len = localStorage.length;

			for(; len--;){
				var key = localStorage.key(len);
				if(key.indexOf(prefixes.default) == 0 && key.indexOf(prefixes.secure) == -1){
					var row = localStorage.getItem(key);
					if(typeof row === 'string'){
						var data = JSON.parse(row),
							collection;

						collection = new Collection(data.name, data.options);
						collection.documents = data.documents;
						collection.length = data.documents.length;

						this.collections[collection.name] = collection;
					}
				}
			}

			return this;
		},

		/**
		 * Cleans up memory
		 */
		destroy: function(){
			for (var property in this.collections) {
				if (this.collections.hasOwnProperty(property)) {
					property.destroy();
				}
			}
			this.collections = null;
			window.Store = null;
		},

		/**
		 * Stores a collection into local storage
		 *
		 * @param {Collection} [collection] Collection to store into local storage
		 */
		commit: function(collection){
			var node = this.collection(typeof collection === 'object' ? collection.name : collection);
			node.commit();
		}
	};

	/**
	 * Collection Object
	 * @param name Collection name
	 * @param options Options additional options
	 * @returns {Collection}
	 */
	function Collection(name, options){
		this.name = name;
		this.documents = [];
		this.options = options || {};
		this.length = 0;
		return this;
	}
	Collection.prototype = {
		/**
		 * Inserts data into a collection
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ forename: 'Foo', surname: 'Bar' });
		 *
		 * @param {object} doc Data to be inserted into the collection
		 * @returns {Document}
		 */
		insert: function(doc){
			var document = new Document(doc);
			this.documents.push(document);
			this.length++;

			if(this.options.autoCommit){
				this.commit();
			}

			return document;
		},

		/**
		 * Removes documents which satisfy the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 1
		 * Examples.remove({ _id: '394' });
		 * console.log(Examples.length) // 0
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '394', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 1
		 * Examples.remove({ forename: 'Foo' });
		 * console.log(Examples.length) // 0
		 *
		 * @param {object|number|string} [query] Query which tests for valid documents
		 * @return {Collection}
		 */
		remove: function(query){
			var documents = this.find(formatQuery(query));

			// Iterate through query results
			documents.forEach(function(document){
				// Get index of document in the collection
				var index = this.documents.indexOf(document);

				// If index is not -1 (means it wasn't found in the array)
				if(index !== -1){
					// If found in the array, remove it
					this.documents.splice(index, 1);
					// Update the length of the collection
					this.length--;
				}
			}, this);

			if(this.options.autoCommit){
				this.commit();
			}

			// Return collection
			return this;
		},

		/**
		 * Returns an array of documents which satisfy the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
		 * Examples.insert({ _id: '2', forename: 'Bar', surname: 'Foo' });
		 * Examples.insert({ _id: '3', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 2
		 *
		 * var results = Examples.find({ forename: 'Foo' });
		 * console.log(results) // [{ _id: '1', forename: 'Foo', surname: 'Bar' }, { _id: '3', forename: 'Foo', surname: 'Bar' }]
		 *
		 * @param {object|number|string} [query] Query which tests for valid documents
		 * @return {Collection[]}
		 */
		find: function(query){
			var keys,
				results;

			// Get clone of documents in collection
			results = this.documents.slice(0);

			query = formatQuery(query);

			// Get query keys
			keys = Object.keys(query);

			while(keys.length > 0){
				// Break out of loop if we have 0 documents in result
				if(results.length === 0){
					break;
				}

				results = results.filter(function(document){
					var part = {};
					part[keys[0]] = query[keys[0]];
					return compare(document, part)
				});

				// Remove query key
				keys.splice(0,1);
			}

			// Return results to caller
			return results;
		},

		/**
		 * Returns the first document which satisfied the query given
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: '1', forename: 'Foo', surname: 'Bar' });
		 * Examples.insert({ _id: '2', forename: 'Foo', surname: 'Bar' });
		 * console.log(Examples.length) // 2
		 *
		 * var result = Examples.findOne({ forename: 'Foo', surname: 'Bar' });
		 * console.log(result) // { _id: '1', forename: 'Foo', surname: 'Bar' }
		 *
		 * @param {object|number|string} query Query which tests for valid documents
		 * @return {Collection}
		 */
		findOne: function(query){
			return this.find(query)[0];
		},

		/**
		 * Updates an existing document inside the collection
		 * Supports partial updates
		 *
		 * @example
		 * var Examples = Store.addCollection('example');
		 * Examples.insert({ _id: 0, forename: 'Foo', surname: 'Bar' });
		 * Examples.update({ _id: 0 },{ title: 'Mrs' });
		 *
		 * var result = Examples.findOne({ _id:0 });
		 * console.log(result) // { _id: '0', forename: 'Foo', surname: 'Bar', title: 'Mrs' }
		 *
		 * @param {object|number|string} [query] Query which tests for valid documents
		 * @param {object} doc Data to be inserted into the collection
		 * @returns {Collection}
		 */
		update: function(query, doc){
			var documents = this.find(formatQuery(query));

			// Iterate through query results
			documents.forEach(function(document){
				// Get index of document in the collection
				var index = this.documents.indexOf(document);

				// If index is not -1 (means it wasn't found in the array)
				if(index !== -1){
					//  Merge currently record with update object
					this.documents[index] = new Document(MergeRecursive(this.documents[index], doc));
				}
			}, this);

			if(this.options.autoCommit){
				this.commit();
			}

			// Return collection
			return this;
		},

		/**
		 * Returns the size of the collection
		 * @returns {Number} size of collection
		 */
		size: function(){
			return this.documents.length;
		},

		/**
		 * Cleans up memory
		 */
		destroy: function(){
			this.documents = null;
			this.name = null;
		},

		/**
		 * Stores the collection into local storage
		 *
		 * @return {Collection}
		 */
		commit: function(){
			var json = JSON.stringify(this);
			window.localStorage.setItem(prefixes.default.concat(this.name), json);
			return this;
		}
	};

	/**
	 * Document Object
	 * @param {object} object Document data
	 * @returns {object} Document data
	 */
	function Document(object){
		// If object does not has an ID then assign one
		if(object.hasOwnProperty('_id') === false){
			object._id = generateUniqueIdentifier();
		}

		this.object = object;
		return this.object;
	}

	pocket.new = function(options){
		return new Store(typeof options === 'object' ? options : { autoCommit: true });
	};

	return pocket;

})((window.Pocket || {}));