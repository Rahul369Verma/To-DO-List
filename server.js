const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
//ejs is also installed but no need to require

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
const day = date.getdate();
mongoose.connect("mongodb+srv://rahul:test123@rahul.ta3ka.mongodb.net/todolistDB?retryWrites=true&w=majority"
,{useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false });

const itemSchema = mongoose.Schema({
	name: String
});

const listSchema = mongoose.Schema({
	name: String,
	item: [itemSchema]
});

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List", listSchema);

const firstItem = new Item({
	name: "Welcome to yout todolist!"
});
const secondItem = new Item({
	name: "Hit rhe + button to add a new item."
});
const thirdItem = new Item({
	name: "<-- Hit this to delete an item."
});
const defaultItems = [firstItem,secondItem,thirdItem];
const listArray = [firstItem,secondItem,thirdItem];


app.get("/",function (req, res) {
	Item.find({},function (err,itemsArray) {
		if (itemsArray.length === 0) {
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err);
				}else{
					console.log("successfully insert default items");
				}
			})
			res.redirect("/");
		}else {
			res.render("list",{listTitle: day,newListItem: itemsArray});				
		}
	})
});
app.get("/:customList",function (req, res) {
	const customList = _.capitalize(req.params.customList);
	List.findOne({name: customList}, function (err, foundList) {
		if (!err) {
			if (foundList) {
				res.render("list", {listTitle: foundList.name,newListItem: foundList.item});			
			}else{
				const createItem = new List({
					name: customList,
					item: listArray
				});
				createItem.save();			
				res.redirect("/" + customList);
			}
		}
	});
});
app.get("/about",function (req, res) {
	res.render("about");	
});


app.post('/',function (req, res) {
	const inputName = req.body.newItem;
	const listName = req.body.button;
	if (listName === day) {
		const newItem = new Item({
			name: inputName
		});
		newItem.save();
		res.redirect("/");
	}else {
		const item = new Item({
			name: inputName
		});
		List.findOne({name: listName}, function (err, foundList) {
			foundList.item.push(item);
			foundList.save();
			res.redirect("/" + listName)
		})
	}

});
app.post("/delete",function (req, res) {
	const idNumber = req.body.checkbox;
	const hiddenTitle = req.body.hiddenTitle;
	
	if (hiddenTitle === day) {
		Item.findByIdAndRemove(idNumber, function (err) {
			if (!err) {
				res.redirect("/");
			}
		});		
	}else {
		List.findOneAndUpdate({name: hiddenTitle},{$pull: {item: {_id: idNumber}}},function (err, foundList) {
			if (!err) {
				res.redirect("/" + hiddenTitle);
			}
		});
	}


});

let port = process.env.PORT;
if(port == null || port == ""){
	port = 5000;
}

app.listen(port,function () {
	console.log('server is started 5000 and on Heroku');
});