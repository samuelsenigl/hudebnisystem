var http=require('http')
var https=require('https')
var mysql=require('mysql')
var express=require('express')
var cors=require('cors')
var bcrypt=require('bcrypt')
var crypto=require('crypto')
var jsonwebtoken=require('jsonwebtoken')
const app = express()
const fs = require("fs")
const util = require("util")
var nodemailer=require("nodemailer")

const JWT_SECRET = "DWypKKqWifkiYRHJUkSjuPT4Af3sy5lb1brAt8cbs3JIA0KTGXgiPiWfpoNbRDES"

var options = {
	key: fs.readFileSync('/home/samuel/privkey.pem'),
	cert: fs.readFileSync('/home/samuel/cert.pem'),
};

/*var con = mysql.createConnection({
	host: "127.0.0.1",
	user: "sizej",
	password: "mpracovnisesit",
	database: "sizej",
	charset: "utf8mb4"
});*/

var con = mysql.createPool({
	connectionLimit: 10,
	host: "127.0.0.1",
	user: "sizej",
	password: "mpracovnisesit",
	database: "sizej",
	charset: "utf8mb4"
});

con.getConnection(function(err, connection){
	if(err) throw err;
	console.log("Connected to DB");
	mylog.log("Connected to DB");
});

con.on('error', function(err){
	console.log("[MYSQL ERROR] ", err);
	mylog.log("[MYSQL ERROR]: "+err);
});

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

var loggedUserId = 0
var loggedUserTeamId = 0

function isNumber(n) { return parseFloat(n) == n }

const getPrettyDate = () => new Date().toString().replace(":","-").replace(/00\s\(.*\)/, "").replace(' ${new Date().getFullYear()}', ",").replace(/:\d\d\s/, " ");


var now = new Date();

const yyyy = now.getFullYear();
let mm = now.getMonth() + 1;
let dd = now.getDate();
if(dd<10)dd="0"+dd;
if(mm<10)mm="0"+mm;
var dateNow = yyyy+"_"+mm+"_"+dd;

var timeNow = now.getHours() + ":" + now.getMinutes();
const mylog = new console.Console(
	fs.createWriteStream("//home/samuel/logs/backend_logs_"+dateNow+"_time_"+now.getHours()+"_"+now.getMinutes()+".log")
);


app.use(function(reg, res, next){
	mylog.log("request: "+reg.originalUrl+", time:"+timeNow)
	//con.destroy();
	res.setHeader("Access-Control-Allow-Origin","*")
	res.setHeader("Access-Control-Allow-Methods","DELETE, GET, OPTIONS, PATCH, POST, PUT")
	res.setHeader("Access-Control-Allow-Headers","Origin, Content-Type, Accept, Authorization, access-control-allow-origin, access-cntrol-request-headers")
	res.setHeader("X-Powered-By","Express")
	res.setHeader("Content-Type","application/json; charset=utf-8")
	res.setHeader("Access-Control-Allow-Credentials", true)
	next()
})

/* Check if user logged */
app.use(function(reg, res, next){
	if(reg.originalUrl == "/api/login" || reg.originalUrl == "/api/registration/join" || reg.originalUrl == "/api/registration/new" || reg.originalUrl == "/api/restorePassword"){
		next()
	}
	else if(!reg.headers.token){
		res.statusCode = 200
		//console.log(reg.headers)
		res.json({"result":[], "status": 500, "msg": "ERR_TOKEN_MISSING", "count": 0}).end();
	}
	else {
		console.log(reg.headers.token)
		con.query("SELECT token.id_musician, musician.id_team FROM token INNER JOIN musician ON token.id_musician=musician.id_musician WHERE token.token LIKE ? AND token.token_date > (NOW() - INTERVAL 2 HOUR)", [reg.headers.token], function (err, result, fields) {
			if(err){
				res.statusCode = 200
				res.json({"result":[], "status": 500, "msg": "ERR_TOKEN", "count": 0}).end();
			}
			else if(result.length == 1){
				// update token_date to NOW
				con.query("UPDATE token SET token_date = CURRENT_TIMESTAMP WHERE token LIKE ?", [reg.headers.token], function (err, result, fields) {});
				// save id of logged user and his team
				loggedUserId = result[0].id_musician
				loggedUserTeamId = result[0].id_team
				return next()
			}
			else{
				res.statusCode = 200
				res.json({"result":[], "status": 500, "msg": "ERR_TOKEN_INVALID", "count": 0}).end();
			}
	
		});
	}
})


/* LOGIN */
app.use('/api/login', (reg, res) => {
	var username = reg.body.username
	var password = reg.body.password
	var saltedPass = "sesit"+password
	
	/*bcrypt.hash(saltedPass, 10, function(err, hash){
		console.log(hash)
	})*/
	mylog.log("LETS DO LOGIN")
	mylog.log("username: "+username)
	mylog.log("password: "+password)
	
	
	con.query("SELECT * FROM musician WHERE email = ? LIMIT 1", [username], function (err, result, fields) {
		if(err){
			mylog.log("error when searching for password using email")
			mylog.log(err)
			res.statusCode = 200;
			res.json({loginWasSuccessful: 0, token: ""});
		}
		else {
			mylog.log("account with this email was found")
			console.log("Length: ",result.length)
			if(result.length == 1) {
				// user with this email was found, now I need to compare hashed passwords
				bcrypt.compare(saltedPass, result[0].password, function(err, bcryptResult){
					
					if(bcryptResult){
						mylog.log("correct password and username")
						console.log("correct password and username");
						// generating token
						const token = jsonwebtoken.sign({ user: username }, JWT_SECRET)
						mylog.log("token generated")
						// savind token into DB
						con.query("INSERT INTO token (token, id_musician) VALUES (?,?)", [token, result[0].id_musician], function(err, result, fields) {
							if(err){
								mylog.log("error when inserting token")
								res.statusCode = 200;
								res.json({loginWasSuccessful: 0, token: ""});
							}
							else{
								mylog.log("new token was saved, login was successful")
								res.statusCode = 200;
								res.json({loginWasSuccessful: 1, token: token});
							}
						})
					}
					else {
						mylog.log("wrong password or username")
						console.log("wrong password or username");
						res.statusCode = 200;
						res.json({loginWasSuccessful: 0, token: ""});
					}
				})
			}
			else {
				mylog.log("result was not only one")
				console.log("wrong password or username");
				res.statusCode = 200;
				res.json({loginWasSuccessful: 0, token: ""});
			}
		}
	});
})


