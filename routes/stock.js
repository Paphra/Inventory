var express = require('express');
var async = require('async');
var {body, check, validationResult} = require('express-validator');
var url = require('url');

var Stock = require('../models/Stock');
var Category = require('../models/Category');
var Supplier = require('../models/Supplier');
var Brand = require('../models/Brand');
var Flow = require('../models/Flow');

var checkuser = require('../checkuser');

const load=(req, res, next, stock=null)=>{
  async.parallel({
    suppliers: callback => {
      Supplier.find({}, callback);
    },
    flows: callback => {
      Flow.find({}, callback);
    },
    categories: callback => {
      Category.find({}, callback);
    },
    brands: callback => {
      Brand.find({}, callback);
    },
    items: callback => {
      Stock.find({})
        .populate('category')
        .populate('brand')
        .populate('supplier')
        .exec(callback);
    }
  }, (err, results) => {
      if (err) return next(err);
      let attributes = {
        title: 'Stock Items | Inventory',
        items: results.items,
        suppliers: results.suppliers,
        flows: results.flows,
        categories: results.categories,
        brands: results.brands,
        user: req.session.user,
        return_item: stock,
        error: req.query.error,
        success: req.query.success,
        nav: 3
      }

      res.render(
        'stock/items',
        attributes
      );
  });

}

const redirect=(err, res)=>{
  let q = {}
  if (err) {
    q.error = err;
  } else {
    q.success = true;
  }
  res.redirect(url.format({
    pathname: '/stock',
    query: q
  }));
}

module.exports = (app = express())=>{
  
  // creating an item
  app.post('/stock', checkuser, [
    body('name', 'Item Name MUST not be empty').trim().isLength({ min: 3 }),
    body('brand', 'Item Brand MUST not be empty').trim().isLength({ min: 2 }),
    body('color', 'Item Color MUST not be empty').trim().isLength({ min: 3 }),
    body('quantity', 'Item Qunatity MUST not be empty').trim().isLength({ min: 1 }),
    body('category', 'Item Category MUST not be empty').trim().isLength({ min: 3 }),
    body('status', 'Item Status MUST not be empty').trim().isLength({ min: 3 }),
    body('unit_price', 'Item Unit Price MUST not be empty').trim().isLength({ min: 1 }),
    body('supplier', 'Item Supplier MUST not be empty').trim().isLength({ min: 3 }),
    body('description', 'Item Description MUST not be empty').trim().isLength({ min: 1 }),
    
    check('*').escape(),
    
    (req, res, next)=>{
      // get the errors
      let errors = validationResult(req);
      let size = {
        w: req.body.w,
        h: req.body.h,
        l: req.body.l
      }
      if(!errors.isEmpty()){
        req.body.size = size;
        req.body.errors = errors.array();
        load(req, res, next, req.body);
      }else{
        let stock = new Stock({
          name: req.body.name,
          brand: req.body.brand,
          color: req.body.color,
          size: size,
          serial: req.body.serial,
          quantity: req.body.quantity,
          description: req.body.description,
          category: req.body.category,
          status: req.body.status,
          unit_price: req.body.unit_price,
          supplier: req.body.supplier,
        });
        stock.save((err, theStock) => {
          redirect(err, res);
        })
      }
    }
  ]);

  // updating an item
  app.post('/stock/:id', checkuser, [
    body('name', 'Item Name MUST not be empty').trim().isLength({ min: 3 }),
    body('brand', 'Item Brand MUST not be empty').trim().isLength({ min: 2 }),
    body('color', 'Item Color MUST not be empty').trim().isLength({ min: 3 }),
    body('quantity', 'Item Qunatity MUST not be empty').trim().isLength({ min: 1 }),
    body('category', 'Item Category MUST not be empty').trim().isLength({ min: 3 }),
    body('status', 'Item Status MUST not be empty').trim().isLength({ min: 3 }),
    body('unit_price', 'Item Unit Price MUST not be empty').trim().isLength({ min: 1 }),
    body('supplier', 'Item Supplier MUST not be empty').trim().isLength({ min: 3 }),
    body('description', 'Item Description MUST not be empty').trim().isLength({ min: 1 }),

    check('*').escape(),

    (req, res, next) => {
      // get the errors
      let errors = validationResult(req);
      let size = {
        w: req.body.w,
        h: req.body.h,
        l: req.body.l
      };

      if (!errors.isEmpty()) {
        req.body.size = size;
        req.body.url = '/stock/' + req.params.id;
        req.body.errors = errors.array()
        load(req, res, next, req.body);
      }else{
        let stock = new Stock({
          name: req.body.name,
          brand: req.body.brand,
          color: req.body.color,
          size: size,
          serial: req.body.serial,
          quantity: req.body.quantity,
          description: req.body.description,
          category: req.body.category,
          status: req.body.status,
          unit_price: req.body.unit_price,
          supplier: req.body.supplier,
          _id: req.params.id
        });
        Stock.findByIdAndUpdate(
          req.params.id,
          stock,
          (err) => {
            redirect(err, res);
          });
      }
    }
  ]);
  // delete an item
  app.post('/stock/:id/delete', checkuser, (req, res, next)=>{
    Stock.findByIdAndRemove(req.body.stockid, (err)=>{
      redirect(err, res);
    })
  });
  
  // get all the items in the store
  app.get('/stock', checkuser, (req, res, next)=>{
    load(req, res, next);
  });
}
