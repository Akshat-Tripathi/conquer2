/* Connect to MongoDB Atlas via Éire AWS */

var mongo = require("mongoose");  
var db =   
mongo.connect("mongodb://192.168.1.71:27017/reactcrud", function(err, response){  
   if(err){ console.log('Failed to connect to ' + db); }  
   else{ console.log('Connected to ' + db, ' + ', response); }  
});  
  

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://conquer2admin:<password>@cluster0.qnrve.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
  


module.exports =db; 