/* SONGS */

// SONGS GET ONE
app.use('/api/songs/get/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT * FROM song WHERE id_team = ? AND id_song = ? LIMIT 1", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// SONGS GET ALL
app.use('/api/songs/get', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// prepare query to get all songs of user's team
	var sqlQuery = "SELECT song.*, (SELECT COUNT (*) FROM song WHERE id_team=?) AS COUNT FROM song WHERE id_team = ? ORDER BY title"
	var searchText = ""
	var sqlParameters = [loggedUserTeamId,loggedUserTeamId]
	
	// check if I need to search
	if(reg.query.search){
		sqlQuery = "SELECT song.*, (SELECT COUNT (*) FROM song WHERE id_team=? AND title LIKE ?) AS COUNT FROM song WHERE id_team = ? AND title LIKE ? ORDER BY title"
		searchText = "%"+reg.query.search+"%"
		sqlParameters = [loggedUserTeamId,searchText,loggedUserTeamId,searchText]
	}
	if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
		sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
	}

	// make the SQL request
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result[0].COUNT}).end();
		}
	});
})

// SONGS GET ALL ADVANCED
app.use('/api/songs/get_adv', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Search option: ", reg.body.searchOption)
	console.log("Title: ", reg.body.title)
	console.log("Author: ", reg.body.author)
	console.log("SongKey: ", reg.body.songKey)
	console.log("Capo: ", reg.body.capo)
	console.log("Tags: ", reg.body.tags)
	console.log("Tempo: ", reg.body.tempo)
	var searchOption = reg.body.searchOption;
	var addSearchOption = false;
	
	// prepare query to get all playlists of user's team
	var sqlQuery = "SELECT * FROM song WHERE id_team = ?"
	var sqlParameters = [loggedUserTeamId]
	
	sqlQuery = sqlQuery + " AND ( ";

	// add attribute title to query
	if(reg.body.title && reg.body.title.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " title LIKE ?";
		sqlParameters.push("%"+reg.body.title+"%");
		addSearchOption = true;
	}

	if(reg.body.author && reg.body.author.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " author LIKE ?";
		sqlParameters.push("%"+reg.body.author+"%");
		addSearchOption = true;
	}

	if(reg.body.songKey && reg.body.songKey.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " song_key LIKE ?";
		sqlParameters.push(reg.body.songKey);
		addSearchOption = true;
	}

	if(reg.body.capo && reg.body.capo.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " capo = ?";
		sqlParameters.push(reg.body.capo);
		addSearchOption = true;
	}

	if(reg.body.tempo && reg.body.tempo.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " tempo = ?";
		sqlParameters.push(reg.body.tempo);
		addSearchOption = true;
	}
	
	if(sqlParameters.length == 1)sqlQuery = sqlQuery + " TRUE ) ";
	else sqlQuery = sqlQuery + " ) ";
	
	sqlQuery = sqlQuery + " ORDER BY title";
	
	
	// get count of all
	var count = 0
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// now I have count of all
			count = result.length;
	
			// now add LIMIT and OFFSET to the query
			if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
				sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
			}
	
	
			// make the SQL request
			con.query(sqlQuery, sqlParameters, function (err, result, fields) {
				if(err){
					res.statusCode = 500;
					res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
				}
				else {
					res.statusCode = 200;
					res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": count}).end();
				}
			});
		}
	});
})

