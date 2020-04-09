var express = require('express');
var async = require('async');
var url = require('url');
var {body, check, validationResult} = require('express-validator');

var Flow = require('../models/Flow');
var Stock = require('../models/Stock');
var checkuser = require('../checkuser');
var Worker = require('../models/Worker');
var Branch = require('../models/Branch');
var Brand = require('../models/Brand');
var Category = require('../models/Category');
var Supplier = require('../models/Supplier');

const load =(req, res, next, flow=null)=>{
  let user = req.session.user;
  let branch_filter = {};
  if (user.role.name.toLowerCase().includes('admin') ||
    user.username.toLowerCase().includes('admin') ||
    user.position.name.toLowerCase().includes('admin')) {
    branch_filter = {
      'branch': user.branch._id
    }
  }
  async.parallel({
    workers: callback=>{
      Worker.find(branch_filter)
        .populate('branch')
        .populate('position')
        .populate('role')
        .exec(callback);
    },
    branches: callback=>{
      Branch.find({'name': user.branch.name})
        .exec(callback);
    },
    flows: callback => {
      Flow.find(branch_filter)
        .populate('item')
        .populate('branch')
        .populate('handled_by')
        .populate('entered_by')
        .exec(callback);
    },
    brands: callback => { Brand.find({}, callback); },
    suppliers: callback => { Supplier.find({}, callback); },
    categories: callback => { Category.find({}, callback); },
    items: callback => {
      Stock.find({'status': 'Available'})
        .populate('category')
        .populate('supplier')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'stock/flows',
      {
        title: 'Stock Flows | Inventory',
        flows: results.flows,
        return_item: flow,
        success: req.query.success,
        error: req.query.error,
        workers: results.workers,
        branches: results.branches,
        categories: results.categories,
        suppliers: results.suppliers,
        brands: results.brands,
        items: results.items,
        user: req.session.user,
        nav: 2
      }
    );
  });
}

const redirect =(err, res)=>{
  let q = {}
  if (err) {
    q.error = err;
  } else {
    q.success = true;
  }
  res.redirect(url.format({
    pathname: '/flows',
    query: q
  }));
}

module.exports = (app = express())=>{

  // create a new flow
  app.post('/flows', checkuser, [
    body('item', 'Item Must not Be Empty').trim().isLength({ min: 1 }),
    body('handled_by', 'Handler Must not Be Empty').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not Be Empty').trim().isLength({ min: 1 }),
    body('quantity', 'Quantity Must not Be Empty').trim().isLength({ min: 1 }),
    body('action', 'Action Must not Be Empty').trim().isLength({ min: 1 }),
    body('quality', 'quality Must not Be Empty').trim().isLength({ min: 1 }),
    body('entry_date', 'Entry Date Must not Be Empty').trim().isLength({ min: 1 }),
    body('details', 'Details Must not Be Empty').trim().isLength({ min: 1 }),

    check('*').escape(),
    check('entry_date').toDate(),

    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        load(req, res, next, req.body);
      }else{
        let flow = new Flow(req.body);
        flow.save((err, flw)=>{
          if(err) return next(err);
          Stock.findById(flw.item)
            .exec((err2, item)=>{
              if(err2) return next(err2);
              if (flw.action === 'Purchased' || flw.action === 'Return In') {
                item.quantity += flw.quantity;
              }else if(flw.action!=='Used'){
                item.quantity -= flw.quantity;
              }
              item.updateOne(item, (err3)=>{
                redirect(err3, res);
              });    
            });
          
        });
      }
    }
  ]);

  // update a flow
  app.post('/flows/:id', checkuser, [
    body('item', 'Item Must not Be Empty').trim().isLength({ min: 1 }),
    body('handled_by', 'Handler Must not Be Empty').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not Be Empty').trim().isLength({ min: 1 }),
    body('quantity', 'Quantity Must not Be Empty').trim().isLength({ min: 1 }),
    body('action', 'Action Must not Be Empty').trim().isLength({ min: 1 }),
    body('quality', 'quality Must not Be Empty').trim().isLength({ min: 1 }),
    body('entry_date', 'Entry Date Must not Be Empty').trim().isLength({ min: 1 }),
    body('details', 'Details Must not Be Empty').trim().isLength({ min: 1 }),

    check('*').escape(),
    check('entry_date').toDate(),

    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.body.errors = errors.array();
        load(req, res, next, req.body);
      } else {
        req.body._id = req.params.id;
        let flow = new Flow(req.body);
        Flow.findById(req.params.id)
          .exec((err, fw) => {
            if (err) return next(err);
            let sub = false;
            let excess = flow.quantity - fw.quantity;
            Stock.findById(flow.item)
              .exec((err, item)=>{
                if (flow.action === 'Purchased' || flow.action === 'Return In') {
                  item.quantity += excess;
                } else if (flow.action !== 'Used') {
                  item.quantity -= excess;
                }
                item.updateOne(item, (err3)=>{
                  if(err3) return next(err3);
                  fw.updateOne(flow, (err2) => {
                    redirect(err2, res);
                  });
                });
              });
          });
      }
    }
  ]);

  // delete a flow
  app.post('/flows/:id/delete', checkuser, (req, res, next)=>{
    Flow.findByIdAndRemove(req.body.flowid, (err)=>{
      redirect(err, res);
    })
  });

  // list all the stock instances
  app.get('/flows', checkuser, (req, res, next)=>{
    load(req, res, next);
  });
} 