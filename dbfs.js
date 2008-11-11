/*
function t(s) {
	var t = new Date();
	if (!window.startTime) {
		window.startTime = t.getTime();
	}
	
	console.log((t.getTime() - window.startTime) + ' ' + s);
}
*/


if (window.t) t('go');

function jsLoader(d) {
	var head = document.getElementsByTagName('head')[0];
	var s = document.createElement('script');
	s.textContent = (d);
	head.appendChild(s);
}

function cssLoader(d) {
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.textContent = (d);
	head.appendChild(style);
}

window.dbfsLoaded = {};

function dbfs() {
	this.db = null;
	
	// load mutlitple asnyc
	this.loadm = function(urls, callback, reload) {
		for(var i = 0; i < urls.length; i++) {
			var sdb = new dbfs();
			sdb.load(urls[i], callback, reload);
		}
	};
	
	// load multiple sync
	this.loadms = function(urls, callback, reload, finalCallback) {
		if(urls.length < 1) {
			if(finalCallback) return finalCallback();
			
			return;
		}
		
		if(callback == null) callback = function(data) { return data; };
				
		var url = urls.shift();
		
		this.load(url, function(data) {
			if(window.t) t(url + ' loaded');
			data = callback(data);
			if(window.t) t(url + ' callback executed');
			var sdb = new dbfs();
			sdb.loadms(urls, callback, reload, finalCallback);
			return data;
		}, reload);
	};
	
	this.getMTime = function(url) {
		var t = this.mtimes[url];
		if(!t) t = '2008-06-27 20:02:00'; 
		return this.mtimes[url];
	};
	
	this.load = function(url, callback, reload) {
		if(reload == undefined) var reload = true;
		
		if(window.dbfsLoaded[url] & !reload) return;
		
		if (callback == null) callback = function(data) { return data; };
		if(this.db == null) this.db = this.openDb();
		
		this.loadFromDb(url, callback);		
	};
	
	this.loadHttp = function(url, callback) {
		var xmlHttpReq = false;
		var self = this;
		/*
		// Mozilla/Safari
		if (window.XMLHttpRequest) {
			self.xmlHttpReq = new XMLHttpRequest();
		}
		// IE
		else if (window.ActiveXObject) {
			self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
		}
		*/
		self.xmlHttpReq = new XMLHttpRequest();
		self.xmlHttpReq.open('GET', url, true);
		self.xmlHttpReq.setRequestHeader('Content-Type', 'application/javascript');
		self.xmlHttpReq.onreadystatechange = function() {
			if (self.xmlHttpReq.readyState == 4) {
				var data = self.xmlHttpReq.responseText;
				self.writeToDb(url, data);
				callback(data);
				window.dbfsLoaded[url] = true;
			}
		};
		self.xmlHttpReq.send('');
	};
	
	this.openDb = function() {
		if (!window.openDatabase)
			return null;
			
		if(window.dbfsDb) return window.dbfsDb;
		window.dbfsDb = openDatabase('dbfs', '1.0', 'Offline File Storage', 262144);
		return window.dbfsDb;
	};
	
	this.loadFromDb = function(url, callback) {
		var self = this;
				
		if((document.location.hash == '#reload') || (this.db == null)  || (this.dontUseDb)) {
			self.loadHttp(url, callback);
			return;
		}

		var lMod = this.getMTime(url);
		
		this.db.transaction(function(t) {
			t.executeSql('SELECT * FROM files WHERE url = ? AND added >= ?', [url, lMod], function(t, r) {
				if(r.rows.length == 0) {
					self.loadHttp(url, callback);
				} else {
					//console.log(r.rows.item(0).modified);
					callback(r.rows.item(0).data);
					window.dbfsLoaded[url] = true;
				}
			}, function(t, r) {
				// in case of emergency (table not found...)
				console.log(r.message);
				self.loadHttp(url, callback);
			});
		});
	};
	
	this.writeToDb = function(url, data) {
		
		if(!this.db) return;
		
		var lMod = this.getMTime(url);
		
		this.db.transaction(function(t) {
			//t.executeSql('DROP TABLE files;', [], jsdbNdh, errorHandler);
			t.executeSql('CREATE TABLE files(url TEXT NOT NULL, data TEXT, added DATETIME);', [], function() {} , function(t, r) {});
			t.executeSql('DELETE FROM files WHERE url = ?;', [url]);
			t.executeSql('INSERT INTO files (url, data, added) VALUES (?, ?, ?);', [url, data, lMod], function() {}, function(t, r) {
				console.log(r.message);
			});
		});
	
	};
};
