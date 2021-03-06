const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id){
    this.name = username;
    this.email = email;
    this.cart = cart;// {items: []}
    this._id = id ? new ObjectId(id) : null; 
  }


  save(){
    const db = getDb();
    return db.collection('users')
    .insertOne(this)
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    }); 
  }

  addToCart(product){
   const cartProductIndex = this.cart.items.findIndex(cp => {
     return cp.productId.toString() === product._id.toString();
   });
   let newQuantity = 1;

   const updatedCartItems = [...this.cart.items];

   if(cartProductIndex >= 0){
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
   }else{
     updatedCartItems.push({ 
       productId: new ObjectId(product._id),
       quantity: newQuantity
      });
   }

   const updatedCart = {
     items : updatedCartItems
    };
   const db = getDb();
   return db
    .collection('users')
    .updateOne(
      {_id: new ObjectId(this._id)}, 
      {$set: {cart : updatedCart} 
      }); 
  }

  deleteItemFromCart(productId){
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
    .collection('users')
    .updateOne(
      {_id : new ObjectId(this._id)},
      {$set : {cart : {items : updatedCartItems} } }
      );
  }

  addOrder(){
    const db = getDb();
    return this.getCart()
    .then(products => { 
      const order = {
        items : products,
        user : {
        _id : new ObjectId(this._id),
        name: this.name
      } 
    };
    return db
    .collection('orders')
    .insertOne(order)
  })
    .then(result => {
      this.cart = {items: []};
      return db 
        .collection('users')
        .updateOne(
        { _id : new ObjectId(this._id) },
        { $set : { cart: { items: [] } } }
        );
    });
  }

  getOrders(){
    const db = getDb();
    return db
      .collection('orders')
      .find({'user._id' : new ObjectId(this._id)})
      .toArray();
  }

  getCart() {
   const db = getDb();
   const productIds = this.cart.items.map(item => {
     return item.productId;
   });
   return db
    .collection('products')
    .find({_id : {$in : productIds}})
    .toArray()
    .then(products => {
      return products.map(p => {
        return {
          ...p, 
          quantity: this.cart.items.find(item => {
          return item.productId.toString() === p._id.toString();
        }).quantity
      };
      });
    });
  
  }

  static findById(userId){
    const db = getDb();
    return db.collection('users')
    //can use .find().next() instead of this if not sure if just one will return
    .findOne({_id : new ObjectId(userId)})
    .then(user => 
      {
      console.log(user);
      return user;
    })
    .catch(err => {
      console.log(err);
    });
  }
}

module.exports = User;
