var express = require('express');
var async = require('async');
var { body, check, validationResult} = require('express-validator');
var url = require('url');

var Category = require('../models/Category');
var Stock = require('../models/Stock');
var Worker = require('../models/Worker');
var Brand = require('../models/Brand');

var checkuser = require('../checkuser');

const load_categories =(req, res, next, category=null)=>{
  async.parallel({
    items: (callback) => {
      Stock.find({}, 'category')
        .exec(callback);
    },
    categories: (callback) => {
      Category.find({})
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'settings/categories',
      {
        title: 'Categories | Inventory',
        categories: results.categories,
        items: results.items,
        returned: category,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 6,
        navS: 1
      }
    );
  })

}

const load_brands = (req, res, next, brand = null) => {
  async.parallel({
    items: (callback) => {
      Stock.find({}, 'brand')
        .exec(callback);
    },
    brands: (callback) => {
      Brand.find({})
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'settings/brands',
      {
        title: 'Brands | Inventory',
        items: results.items,
        brands: results.brands,
        returned: brand,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 6,
        navS: 2
      }
    );
  })
}

const redirect =(err, res, path)=>{
  let q = {}
  if (err) {
    q.error = err;
  } else {
    q.success = true;
  }
  res.redirect(url.format({
    pathname: path,
    query: q
  }));
}

module.exports = (app = express())=>{
  /* all routes should have the settings */

  /**
   * CATEGORIES
   */
  // create a new Category
  app.post('/categories', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({min: 1}),
    check('*').escape(),
    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        load_categories(req, res, next, req.body);
      }else{
        let category = new Category({
          name: req.body.name,
          description: req.body.description
        });
        category.save((err) => {
          redirect(err, res, '/categories');
        });
      }
      
    }
  ]);

  // update a category
  app.post('/categories/:id', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        req.body.url = '/categories/' + req.params.id;
        load_categories(req, res, next, req.body);
      }else{
        let category = new Category({
          name: req.body.name,
          description: req.body.description,
          _id: req.params.id
        });
        Category.findByIdAndUpdate(
          req.params.id,
          category,
          (err, theCategory) => {
            redirect(err, res, '/categories');
          }
        );
      }
    }
  ]);
  
  // delete a category
  app.post('/categories/:id/delete', checkuser, (req, res, next)=>{
    Category.findByIdAndRemove(req.body.categoryid, (err)=>{
      redirect(err, res, '/categories');
    });
  });
  
  // categories get list
  app.get('/categories', checkuser, (req, res, next) => {
    load_categories(req, res, next);
  });

  /**
   * END CATEGORIES
   */


  /**
   * BRANDS
   */
  // create a new Brand
  app.post('/brands', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load_brands(req, res, next, req.body);
      }else{
        let brand = new Brand({
          name: req.body.name,
          description: req.body.description
        });
        brand.save((err) => {
          redirect(err, res, '/brands');
        });
      }
    }
  ]);

  // update a brand
  app.post('/brands/:id', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/brands/' + req.params.id;
        load_brands(req, res, next, req.body);
      }else{
        let brand = new Brand({
          name: req.body.name,
          description: req.body.description,
          _id: req.params.id
        });
        Brand.findByIdAndUpdate(
          req.params.id,
          brand,
          (err, theBrand) => {
            redirect(err, res, '/brands');
          }
        )
      }
    }
  ]);

  // delete a brand
  app.post('/brands/:id/delete', checkuser, (req, res, next) => {
    Brand.findByIdAndRemove(req.body.brandid, (err) => {
      redirect(err, res, '/brands');
    })
  });

  // brands get list
  app.get('/brands', checkuser, (req, res, next) => {
    load_brands(req, res, next);
  });

  /**
  * END BRANDS
  */
  
  // get all settings list
  app.get('/settings', checkuser, (req, res, next)=>{
    res.render(
      'settings/index',
      {
        title: 'Settings',
        user: req.session.user,
        nav: 6
      }
    );
  });
}