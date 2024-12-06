var express = require('express');
var router = express.Router();
const userModel=require('./users');
const taskModel=require('./task');
const historyModel=require('./history');
const passport=require("passport");
const localStrategy=require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//----Register post route------//
router.post('/register', function(req, res, next) {
  let userdata=new userModel({
    username:req.body.username,
    fullname:req.body.fullname 
    
  });
  userModel.register(userdata,req.body.password)
  .then(function (registereduser){
    passport.authenticate("local")(req,res,function (){
      res.redirect('/profile');
    })
  })
});

 ////////----------profile route----------//////////
router.get('/profile',isLoggedIn,async function(req,res){
  let currentUserTasks=await userModel.findOne({
    username:req.session.passport.user
  })
  .populate("tasks")


  res.render("profile",{currentUserTasks})
})

////////---------create task route---------//////////
router.post('/createTask',isLoggedIn,async function(req,res){
//Finding current user
if(req.body.task2do.trim()==""){
  return res.status(400).send('No file were uploaded')
}
  let currentUser= await userModel.findOne({
  username:req.session.passport.user
})
//creating new task 
let currentTask=await taskModel.create({
  task:req.body.task2do
,
user:currentUser._id
})
//saving in history
let cthistory=await historyModel.create({
  task:req.body.task2do
,
createdAt:currentTask.createdAt
,
user:currentUser._id
})
currentUser.tasks.push(currentTask._id)
currentUser.taskhistory.push(cthistory._id)
await currentUser.save();
res.redirect('/profile')

})
//////////----------Deleting a task----------//////////
// Route for deleting a task
router.post('/deleteTask/:taskId', isLoggedIn, async function(req, res) {
  const taskId =req.params.taskId

  try {
    // Find the task by ID and remove it
    const deletedTask = await taskModel.findByIdAndDelete(taskId);
      
    // Optionally, handle errors or send a response
    if (!deletedTask) {
      return res.status(404).send('Task not found');
    }
    const currentUser = await userModel.findOne({
      username: req.session.passport.user
    });

    // Pull the task ID from the tasks array
    currentUser.tasks.pull(taskId);
    
    // Save the updated user document
    await currentUser.save();
    // Send a success response (you can customize this based on your needs)
    res.redirect('/profile');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send('Internal Server Error');
  }
});
//////////----------Deleting a history----------//////////
// Route for deleting a task
router.post('/deleteHistory/:historyId', isLoggedIn, async function(req, res) {
  const hisId =req.params.historyId

  try {
    // Find the task by ID and remove it
    const deletedHistory = await historyModel.findByIdAndDelete(hisId);
      
    // Optionally, handle errors or send a response
    if (!deletedHistory) {
      return res.status(404).send('Task not found');
    }
    const currentUser = await userModel.findOne({
      username: req.session.passport.user
    });

    // Pull the task ID from the tasks array
    currentUser.taskhistory.pull(hisId);
    
    // Save the updated user document
    await currentUser.save();
    // Send a success response (you can customize this based on your needs)
    res.redirect('/history');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send('Internal Server Error');
  }
});


////////----------Login post user---------//////////
router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  // failureFlash:true
}),function (req,res){
})

router.get("/history",isLoggedIn,async function(req,res){
  let currentUserHistory=await userModel.findOne({
    username:req.session.passport.user
  })
  .populate("taskhistory")
  res.render("history",{currentUserHistory})
})

//////////---------Login page------------/////////
router.get("/login",function(req,res){
  res.render("login")
})
//////////----------Logout route---------/////////
router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/login');
  })
})
//////////----------isLoggedIn route----------/////////
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}
module.exports = router; 
 