require("dotenv").config();
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const currentDate = require(path.join(__dirname, "date.js"));
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();
const portNum = process.env.PORT || 8800;

mongoose.connect(process.env.URI);



const TodoListSchema = new mongoose.Schema({
  work: {
    type: String
  },
  dateinfo: {
    type: String,
    required: true
  }
});


var listname = "";
var List = " "
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.get('/', (req, res) => {

  mongoose.connection.client.db("todoList").listCollections().toArray().then(val => {
    res.render('index', { userCreatedLists: val })

  })
});

app.get('/lists/:pageName', (req, res) => {
  listname = _.lowerCase(req.params.pageName);
  List = mongoose.model(listname, TodoListSchema);
  List.find({}).then(val => {
    res.render("home", { dateInfo: currentDate.getDate(), newWorksTodo: val, pagename: listname });
  });
})

app.post('/addlists', async (req, res) => {
  var name = _.lowerCase(req.body.listName)
 
  mongoose.connection.client.db("todoList").createCollection(name, function (err, listcollection) {
    if (err) {
      console.log(err);
    }
  }).then(x => {

    res.redirect('/');
  })

})

app.post('/lists/:pageName', (req, res) => {
  const listiteam = new List({
    work: req.body.newWork,
    dateinfo: currentDate.getDate()
  })
  listiteam.save();
  res.redirect(`/lists/${listname}`);
});

app.post('/delete', (req, res) => {

  List.findByIdAndDelete({ _id: req.body.checkboxValue }).then(err => {
    res.redirect(`/lists/${listname}`);
  });

})
app.post("/deletelist", (req, res) => {
  mongoose.connection.db.dropCollection(req.body.listval, function (err, result) {
    if (err) {
      console.log(err);
    }
  }).then(x => {
    res.redirect("/");
  })
})
app.listen(portNum, () => {
  console.log(`Succefully connected to ${portNum} :)`);
})