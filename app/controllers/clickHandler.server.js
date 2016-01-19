'use strict';

function clickHandler (db) {
   var clicks = db.collection('clicks');
	var usernames = db.collection('usernames');
	var urlindex = db.collection('urlindex');
	var polls = db.collection('polls');
   this.getClicks = function (req, res) {

      var clickProjection = { '_id': false };

      usernames.findOne({'username': req.cookies.username}, clickProjection, function (err, result) {
         if (err) {
            throw err;
         }

         if (result) {
            res.json(result);
         } else {
            
         }
      });
   };
   
   this.getPolls = function (req, res) {

      var clickProjection = { '_id': false };

      polls.find({'user': req.cookies.username}, clickProjection, function (err, result) {
         if (err) {
            throw err;
         }

         if (result) {
         	result.toArray(function (err, result) {
         		if (err) {
            		throw err;
         		}
         		res.json(result);
         	})
            
         } else {
            
         }
      });
   };
   
   this.returnDate = function (req, res) {
      if (!isNaN(+decodeURI(req.params.sentdate)))
      {
         var thingy4 = new Date(+decodeURI(req.params.sentdate));
         var thingy5 = +decodeURI(req.params.sentdate);
         res.json({'unix': thingy5, 'natural': thingy4});
      }
      else {
        var thingy2 = new Date(decodeURI(req.params.sentdate).toString());
        var thingy3 = Date.parse(thingy2);
        res.json({'unix': thingy3, 'natural': thingy2});
      }
   };
   
   this.returnShort = function (req, res) {
      var erryday = parseInt(req.params.urlst);
      polls.findOne({'short_url': erryday}, function (err, result) {
         if (err) {
            throw err;
         }
         if (result) {
         var urlgo = result.original_url;
         res.redirect(urlgo);
         }
         else {
            res.json({'error': 'That short url does not exist'});
         }
      });
   };
   
   this.returnNewShort = function (req, res) {
      var ayylmao2 = req.params[0];
      console.log(ayylmao2);
      var ayylmao = '';
      if (ayylmao2.startsWith("http")) {
         urlindex.findOne({'name': 'index'} , function (err, result) {
            if (err) {
               throw err;
            }
            ayylmao = result.num;
            var tempob = {'original_url': ayylmao2, 'short_url': ayylmao};
            polls.insert(tempob, function (err) {
                  if (err) {
                     throw err;
                  }
                  urlindex.findAndModify({'name': 'index'}, {}, { $inc:  {'num': 1} }, function (err, result) {
                     if (err) {
                        throw err;
                     }
            
                     res.json({'original_url': ayylmao2, 'short_url': 'https://api-projects-naiyucko.c9users.io/short/' + ayylmao});
                  });
                  
               });
         });
      }
      else {
         res.json({'error': 'Invalid URL'});
      }
   };
   
   this.whoami = function (req, res) {
      var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      var lang = req.headers["accept-language"].split(',')[0];
      var os = req.headers['user-agent'];
      res.json({'ipaddress': addr, 'language': lang, 'software': os});
   };

   this.pollVote = function (req, res) {
   	var answer = req.body.poll.toString();
   	var rname = decodeURI(req.params.name).toString();
	var rtitle = decodeURI(req.params.ptitle).toString();
	if (req.params.ptitle.endsWith('?') && !rtitle.endsWith('?')) {
			rtitle += "?";
		}
   	var query = {};
   	query[answer] = parseInt(1);
      polls.findAndModify({'user': rname, 'title' : rtitle}, {}, { $inc:  query }, function (err, result) {
         if (err) {
            throw err;
         }

         res.redirect('/');
      });
   };

   this.resetClicks = function (req, res) {
      clicks.update({}, { 'clicks': 0 }, function (err, result) {
         if (err) {
            throw err;
         }
         res.json(result);
      });
   };
   
   this.addUser = function (req, res, next) {
   		usernames.insert({ 'username': req.body.login, 'password': req.body.password }, function (err) {
               if (err) {
                  throw err;
               }
            });
            next();
	};
	
	this.createPoll = function (req, res, next) {
		var rtitle = decodeURI(req.body.title).toString();
		if (rtitle.endsWith('?')) {
			rtitle = rtitle.substring(0, rtitle.length - 1);
			console.log(rtitle);
		}
		var tempob = {'user' : req.cookies.username, 'title' : rtitle};
		for (var v = 1; v < Object.keys(req.body).length - 1; v++)
		{
			
			var tempagain = "name" + v.toString();
			var tempstring = req.body[tempagain];
			tempob[tempstring] = 0;
		}
		polls.insert(tempob, function (err) {
               if (err) {
                  throw err;
               }
               var urlgo = "/poll/" + req.cookies.username.toString() + "/" + rtitle;
               res.redirect(urlgo);
            });
	}
	
	this.loginCheck = function (req, res, next) {
   		usernames.find({ 'username': req.body.login, 'password': req.body.password }, function (err, result) {
               if (err) {
                  throw err;
               }
               result.toArray(function (err, result) {
               		if (err){
               			throw err;
               		}
               		
	               	if (result.length === 1) {
	               		res.cookie("username" , req.body.login);
	               		res.redirect('/');
	               }
	               else {
	               		res.redirect('/login');
	               }
               })
               
            });
	};
	
	this.isLogged = function (req, res, next) {
		if (req.cookies.username)
		{
			next();
		}
		else
		{
			res.redirect('/login');
		}
	};
	
	this.displayPoll = function (req, res, next) {
		var clickProjection = { '_id': false };
		var rname = decodeURI(req.params.name).toString();
		var rtitle = decodeURI(req.params.ptitle).toString();
		if (req.params.ptitle.endsWith('?') && !rtitle.endsWith('?')) {
			rtitle += "?";
		}
		polls.findOne({'user': rname, 'title' : rtitle}, clickProjection, function (err, result) {
         if (err) {
            throw err;
         }
         if (result) {
            res.json(result);
         } else {
         }
      });
	}
	
	this.viewPoll = function (req, res, next) {
		var clickProjection = { '_id': false };
		var rname = decodeURI(req.params.name).toString();
		var rtitle = decodeURI(req.params.ptitle).toString();
		if (req.params.ptitle.endsWith('?') && !rtitle.endsWith('?')) {
			rtitle += "?";
		}
		polls.findOne({'user': rname, 'title' : rtitle}, clickProjection, function (err, result) {
         if (err) {
            throw err;
         }

         if (result) {
            res.json(result);
         } else {
         }
      });
	}
	
	this.deletePoll = function (req, res, next) {
		var rname = decodeURI(req.params.name).toString();
		var rtitle = decodeURI(req.params.ptitle).toString();
		if (req.params.ptitle.endsWith('?') && !rtitle.endsWith('?')) {
			rtitle += "?";
		}
		polls.remove({'user': rname, 'title' : rtitle}, function (err, result) {
			if (err) {
            throw err;
         }
         res.redirect('/');
		});
	}
}

module.exports = clickHandler;

function isInt(value) {
  !isNaN(value);
}