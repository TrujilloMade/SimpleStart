// Middleware to prevent a user from pages only accessbile by logging in
const ensureAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){//isAuthenticated is apart of passport
        req.session.loggedIn = true;
        return next();
    }
    req.session.loggedIn = false;
    req.flash('err_msg', 'You are not logged in');
    res.redirect('/');
}

// Middleware to prevent a user from login/register if they are already logged in
const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){//isAuthenticated is apart of passport
        return next();
    }
    res.redirect('/')
}
module.exports ={ensureAuthenticated, isLoggedIn};