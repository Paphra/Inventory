var express = require('express');
var {body, check, validationResult} = require('express-validator');
var async = require('async');
var sha1 = require('sha1');
var checkuser = require('../checkuser');
var url = require('url');

var Branch = require('../models/Branch');
var Worker = require('../models/Worker');
var Supplier = require('../models/Supplier');
var Flow = require('../models/Flow');
var Stock = require('../models/Stock');

const load_suppliers =(req, res, next, supplier=null)=>{
  async.parallel({
    items: callback => {
      Stock.find({}, callback);
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
        returned: supplier,
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
        returned: branch,
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
    flows: callback => {
      Flow.find({}, callback);
    },
    branches: callback => {
      Branch.find({}, callback);
    },
    workers: callback => {
      Worker.find({})
        .populate('branch')
        .exec(callback);
    }
  }, (err, results) => {
    if (err) return next(err);
    for (let index = 0; index < results.workers.length; index++) {
      if (results.workers[index].user){
        results.workers[index].password = sha1(results.workers[index].password);
      }
    }
    res.render(
      'operations/workers',
      {
        title: 'Workers | Inventory',
        workers: results.workers,
        branches: results.branches,
        flows: results.flows,
        returned: worker,
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
              let isUser = parseInt(req.body.is_user, 0);

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
                worker.admin = parseInt(req.body.is_admin, 0);
              }else{
                worker.username = '';
                worker.password = '';
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
        let isUser = parseInt(req.body.is_user, 0);
        
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
          let pass = req.body.password;
          let old_sha = req.body.old_sha;

          if(old_sha != pass){
            worker.password = sha1(pass);
          }
          
          worker.username = req.body.username;
          worker.admin = parseInt(req.body.is_admin, 0)
        } else {
          worker.password = '';
          worker.username = '';
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