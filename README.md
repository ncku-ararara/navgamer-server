# NavGamer Server
- RESTful API server of an beacon-tango system project.

## System requirement
- [nodejs](https://nodejs.org/en/download/current/)
	- Develope with `v8.1.2`
- [MongoDB](https://hackmd.io/s/H1OxuGFCx)
- [ChatterBot](https://github.com/gunthercox/ChatterBot)
	- Develope with `v0.7.5`
	- Run by `python3.5.2`
	- More details about usage, check out corpus files in `server/chatbot/data`.
- [Postfix](http://www.postfix.org/)
	- v3.1.0
	- Served as mail server in this project.
	- [Installation guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-on-ubuntu-16-04)
- [SSL (from SSLForFree)](https://www.sslforfree.com/)
        - Enable `https` for connection secure.

## Setting before run up service
- Make a directory in project root named `ararara-download` as the adf storage.
- Check out mail server configuration.
- Using `npm run all` to start server.

## Author
- Kevin Cyu, kevinbird61@gmail.com
