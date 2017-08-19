// dealing with user account entries
const path = require('path');
const fs = require('fs');
const { DB } = require('./db');
const { MailMan } = require('./mail');

class UserService {
    init(app){
        app.post('/register',this.register);
        app.get('/checkmail',this.checkmail);
        app.post('/login',this.login);
        app.get('/forget_pass',this.forget_pass);
        app.get('/verify_manual',this.verify_manual); // user get the mail , and then they can type it for themself
    }

    register(req,res){
        // fetch variable
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const ltype = req.body.ltype == undefined ? 'TW' : 'US';
        console.log(`Username: ${username}, Password: ${password}, Email: ${email}`);
        // get register function
        DB.user_register(username,password,email,function(err,msg){
            if(err){
                res.end(msg);
            }
            else{
                // response
                res.end(msg);
                // email to notify this user !
                var content = fs.readFileSync(path.join(__dirname,'mail',ltype,'congratulation.txt'),'utf-8');
                // mailing
                MailMan.mail(email,"NavGamer System Notify Mail",content,function(err,msg){
                    console.log(msg);
                });
            }
        });
    }

    login(req,res){
        const username = req.body.username;
        const password = req.body.password;
        console.log(`Username: ${username}, Password: ${password}`);
        // get login function
        DB.user_login(username,password,function(err,msg){
            if(err){
                res.end(msg);
            }
            else{
                res.end(msg);
            }
        });
    }

    forget_pass(req,res){
        const username = req.query.username;
        const ltype = req.body.ltype == undefined ? 'TW' : 'US';
        // using username to find and generate code for it
        DB.user_gettmpcode(username,function(err,msg){
            if(err)
                res.end(msg);
            else{
                // using msg as user mail to deliver
                var content = fs.readFileSync(path.join(__dirname,'mail',ltype,'verify.txt'),'utf-8');
                // mailing
                MailMan.mail(msg.email,"NavGamer - Forget password recovery rules",content,function(err,m_msg){
                    if(err){
                        // FIXME
                    }
                    else{
                        // And then send another one for code!
                        MailMan.mail(msg.email,"NavGamer - code for recovery",msg.code,function(err,m_msg){                    
                            res.end("Check your mail");
                        });
                    }
                });
            }
        })
    }

    verify_manual(req,res){
        const username = req.query.username;
        const code = req.query.code;
        // verify by db 
        DB.user_verify(username,code,function(err,msg){
            if(err){
                res.end(msg)
            }
            else{
                MailMan.mail(msg.email,"NavGamer - Your password",msg.password,function(err,m_msg){                    
                    res.end("password send");
                });
            }
        })
    }

    checkmail(req,res){
        const email = req.query.email;

        DB.user_checkmail(email,function(err,msg){
            if(err){
                res.end(msg);
            }
            else{
                res.end(msg);
            }
        })
    }
}

module.exports = {
    UserService: new UserService()
}