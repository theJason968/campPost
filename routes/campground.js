var express = require("express");
var router = express.Router();
var campgroundModel = require("../model/campground");
var middleware = require("../middleware/index");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//Index ROUTE: show all campgrounds
router.get("/", (req, res) => { 
    //get campground from db
    campgroundModel.find({}, function(err, allcampground){
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/index", {campgrounds: allcampground});
        }
    });
    
});

router.post("/", middleware.isLoggedIn,(req, res) => {
    
    //get data from form and add campground to array
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    let name = req.body.name;
    let price = req.body.price;
    let image = req.body.image;
    let description = req.body.description;
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var arrCampground = {name: name, price: price, image: image, description: description, author: author, location: location, lat: lat, lng: lng};
        //create new campground and save to database
        campgroundModel.create(arrCampground, function(err, newCreated){
            if(err){
                prompt("Needs an image or name");
            }else{
                console.log(newCreated)
                //redirect back to /campgrounds
                res.redirect("/campgrounds");
            }
        });
    });  
});

//NEW - show form to create
router.get("/new", middleware.isLoggedIn,(req, res) => {
    res.render("campgrounds/new");
});

//SHOW ROUTE
router.get("/:id", (req, res) =>{
    //find campground with id
    campgroundModel.findById(req.params.id).populate("comment").exec(function(err, foundCampground){
        if(err){
            console.log("error");
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    campgroundModel.findById(req.params.id, function(err, findCampground){
        res.render("campgrounds/edit", {campground: findCampground});
    });      
});
    
// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        campgroundModel.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                req.flash("error", err.message);
                console.log(err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Succesfully Updated");
                res.redirect("/campgrounds/" + updatedCampground._id /* or req.params.id */);
            }
        });
    });
});

//DELTE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    campgroundModel.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;