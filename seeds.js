var mongoose = require("mongoose");
var campgroundModel = require("./model/campground");
var comments = require("./model/comments")

var data = [
    {
        name: "Rest",
        image: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1259&q=80",
        description: "In the mountains"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm4.staticflickr.com/3859/15123592300_6eecab209b.jpg",
        description: "blah blah blah"
    }
]

function seedDB(){
    campgroundModel.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campground");
        data.forEach(function(seed){
            campgroundModel.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else {
                    console.log("added campground");
                    comments.create(
                        {
                            text: "Great place",
                            author: "Bob"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                campground.comment.push(comment);
                                campground.save();
                                console.log("created new comment");
                            }
                        }
                    )
                }
            });
        });
    });
    
}

module.exports = seedDB;    