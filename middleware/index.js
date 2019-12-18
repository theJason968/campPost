//all middleware go here
var campgroundModel = require("../model/campground")
var Comment = require("../model/comments")
var middlewareObject = {}

middlewareObject.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        //redirect if not
        campgroundModel.findById(req.params.id, function(err, findCampground){
            if(err){
                res.redirect("back");
            } else {
                //does user own it?
                if(findCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permissions to do that")
                    res.redirect("back");
                }
            }   
        });
    } else {
        req.flash("error", "You need to log in to do that");
        res.redirect("back");
    }
}

middlewareObject.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated){
        if(req.isAuthenticated()){
            //redirect if not
            Comment.findById(req.params.comment_id, function(err, findComment){
                if(err){
                    req.flash("error", "Campground not found")
                    res.redirect("back");
                } else {
                    //does user own it?
                    if(findComment.author.id.equals(req.user._id)){
                        next();
                    } else {
                        req.flash("error", "You do not have permissions to do that")
                        res.redirect("back");
                    }
                }   
            });
        } else {
            req.flash("error", "You need to log in to do that");
            res.redirect("back");
        }
    }
}

//middleware
middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to log in to do that");
    res.redirect("/login");
}


module.exports = middlewareObject;