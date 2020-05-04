var express = require('express');
var async = require('async');

var checkuser = require('../checkuser');
var Flow = require('../models/Flow');
var Stock = require('../models/Stock');
var Branch = require('../models/Branch');

let months = [
  {name: 'Jan', max:31}, {name: 'Feb', max:28}, {name: 'Mar', max:31},
  {name: 'Apr', max:30}, {name: 'May', max:31}, {name: 'Jun', max:30},
  {name: 'Jul', max:30}, {name: 'Aug', max:31}, {name: 'Sep', max:30},
  {name: 'Oct', max:31}, {name: 'Nov', max:30}, {name: 'Dec', max:31}]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

let make_th =(day=0)=>{
  let st = [1, 21, 31];
  let nd = [2, 22];
  let rd = [3, 23];
  if(st.includes(day)){
    return day + 'st';
  }else if(nd.includes(day)){
    return day + 'nd';
  }else if(rd.includes(day)){
    return day + 'rd';
  }

  return day + 'th';
}

let generate =(params)=>{
  let items = [];
  for(flow of params.flows){
    let item = flow.item;
    if(items.includes(item) === false){
      items.push(item)
    }
  }
  let start = 0;
  let end = 0;
  let start_day = params.date1.getDate();
  let start_month = params.date1.getMonth();
  let start_year = params.date1.getFullYear();
  if (params.type=='days'){
    start = start_day;
    end = start + params.counter;
  }else if(params.type== 'months'){
    start = start_month;
    end = start + params.counter;
  }else{
    start = start_year;
    end = start + params.counter + 1;
  }
  let month_max = months[start_month].max;
  let ext_i = start;
  
  for(item of items){
    ext_i = start;
    let dataset = {
      label: "",
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2
    };
    
    for(let i = start; i < end; i++){
      let total = 0;
      if(params.type=='days'){
        if(ext_i > month_max){
          ext_i = 1;
        }
      }else if(params.type=='months'){
        if(ext_i > 11){
          ext_i = 0;
        }
      }
      for(flow of params.flows){
        let variable = flow.entry_date.getDate();
        if(params.type == 'months'){
          variable = flow.entry_date.getMonth();
        }else if(params.type == "years"){
          variable = flow.entry_date.getFullYear();
        }

        if(flow.item == item && variable == ext_i){
          total += flow.quantity;
        }
      }
      ext_i ++;
      dataset.data.push(total);
    }
    let bg = 'rgba(' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 1);
    let bc = 'rgba(' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + 1;
    dataset.label = item.name;
    dataset.backgroundColor = [bg,];
    dataset.borderColor = [bc,];
    params.datasets.push(dataset);
  }
  
  // Labels
  let dif_ext = start;
  for(let i = start; i < end; i++){
    if(params.type=='days'){
      if(dif_ext > month_max){
        dif_ext = 1;
      }
      params.labels.push(make_th(dif_ext));
    }else if(params.type=='months'){
      if(dif_ext > 11){
        dif_ext = 0;
      }
      params.labels.push(months[dif_ext].name);
    }else{
      params.labels.push(dif_ext);
    }
    dif_ext ++;
  }
}
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
    
    async.parallel({
      flows: callback=>{
        Flow.find(filter)
          .sort('entry_date')
          .populate('branch')
          .populate('entered_by')
          .populate('worker')
          .populate('item')
          .exec(callback);
      },
      branches: callback=>{
        Branch.find({}, callback);
      },
      items: callback=>{
        Stock.find({}, callback);
      }
    }, 
    (err, results)=>{
      if (err) return next(err);
      
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const firstDate = new Date(from);
      const secondDate = new Date(to);
      const days = Math.round(Math.abs((secondDate - firstDate) / oneDay));
      let data = {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true
        }
      }
  
      let labels = [];
      let datasets = [];
      params = {
        datasets: datasets,
        flows: results.flows, 
        labels: labels,
        date1: firstDate,
        date2: secondDate,
      }
            
      if(days<=31){
          params.counter = days;
          params.type = 'days';
          generate(params);
        
      }else if(days <= 122){
        params.counter = 4;
        params.type = 'months';
        generate(params);

      }else if(days <=366){
        params.counter = 12;
        params.type = 'months';
        generate(params);
      }else{
        let years = Math.ceil((days / 365));
        params.counter = years;
        params.type = 'years';
        generate(params);
      }

      data.data.labels = labels;
      data.data.datasets = datasets;
      
      res.render(
        'index',
        {
          title: 'Home | Inventory',
          user: user,
          flows: params.flows,
          branch: branch,
          from: from,
          to: to,
          data: data,
          branches: results.branches,
          items: results.items,
          nav: 1,
        }
      );  
    })
 
  });

}