// CREATE NEW SONG
app.use('/api/songs/ins', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()

	console.log("Title: ", reg.body.title)
	console.log("Author: ", reg.body.author)
	console.log("Content: ", reg.body.content)
	console.log("Capo: ", reg.body.capo)
	console.log("Tempo: ", reg.body.tempo)
	console.log("Song key: ", reg.body.song_key)
	console.log("Tags: ", reg.body.tags)
	console.log("Note: ", reg.body.note)
	console.log("Song Url: ", reg.body.original_url)
	console.log("Public: ", reg.body.is_public)
	
	// make the SQL request
	con.query("INSERT INTO song (title, author, content, capo, tempo, song_key, shared_note, original_url, is_public, id_team, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [reg.body.title, reg.body.author, reg.body.content, reg.body.capo, reg.body.tempo, reg.body.song_key, reg.body.note, reg.body.original_url, reg.body.is_public, loggedUserTeamId, loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// add tags to the song
			if(reg.body.tags && reg.body.tags.length > 0){
				reg.body.tags.forEach(element => {
					con.query("INSERT IGNORE INTO tag (id_tag) VALUES (?)", [element], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
				reg.body.tags.forEach(element => {
					con.query("INSERT INTO tag_song (id_tag, id_song) VALUES (?,?)", [element, result.insertId], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
			}
			// need to add tags also
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record inserted.", "count": result.length}).end();
		}
	});
})

// UPDATE SONG
app.use('/api/songs/upd/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Tags: ", reg.body.tags)
	
	// make the SQL request
	con.query("UPDATE song SET title=?, author=?, content=?, capo=?, tempo=?, song_key=?, shared_note=?, original_url=?, is_public=? WHERE id_song=? AND id_team=?", [reg.body.title, reg.body.author, reg.body.content, reg.body.capo, reg.body.tempo, reg.body.song_key, reg.body.note, reg.body.original_url, reg.body.is_public, reg.params.id, loggedUserTeamId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// add tags to the song
			if(reg.body.tags && reg.body.tags.length > 0){
				reg.body.tags.forEach(element => {
					con.query("INSERT IGNORE INTO tag (id_tag) VALUES (?)", [element], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
				con.query("DELETE FROM tag_song WHERE id_song=?", [reg.params.id], function (err, result, fields) {});
				reg.body.tags.forEach(element => {
					con.query("INSERT INTO tag_song (id_tag, id_song) VALUES (?,?)", [element, reg.params.id], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
			}
			// need to add tags also
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
		}
	});
})

// DELETE SONG
app.use('/api/songs/del/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("UPDATE song SET is_public=0, id_team=0 WHERE id_song=? AND id_team=?", [reg.params.id,loggedUserTeamId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record deleted.", "count": result.length}).end();
		}
	});
})

/* PLAYLISTS */

// PLAYLISTS GET ONE
app.use('/api/playlists/get/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT * FROM playlist WHERE id_team = ? AND id_playlist = ? LIMIT 1", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// PLAYLISTS GET ALL
app.use('/api/playlists/get', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// prepare query to get all playlists of user's team
	/*var sqlQuery = "SELECT playlist.*, (SELECT COUNT(*) FROM playlist WHERE id_team=?) AS COUNT FROM playlist WHERE id_team = ? ORDER BY date_time DESC"
	var searchText = ""
	var sqlParameters = [loggedUserTeamId,loggedUserTeamId]
	
	// check if I need to search
	if(reg.query.search){
		sqlQuery = "SELECT playlist.*, (SELECT COUNT(*) FROM playlist WHERE id_team=? AND event_name LIKE ?) AS COUNT FROM playlist WHERE id_team = ? AND event_name LIKE ? ORDER BY date_time DESC"
		searchText = "%"+reg.query.search+"%"
		sqlParameters = [loggedUserTeamId,searchText,loggedUserTeamId,searchText]
	}
	if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
		sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
	}
	
	// make the SQL request
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result[0].COUNT}).end();
		}
	});*/
	

	
	// prepare query to get all playlists of user's team
	var sqlQuery = "SELECT playlist.*, GROUP_CONCAT(CONCAT_WS(' ', musician.name, musician.surname) SEPARATOR ', ') AS members FROM playlist LEFT JOIN playlist_musician ON playlist_musician.id_playlist=playlist.id_playlist LEFT JOIN musician ON playlist_musician.id_musician=musician.id_musician WHERE playlist.id_team = ?"
	var sqlParameters = [loggedUserTeamId]
	

	sqlQuery = sqlQuery + " GROUP BY playlist.id_playlist ORDER BY playlist.date_time DESC";
	
	
	// get count of all
	var count = 0
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// now I have count of all
			count = result.length;
	
			// now add LIMIT and OFFSET to the query
			if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
				sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
			}
	
	
			// make the SQL request
			con.query(sqlQuery, sqlParameters, function (err, result, fields) {
				if(err){
					res.statusCode = 500;
					res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
				}
				else {
					res.statusCode = 200;
					res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": count}).end();
				}
			});
		}
	});
	
	
})

// PLAYLISTS GET ALL ADVANCED
app.use('/api/playlists/get_adv', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Search option: ", reg.body.searchOption)
	console.log("EventName: ", reg.body.eventName)
	console.log("Address: ", reg.body.address)
	console.log("Member: ", reg.body.member)
	console.log("Note: ", reg.body.note)
	console.log("Date: ", reg.body.date)
	var searchOption = reg.body.searchOption;
	var addSearchOption = false;
	
	// prepare query to get all playlists of user's team
	var sqlQuery = "SELECT playlist.*, GROUP_CONCAT(CONCAT_WS(' ', musician.name, musician.surname) SEPARATOR ', ') AS members FROM playlist LEFT JOIN playlist_musician ON playlist_musician.id_playlist=playlist.id_playlist LEFT JOIN musician ON playlist_musician.id_musician=musician.id_musician WHERE playlist.id_team = ?"
	var sqlParameters = [loggedUserTeamId]
	
	sqlQuery = sqlQuery + " AND ( ";

	// add attribute eventName to query
	if(reg.body.eventName && reg.body.eventName.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " event_name LIKE ?";
		sqlParameters.push("%"+reg.body.eventName+"%");
		addSearchOption = true;
	}

	if(reg.body.address && reg.body.address.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " address LIKE ?";
		sqlParameters.push("%"+reg.body.address+"%");
		addSearchOption = true;
	}

	if(reg.body.note && reg.body.note.length > 0){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " notes LIKE ?";
		sqlParameters.push("%"+reg.body.note+"%");
		addSearchOption = true;
	}

	if(reg.body.date && reg.body.date != "0000-00-00"){
		if(addSearchOption){ sqlQuery = sqlQuery + " " + searchOption; addSearchOption = false; }
		sqlQuery = sqlQuery + " date_time = ?";
		sqlParameters.push(reg.body.date);
		addSearchOption = true;
	}
	
	if(sqlParameters.length == 1)sqlQuery = sqlQuery + " TRUE ) ";
	else sqlQuery = sqlQuery + " ) ";
	
	sqlQuery = sqlQuery + " GROUP BY playlist.id_playlist ORDER BY playlist.date_time DESC";
	
	
	// get count of all
	var count = 0
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// now I have count of all
			count = result.length;
	
			// now add LIMIT and OFFSET to the query
			if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
				sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
			}
	
	
			// make the SQL request
			con.query(sqlQuery, sqlParameters, function (err, result, fields) {
				if(err){
					res.statusCode = 500;
					res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
				}
				else {
					res.statusCode = 200;
					res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": count}).end();
				}
			});
		}
	});
})

