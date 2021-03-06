'use strict';
var Promise = require("bluebird");
var polygonToGrid = require('../../polygonToGrid');
var simulatePath = require('../../simulatePathWithSORAL');
var dbFunctions = require('./db');
var db = require("sqlite");

/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */


/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function submit_search_data(req, res) {
  // variables defined in
    // the Swagger document can be referenced using req.swagger.params.{parameter_name}

    let json = req.body;

         let type = json.type;

         if(type === "FeatureCollection") {
             simulatePath.calculatePathsForInput(json, res);
         }
}




function  define_settings(req, res) {


    let settings = req.body;


    try {
        dbFunctions.findExistingSettings().then((found_settings) => {
            let sql ="";
            if(settings.hasOwnProperty('reset')) {
                sql = dbFunctions.dropSettingsSQL();
            } else if(typeof (found_settings) === "undefined") {
                //Nothing in there yet so lets insert
                console.log("inserting!");
               sql =  dbFunctions.insertIntoSQL(settings);
            } else {
                //Need to update
                console.log("updating");
                sql = dbFunctions.updateSQL(settings);
            }
            console.log(sql);
            debugger;
            db.run(sql).then(() => {
                try {
                    dbFunctions.findExistingSettings().then(existing_settings_res => {
                        debugger;
                        if(existing_settings_res) {
                            res.json(existing_settings_res);
                        } else {
                            res.json({"message": "existing settings do not exist yet."});
                        }
                    });

                } catch (err) {
                    console.log(err);
                    res.json({"message": "could not retrieve settings, error:" + err});
                }
            });


        }).catch(err =>{
            console.error(err.stack);
            res.json({"message": "could not retrieve settings"});
        });


        //res.render('post', { post, categories });
    } catch (err) {
        console.log(err);
        //next(err);
    }





}


module.exports = {
    submit_search_data: submit_search_data,
    define_settings:   define_settings
};
