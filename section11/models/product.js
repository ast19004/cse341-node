const mongodb = require('mongoDb');
const getDb = require('../util/database').getDb;

class Product{
  constructor(title, price, description, imageUrl, id, userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save(){

    const db = getDb();
    let dbOp;
    if(this._id){
      //Update the product
      dbOp = db
        .collection('products')
        .updateOne({_id : this._id}, {$set : this});
    }else{
      //Insert the product
      dbOp = db
        .collection('products')
        .insertOne(this);
    }
    return  dbOp
      .then(result => {
      console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
    }

  static fetchAll(){
    const db = getDb();
    return db.collection('products')
    //find kind of works like a buffer getting one document at a time.
    .find()
    //toArray makes toFind return all documents as an array instead of bits at a time
    //don't use on large scale amounts of documents
    //in that case pagination is better
    .toArray()
    .then(products => {
      console.log(products);
      return products;
    })
    .catch(err => {
      console.log(err);
    });
  }

  static findById(prodId){
    const db = getDb();
    return db.collection('products')
    .find({_id : new mongodb.ObjectId(prodId)})
    //find still a cursor even though just 1 document so you need next 
    .next()
    .then(product => {
      console.log(product);
      return product;
    })
    .catch(err => {
      console.log(err);
    });
  }
  static deleteById(prodId){
    const db = getDb();
    return db.collection('products')
      .deleteOne({_id : new mongodb.ObjectId(prodId)})
      .then(result => {
        console.log("Deleted");
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = Product;
