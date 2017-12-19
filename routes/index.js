var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant/restaurant");
var middleware = require("../middleware");
var Request = require("../models/request/request");
var Message = require("../models/message");

//  ============================================================

// Nodejs encryption with CTR
// var crypto = require('crypto'),
//     algorithm = 'aes-256-ctr',
//     password = 'd6F3Efeq';

// function encrypt(text){
//   var cipher = crypto.createCipher(algorithm,password)
//   var crypted = cipher.update(text,'utf8','hex')
//   crypted += cipher.final('hex');
//   return crypted;
// }
 
// function decrypt(text){
//   var decipher = crypto.createDecipher(algorithm,password)
//   var dec = decipher.update(text,'hex','utf8')
//   dec += decipher.final('utf8');
//   return dec;
// }
 
// var hw = encrypt("hello world")
// console.log(hw);
// outputs hello world
// console.log(decrypt(hw));


//  ===========================================================

            // INDEX


router.get("/",function(req, res){
   res.render("landing"); 
});

router.get("/home", function(req, res) {
   Request.count({}, function(err, count){
        if(err){
            console.log(err);
        }else{
             res.render("index" ,{count: count}); 
        }        
    });

});

// New Business
router.get("/home/new", middleware.isLoggedIn, function(req, res) {
    res.render("new");
});

            //  Finding Users

router.post("/results", function(req, res) {
    var name = req.body.search;

    User.find({name : name},function(err, foundResult){
        if(err){
            console.log("Error");
        }
        else{
                    // Ref = 1 for campgrounds.ejs
            // res.render("places/places", {places:foundResult, url : "/restaurants", name : "Results"});
            res.render("places/users", {users: foundResult, url: "/user", name: "Users"});                      
        }
    });
    
});
            //  Showing found Users
router.get("/user/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else{
            res.render("places/foundUser", {foundUser: foundUser});
        }
    });
});
             // Creating a Message

router.post("/sendmessage/:id", function(req, res){
    
    var message = req.body.message;
    var key = req.body.key;
    author = {
        id : req.user.id,
        username: req.user.username
    }

    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else{
            // Message.create()
            var reciever = {
                id: foundUser.id,
                username: foundUser.username
            }
            var obj = {message: message, key: key, author: author, reciever: reciever};
            // console.log(obj);
            Message.create(obj, function(err, message){
                req.flash("success", "Message Sent Sucessfully !!!");
                res.redirect("back");
            });
        }
    });
});

            //  Show Messages

router.get("/mymessages", function(req, res){
    Message.find({}, function(err, messages){
        res.render("places/mymessages", {messages: messages});
    });
});           

router.post("/decryptMessage/:id", function(req, res){
    Message.findById(req.params.id, function(err, foundMessage){
        if(err){
            console.log(err);
        } else{
            foundMessage.givenKey = req.body.decrKey;
            foundMessage.save();
            res.redirect("/mymessages");
        }
    });
});


// =========================
//  Authentication Routes
// =========================

// show register form
router.get("/register", function(req, res) {
    res.render("register");
});

// handle signup logic
router.post("/register", function(req, res) {
    User.register(new User({username: req.body.username, name : req.body.name, num: req.body.num, address: req.body.add}), req.body.password, function(err, user){
        if(err){
            req.flash("error", err.messge);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Hyderabad " + req.body.username);    
            res.redirect("/home");
        });
    });
});

// Show login form
router.get("/login", function(req, res) {
       res.render("login"); 
});

// Handle login logic
router.post("/login",passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
}) ,function(req, res) {
    
});

// logout User
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Sucessfully logged you out !!!");
    res.redirect("/home");
    
});

router.post("/requests", middleware.isLoggedIn, function(req, res){
        var author = {
        id: req.user.id,
        username: req.user.username
    };

    var data = {
        name: req.body.name,
        url : req.body.url,
        description: req.body.description,
        direction : req.body.direction,
        catagory : req.body.catagory,
        author: author
    };
    Request.create(data, function(err, Requests){
        if(err){
            console.log("Error");
        }
        else{
            req.flash("success", "Your Post have been saved and will be created after varification of details");
            res.redirect("/home");
        }
    });
    

});

router.get("/requests",checkIfAdmin, function(req,res){
   Request.find({}, function(err, requests){
     if(err){
         console.log("error");
     }
     else{
         
         res.render("requests",{requests: requests});
     }
   });
});

// router.get("/requests/view", checkIfAdmin, function(req, res) {
//   Request.find({}, function(err, requests) {
//         if(err){
//             console.log(err);
//         } else{
//             res.render("viewMe", {requests: requests});
//         } 
//   });
// });

        // SHOW
        
        // Finding a perticular Req by Id and using it in show page
router.get("/requests/:id", function(req, res) {
    Request.findById(req.params.id, function(err, data){
        if(err){
            console.log("Error");
        }
        else{
                // Ref = 2 for show.ejs
            res.render("viewMe", {requests:data});     
        }
    });
});

router.delete("/requests/:id",checkIfAdmin, function(req, res){
   Request.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("back");
      }
      req.flash("sucess", "Sucessfully deleted a Request");
      res.redirect("back");
   }); 
});

function checkIfAdmin(req, res, next){

    if(req.isAuthenticated()){
        var obj = {
            a:'5959ed7cb984c10011e28190'
        };
        if(req.user._id.equals(obj.a)){
            next();
        }
        else{
            req.flash("error", "Your You do not have permission to Access the route !!!");
            res.redirect("/home");
        }
    }
    else{
        console.log("Login to Continue");
        res.redirect("/login");
    }
}

module.exports = router;