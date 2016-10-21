/**
 * Testing for the NursePad mobile application
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
				expect(Pocket.new().version).toBeDefined();
				expect(Pocket.new().collections).toBeDefined();
			})
		});

		describe('collections', function(){
			var store = Pocket.new();

			it('should create collection', function(){
				store.collection('test');
				expect(store.collections.test).toBeDefined()
			});

			it('should remove collection', function(){
				expect(store.removeCollection('test').collections.test).not.toBeDefined()
			});
		});

		describe('documents', function(){
			var store = Pocket.new();
			var collection = store.collection('test');

			it('should create documents', function(){
				collection.insert({ id:0 });
				collection.insert({ id: 1 });
				expect(collection.documents.length).toEqual(2);
			});

			it('should remove all documents', function(){
				collection.remove();
				expect(collection.length).toEqual(0);
			});

			var document;

			it('should create _id', function(){
				document = collection.insert({});
				expect(document._id).toBeDefined();
				expect(typeof document._id).toEqual('string');
			});

			it('should not override _id', function(){
				document = collection.insert({ _id: 1 });
				expect(document._id).toBeDefined();
				expect(document._id).toEqual(1);
			});

			it('should preserve data', function(){
				document = collection.insert({ name: 'Foo', surname: 'Bar' });
				expect(document.name).toEqual('Foo');
				expect(document.surname).toEqual('Bar');
			});

			it('should partially update shallow keys', function(){
				document = collection.insert({ name: 'Foo', surname: 'Bar' });
				expect(document.name).toEqual('Foo');
				expect(document.surname).toEqual('Bar');

				document = collection.update(document._id, { surname: 'Baz' }).findOne(document._id);
				expect(document.surname).toEqual('Baz');

				document = collection.update(document._id, { age: 18 }).findOne(document._id);
				expect(document.age).toBeDefined();
				expect(document.age).toEqual(18);
			});

			it('should partially update deep keys', function(){
				document = collection.insert({ profile:{ name: 'Foo', surname: 'Bar', account: { active: false, username:'user1' } }});
				expect(document.profile.surname).toEqual('Bar');

				document = collection.update(document._id, { profile: { surname:'Baz' }}).findOne(document._id);
				expect(document.profile.surname).toEqual('Baz');

				document = collection.update(document._id, { profile:{ account:{ username:'user2' } }}).findOne(document._id);
				expect(document.profile.account.username).toEqual('user2');
				expect(document.profile.account.active).toEqual(false);

				document = collection.update(document._id, { profile:{ account:{ active:true } }}).findOne(document._id);
				expect(document.profile.account.active).toEqual(true);

				document = collection.update(document._id, { profile:{ account:[{ username:'user1', active:true }] }}).findOne(document._id);
				expect(document.profile.account.length).toEqual(1);
				expect(document.profile.account[0].username).toEqual('user1');
				expect(document.profile.account[0].active).toEqual(true);
			});
		});

		describe('queries', function(){
			var store = Pocket.new();
			var collection = store.collection('test');

			collection.insert({ name: 'Person 1', age: 15, male: false });
			collection.insert({ name: 'Person 2', age: 18, male: true });
			collection.insert({ name: 'Person 3', age: 21, male: true });
			collection.insert({ name: 'Person 4', age: 12, male: false, special: true });
			collection.insert({ name: 'Person 5', age: 15, male: false });
			collection.insert({ name: 'Person 6', age: 34, male: false });

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

		});


	});
});