// CREATE NEW PLAYLIST
app.use('/api/playlists/ins', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Title: ", reg.body.title)
	console.log("Datum: ", reg.body.date)
	console.log("Members: ", reg.body.members)
	console.log("Songs: ", reg.body.songs)
	console.log("Note: ", reg.body.note)
	
	// make the SQL request
	con.query("INSERT INTO playlist (id_team, notes, address, date_time, event_name) VALUES (?,?,?,?,?)", [loggedUserTeamId,reg.body.note,reg.body.address,reg.body.date,reg.body.title], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// add members to the playlist
			if(reg.body.members && reg.body.members.length > 0){
				reg.body.members.forEach(element => {
					con.query("INSERT INTO playlist_musician (id_playlist, id_musician) VALUES (?,?)", [result.insertId,element], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
			}
			// add songs to the playlist
			if(reg.body.songs && reg.body.songs.length > 0){
				var index = 1;
				reg.body.songs.forEach(element => {
					con.query("INSERT INTO playlist_song (id_playlist, id_song, playlist_order) VALUES (?,?,?)", [result.insertId,element,index], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
					index = index + 1;
				})
			}
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record inserted.", "count": result.length}).end();
		}
	});
})

// UPDATE PLAYLIST
app.use('/api/playlists/upd/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("UPDATE playlist SET notes=?, address=?, date_time=?, event_name=? WHERE id_playlist=?", [reg.body.note,reg.body.address,reg.body.date,reg.body.title,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// add members to the playlist
			if(reg.body.members && reg.body.members.length > 0){
				con.query("DELETE FROM playlist_musician WHERE id_playlist=?", [reg.params.id], function (err, result, fields) {
					reg.body.members.forEach(element => {
						con.query("INSERT INTO playlist_musician (id_playlist, id_musician) VALUES (?,?)", [reg.params.id,element], function (err, result, fields) {
							if(err){
								res.statusCode = 500;
								res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
							}
						});
					})
				});
			}
			// add songs to the playlist
			if(reg.body.songs && reg.body.songs.length > 0){
				con.query("DELETE FROM playlist_song WHERE id_playlist=?", [reg.params.id], function (err, result, fields) {
					var index = 1;
					reg.body.songs.forEach(element => {
						con.query("INSERT INTO playlist_song (id_playlist, id_song, playlist_order) VALUES (?,?,?)", [reg.params.id,element,index], function (err, result, fields) {
							if(err){
								res.statusCode = 500;
								res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
							}
						});
						index = index + 1;
					})
				});
			}
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
		}
	});
})

// DELETE PLAYLIST
app.use('/api/playlists/del/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	con.query("DELETE FROM playlist_musician WHERE id_playlist=?", [reg.params.id], function (err, result, fields) {});
	con.query("DELETE FROM playlist_song WHERE id_playlist=?", [reg.params.id], function (err, result, fields) {});

	
	// make the SQL request
	con.query("DELETE FROM playlist WHERE id_playlist=? AND id_team=?", [reg.params.id,loggedUserTeamId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record deleted.", "count": result.length}).end();
		}
	});
})

