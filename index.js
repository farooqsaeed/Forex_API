
var express = require('express');
var mysql = require('mysql');
const axios = require('axios');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000,() => {
  if (counter==0) {
    console.log('server started');
    con.query("SELECT COUNT(*) AS Count FROM data", function (err, result) {
      if (err) throw err;
      else{
        console.log(result[0].Count);
        counter = result[0].Count;
      }
      
    });
  }
  console.log('go to http://localhost:3000');
  setInterval(function(){
    countData()
}, 60000);
});
var io = socket(server);

io.on('connection',(socket)=>{
  console.log('socket connection established');
})
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "forex"
  });
  var counter = 0;
  
    const getData = async () => {
        try {
          return await axios.get('https://data.fixer.io/api/latest?access_key=c40fa8e96f4c72e7f948400392d4c915&base=USD&symbols=GBP')
        } catch (error) {
          console.error(error)
        }
      }
      
      const countData = async () => {
          
        try{
          const values = await getData()
          var timestamp = values.data.timestamp;
          var gbp = values.data.rates.GBP;
          var one_minute = 0;
          var five_minute =0;
          var thirty_minute =0;
         
          var five = counter-4;
          var thirty = counter-29;
    
          con.query("SELECT current_value FROM data WHERE id='"+counter+"'", function (err, result) {
            if (err) throw err;
            else{
              one_minute=counter==0?'0':Math.abs((gbp-result[0].current_value)*10000);
              console.log(result.length);
              
               con.query("SELECT current_value FROM data WHERE id='"+five+"'", function (err, result) {
                if (err) throw err;
                else{
                  five_minute=counter==0?'0':counter<5?'------':Math.abs((gbp-result[0].current_value)*10000);
                  
                  
                  con.query("SELECT current_value FROM data WHERE id='"+thirty+"'", function (err, result) {
                    if (err) throw err;
                    else{
                     
                      thirty_minute=counter==0?'0':counter<30?'------': Math.abs((gbp-result[0].current_value)*10000);
                      
                      ++counter;
                      var sql = "INSERT INTO data (time,current_value,one_minute,five_minute,thirty_minute) VALUES ('"+timestamp+"','"+gbp+"','"+one_minute+"','"+five_minute+"','"+thirty_minute+"')";
                      con.query(sql, function (err, result) {
                        if (err) throw err;
                        else{
                          con.query("SELECT * FROM data ORDER BY id DESC LIMIT 1", function (err, result) {
                            if (err) throw err;
                            console.log(result);
                            io.sockets.emit('faisal',JSON.stringify(result[0]));
                          });
                        }
                        console.log(counter+"record inserted");
                      });
                    }
                  }); 
                }
              });
               
            }
           
          }); 
        } 
        catch (error) {
          console.error(error)
        } 
      }

      app.get("/items/", (req, res) => {
    
        con.query("SELECT * FROM data", function (err, result) {
          if (err) throw err;
          console.log(result);
          res.json(result);
        }); 
        
           
     });
   

    


     