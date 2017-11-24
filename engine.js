var Engine = {

	/** achievements **/
	achievements: [
		{ name: "Idle for x10", toGet: ["totalidle", 10], bonus: 10, achieved: false },
		{ name: "Idle for x100", toGet: ["totalidle", 100], bonus: 100, achieved: false },
		{ name: "500 Cookies", toGet: ["cookies", 100], bonus: 100, achieved: false }
	],

	/** buyables **/
	buyables: {
		levelling: [
			{ name: "Small Speed boost", cost: 10, effect: ["speed", 250], purchased: false },
			{ name: "Fast Speed boost", cost: 20, effect: ["speed", 500], purchased: false },
			{ name: "Very Fast Speed boost", cost: 30, effect: ["speed", 1000], purchased: false }
		],
		items: [
			{ name: "Small Knife", cost: 10, effect: ["weapon", 1.5], purchased: false },
			{ name: "Hunting Knife", cost: 20, effect: ["weapon", 2], purchased: false },
			{ name: "Machete", cost: 30, effect: ["weapon", 2.5], purchased: false }
		]
	},

	/** display and Interactions **/
	clickables: {
		pause: null,
		paused: null,
		save: null,
		load: null,
		deleteSave: null
	},
	display: {
		paused: null,

		levelling: null,
		items: null,

		progress: null,
		status: null,
		cookies: null
	},

	/** player Stats **/
	player: {
		cookies: 0,
		health: 100,
		strength: 1,
		level: 1,
		totalIdle: 0,
		weapon: 0,
		inventory: []
	},

	/** Variables **/
	paused: false,
	idleTimePiece: null,
	timeThen: new Date().getTime(),
	timeNow: new Date().getTime(),
	ticks: 0,
	idleSpeed: 3000,

	/** pause **/
	pause: function () {
		if (Engine.paused == false) {
			clearTimeout(Engine.idleTimePiece);
			$('#progressvalue').stop();
			Engine.display.paused.style.display = "block";
			Engine.paused = true;
		} else {
			Engine.idleTimer();
			Engine.display.paused.style.display = "none";
			Engine.paused = false;
		}
	},

	/** Check achievements **/
	checkAchievements: function () {
		for (var a = 0; a < Engine.achievements.length; a++) {
			if (Engine.achievements[a].achieved == false) {
				switch (Engine.achievements[a].toGet[0]) {
					case "totalidle":
						if (Engine.player.totalIdle == Engine.achievements[a].toGet[1]) {
							Engine.status("Achievement Gained: " + Engine.achievements[a].name);
							Engine.achievements[a].achieved = true;
							Engine.player.cookies += Engine.achievements[a].bonus;
							Engine.display.cookies.innerHTML = Engine.player.cookies;
						}
						break;
					case "cookies":
						if (Engine.player.cookies == Engine.achievements[a].toGet[1]) {
							Engine.status("Achievement Gained: " + Engine.achievements[a].name);
							Engine.achievements[a].achieved = true;
							Engine.player.cookies += Engine.achievements[a].bonus;
							Engine.display.cookies.innerHTML = Engine.player.cookies;
						}
						break;
					default:
						alert("ERROR");
						break;
				}
			}
		}
	},

	/** Update Shop **/
	updateBuyables: function () {
		Engine.display.levelling.innerHTML = "";
		Engine.display.items.innerHTML = "";
		var levellingHTML = "";
		for (var l = 0; l < Engine.buyables.levelling.length; l++) {
			if (Engine.buyables.levelling[l].purchased == false) {
				levellingHTML += '<li name="' + l + '">'
					+ Engine.buyables.levelling[l].name
					+ ' - cost: ' + Engine.buyables.levelling[l].cost
					+ '</li>';
			}
		}
		Engine.display.levelling.innerHTML = levellingHTML;
		var itemsHTML = "";
		for (var l = 0; l < Engine.buyables.items.length; l++) {
			if (Engine.buyables.items[l].purchased == false) {
				itemsHTML += '<li name="' + l + '">'
					+ Engine.buyables.items[l].name
					+ ' - cost: ' + Engine.buyables.items[l].cost
					+ '</li>';
			}
		}
		Engine.display.items.innerHTML = itemsHTML;
		var levellingChildren = Engine.display.levelling.childNodes;
		for (var lc = 0; lc < levellingChildren.length; lc++) {
			levellingChildren[lc].addEventListener("click", function () {
				var thisIndex = parseInt(this.getAttribute("name"));
				Engine.buyLevelling(thisIndex);
				return false;
			});
		}
		itemsChildren = Engine.display.items.childNodes;
		for (var lc = 0; lc < itemsChildren.length; lc++) {
			itemsChildren[lc].addEventListener("click", function () {
				var thisIndex = parseInt(this.getAttribute("name"));
				Engine.buyItems(thisIndex);
				return false;
			});
		}

	},

	/** Buy a level **/
	buyLevelling: function (index) {
		if (Engine.player.cookies >= Engine.buyables.levelling[index].cost) {
			Engine.player.cookies -= Engine.buyables.levelling[index].cost;
			Engine.buyables.levelling[index].purchased = true;
			switch (Engine.buyables.levelling[index].effect[0]) {
				case "speed":
					clearTimeout(Engine.idleTimePiece);
					$('#progressvalue').stop().css("width", "0%");
					Engine.idleSpeed -= Engine.buyables.levelling[index].effect[1];
					Engine.idleTimer();
					break;
				default:
					alert("ERROR");
					break;
			}
			Engine.updateBuyables();
			Engine.display.cookies.innerHTML = Engine.player.cookies;
		} else {
			Engine.status("Not enough Cookies!");
		}

	},

	/** Buy an Item **/
	buyItems: function (index) {
		if (Engine.player.cookies >= Engine.buyables.items[index].cost) {
			Engine.player.cookies -= Engine.buyables.items[index].cost;
			Engine.buyables.items[index].purchased = true;
			switch (Engine.buyables.items[index].effect[0]) {
				case "weapon":
					Engine.player.weapon = Engine.buyables.items[index].effect[1];
					break;
				default:
					break;
			}
			Engine.updateBuyables();
			Engine.display.cookies.innerHTML = Engine.player.cookies;
		} else {
			Engine.status("Not enough Cookies!");
		}
	},

	/** Show a status **/
	status: function (text) {
		Engine.clickables.status.innerHTML = text;
		setTimeout(function () {
			Engine.clickables.status.innerHTML = "";
		}, 3000);
	},

	/** save **/
	save: function () {
		var tmpsavefile = JSON.stringify(Engine.player);
		window.localStorage.setItem("savefile", tmpsavefile);
		var tmpidleSpeed = JSON.stringify(Engine.idleSpeed);
		window.localStorage.setItem("saveidlespeed", tmpidleSpeed);
		var tmpbuyables = JSON.stringify(Engine.buyables);
		window.localStorage.setItem("savebuyables", tmpbuyables);
		var tmpachievements = JSON.stringify(Engine.achievements);
		window.localStorage.setItem("saveachievements", tmpachievements);
		Engine.status("saved!");
	},

	/** load **/
	load: function () {
		if (!window.localStorage.getItem("savefile")) {
			Engine.status("No save file present for load!");
		} else {
			var tmpsavefile = window.localStorage.getItem("savefile");
			Engine.player = JSON.parse(tmpsavefile);
			Engine.idleSpeed = JSON.parse(window.localStorage.getItem("saveidlespeed"));
			Engine.buyables = JSON.parse(window.localStorage.getItem("savebuyables"));
			Engine.achievements = JSON.parse(window.localStorage.getItem("saveachievements"));
			Engine.status("loaded successfully!");
			Engine.display.cookies.innerHTML = Engine.player.cookies;
		}
	},

	/** deleteSave **/
	deleteSave: function () {
		if (!window.localStorage.getItem("savefile")) {
			Engine.status("No save file present for deletion");
		} else {
			window.localStorage.removeItem("savefile");
			Engine.status("deleteSaved successfully!");
		}
	},

	/** Start Idle Timer **/
	idleTimer: function () {
		Engine.timeNow = new Date().getTime();
		var timeDifference = Engine.timeNow - Engine.timeThen - Engine.ticks;
		while (timeDifference >= Engine.idleSpeed) {
			Engine.player.cookies++;
			Engine.display.cookies.innerHTML = Engine.player.cookies;
			timeDifference -= Engine.idleSpeed;
			Engine.ticks += Engine.idleSpeed;
			Engine.player.totalIdle++;
			Engine.checkAchievements();
		}

		var idleTime = Engine.idleSpeed - timeDifference;

		$("#progressvalue").animate({
			width: "100%"
		}, idleTime, function () {
			$(this).css("width", "0%");
		});

		Engine.idleTimePiece = setTimeout(Engine.idleTimer, idleTime);
	},

	/** initialisation **/
	init: function () {
		Engine.display.paused = document.getElementById("paused");

		Engine.clickables.pause = document.getElementById("pause");
		Engine.clickables.pause.addEventListener("click", function () {
			Engine.pause();
			return false;
		});

		Engine.clickables.paused = document.getElementById("paused");
		Engine.clickables.paused.addEventListener("click", function () {
			Engine.pause();
			return false;
		});

		Engine.display.levelling = document.getElementById("levelling");
		Engine.display.items = document.getElementById("items");

		Engine.display.progress = document.getElementById("progressvalue");
		Engine.clickables.status = document.getElementById("status");

		Engine.clickables.save = document.getElementById("save");
		Engine.clickables.save.addEventListener("click", function () {
			Engine.save();
			return false;
		});

		Engine.clickables.load = document.getElementById("load");
		Engine.clickables.load.addEventListener("click", function () {
			Engine.load();
			return false;
		});

		Engine.clickables.deleteSave = document.getElementById("delete");
		Engine.clickables.deleteSave.addEventListener("click", function () {
			Engine.deleteSave();
			return false;
		});

		Engine.display.cookies = document.getElementById("cookies");
		Engine.idleTimer();

		if (window.localStorage.getItem("savefile")) {
			Engine.load();
		}

		Engine.updateBuyables();
	}

};

/** Start Already! **/
window.onload = function () {
	Engine.init();
};