// GET MEMBERS OF CONCRETE PLAYLIST
app.use('/api/playlists/members/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT musician.id_musician, musician.name, musician.surname FROM playlist_musician INNER JOIN musician ON playlist_musician.id_musician=musician.id_musician INNER JOIN playlist ON playlist.id_playlist=playlist_musician.id_playlist WHERE playlist.id_team = ? AND playlist_musician.id_playlist = ?", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// GET SONGS OF CONCRETE PLAYLIST
app.use('/api/playlists/songs/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT song.id_song, playlist_song.playlist_order, song.title, song.capo, song.song_key FROM playlist_song INNER JOIN song ON playlist_song.id_song=song.id_song INNER JOIN playlist ON playlist.id_playlist=playlist_song.id_playlist WHERE playlist.id_team = ? AND playlist_song.id_playlist = ? ORDER BY playlist_song.playlist_order ASC", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

/* TASKS */

// TASKS GET ONE
app.use('/api/tasks/get/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN task_musician ON task.id_task = task_musician.id_task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task_musician.id_musician = ? AND task.id_task = ? GROUP BY task.id_task UNION SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task.created_by = ? AND task.id_task = ? GROUP BY task.id_task LIMIT 1", [loggedUserId,reg.params.id,loggedUserId,reg.params.id], function (err, result, fields) {
	//con.query("SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN task_musician ON task.id_task = task_musician.id_task INNER JOIN musician ON task.created_by=musician.id_musician WHERE (task_musician.id_musician = ? OR task.created_by = ?) AND task.id_task = ? GROUP BY task.id_task LIMIT 1", [loggedUserId,loggedUserId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// TASKS GET ALL
app.use('/api/tasks/get', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	var sqlQuery = "SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN task_musician ON task.id_task = task_musician.id_task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task_musician.id_musician = ? GROUP BY task.id_task UNION SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task.created_by = ? GROUP BY task.id_task ORDER BY date DESC"
	var searchText = ""
	var sqlParameters = [loggedUserId,loggedUserId]
	
	// with the search
	if(reg.query.search){
		// make the SQL request
		searchText = "%"+reg.query.search+"%"
		sqlQuery = "SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN task_musician ON task.id_task = task_musician.id_task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task_musician.id_musician = ? AND title LIKE ? GROUP BY task.id_task UNION SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task.created_by = ? AND task.title LIKE ? GROUP BY task.id_task ORDER BY date DESC"
		sqlParameters = [loggedUserId,searchText,loggedUserId,searchText]
	}
		
	// get count of all
	var count = 0
	con.query(sqlQuery, sqlParameters, function (err, result, fields) {
		if(err){
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// now I have count of all
			count = result.length;
	
			// now add LIMIT and OFFSET to the query
			if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
				sqlQuery = sqlQuery + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
			}
			
			// make the SQL request
			con.query(sqlQuery, sqlParameters, function (err, result, fields) {
				if(err){
					res.statusCode = 500;
					res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
				}
				else {
					res.statusCode = 200;
					res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": count}).end();
				}
			});
		}
	});	
})

// TASKS GET ALL ADVANCED
app.use('/api/tasks/get_adv', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Search option: ", reg.body.searchOption)
	console.log("Title: ", reg.body.title)
	console.log("Content: ", reg.body.content)
	console.log("CreatedBy: ", reg.body.createdBy)
	console.log("SharedWith: ", reg.body.sharedWith)
	console.log("Status: ", reg.body.status)
	var searchOption = reg.body.searchOption;
	var addSearchOption = false;
	
	// prepare query to get all user's tasks
	var sqlQueryGetAllSharedWithUser = "SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN task_musician ON task.id_task = task_musician.id_task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task_musician.id_musician = ?"
	var sqlParametersGetAllSharedWithUser = [loggedUserId]

	// UNION
	var sqlQueryGetAllUserCreated = "SELECT task.*, musician.name AS author_name, musician.surname AS author_surname FROM task INNER JOIN musician ON musician.id_musician=task.created_by WHERE task.created_by = ?"
	var sqlParametersGetAllUserCreated = [loggedUserId]
	
	sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " AND ( ";
	sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " AND ( ";

	if(reg.body.title && reg.body.title.length > 0){
		if(addSearchOption){
			sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " " + searchOption;
			sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " " + searchOption;
			addSearchOption = false;
		}
		sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " title LIKE ?";
		sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " title LIKE ?";
		sqlParametersGetAllSharedWithUser.push("%"+reg.body.title+"%");
		sqlParametersGetAllUserCreated.push("%"+reg.body.title+"%");
		addSearchOption = true;
	}

	if(reg.body.content && reg.body.content.length > 0){
		if(addSearchOption){
			sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " " + searchOption;
			sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " " + searchOption;
			addSearchOption = false;
		}
		sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " content LIKE ?";
		sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " content LIKE ?";
		sqlParametersGetAllSharedWithUser.push("%"+reg.body.content+"%");
		sqlParametersGetAllUserCreated.push("%"+reg.body.content+"%");
		addSearchOption = true;
	}

	if(reg.body.createdBy && reg.body.createdBy.length > 0){
		if(addSearchOption){
			sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " " + searchOption;
			sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " " + searchOption;
			addSearchOption = false;
		}
		sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " created_by = ?";
		sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " created_by = ?";
		sqlParametersGetAllSharedWithUser.push(reg.body.createdBy);
		sqlParametersGetAllUserCreated.push(reg.body.createdBy);
		addSearchOption = true;
	}

	if(reg.body.status && reg.body.status.length > 0){
		if(addSearchOption){
			sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " " + searchOption;
			sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " " + searchOption;
			addSearchOption = false;
		}
		sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " status LIKE ?";
		sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " status LIKE ?";
		sqlParametersGetAllSharedWithUser.push(reg.body.status);
		sqlParametersGetAllUserCreated.push(reg.body.status);
		addSearchOption = true;
	}
	
	if(sqlParametersGetAllSharedWithUser.length == 1)sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " TRUE ) ";
	else sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " ) ";
	
	if(sqlParametersGetAllUserCreated.length == 1)sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " TRUE ) ";
	else sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " ) ";
	
	sqlQueryGetAllSharedWithUser = sqlQueryGetAllSharedWithUser + " GROUP BY task.id_task";
	sqlQueryGetAllUserCreated = sqlQueryGetAllUserCreated + " GROUP BY task.id_task";
		
	var sqlQueryGetCountAll = sqlQueryGetAllSharedWithUser + " UNION " + sqlQueryGetAllUserCreated + " ORDER BY date DESC";
	var sqlParameterGetCountAll = sqlParametersGetAllSharedWithUser.concat(sqlParametersGetAllUserCreated);
	
	console.log(sqlQueryGetCountAll)
	
	// get count of all
	var count = 0
	con.query(sqlQueryGetCountAll, sqlParameterGetCountAll, function (err, result, fields) {
		if(err){
			console.log(err);
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// now I have count of all
			count = result.length;
	
			// now add LIMIT and OFFSET to the query
			if(reg.query.limit && reg.query.offset && isNumber(reg.query.limit) && isNumber(reg.query.offset)){
				sqlQueryGetCountAll = sqlQueryGetCountAll + " LIMIT "+reg.query.limit+" OFFSET "+reg.query.offset
			}
	
	
			// make the SQL request
			con.query(sqlQueryGetCountAll, sqlParameterGetCountAll, function (err, result, fields) {
				if(err){
					res.statusCode = 500;
					res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
				}
				else {
					res.statusCode = 200;
					res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": count}).end();
				}
			});
		}
	});
})

// CREATE NEW TASK
app.use('/api/tasks/ins', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Title: ", reg.body.title)
	console.log("Obsah: ", reg.body.content)
	console.log("Datum: ", reg.body.date)
	console.log("Stav: ", reg.body.status)
	console.log("ShareWith: ", reg.body.shareWith)
	// make the SQL request
	con.query("INSERT INTO task (title, content, date, status, created_by) VALUES (?,?,?,?,?)", [reg.body.title,reg.body.content,reg.body.date,reg.body.status,loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			// share with others
			if(reg.body.shareWith && reg.body.shareWith.length > 0){
				reg.body.shareWith.forEach(element => {
					con.query("INSERT INTO task_musician (id_task, id_musician) VALUES (?,?)", [result.insertId,element], function (err, result, fields) {
						if(err){
							res.statusCode = 500;
							res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
						}
					});
				})
				res.statusCode = 200;
				res.json({"result":result, "status": 200, "msg": "Record inserted.", "count": result.length}).end();
			}
			else {
				res.statusCode = 200;
				res.json({"result":result, "status": 200, "msg": "Record inserted.", "count": result.length}).end();
			}
		}
	});
})

