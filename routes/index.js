var express = require('express');
var async = require('async');

var checkuser = require('../checkuser');
var Flow = require('../models/Flow');
var Stock = require('../models/Stock');

module.exports = (app=express())=>{
  // help information
  app.get('/help', checkuser, (req, res, next) => {
    res.render(
      'help',
      {
        title: 'Help Information | Inventory',
        user: req.session.user,
        nav: 4
      }
    )
  });

  // index page
  app.get('/', checkuser, (req, res, next)=>{
    let user = req.session.user;
    let branch_filter = {};
    if (user.role.name.toLowerCase() != 'admin' ||
        user.position.name.toLowerCase() != 'admin'){
        branch_filter = {
          'branch': user.branch._id
        }
      }
    async.parallel({
      flows: callback=>{
        Flow.find(branch_filter)
          .sort('-entry_date')
          .populate('branch')
          .populate('entered_by')
          .populate('worker')
          .populate('stock')
          .exec(callback);
      },
      items: callback=>{
        Stock.find({}, callback);
      }
    }, 
    (err, results)=>{
      if (err) return next(err);
      let data = {
        type: 'line',
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [{
            label: "Item 1",
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: [
              'rgba(105, 0, 132, .2)',
            ],
            borderColor: [
              'rgba(200, 99, 132, .7)',
            ],
            borderWidth: 2
          },
          {
            label: "Item 2",
            data: [28, 48, 40, 19, 86, 27, 90],
            backgroundColor: [
              'rgba(0, 137, 132, .2)',
            ],
            borderColor: [
              'rgba(0, 10, 130, .7)',
            ],
            borderWidth: 2
          }
          ]
        },
        options: {
          responsive: true
        }
      }
      res.render(
        'index',
        {
          title: 'Home | Inventory',
          user: user,
          flows: results.flows,
          data: data,
          items: results.items,
          nav: 1,
        }
      );  
    })
   
  });
}