var Observable = require('FuseJS/Observable');
var Environment = require('FuseJS/Environment');
var Storage = require("FuseJS/Storage");
var qreader = require('Qreader');
var txt = Observable();
var txt_2 = Observable();
var history_done = Observable();
var bg_image = Observable("Images/orange_bg_low.png");
var events = Observable(
		{ id: 0, color: Observable("#FBD263"), name: "Register device and check that you have internet connection", weekday: "*: ", is_added: Observable(), change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(false), history_done: Observable(true) }
	);
// var events = Observable();
var user_id_img = Observable(0);
var user_id_text = Observable(0);
var progression = Observable("0");
var collective_progression_1 = Observable("0");
var collective_progression_2 = Observable("0");
var collective_progression_4 = Observable("0");
var collective_progression_5 = Observable("0");
var SAVENAME = "data.json";
var user_id = 0;
var load_program_visibility = Observable("Visible");
var send_program_visibility = Observable("Collapsed");

// Scan QR code
function load () {
	if(Environment.mobile) {
		// https://github.com/zean00/fuse-qreader
		qreader.scan().then(function (res) {
			user_id_img.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+res;
			user_id_text.value = res;
			txt.value = res;
			txt_2.value = txt.value;
			// var object = read_file_content();
			// if (isEmpty(object) || object.id == 0) {
			// 	object = {};
			// 	console.log("file did not exist");
			// }
			// object.id = txt.value;
			// txt_2.value = JSON.stringify(object);
			// Storage.write(SAVENAME, JSON.stringify(object));
		});
	} else {
		txt.value = Math.floor(Math.random() * Math.floor(100000));
		user_id_img.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+txt.value;
		user_id_text.value = txt.value;
		txt_2.value = txt.value;
		// var object = {};
		// var object = read_file_content();
		// if (isEmpty(object) || object.id == 0) {
		// 	object = {};
		// 	console.log("file did not exist");
		// }
		// object.id = txt.value;
		// txt_2.value = JSON.stringify(object);
		// Storage.write(SAVENAME, JSON.stringify(object));
	}
	console.log(txt.value);
}
function validate_code() {
	console.log("-----"+txt.value);
	console.log("This value should be validated through server: "+txt.value);
	var body = "action=get_user_details&password="+txt.value;
    var url = "http://koikka.work/100syke/100syke.php";
    fetch(url, {
        method: 'POST',
        headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
        body: body,
        cache: false
    }).then(function(response) {
        if(response.ok) {
            // var json = JSON.parse(response._bodyText);
            console.log(response._bodyText);
            // json.action = action;
            // callback(json);
            var json = JSON.parse(response._bodyText);
            console.log(json.status);
            if (json.status) {
	            var object = read_file_content(false);
				if (isEmpty(object) || object.id == 0) {
					object = {};
					console.log("file did not exist");
				}
				object.id = txt.value;
				object.user_id = json.id;
				console.log("------------------ "+json.id);
				txt_2.value = "SUCCESS";//JSON.stringify(response._bodyText);
				Storage.write(SAVENAME, JSON.stringify(object));
			} else {
				console.log("--- THIS WAS NOT VALID PASSWORD ---");
				txt_2.value = "ERROR";//JSON.stringify(response._bodyText);
			}
   //          user_id_img.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+txt.value;
			// user_id_text.value = txt.value;
        } else {
            console.log("False HTTP response : "+response.status);
        }
    }).catch(function(err) {
        if(err != "SyntaxError: Unexpected end of input") {
            // An error occurred somewhere in the Promise chain
            console.log("Server error : "+err);
        } else{
            console.log("SERVER SYNTAX ERROR");
        }
    });
}
function load_program() {
	read_file_content_2(false).then(function(object) {
		if (isEmpty(object) || object.id == 0 || object.user_id === undefined) {
			console.log("can not make query with empty credintials: "+object);
		} else {
			console.log("load user "+object.user_id+" program");
			var body = "action=request_user_calendar&id="+object.user_id;
		    var url = "http://koikka.work/100syke/100syke.php";
		    fetch(url, {
		        method: 'POST',
		        headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
		        body: body,
		        cache: false
		    }).then(function(response) {
		        if(response.ok) {
		        	var json = JSON.parse(response._bodyText);
		        	events.value = [];
					if (json.status) {
						var data = JSON.parse(json.data);
						var tasks_done = json.tasks_done;
						var weekday_arr = ["mo", "tu", "we", "th", "fr", "sa", "su"];
						var weekday_name = ["MA", "TI", "KE", "TO", "PE", "LA", "SU"];
						// console.log(data[weekday_arr[i]]);
						for (var i = 0; i < weekday_arr.length; i++) {
							var is_done = false;
							for (var k = 0; k < tasks_done.length; k++) {
								// console.log("--"+tasks_done[k].event);
								if (tasks_done[k].event == data[weekday_arr[i]] && tasks_done[k].day == weekday_arr[i]) {
									is_done = true;
								}
							}
							console.log("*"+weekday_arr[i]);
							console.log("+"+data[weekday_arr[i]]);
							if (is_done) {
								events.add({ id: weekday_arr[i], color: Observable("#1EB917"), name: data[weekday_arr[i]], is_added: Observable(), weekday: weekday_name[i]+": ", change_color: Observable(true), change_color_false: Observable(false), done_week: Observable(true), history_done: Observable(true) });
							} else {
								events.add({ id: weekday_arr[i], color: Observable("#FFC535"), name: data[weekday_arr[i]], is_added: Observable(), weekday: weekday_name[i]+": ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(false), history_done: Observable(false) });
							}
							// } else {
								// events.add({ id: weekday_arr[i], color: Observable("#AED6F1"), name: data[weekday_arr[i]], is_added: Observable(), weekday: "MA: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
							// }
						}
						if ((json.tasks_percent*4) < 5) {
							progression.value = "-"+((json.tasks_percent*4));
						} else {
							progression.value = "-"+((json.tasks_percent*4)-5);
						}
						progression.value = "-"+json.tasks_percent;
						console.log("progression: "+progression.value);
						load_program_visibility.value = "Collapsed";
						send_program_visibility.value = "Visible";
						collective_progression_1.value = "-"+(Math.floor(Math.random() * 50)+1);
						collective_progression_2.value = "-"+(Math.floor(Math.random() * 70)+1);
						collective_progression_4.value = "-"+(Math.floor(Math.random() * 100)+1);
						collective_progression_5.value = "-"+(Math.floor(Math.random() * 20)+1);
						console.log(collective_progression_1.value);
						console.log(collective_progression_2.value);
						console.log(collective_progression_4.value);
						console.log(collective_progression_5.value);
						// progression.value="-100";

						// events.add({ id: "mo", color: Observable("#AED6F1"), name: data.mo, is_added: Observable(), weekday: "MA: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "tu", color: Observable("#AED6F1"), name: data.tu, is_added: Observable(), weekday: "TI: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "we", color: Observable("#AED6F1"), name: data.we, is_added: Observable(), weekday: "KE: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "th", color: Observable("#AED6F1"), name: data.th, is_added: Observable(), weekday: "TO: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "fr", color: Observable("#AED6F1"), name: data.fr, is_added: Observable(), weekday: "PE: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "sa", color: Observable("#AED6F1"), name: data.sa, is_added: Observable(), weekday: "LA: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// events.add({ id: "su", color: Observable("#AED6F1"), name: data.su, is_added: Observable(), weekday: "SU: ", change_color: Observable(false), change_color_false: Observable(false), done_week: Observable(data.done) });
						// console.log(data.mo);
						// console.log(data.tu);
						// console.log(data.we);
						// console.log(data.th);
						// console.log(data.fr);
						// console.log(data.sa);
						// console.log(data.su);
					} else {
						console.log("--- THIS WAS NOT VALID QUERY ---");
					}
		        } else {
		            console.log("False HTTP response : "+response.status);
		        }
		    }).catch(function(err) {
		        if(err != "SyntaxError: Unexpected end of input") {
		            // An error occurred somewhere in the Promise chain
		            console.log("Server error : "+err);
		        } else{
		            console.log("SERVER SYNTAX ERROR");
		        }
		    });
		}
	}).catch(function(error) {
		console.log('Error: ' + error)
	});
}
function selected(arg) {
	console.log(arg.data.name);
	console.log(arg.data.id);
	console.log(arg.data.history_done.value);
	if (!arg.data.history_done.value) {
		if (arg.data.name.length > 0) {
			if (arg.data.change_color.value) {
				arg.data.change_color.value = false;
				arg.data.done_week.value = false;
			} else {
				arg.data.change_color.value = true;
				arg.data.done_week.value = true;
			}
		} else if (arg.data.id <= 0) {
			arg.data.change_color_false.value = true;
			setTimeout(function() {
				arg.data.change_color_false.value = false;
			}, 300);
			setTimeout(function() {
				arg.data.change_color_false.value = true;
			}, 600);
			setTimeout(function() {
				arg.data.change_color_false.value = false;
			}, 900);
		} else {
			arg.data.change_color_false.value = true;
			setTimeout(function() {
				arg.data.change_color_false.value = false;
			}, 300);
			setTimeout(function() {
				arg.data.change_color_false.value = true;
			}, 600);
			setTimeout(function() {
				arg.data.change_color_false.value = false;
			}, 900);
		}
	}
}
function send_program() {
	console.log("send_program");
	read_file_content_2(false).then(function(object) {
		if (isEmpty(object) || object.id == 0 || object.user_id === undefined) {
			console.log("can not make query with empty credintials: "+object);
		} else {
			console.log("load user "+object.user_id+" program");
			// console.log(JSON.stringify(events));
			for (var i = 0; i < events._values.length; i++) {
				// console.log(JSON.stringify(events._values[i]));
				// console.log(JSON.stringify(events._values[i].done_week));
				if (events._values[i].done_week != null && events._values[i].name.length > 0) {
					var history = events._values[i].history_done._values[0];
					var name = events._values[i].name;
					var day = events._values[i].id;
					var status_bool = events._values[i].done_week._values[0];
					var status = 0;
					if (status_bool) {
						status = 1;
					}
					// console.log("Event: "+events._values[i].name+", status: "+events._values[i].done_week._values[0]+", history: "+events._values[i].history_done._values[0]);
					if (!history) {
						console.log(day+": "+name);
						var body = "action=save_done_task&id="+object.user_id+"&task="+name+"&day="+day+"&status="+status;
					    var url = "http://koikka.work/100syke/100syke.php";
					    fetch(url, {
					        method: 'POST',
					        headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
					        body: body,
					        cache: false
					    }).then(function(response) {
					    	// If want to do something
					    	console.log(response._bodyText);
					    	load_program();
						}).catch(function(err) {
					        if(err != "SyntaxError: Unexpected end of input") {
					            // An error occurred somewhere in the Promise chain
					            console.log("Server error : "+err);
					        } else{
					            console.log("SERVER SYNTAX ERROR");
					        }
					    });
					}
					// console.log(JSON.stringify(events._values[i].done_week._values[0]));
					// console.log(JSON.stringify(events._values[i].history_done._values[0]));
				}
			}
		}
	}).catch(function(error) {
		console.log('Error: ' + error)
	});
	// console.log(events)
}
// Check is json empty
function isEmpty(obj) {
	for(var key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
}
// Read local file
function read_file_content(on_start) {
	/* Reads all items on startup */
	Storage.read(SAVENAME).then(function(content) {
		console.log("content: "+content);
		content = JSON.parse(content);
		console.log("ID: "+content.id);
		user_id = content.id;
		// Set user id in qr code
		if (on_start) {
			user_id_img.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+user_id;
			user_id_text.value = user_id;
		}
		return content;
	}, function(error) {
		//For now, let's expect the error to be because of the file not being found.
		// welcomeText.value = "There is currently no local data stored";
		console.log(SAVENAME);
		console.log("some error while reading data: "+error);
		return "{\"id\": 0}";
	});
}
function read_file_content_2(on_start) {
	/* Reads all items on startup */
	return new Promise(function (resolve, reject) {
		Storage.read(SAVENAME).then(function(content) {
			console.log("content: "+content);
			content = JSON.parse(content);
			console.log("ID: "+content.id);
			user_id = content.id;
			// Set user id in qr code
			if (on_start) {
				user_id_img.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+user_id;
				user_id_text.value = user_id;
			}
			resolve(content);
		}, function(error) {
			//For now, let's expect the error to be because of the file not being found.
			// welcomeText.value = "There is currently no local data stored";
			console.log(SAVENAME);
			console.log("some error while reading data: "+error);
			reject("{\"id\": 0}");
		});
	});
}
read_file_content(true);
module.exports = {
	load: load,
	txt: txt,
	txt_2: txt_2,
	user_id_img: user_id_img,
	user_id_text: user_id_text,
	validate_code: validate_code,
	load_program: load_program,
	events: events,
	selected: selected,
	send_program: send_program,
	history_done: history_done,
	bg_image: bg_image,
	progression: progression,
	load_program_visibility: load_program_visibility,
	send_program_visibility: send_program_visibility,
	collective_progression_1: collective_progression_1,
	collective_progression_2: collective_progression_2,
	collective_progression_4: collective_progression_4,
	collective_progression_5: collective_progression_5
};