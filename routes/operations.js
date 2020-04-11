var express = require('express');
var {body, check, validationResult} = require('express-validator');
var async = require('async');
var sha1 = require('sha1');
var checkuser = require('../checkuser');
var url = require('url');

var Branch = require('../models/Branch');
var Worker = require('../models/Worker');
var Supplier = require('../models/Supplier');
var Role = require('../models/Role');
var Position = require('../models/Position');
var Flow = require('../models/Flow');

const load_suppliers =(req, res, next, supplier=null)=>{
  async.parallel({
    items: callback => {
      Flow.find({}, callback);
    },
    suppliers: callback => {
      Supplier.find({}, callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'operations/suppliers',
      {
        title: 'Stock Suppliers | Inventory',
        suppliers: results.suppliers,
        items: results.items,
        return_item: supplier,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 5,
        navS: 3
      }
    );
  })
}

const load_branches =(req, res, next, branch=null)=>{
  async.parallel({
    workers: callback => {
      Worker.find({}, 'branch', callback);
    },
    flows: callback => {
      Flow.find({}, 'branch', callback);
    },
    branches: callback => {
      Branch.find({}, callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'operations/branches',
      {
        title: 'Branches | Inventory',
        branches: results.branches,
        workers: results.workers,
        flows: results.flows,
        return_item: branch,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 5,
        navS: 1
      }
    );
  });
}

const load_workers =(req, res, next, worker=null)=>{
  async.parallel({
    roles: callback => {
      Role.find({}, callback);
    },
    flows: callback => {
      Flow.find({}, callback);
    },
    positions: callback => {
      Position.find({}, callback);
    },
    branches: callback => {
      Branch.find({}, callback);
    },
    workers: callback => {
      Worker.find({})
        .populate('branch')
        .populate('role')
        .populate('position')
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'operations/workers',
      {
        title: 'Workers | Inventory',
        workers: results.workers,
        branches: results.branches,
        positions: results.positions,
        roles: results.roles,
        flows: results.flows,
        return_item: worker,
        success: req.query.success,
        error: req.query.error,
        user: req.session.user,
        nav: 5,
        navS: 2
      }
    );
  })
}

const redirect = (err, res, path)=>{
  let q ={};
  if(err){
    q.error = err;
  }else{
    q.success = true;
  }
  res.redirect(url.format({
    pathname: path,
    query: q
  }));
}

module.exports = (app=express())=>{

  /**
   * BRANCHES
   */
  // create branch
  app.post('/branches', checkuser, [
    body('name', 'Branch Name  Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Branch Email  Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Branch Phone  Must not be empty.').trim().isLength({ min: 1 }),
    body('address', 'Branch Address  Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next)=>{
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load_branches(req, res, next, req.body);
      }
      let branch = new Branch({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      })
      branch.save((err, theBranch)=>{
        redirect(err, res, '/branches');
      });
    }
  ]);
  // delete branch
  app.post('/branches/:id/delete', checkuser, (req, res)=>{
    Branch.findByIdAndRemove(req.body.branchid, (err)=>{
      redirect(err, res, '/branches');
    });
  });

  // update brnach
  app.post('/branches/:id', checkuser, [
    body('name', 'Branch Name  Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Branch Email  Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Branch Phone  Must not be empty.').trim().isLength({ min: 1 }),
    body('address', 'Branch Address  Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/branches/' + req.params.id;
        load_branches(req, res, next, req.body);
      }
      let branch = new Branch({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        _id: req.params.id
      });
      Branch.findByIdAndUpdate(
        req.params.id,
        branch,
        (err)=>{
          redirect(err, res, '/branches');
        }
      );
    }
  ]);
   
  // get all branches
  app.get('/branches', checkuser, (req, res, next)=>{
    load_branches(req, res, next);
  });
  /**
   * END BRANCHES
   */

  /**
   * WORKERS
   */
  // create worker
  app.post('/workers', checkuser, [
    body('first_name', 'First Name Must not be empty.').trim().isLength({ min: 1 }),
    body('last_name', 'Last Name Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Email Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Phone Must not be empty.').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not be empty.').trim().isLength({ min: 1 }),
    body('position', 'Position Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        load_workers(req, res, next, req.body);
      }else{
        // cehc if worker exists with username or email
        Worker.findOne({ 'email': req.body.email })
          .exec((err, found) => {
            if (err || found){
              redirect(err, res, '/workers');
            }else{
              // no worker found
              let isUser = false;
              if (req.body.user_val == 1 || req.body.user_val === '1') {
                isUser = true;
              }
              let worker = new Worker({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                branch: req.body.branch,
                position: req.body.position,
                user: isUser,
                status: req.body.status
              });
              if (worker.user) {
                worker.username = req.body.username;
                worker.password = req.body.password ? sha1(req.body.password) : '';
                worker.role = req.body.role;
              }
              // save the worker
              worker.save((err) => {
                redirect(err, res, '/workers');
              });
            }
          });
      }
      
    }
  ]);
  // delete worker
  app.post('/workers/:id/delete', checkuser, (req, res)=>{
    Worker.findByIdAndRemove(req.body.workerid, (err)=>{
      redirect(err, res, '/workers');
    });
  });
  // update worker
  app.post('/workers/:id', checkuser, [
    body('first_name', 'First Name Must not be empty.').trim().isLength({ min: 1 }),
    body('last_name', 'Last Name Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Email Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Phone Must not be empty.').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not be empty.').trim().isLength({ min: 1 }),
    body('position', 'Position Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/workers/' + req.params.id;
        load_workers(req, res, next, req.body);
      }else{
        // no worker found
        let isUser = false;
        if (req.body.user_val == 1 || req.body.user_val === '1') {
          isUser = true;
        }
        let worker = new Worker({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone: req.body.phone,
          branch: req.body.branch,
          position: req.body.position,
          status: req.body.status,
          user: isUser,
          _id: req.params.id
        });
        if (worker.user) {
          if (sha1(req.body.password) !== req.body.confirm_password) {
            worker.password = sha1(req.body.password);
          }else{
            worker.password = req.body.password;
          }
          worker.username = req.body.username;
          worker.role = req.body.role;
        } else {
          worker.password = '';
          worker.username = '';
          worker.role = '';
        }
        Worker.findByIdAndUpdate(
          req.params.id,
          worker,
          (err) => {
            redirect(err, res, '/workers');
          }
        );
      }
    }
  ]);

  // get all the workers in the system
  app.get('/workers', checkuser, (req, res, next) => {
    load_workers(req, res, next);
  });
  /**
   * END WORKERS
   */

  /**
   * SUPPLIERS
   */
  // create supplier
  app.post('/suppliers', checkuser, [
    body('name', 'Supplier Name  Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Supplier Email  Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Supplier Phone  Must not be empty.').trim().isLength({ min: 1 }),
    body('address', 'Supplier Address  Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load_suppliers(req, res, next, req.body);
      }
      let supplier = new Supplier({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      })
      supplier.save((err) => {
        redirect(err, res, '/suppliers');
      });
    }
  ]);
  // delete supplier
  app.post('/suppliers/:id/delete', checkuser, (req, res) => {
    Supplier.findByIdAndRemove(req.body.supplierid, (err) => {
      redirect(err, res, '/suppliers');
    });
  });
  // update supplier
  app.post('/suppliers/:id', checkuser, [
    body('name', 'Supplier Name  Must not be empty.').trim().isLength({ min: 1 }),
    body('email', 'Supplier Email  Must not be empty.').trim().isLength({ min: 1 }),
    body('phone', 'Supplier Phone  Must not be empty.').trim().isLength({ min: 1 }),
    body('address', 'Supplier Address  Must not be empty.').trim().isLength({ min: 1 }),
    check('*').escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        req.body.url = '/suppliers/' + req.params.id;
        load_suppliers(req, res, next, req.body);
      }
      let supplier = new Supplier({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        _id: req.params.id
      });
      Supplier.findByIdAndUpdate(
        req.params.id,
        supplier,
        (err) => {
          redirect(err, res, '/suppliers');
        }
      );
    }
  ]);
  // get all suppliers
  app.get('/suppliers', checkuser, (req, res, next)=>{
    load_suppliers(req, res, next);
  });
  /**
   * END SUPPLIERS
   */

  // get all operations
  app.get('/operations', checkuser, (req, res, next)=>{
    res.render(
      'operations/index',
      {
        title: 'Business Operations',
        user: req.session.user,
        nav: 5,
        navS: 0
      }
    );
  });
}