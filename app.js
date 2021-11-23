const express=require("express");
const bodyParser=require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const date=require(__dirname+"/day.js");
const app=express();
const _=require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
mongoose.connect("mongodb+srv://admin-srj:Intelminda1@cluster0.uqzia.mongodb.net/todolistDB");
const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Cook"
});
const item2=new Item({
    name:"Read"
});
const item3=new Item({
    name:"Play"
});
const defaultItems=[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully iserted into DB");
                }
            });
            res.redirect("/");
        }
        else
        res.render("list",{kindOfDay:date.getDay(),items:foundItems});
    });
})
app.post("/",function(req,res){
    const item=new Item({
        name:req.body.listItem
    });
    const path=req.body.btn;
    if(path===date.getDay()){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:path},function(err,foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+path);
            }
        });
    }
})
app.post("/delete",function(req,res){
    if(req.body.hid===date.getDay()){
        Item.findByIdAndRemove(req.body.checkbox,function(err){
            if(!err){
                console.log("Successfully deleted");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:req.body.hid},{$pull:{items:{_id:req.body.checkbox}}},function(err,foundList){
            if(!err){
                res.redirect("/"+req.body.hid);
            }
        });
    }
})
app.get("/about",function(req,res){
    res.render("about");
})
app.get("/:param",function(req,res){
    const path=_.capitalize(req.params.param);
    List.findOne({name:path},function(err,results){
        if(!err){
            if(!results){
                const list=new List({
                    name:path,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+path);
            }
            else{
                res.render("list",{kindOfDay:path,items:results.items});
            }
        }
    })
}) 
let port=process.env.PORT;
if(port==null || port==""){
    port=3000;
}
app.listen(port,function(){
    console.log("Sever started");
})