// UPDATE TASK
app.use('/api/tasks/upd/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	

	// make the SQL request
	con.query("UPDATE task SET title=?, content=?, date=?, status=? WHERE id_task = ?", [reg.body.title,reg.body.content,reg.body.date,reg.body.status,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
		}
	});
})

// DELETE TASK
app.use('/api/tasks/del/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("DELETE FROM task WHERE id_task = ?", [reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record deleted.", "count": result.length}).end();
		}
	});
})

// GET MUSICIAN THAT IS CONCRETE TASK SHARED WITH
app.use('/api/tasks/shared/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT musician.id_musician, musician.name, musician.surname FROM musician INNER JOIN task_musician ON musician.id_musician=task_musician.id_musician WHERE task_musician.id_task = ? GROUP BY task_musician.id_musician", [reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// GET TAGS OF ONE SONG
app.use('/api/tags/get/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT tag_song.id_tag FROM tag_song INNER JOIN song ON tag_song.id_song = song.id_song WHERE song.id_team = ? AND song.id_song = ? GROUP BY tag_song.id_tag", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// GET PRIVATE NOTES OF ONE SONG
app.use('/api/notes/get/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT * FROM note WHERE id_song = ? AND id_musician = ?", [reg.params.id,loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// CREATE NEW PRIVATE NOTE
app.use('/api/notes/ins', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("INSERT INTO note (id_song, id_musician, content) VALUES (?,?,?)", [reg.body.songId,loggedUserId,reg.body.content], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record inserted.", "count": result.length}).end();
		}
	});
})

// UPDATE PRIVATE NOTE
app.use('/api/notes/upd/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("UPDATE note SET content = ? WHERE id_note = ? AND id_musician = ?", [reg.body.content,reg.params.id,loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
		}
	});
})

// DELETE PRIVATE NOTE
app.use('/api/notes/del/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("DELETE FROM note WHERE id_note = ? AND id_musician = ?", [reg.params.id,loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Record deleted.", "count": result.length}).end();
		}
	});
})

/* USERS */

