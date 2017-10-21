// for NavGamer-Lite entries
const { DB } = require('./db');

class Lite {
    init(app){
        // Bind image id with specific shop id
        app.post('/bind_lite_imageID',this.bind_lite_imageID);
        // Get information (only shopName) by image id
        app.get('/get_lite_info_indie',this.get_lite_info_indie);
        // Get information from NavGamer origin database by image id
        app.get('/get_lite_info_reuse',this.get_lite_info_reuse);
    }

    bind_lite_imageID(req,res){
        if(req.body.imageID == undefined || req.body.shopID == undefined || req.body.shopName == undefined){
            res.status(500).send('internal error');
        }
        else{
            DB.bind_lite_imageID(req.body.imageID,req.body.shopID,req.body.shopName,function(err,obj){
                if(err) res.status(500).send(obj);
                else res.end(obj);
            })
        }
    }

    get_lite_info_indie(req,res){
        DB.get_lite_info_indie(req.query.imageID,function(err,obj){
            
            res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right

            if(err) res.status(500).send(obj);
            else res.end(JSON.stringify(obj));
        })
    }    

    get_lite_info_reuse(req,res){
        DB.get_lite_info_indie(req.query.imageID,function(err,obj){

            res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right
            
            if(err) res.status(500).send(obj);
            else res.end(JSON.stringify(obj));
        })
    }
}

module.exports = {
    Lite: new Lite()
}