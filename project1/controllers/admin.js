const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [] 
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors.array)
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: 'admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors : errors.array() 
    })
  }

  const product = new Product({
    title: title,
    price: price,
    description : description,
    imageUrl : imageUrl,
   //you can also write req.session.user and mongoose will know to grad the id 
    userId : req.session.user._id 
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
    //   return res.status(500).render('admin/edit-product', {
    //   pageTitle: 'Add Product',
    //   path: 'admin/add-product',
    //   editing: false,
    //   hasError: true,
    //   product: {
    //     title: title,
    //     imageUrl: imageUrl,
    //     price: price,
    //     description: description
    //   },
    //   errorMessage: 'Database operation failed, please try again',
    //   validationErrors : []
    // })

    // res.redirect('/500');
    const error = new Error(err);
    error.httpStatusCode = 500;
    //next with error passed lets express know error occurred and it will skip all other middleware and go into error middleware
    return next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors : []
      });
    })
    .catch(err => { 
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors.array)
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: 'admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id : prodId 
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array() 
    })
  }

  Product.findById(prodId).then(product => {
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle,
    product.price = updatedPrice,
    product.description = updatedDesc,
    product.imageUrl = updatedImageUrl  
    return product.save()
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    }) 
  })
    .catch(err => { 
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
//select allows you to say which fields you want returned, the - says exculde this 
  //.select('title price -_id')
//can use populate to get more info and not just id
  //.populate('userId')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => { 
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });;
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //findByIdAndRemove mongoose built in method
  // Product.findByIdAndDelete(prodId)
  Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => { 
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
