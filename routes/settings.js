var express = require('express');
var async = require('async');
var { body, check, validationResult} = require('express-validator');
var url = require('url');

var Category = require('../models/Category');
var Role = require('../models/Role');
var Position = require('../models/Position');
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
        return_item: category,
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
        return_item: brand,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 6,
        navS: 2
      }
    );
  })
}

const load_roles = (req, res, next, role = null) => {
  async.parallel({
    workers: (callback) => {
      Worker.find({}, 'role')
        .exec(callback);
    },
    roles: (callback) => {
      Role.find({})
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'settings/roles',
      {
        title: 'Roles | Inventory',
        roles: results.roles,
        workers: results.workers,
        return_item: role,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 6,
        navS: 3
      }
    );
  });
}

const load_positions = (req, res, next, position = null) => {
  async.parallel({
    workers: (callback) => {
      Worker.find({}, 'position')
        .exec(callback);
    },
    positions: (callback) => {
      Position.find({})
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'settings/positions',
      {
        title: 'Positionss | Inventory',
        positions: results.positions,
        workers: results.workers,
        return_item: position,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 6,
        navS: 4
      }
    );
  });
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
    body('name', 'Name Field Must not be Empty.').trim().isLength({min: 3}),
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
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
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
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
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

  /**
   * ROLES
   */
  // create a new role
  app.post('/roles', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load_roles(req, res, nect, req.body);
      }else{
        let role = new Role({
          name: req.body.name,
          description: req.body.description
        });
        role.save((err) => {
          redirect(err, res, '/roles');
        });
      }
  
    }
  ]);

  // update a role
  app.post('/roles/:id', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/roles/'+ req.params.id;
        load_roles(req, res, next, req.body);
      }else{
        let role = new Role({
          name: req.body.name,
          description: req.body.description,
          _id: req.params.id
        });
        Role.findByIdAndUpdate(
          req.params.id,
          role,
          (err, theRole) => {
            redirect(err, res, '/roles');
          });
      }
      
    }
  ]);

  // delete a role
  app.post('/roles/:id/delete', checkuser, (req, res, next) => {
    Role.findByIdAndRemove(req.body.roleid, (err) => {
      redirect(err, res, '/roles');
    })
  });

  // roles get list
  app.get('/roles', checkuser, (req, res, next) => {
    load_roles(req, res, next);
  });
  /**
   * END ROLES
   */
  
  /**
   * POSITIONS
   */
  // create a new position
  app.post('/positions', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load_positions(req, res, next, req.body);
      }else{
        let position = new Position({
          name: req.body.name,
          description: req.body.description
        });
        position.save((err) => {
          redirect(err, res, '/positions');
        });
      }
    }
  ]);

  // update a position
  app.post('/positions/:id', checkuser, [
    body('name', 'Name Field Must not be Empty.').trim().isLength({ min: 3 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/positions/'+ req.params.id;
        load_positions(req, res, next, req.body);
      } else {
        let position = new Position({
          name: req.body.name,
          description: req.body.description,
          _id: req.params.id
        });
        Position.findByIdAndUpdate(
          req.params.id,
          position,
          (err, thePosition) => {
            redirect(err, res, '/positions');
          });
      }
    }
  ]);

  // delete a position
  app.post('/positions/:id/delete', checkuser, (req, res, next) => {
    Position.findByIdAndRemove(req.body.positionid, (err) => {
      redirect(err, res, '/positions');
    });
  });

  // positions get list
  app.get('/positions', checkuser, (req, res, next) => {
    load_positions(req, res, next);
  });
  
  /**
   * END POSITIONS
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