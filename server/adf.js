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
        // upload/download adf data 
        app.post('/add_adf',upload.single('file'),this.add_adf);
        app.get('/get_adf',this.get_adf);
        // store object into specific shop
        app.post('/add_obj',upload.single('file'),this.add_obj);
        app.get('/get_obj_file',this.get_obj_file);
        app.get('/get_obj_info',this.get_obj_info);
    }

    create_beaconID(req,res){
        if(req.body.auth_flag == undefined || req.body.beaconID == undefined){
            res.end("error input format");
        }
        DB.set_adf_beaconID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID,
            function(err,msg){
            if(err)
                res.end(msg);
            else{
                // create folder 
                mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID),function(err){
                    if(err)
                        res.end("create folder error");
                    else 
                        res.end(msg); // fully success
                });
            }            
        });
    }

    create_adfID(req,res){
        if(req.body.auth_flag == undefined || req.body.beaconID == undefined || req.body.adfID == undefined){
            res.end("error input format");
        }
        DB.set_adf_adfID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID,req.body.adfID,
            function(err,msg){
                if(err)
                    res.end(msg);
                else{
                    // create folder 
                    mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID,req.body.adfID),function(err){
                        if(err)
                            res.end("create folder error");
                        else 
                            res.end(msg); // fully success
                    });
                }
        });
    }

    create_shop(req,res){
        if(req.body.shopID == undefined || req.body.password == undefined || req.body.auth_flag == undefined || req.body.beaconID == undefined || req.body.adfID == undefined){
            res.end("error input format");
        }
        else{
            DB.set_adf_shopID(req.body.shopID,req.body.password,req.body.auth_flag,req.body.beaconID,req.body.adfID,
                function(err,msg){
                    if(err)
                        res.end(msg);
                    else{
                        // create folder 
                        mkdirp(path.join(__dirname,'..','ararara-download',req.body.beaconID,req.body.adfID,req.body.shopID),function(err){
                            if(err)
                                res.end("create folder error");
                            else 
                                res.end(msg); // fully success
                        });
                    }
                });
        }
    }

    add_adf(req,res){
        // fetch beacon ID, and adf ID
        // console.log(req.file);
        
        // checking path 
        fsx.pathExists(path.join(__dirname,'..',"ararara-download",req.body.beaconID,req.body.adfID))
            .then(exists => {
                if(exists == false)
                    res.end("error ID");
                else{
                    // moving files (overwrite)
                    fsx.move(path.join('/tmp/navgamer-tmp',req.file.originalname),
                        path.join(__dirname,'..',"ararara-download",req.body.beaconID,req.body.adfID,req.body.adfID+".adf")
                        ,{ overwrite: true })
                        .then(() => {
                            res.end("uploaded");
                        })
                        .catch( err => {
                            res.end("error");
                        });
                }
            });
    }

    get_adf(req,res){
        var file = path.join(__dirname,'..','ararara-download',req.query.beaconID,req.query.adfID,req.query.adfID+".adf");
        fsx.pathExists(file).then(exists => {
            if(exists == false)
                res.end("error ID");
            else
                res.download(file);
        }).catch( err => {
            res.end("error");
        });
    }

    add_obj(req,res){
        // check 
        var file = path.join(__dirname,'..','ararara-download',req.body.beaconID,req.body.adfID,req.body.shopID);
        fsx.pathExists(file).then(exists => {
            if(exists == false)
                res.end("error ID");
            else{
                // moving files (overwrite if the file is already existed)
                fsx.move(path.join('/tmp/navgamer-tmp',req.file.originalname),
                        path.join(__dirname,'..',"ararara-download",req.body.beaconID,req.body.adfID,req.body.shopID,req.body.id),
                        { overwrite: true })
                        .then(() => {
                            // add info obj into shop
                            DB.add_adf_obj(req.body.shopID,req.body.password,req.body.id,
                                req.body.shopName,req.body.shopIntro,req.body.beaconID,
                                req.body.adfID,req.body.pos,req.body.rot,req.body.scale,function(err,msg){
                                    if(err)
                                        res.end(msg);
                                    else
                                        res.end(msg);
                            });
                        })
                        .catch( err => {
                            res.end("error");
                        });
            }
        }).catch( err => {
            res.end("error");
        });
    }

    get_obj_file(req,res){
        var file = path.join(__dirname,'..','ararara-download',req.query.beaconID,req.query.adfID,req.query.shopID,req.query.id);
        fsx.pathExists(file).then(exists => {
            if(exists == false)
                res.end("error ID");
            else
                res.download(file);
        }).catch( err => {
            res.end("error");
        });
    }

    get_obj_info(req,res){
        DB.get_adf_obj(req.query.id,req.query.beaconID,req.query.adfID,req.query.shopID,function(err,msg){
            if(err)
                res.end(msg);
            else
                res.end(JSON.stringify(msg));
        });
    }
}

module.exports = {
    AdfService: new AdfService()
}