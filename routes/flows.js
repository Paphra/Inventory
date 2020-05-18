var express = require('express');
var async = require('async');
var url = require('url');
var {body, check, validationResult} = require('express-validator');
var deepclone = require('lodash/cloneDeep')

var Flow = require('../models/Flow');
var Stock = require('../models/Stock');
var checkuser = require('../checkuser');
var Branch = require('../models/Branch');
var Brand = require('../models/Brand');
var Category = require('../models/Category');
var Quantity = require( '../models/Quantity' )

const load =(req, res, next, flow=null)=>{
  let user = req.session.user;
  let filter = {};
  let {branch, from, to} = req.query
  if(branch === undefined){
    filter.branch = user.branch._id;
  }else{
    if(branch != 'all'){
      filter.branch = branch;
    }
  }

  let date = new Date();   
  if (from === undefined){
    let l_month = (date.getMonth()).toString().padStart(2, '0');
    let l_day = (date.getDate()).toString().padStart(2, '0');
    from = date.getFullYear() + '-' + l_month + '-' + l_day;
  }
  if(to === undefined ){
    let c_month = (date.getMonth()+1).toString().padStart(2, '0');
    let c_day = (date.getDate()).toString().padStart(2, '0');
    to = date.getFullYear() + '-' + c_month + '-' + c_day;
  }
  
  filter.entry_date = {
    $gte: new Date(new Date(from).setHours(00, 00, 00)),
    $lt: new Date(new Date(to).setHours(23, 59, 59))
  };

  let b_filter = {};
  let w_filter = deepclone(filter);
  w_filter.status = 'Active';
   
  if (user.admin == false){
      b_filter = {'name': user.branch.name};
  }else{
    delete w_filter.branch;
  }
  async.parallel({
    branches: callback=>{
      Branch.find(b_filter)
        .exec(callback);
    },
    flows: callback => {
      Flow.find(filter)
        .sort('-entry_date')
        .populate('item')
        .populate('branch')
        .populate('entered_by')
        .exec(callback);
    },
    brands: callback => { Brand.find({}, callback); },
    categories: callback => { Category.find({}, callback); },
    items: callback => {
      Stock.find({})
        .populate('category')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    
    res.render(
      'stock/flows',
      {
        title: 'Stock Flows | Inventory',
        flows: results.flows,
        returned: flow,
        success: req.query.success,
        error: req.query.error,
        workers: results.workers,
        branches: results.branches,
        categories: results.categories,
        brands: results.brands,
        items: results.items,
        user: req.session.user,
        from: from,
        to: to,
        branch: branch,
        nav: 2,
        atflows: true,
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

  // importing 
  app.post('/flows/import', checkuser, [
    body('data', 'Data Must Not Be Empty').trim().isLength({min:10}),
    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        req.body.isImport = true;
        load(req, res, next, req.body);
      }else{
        let db_fields = [
          'item', 'action', 'qunatity', 'details', 'quality', 
          'amount', 'branch', 'entered_by', 'handled_by',
          'entry_date'
        ]
        let raw_data = req.body.data;
        let rows_str = raw_data.split('\r\n')
        let headers_str = rows_str[0];
        let data_str = rows_str.slice(1);
        let headers = headers_str.split(',');
        let data = [];
        for(data_row of data_str){
          var row_items = data_row.split(',');
          let row = {};
          for(let i=0; i<headers.length; i++){
            row[headers[i]] = row_items[i];
          }
          data.push(row);
        }
        
        async.parallel({
          branch: callback=>{
            Branch.findOne({'name': ''}, callback);
          },
          item: callback => {
            Stock.findOne({'name': ''}, callback);
          },
        }, (err, results) => {
          console.log(data);

        });
      }
    }
  ]);

  // create a new flow
  app.post('/flows', checkuser, [
    body('item', 'Item Must not Be Empty').trim().isLength({ min: 1 }),
    body('handled_by', 'Taken/Returned By Must not Be Empty').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not Be Empty').trim().isLength({ min: 1 }),
    body('quantity', 'Quantity Must not Be Empty').trim().isLength({ min: 1 }),
    body( 'entry_date', 'Entry Date Must not Be Empty' ).trim().isLength( { min: 1 } ),
    
    check('*').escape(),
    check('entry_date').toDate(),

    (req, res, next)=>{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        req.body.errors = errors.array();
        load(req, res, next, req.body);
      }else{
        let flow = new Flow(req.body);
        flow.save((err, saved)=>{
          if(err) return next(err);
          Quantity.findOne( {
            'item': saved.item,
            'branch': saved.branch
          }, ( err, qtty ) => {
              if ( err ) return next( err )
              
              if ( qtty ) {
                if (saved.action === 'Purchased' || saved.action === 'Return In'|| saved.action === 'Received'
                  || saved.action === 'Transfered In') {
                  qtty.value += saved.quantity;
                }else{
                  qtty.value -= saved.quantity;
                }
                qtty.updateOne(qtty, (err)=>{
                  redirect(err, res);
                });
              } else {
                qtty = new Quantity( {
                  item: saved.item,
                  branch: saved.branch,
                  value: saved.quantity
                } )
                qtty.save( ( err ) => {
                  redirect( err, res )
                })
              }
          } )
        });
      }
    }
  ]);

  // update a flow
  app.post('/flows/:id', checkuser, [
    body('item', 'Item Must not Be Empty').trim().isLength({ min: 1 }),
    body('handled_by', 'Taken/Returned By Must not Be Empty').trim().isLength({ min: 1 }),
    body('branch', 'Branch Must not Be Empty').trim().isLength({ min: 1 }),
    body('quantity', 'Quantity Must not Be Empty').trim().isLength({ min: 1 }),
    body( 'entry_date', 'Entry Date Must not Be Empty' ).trim().isLength( { min: 1 } ),
    
    check('*').escape(),
    check('entry_date').toDate(),

    (req, res, next) => {
      req.body._id = req.params.id;
      Flow.findById(req.params.id)
        .exec((err, flow) => {
          if (err) return next(err);
          let errors = validationResult(req);
          if (!errors.isEmpty()) {
            req.body.errors = errors.array();
            req.body.url = flow.url;
            load(req, res, next, req.body);
          } else {
            let flowUpdate = new Flow(req.body);
            let excess = flowUpdate.quantity - flow.quantity;
            Quantity.findOne( {
                'item': flow.item,
                'branch': flow.branch
              }, ( err, qtty ) => {
                if ( err ) return next( err )
                if ( qtty ) {
                  if ( flowUpdate.action === 'Purchased' || flowUpdate.action === 'Return In'
                    || flowUpdate.action === 'Received' || flowUpdate.action === 'Transfered In') {
                    qtty.value += excess;  
                  } else {
                    qtty.value -= excess
                  }
                }
                flow.updateOne( flowUpdate, ( err ) => {
                  if ( err ) return next( err )
                    if ( qtty ) {
                      qtty.updateOne(qtty, (err)=>{
                        redirect(err, res);
                      });
                    } else {
                      let qtty = new Quantity( {
                        item: flowUpdate.item,
                        branch: flowUpdate.branch,
                        value: (- flowUpdate.quantity)
                      } )
                      qtty.save( ( err ) => {
                        redirect(err, res)
                      })
                    }  
                  })    
              } )
          }
      });
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
