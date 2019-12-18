var express     = require("express"),
    request     = require("request"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    campgroundModel = require("./model/campground"),
    seedDB      = require("./seeds"),
    Comment     = require("./model/comments"),
    passport    = require("passport"),
    passportMongoose = require("passport-local-mongoose"),
    localStrategy = require("passport-local"),
    User        = require("./model/user"),
    app         = express(),
    methodOverride = require("method-override"),
    flash       = require("connect-flash")

//require routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campground"),
    indexRoutes         = require("./routes/index")

// mongoose.connect("mongodb://localhost/yelp_campv11", {useNewUrlParser: true });
mongoose.connect("mongodb+srv://thejason968:2FhBk7Io0RX7D1D1@cluster0-tmsua.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/Public"));
app.use(methodOverride("_method"));
app.use(flash());
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// seedDB(); //seed database

app.use(require("express-session")({
    secret: "Just the tip",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
    
app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));