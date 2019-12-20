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

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || data.status === 'ZERO_RESULTS') {
        req.flash('error', 'Invalid address');
        console.log(err.message)
        return res.redirect('back');
      }
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      campgroundModel.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err.message);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
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
    
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      campgroundModel.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
              console.log(err.message)
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
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