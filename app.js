//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser: true})

const itemsSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "eat"
})
const item2 = new Item({
  name: "code"
})
const item3 = new Item({
  name: "Welcome"
})
const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,items){
    if(items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success inserting")
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
    
  })

const day = date.getDate();
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,result){
    if(!err){
      if(!result){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: result.name,newListItems: result.items});
      }
    }
  })

  
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save()
    })
    res.redirect("/"+listName);
  }
  
});

app.post("/delete",function(req,res){
  console.log(req.body.checkedBox)
  const checkedItemId = req.body.checkedBox;
  const listName = req.body.listName;
  // Item.deleteOne({_id: checkedItemId},function(err){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     console.log("success")
  //     res.redirect("/")
  //   }
  // });
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("success")
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, 
      {$pull: {items:{_id: checkedItemId}}},
      function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
    });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