// GET LOGGED USER
app.use('/api/users/logged', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT id_musician, name, surname, email FROM musician WHERE id_musician = ?", [loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// UPDATE USER DATA
app.use('/api/users/upd/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	if(reg.body.name && reg.body.surname && reg.body.email){
		// make the SQL request
		con.query("UPDATE musician SET name = ?, surname = ?, email = ? WHERE id_musician = ?", [reg.body.name,reg.body.surname,reg.body.email,reg.params.id], function (err, result, fields) {
			if(err){
				res.statusCode = 500;
				res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
			}
			else {
				res.statusCode = 200;
				res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({"result":[], "status": 200, "msg": "Cannot save, because parameter were not sent.", "count": 0}).end();
	}
})

// UPDATE USER PASSWORD
app.use('/api/users/newpassword', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	con.query("SELECT * FROM musician WHERE id_musician = ?", [loggedUserId], function (err, result, fields) {
		if(err){
			console.log("some error when updating password");
			res.statusCode = 200;
			res.json({passwordChanged: 0});
		}
		else {
			if(result.length == 1 && reg.body.old_password && reg.body.new_password) {
				// user with this email was found, now I need to compare hashed passwords
				var saltedPass = "sesit"+reg.body.old_password
				bcrypt.compare(saltedPass, result[0].password, function(err, bcryptResult){
					
					if(bcryptResult){
						console.log("correct old_password now I can change to new password");
						// savind new password into DB
						
						var newSaltedPass = "sesit"+reg.body.new_password
						bcrypt.hash(newSaltedPass, 10, function(err, hash){
							con.query("UPDATE musician SET password = ? WHERE id_musician = ?", [hash, loggedUserId], function(err, result, fields) {
								if(err){
									console.log("some error when updating password");
									res.statusCode = 200;
									res.json({passwordChanged: 0});
								}
								else{
									console.log("password was changed");
									res.statusCode = 200;
									res.json({passwordChanged: 1});
								}
							})
						})
					}
					else {
						console.log("some error when updating password");
						res.statusCode = 200;
						res.json({passwordChanged: 0});
					}
				})
			}
			else {
				console.log("some error when updating password");
				res.statusCode = 200;
				res.json({passwordChanged: 0});
			}
		}
	});
})

/* TEAM */

// GET MEMBERS OF MY TEAM
app.use('/api/team/members', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	var sqlQuery = "SELECT musician.id_musician, musician.name, musician.surname FROM musician WHERE musician.id_team = ?"
	if(reg.query.notMe && reg.query.notMe == 1){
		sqlQuery = "SELECT musician.id_musician, musician.name, musician.surname FROM musician WHERE musician.id_team = ? AND musician.id_musician <> ?"
	}
	con.query(sqlQuery, [loggedUserTeamId,loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// REMOVE MEMBER FROM TEAM
app.use('/api/teams/members/del/:id', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	console.log("Delete user with ID "+reg.params.id+" from team")
	// check if logged user has rights of team_leader
	con.query("SELECT * FROM role_musician INNER JOIN role ON role_musician.id_role=role.id_role WHERE role_musician.id_musician=? AND role.name LIKE ?", [loggedUserId,"team_leader"], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else if(result.length == 1) {
			console.log("logged user has rights to delete team member")
			con.query("UPDATE musician SET id_team=-1 WHERE id_team=? AND id_musician=?", [loggedUserTeamId,reg.params.id], function (err, result, fields) {});
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
		else {
			console.log("logged user does not have rights to delete team member")
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
	});
})

// JOIN TEAM
app.use('/api/teams/join', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	if(reg.body.code){
		// make the SQL request
		con.query("SELECT id_team FROM team WHERE join_code = ?", [reg.body.code], function (err, result, fields) {
			if(err){
				res.statusCode = 500;
				res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
			}
			else if(result.length == 1) {
				// found the team, now add
				console.log(result[0].id_team)
				con.query("UPDATE musician SET id_team=? WHERE id_team=-1 AND id_musician=?", [result[0].id_team,loggedUserId], function (err, result, fields) {});
				console.log("team joined")
				res.statusCode = 200;
				res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
			}
			else {
				res.statusCode = 500;
				res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({"result":[], "status": 200, "msg": "Cannot save, because parameter were not sent.", "count": 0}).end();
	}
})

// GET TEAM OF LOGGED USER
app.use('/api/teams/logged', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT id_team, name, join_code FROM team WHERE id_team = ?", [loggedUserTeamId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// UPDATE TEAM DATA
app.use('/api/teams/upd', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	if(reg.body.name && reg.body.code){
		con.query("UPDATE team SET name = ?, join_code = ? WHERE id_team = ?", [reg.body.name,reg.body.code,loggedUserTeamId], function (err, result, fields) {
			if(err){
				res.statusCode = 500;
				res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
			}
			else {
				res.statusCode = 200;
				res.json({"result":result, "status": 200, "msg": "Record updated.", "count": result.length}).end();
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({"result":[], "status": 200, "msg": "Cannot save, because parameter were not sent.", "count": 0}).end();
	}
})

/* ROLES */

// GET ROLES OF LOGGED USER
app.use('/api/roles/logged', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	// make the SQL request
	con.query("SELECT role.id_role, role.name FROM role_musician INNER JOIN role ON role.id_role=role_musician.id_role WHERE role_musician.id_musician = ?", [loggedUserId], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
			res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});

})

/* REGISTRATION */

// CREATE NEW ACCOUNT AND JOIN TEAM
app.use('/api/registration/join', (reg, res) => {
	// check if logged
	//if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	if(reg.body.team_code && reg.body.user_email && reg.body.user_name && reg.body.user_surname && reg.body.user_password){
		// check join code validity
		con.query("SELECT * FROM team WHERE join_code = ?", [reg.body.team_code], function (err, result, fields) {
			if(err){
				res.statusCode = 200;
				res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
			}
			else if(result.length == 1) {
				// join code found
				var teamId = result[0].id_team
				console.log("ID: "+teamId)
				var saltedPass = "sesit"+reg.body.user_password
	
				// hash password
				bcrypt.hash(saltedPass, 10, function(err, hash){
					console.log(hash)
					// save all data
					con.query("INSERT INTO musician (name,surname,email,password,id_team,gdpr) VALUES (?,?,?,?,?,\"1\")", [reg.body.user_name, reg.body.user_surname, reg.body.user_email, hash, teamId], function (err, result, fields) {
						if(err){
							console.log(err.code)
							if(err.code == "ER_DUP_ENTRY"){
								res.json({registrationWasSuccessful: 0, errMessage: "Chyba! Pro tento email již účet existuje."});
							}
							else {
								res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
							}
							res.statusCode = 200;
						}
						else {
							con.query("INSERT INTO role_musician (id_role,id_musician) VALUES (3,?)", [result.insertId], function (err, result, fields) {
								if(err){
									res.statusCode = 200;
									res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
								}
								else {
									console.log("no error")
									res.statusCode = 200;
									res.json({registrationWasSuccessful: 1, errMessage: "Registrace byla úspěšná."});
								}
							});
						}
					});
				})
			}
			else {
				res.statusCode = 200;
				res.json({registrationWasSuccessful: 0, errMessage: "Zadaný join kód není platný. Ověřte si u svého vedoucího týmu, zda máte správný join kód."});
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({registrationWasSuccessful: 0, errMessage: "Nevyplnil jste všechna políčka."});
	}
	
})

// CREATE NEW ACCOUNT AND NEW TEAM
app.use('/api/registration/new', (reg, res) => {
	// check if logged
	//if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	if(reg.body.team_name && reg.body.team_code && reg.body.user_email && reg.body.user_name && reg.body.user_surname && reg.body.user_password){
		// Create new team
		con.query("INSERT INTO team (name, join_code) VALUES (?,?)", [reg.body.team_name,reg.body.team_code], function (err, result, fields) {
			if(err){
				if(err.code == "ER_DUP_ENTRY"){
					res.json({registrationWasSuccessful: 0, errMessage: "Chyba! Neplatný join kód, vymyslete prosím jiný."});
				}
				else {
					res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
				}
				res.statusCode = 200;
			}
			else {
				// team was created, now create user
				var teamId = result.insertId
				console.log("ID: "+teamId)
				var saltedPass = "sesit"+reg.body.user_password
	
				// hash password
				bcrypt.hash(saltedPass, 10, function(err, hash){
					console.log(hash)
					// save all data
					con.query("INSERT INTO musician (name,surname,email,password,id_team,gdpr) VALUES (?,?,?,?,?,\"1\")", [reg.body.user_name, reg.body.user_surname, reg.body.user_email, hash, teamId], function (err, result, fields) {
						if(err){
							console.log(err.code)
							if(err.code == "ER_DUP_ENTRY"){
								res.json({registrationWasSuccessful: 0, errMessage: "Chyba! Pro tento email již účet existuje."});
							}
							else {
								res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
							}
							res.statusCode = 200;
						}
						else {
							con.query("INSERT INTO role_musician (id_role,id_musician) VALUES (2,?)", [result.insertId], function (err, result, fields) {
								if(err){
									res.statusCode = 200;
									res.json({registrationWasSuccessful: 0, errMessage: "Chyba na serveru."});
								}
								else {
									console.log("no error")
									res.statusCode = 200;
									res.json({registrationWasSuccessful: 1, errMessage: "Registrace byla úspěšná."});
								}
							});
						}
					});
				})
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({registrationWasSuccessful: 0, errMessage: "Nevyplnil jste všechna políčka."});
	}
	
})

// CREATE NEW ACCOUNT AND JOIN TEAM
app.use('/api/restorePassword', (reg, res) => {
	// check if logged
	//if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	
	if(reg.body.email && reg.body.join_code){
		// check join code validity
		con.query("SELECT * FROM musician WHERE email = ?", [reg.body.email], function (err, result, fields) {
			if(err){
				res.statusCode = 200;
				res.json({restorationWasSuccessful: 0, errMessage: "Chyba na serveru."});
			}
			else if(result.length == 1) {
				// user with received email was found
				var userId = result[0].id_musician
				var teamId = result[0].id_team
				console.log("User ID: "+userId)
				console.log("Team ID: "+teamId)
				
				// now check validity of join_code
				con.query("SELECT * FROM team WHERE id_team = ? AND join_code = ?", [teamId, reg.body.join_code], function (err, result, fields) {
					if(err){
						res.statusCode = 200;
						res.json({restorationWasSuccessful: 0, errMessage: "Chyba na serveru."});
					}
					else if(result.length == 1) {
						// join_code is valid
						
						// generate new password
						var newPassword = crypto.randomBytes(6).toString("base64url");
						console.log(newPassword)
						
						var saltedPass = "sesit"+newPassword
				
						// hash password
						bcrypt.hash(saltedPass, 10, function(err, hash){
							console.log(hash)
							// save new password
							con.query("UPDATE musician SET password = ? WHERE id_musician = ? AND id_team = ?", [hash, userId, teamId], function (err, result, fields) {
								if(err){
									console.log(err.code)
									res.statusCode = 200;
									res.json({restorationWasSuccessful: 0, errMessage: "Chyba na serveru."});
								}
								else {
									
									// new password was saved, now send email
									var transporter = nodemailer.createTransport({
										host: "smtp.seznam.cz",
										port: 587,
										secure: false,
										auth: {
											user: "sizejweb@seznam.cz",
											pass: "mpracovnisesit123"
										}
									});
									
									var mailOptions = {
										from: "sizejweb@seznam.cz",
										to: reg.body.email,
										subject: "Obnova vašeho hesla | Sizej web",
										text: "Dobrý den,\nVaše nové heslo je: "+newPassword+"\n\nMůžete si ho změnit po přihlášení v sekci Administrace účtu.\n\nHezký den,\nSizej web"
									}
									
									transporter.sendMail(mailOptions, function(error, info){
										if(error){
											console.log(error)
										}
										else {
											console.log("Email sent: "+info.response)
										}
									});
									
									console.log("no error")
									res.statusCode = 200;
									res.json({restorationWasSuccessful: 1, errMessage: "Obnova hesla byla úspěšná. Nové heslo vám přišlo na email."});
								}
							});
						})
					
					}
					else {
						res.statusCode = 200;
						res.json({restorationWasSuccessful: 0, errMessage: "Byl zadán nesprávný join kód."});
					}
				});
			}
			else {
				res.statusCode = 200;
				res.json({restorationWasSuccessful: 0, errMessage: "Pro tento email neexistuje žádný účet."});
			}
		});
	}
	else {
		console.log("did not receive data")
		res.statusCode = 200;
		res.json({restorationWasSuccessful: 0, errMessage: "Nevyplnil jste všechna políčka."});
	}
	
})



/* DASHBOARD */

// GET RANDOM SONG
app.use('/api/songs/random', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT * FROM song WHERE id_team = ? ORDER BY RAND() LIMIT 1", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 200;
		    res.json({"result":[], "status": 200, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})

// GET ONE NEAREST FUTURE PLAYLIST
app.use('/api/playlists/next', (reg, res) => {
	// check if logged
	if(loggedUserId == 0 || loggedUserTeamId == 0) return next()
	// make the SQL request
	con.query("SELECT * FROM playlist WHERE id_team = ? AND date_time >= CURDATE() ORDER BY date_time ASC LIMIT 1", [loggedUserTeamId,reg.params.id], function (err, result, fields) {
		if(err){
			res.statusCode = 500;
		    res.json({"result":[], "status": 500, "msg": err, "count": 0}).end();
		}
		else {
			res.statusCode = 200;
			res.json({"result":result, "status": 200, "msg": "Succesfull get.", "count": result.length}).end();
		}
	});
})


app.use('*', (req, res) => {
	res.json({msg: "Hello"}).end();
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpsServer.listen(8000, () => {
	console.log("HTTPS Server running on port 8000");
});

httpServer.listen(8001, () => {
	console.log("HTTP Server running on port 8001");
});

const port = 8000
/*app.listen(port, () => {
	console.log("Server running at port 8000");
})*/

module.exports = con;

/*

http.createServer(function (req, res){
	res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"});
	if(req.url in routes){
		return routes[req.url](req, res);
	}
	res.end("Hello World from createServer method");
}).listen(8000);
console.log("Server running at http://:8000");


var routes = {
	'/': function index (req, res){
		res.writeHead(200);
		res.end("Hello World!");
	},
	'/api/songs/get': function get (req, res){
		con.query("SELECT * FROM song", function (err, result, fields) {
			if(err){
				res.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
				res.end(err);
			}
			res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"});
			res.end(JSON.stringify(result));
		});
	},
	'/api/songs/get/:id': function get (req, res){
		con.query("SELECT * FROM song WHERE id_song = ?", [req.params.id], function (err, result, fields) {
			if(err){
				res.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
				res.end(err);
			}
			res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"});
			res.end(JSON.stringify(result));
		});
	}
}*/
