// dealing with mail service
const moment = require('moment');

class MailMan{
    constructor(){

    }
    mail(whosmail,title,content,callback){
        var exec = require('child_process').exec;
        exec('echo "'+content+'" | mail -s "'+ title + '" -r kevin ' + whosmail , function(err,stdout,stderr){
            if(err != null){
                callback(1,`MailMan Occurs Error! With notify letter to ${whosmail} in ${moment().format('lll')}`);
            }
            else{
                callback(0,`System successfully sending the mail to user!`);
            }
        });
    }
}

module.exports = {
    MailMan: new MailMan()
}