/**
 * Testing for the Pocket.js Library
 *
 * @author Vincent Racine vr00051@surrey.ac.uk
 */
describe('app', function() {

	/**
	 * Pocket.js tests
	 */
	describe('store', function() {

		describe('store', function(){
			it('should create store', function(){
				var store = new Pocket();
				expect(store.version).toBeDefined();
			});
		});

		describe('collections', function(){
			var store = new Pocket();

			it('should create collection', function(){
				store.collection('test');
				expect(store.collections.test).toBeDefined()
			});

			it('should remove collection', function(){
				expect(store.removeCollection('test').collections.test).not.toBeDefined()
			});
		});

		describe('documents', function() {
			var store = new Pocket();
			var collection = store.collection('test');

			it('should create a document', function(){
				collection.insert({});
				expect(collection.size()).toEqual(1);
			});

			it('should create multiple documents', function(){
				var docs = collection.insert([{}, {}, {}, {}, {}]);
				expect(docs.length).toEqual(5);
				expect(collection.size()).toEqual(6);
			});

			it('should remove a document', function(){
				collection.remove();
				expect(collection.size()).toEqual(0);
			});

			it('should create & return document _id', function(){
				var document = collection.insert({});
				expect(document._id).toBeDefined();
				expect(typeof document._id).toEqual('string');
			});

			it('should not override _id if already exists', function(){
				var document = collection.insert({ _id: 1 });
				expect(document._id).toBeDefined();
				expect(document._id).toEqual(1);
			});

			it('should find documents', function(){
				// Remove previous entries
				collection.remove();
				collection.insert({});
				collection.insert({});
				var documents = collection.find();
				expect(documents.length).toEqual(2);
			});

			it('should find one document', function(){
				// Remove previous entries
				collection.remove();
				collection.insert({});
				collection.insert({});
				var document = collection.findOne();
				expect(document).toBeTruthy();
			});

			it('should partially update shallow keys', function(){
				collection.remove();
				var document = collection.insert({ forename: "Foo", surname: "Bar" });
				expect(document.forename).toEqual("Foo");

				collection.update(document._id, { forename: "Biz" });
				document = collection.findOne();
				expect(document.forename).toEqual("Biz");
			});

			it('should handle deep keys', function(){
				collection.insert({ profile:{ forename: 'Vince', surname: 'Racine', settings:[{ key:"read", active: true },{ key:"write", active: false }] }, tags: ["Storage", "JavaScript", "Library", "PocketJS"]});
				var result = collection.findOne({ "profile.forename": "Vince" });
				expect(result).not.toBeNull();

				window.collection = collection;

				result = collection.findOne({ "tags.0": "Storage" });
				expect(result).not.toBeNull();

				result = collection.findOne({ "profile.settings.1.active": false });
				expect(result).not.toBeNull();
			});
		});

		describe('queries', function(){
			var store = new Pocket();
			var collection = store.collection('test');

			collection.insert({ name: 'Person 1', age: 15, male: false });
			collection.insert({ name: 'Person 2', age: 18, male: true });
			collection.insert({ name: 'Person 3', age: 21, male: true });
			collection.insert({ name: 'Person 4', age: 12, male: false, special: true });
			collection.insert({ name: 'Person 5', age: 15, male: false });
			collection.insert({ name: 'Person 6', age: 34, male: false, tags:["Test", "for", "array", "operators"] });

			it('should test booleans', function(){
				expect(collection.find({ male:true }).length).toEqual(2);
				expect(collection.find({ male:false }).length).toEqual(4);
				expect(collection.findOne({ male:true })).toBeTruthy();
			});

			it('should test strings', function(){
				expect(collection.find({ name:'Person 1' }).length).toEqual(1);
				expect(collection.findOne({ name:'Person 2' })).toBeTruthy();
			});

			it('should test numbers', function(){
				expect(collection.find({ age:15 }).length).toEqual(2);
				expect(collection.findOne({  age:18 })).toBeTruthy();
			});

			it('$eq', function(){
				expect(collection.find({ age: { $eq:15 } }).length).toEqual(2);
				expect(collection.findOne({ age: { $eq:34 } })).toBeTruthy();
				expect(collection.findOne({ age: { $eq:-1 } })).not.toBeTruthy();
			});

			it('$eq', function(){
				expect(collection.find({ age: { $eq:15 } }).length).toEqual(2);
				expect(collection.findOne({ age: { $eq:34 } })).toBeTruthy();
				expect(collection.findOne({ age: { $eq:-1 } })).not.toBeTruthy();
			});

			it('$ne', function(){
				expect(collection.find({ age: { $ne:34 } }).length).toEqual(5);
				expect(collection.findOne({ name: { $ne:'Person 1' } })).toBeTruthy();
				expect(collection.findOne({ special: { $ne:true } })).not.toBeTruthy();
			});

			it('$or', function(){
				expect(collection.find({ $or: [{name: 'Person 1'},{name: 'Person 2'}] }).length).toEqual(2);
				expect(collection.findOne({ $or: [{name: 'Person 1'},{name: 'Person 0'}] })).toBeTruthy();
				expect(collection.findOne({ $or: [{name: 'Person -1'},{name: 'Person 0'}] })).not.toBeTruthy();
			});

			it('$gt', function(){
				expect(collection.find({ age: { $gt:18 } }).length).toEqual(2);
				expect(collection.findOne({ age: { $gt:33 } })).toBeTruthy();
				expect(collection.findOne({ age: { $gt:34 } })).not.toBeTruthy();
			});

			it('$gte', function(){
				expect(collection.find({ age: { $gte:18 } }).length).toEqual(3);
				expect(collection.findOne({ age: { $gte:34 } })).toBeTruthy();
				expect(collection.findOne({ age: { $gte:35 } })).not.toBeTruthy();
			});

			it('$lt', function(){
				expect(collection.find({ age: { $lt:18 } }).length).toEqual(3);
				expect(collection.findOne({ age: { $lt:13 } })).toBeTruthy();
				expect(collection.findOne({ age: { $lt:12 } })).not.toBeTruthy();
			});

			it('$lte', function(){
				expect(collection.find({ age: { $lte:18 } }).length).toEqual(4);
				expect(collection.findOne({ age: { $lte:12 } })).toBeTruthy();
				expect(collection.findOne({ age: { $lte:11 } })).not.toBeTruthy();
			});

			it('nested comparators in $or', function(){
				expect(collection.find({ $or: [{ name:{ $eq:'Person 1' }},{ name:{ $eq:'Person 2' }}] }).length).toEqual(2);
				expect(collection.find({ $or: [{ age:{ $gt:30 }},{ age:{ $lte:15 }}] }).length).toEqual(4);
			});

			it('$in', function(){
				expect(collection.find({ age: { $in:[12, 18] } }).length).toEqual(2);
			});

			it('$nin', function(){
				expect(collection.find({ age: { $nin:[12, 18] } }).length).toEqual(4);
			});

			it('$type', function(){
				expect(collection.find({ age: { $type: "number" } }).length).toEqual(6);
				expect(collection.find({ tags: { $type: "array" } }).length).toEqual(1);
			});

		});

		describe('Driver - localStorage', function(){
			var store = new Pocket();
			var collection = store.collection('test');

			it('select default driver', function(){
				expect(store.options.driver === window.localStorage).toEqual(true);
			});

			it('should commit empty collection', function(){
				collection.remove();
				collection.commit();
				expect(window.localStorage.getItem('pocket.test')).toBeDefined();
			});

			it('should commit non-empty collection', function(){
				window.localStorage.removeItem('pocket.test');
				expect(window.localStorage.getItem('pocket.test')).toBeNull();
				collection.insert({ forename: 'Foo', surname: 'Bar' });
				collection.commit();
				var json = window.localStorage.getItem('pocket.test');
				expect(json).toBeDefined();

				var data = JSON.parse(json);
				expect(data.name).toEqual('test');
				expect(data.length).toEqual(1);
			});
		});

		describe('Driver - Web SQL', function(){
			var store = new Pocket({
				driver: Pocket.Drivers.WEBSQL
			});
			var collection = store.collection('test');

			it('select default driver', function(){
				expect(store.options.driver.toString()).toEqual("[object Database]");
			});

			it('should commit empty collection', function(done){
				collection.remove();
				collection.commit(function(error){
					expect(error).toBeFalsy();
					done();
				});
			});

			it('should commit non-empty collection', function(done){
				collection.insert({ forename: 'Foo', surname: 'Bar' });
				collection.commit(function(error){
					expect(error).toBeFalsy();
					done();
				});
			});

			it('should recover data', function(done){
				collection.remove();
				collection.insert({ forename: 'Foo', surname: 'Bar' });
				collection.commit();
				store.destroy();
				store = new Pocket({
					driver: Pocket.Drivers.WEBSQL
				});
				store.restore(function(error){
					expect(error).toBeFalsy();
					expect(Object.keys(store.collections).length).toBeGreaterThan(0);
					expect(store.collection('test').findOne()).toBeTruthy();
					done();
				});
			});
		});

	});
});