// dealing with adf operation
const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');
const mkdirp = require('mkdirp');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp('/tmp/navgamer-tmp',function(err){
            if(err)
                console.log("mkdirp error");
            cb(null, '/tmp/navgamer-tmp');
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
 
var upload = multer({ storage: storage })

const { DB } = require('./db');

class AdfService {
    init(app){
        // create beaconID - only owner(admin) can create
        app.post('/create_beaconID',this.create_beaconID);
        // create adf which under specific beaconID
        app.post('/create_adfID',this.create_adfID);
        // create shopID which under specific adfID, beaconID
        app.post('/create_shop',this.create_shop);
        // list 
        app.get('/list_storage_hierarchy',this.list_storage_hierarchy);
        // upload/download adf data 
        app.post('/add_adf',upload.single('file'),this.add_adf);
        app.get('/get_adf',this.get_adf);
        // store object into specific shop
        app.post('/add_obj',upload.single('file'),this.add_obj);
        app.get('/get_obj_file',this.get_obj_file);
        app.get('/get_obj_info',this.get_obj_info);
        // get all shopName under specific adfID
        app.get('/get_shopIDs',this.get_shopIDs);
    }

    create_beaconID(req,res){
        if(req.body.auth_flag == undefined || req.body.beaconID == undefined){
            res.status(500).send("error input format");
        }
        DB.set_adf_beaconID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID.toUpperCase(),
            function(err,msg){
            if(err)
                res.status(500).send(msg);
            else{
                // create folder 
                mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID.toUpperCase()),function(err){
                    if(err)
                        res.status(500).send("create folder error");
                    else 
                        res.end(msg); // fully success
                });
            }            
        });
    }

    create_adfID(req,res){
        if(req.body.auth_flag == undefined || req.body.beaconID == undefined || req.body.adfID == undefined){
            res.status(500).send("error input format");
        }
        DB.set_adf_adfID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),
            function(err,msg){
                if(err)
                    res.status(500).send(msg);
                else{
                    // create folder 
                    mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase()),function(err){
                        if(err)
                            res.status(500).send("create folder error");
                        else 
                            res.end(msg); // fully success
                    });
                }
        });
    }

    create_shop(req,res){
        if(req.body.shopID == undefined || req.body.password == undefined || req.body.auth_flag == undefined || req.body.beaconID == undefined || req.body.adfID == undefined){
            res.status(500).send("error input format");
        }
        else{
            DB.set_adf_shopID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),
                function(err,msg){
                    if(err)
                        res.status(500).send(msg);
                    else{
                        // create folder 
                        mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),req.body.shopID),function(err){
                            if(err)
                                res.status(500).send("create folder error");
                            else 
                                res.end(msg); // fully success
                        });
                    }
                });
        }
    }

    list_storage_hierarchy(req,res){
        // list all existed 
        DB.list_storage_hierarchy(function(err,msg){
            if(err)
                res.status(500).send(msg);
            else{
                // FIXME: using fsx to check and auto-recovery the mistake
                res.end(JSON.stringify(msg));
            }
        });
    }

    add_adf(req,res){
        // fetch beacon ID, and adf ID
        // console.log(req.file);
        if(req.body.beaconID == undefined || req.body.adfID == undefined || req.file == undefined){
            res.status(500).send("error");
        }
        else{
            // checking path 
            fsx.pathExists(path.join(__dirname,'..',"ararara-download",req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase()))
            .then(exists => {
                if(exists == false)
                    res.status(500).send("error ID");
                else{
                    // moving files (overwrite)
                    fsx.move(path.join('/tmp/navgamer-tmp',req.file.originalname),
                        path.join(__dirname,'..',"ararara-download",req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),req.body.adfID.toUpperCase()+".adf")
                        ,{ overwrite: true })
                        .then(() => {
                            res.end("uploaded");
                        })
                        .catch( err => {
                            res.status(500).send("error");
                        });
                }
            });
        }
    }

    get_adf(req,res){
        var file = path.join(__dirname,'..','ararara-download',req.query.beaconID.toUpperCase(),req.query.adfID.toUpperCase(),req.query.adfID.toUpperCase()+".adf");
        fsx.pathExists(file).then(exists => {
            if(exists == false){
                // console.log(`Failure download file from server: ${req.query.beaconID.toUpperCase()}\\${req.query.adfID.toUpperCase()}`);
                res.status(500).send("error ID");
            }
            else{
                // console.log(`Successfully download file from server: ${req.query.beaconID.toUpperCase()}\\${req.query.adfID.toUpperCase()}`);
                res.download(file);
            }
        }).catch( err => {
            res.status(500).send("error");
        });
    }

    add_obj(req,res){
        if(req.body.beaconID == undefined || req.body.adfID == undefined || req.body.shopID == undefined || req.file == undefined){
            res.status(500).send("error");
        }
        else{
            // check 
            var file = path.join(__dirname,'..','ararara-download',req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),req.body.shopID);
            fsx.pathExists(file).then(exists => {
                if(exists == false)
                    res.status(500).send("error ID");
                else{
                    // moving files (overwrite if the file is already existed)
                    fsx.move(path.join('/tmp/navgamer-tmp',req.file.originalname),
                            path.join(__dirname,'..',"ararara-download",req.body.beaconID.toUpperCase(),req.body.adfID.toUpperCase(),req.body.shopID,req.body.id),
                            { overwrite: true })
                            .then(() => {
                                // add info obj into shop
                                DB.add_adf_obj(req.body.shopID,req.body.password,req.body.shopName,
                                    req.body.shopIntro,req.body.id,req.body.beaconID.toUpperCase(),
                                    req.body.adfID.toUpperCase(),req.body.pos,req.body.rot,req.body.scale,function(err,msg){
                                        if(err)
                                            res.status(500).send(msg);
                                        else
                                            res.end(msg);
                                });
                            })
                            .catch( err => {
                                res.status(500).send("error");
                            });
                }
            }).catch( err => {
                res.status(500).send("error");
            });
        }
    }

    get_obj_file(req,res){
        var file = path.join(__dirname,'..','ararara-download',req.query.beaconID.toUpperCase(),req.query.adfID.toUpperCase(),req.query.shopID,req.query.id);
        fsx.pathExists(file).then(exists => {
            if(exists == false)
                res.status(500).send("error ID");
            else
                res.download(file);
        }).catch( err => {
            res.status(500).send("error");
        });
    }

    get_obj_info(req,res){
        DB.get_adf_obj(req.query.id,req.query.beaconID.toUpperCase(),req.query.adfID.toUpperCase(),req.query.shopID,function(err,msg){
            if(err)
                res.status(500).send(msg);
            else
                res.end(JSON.stringify(msg));
        });
    }

    get_shopIDs(req,res){
        DB.get_shopIDs_byadfID(req.query.beaconID.toUpperCase(),req.query.adfID.toUpperCase(),function(err,msg){
            if(err)
                res.status(500).send(msg);
            else 
                res.end(JSON.stringify(msg)); // return json array
        });
    }
}

module.exports = {
    AdfService: new AdfService()
}