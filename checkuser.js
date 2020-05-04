module.exports = (req, res, next)=>{
  //next();
  if (req.session.user){
    next();
  }else{
    req.session.return_to = req.originalUrl;
    res.redirect('/login');
  }
}