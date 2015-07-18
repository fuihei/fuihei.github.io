//定义背景星空
var BackScene = function() {
	this.passTime = 0;
	this.shakeCounts = 0.3;
	this.lightsFullCounts = 1;
	this.step = function(dt) {
		this.passTime += dt;
		if (this.passTime > this.shakeCounts * 10000) {
			this.shakeCounts++;
			var loop = rndc(3);
			Tween.create.call(this, "shake", loop, false, function() {}, 0.5 * Game.width, 1.2 * Game.height, 0.5 * Game.width, 1.2 * Game.height, -0.15, 0.25);

			this.resetLights();
			if (this.shakeCounts > this.lightsFullCounts * 25) {
				this.drawLights();
				this.lightsFullCounts++;
			}
		}

	}
	var GLASS_COLORS = [baseColor1.RGBtoRGBA(0.5), baseShineColor.RGBtoRGBA(0.5), outerSunColor.RGBtoRGBA(0.5), baseAlerterGreen.RGBtoRGBA(0.5)];
	var glassColor = GLASS_COLORS[rndf(4)];
	this.drawLights = function() {
		lightCanvas = document.createElement("canvas");
		lightCanvas.width = Game.width;
		lightCanvas.height = Game.height;
		var lightctx = lightCanvas.getContext("2d");
		lightctx.save();
		//绘制天空白黑渐变
		var wb_gradient = lightctx.createRadialGradient(0.5 * Game.width, Game.height, 0, 0.5 * Game.width, Game.height, Game.height);
		wb_gradient.addColorStop(0, "white");
		wb_gradient.addColorStop(1, "black");
		lightctx.fillStyle = wb_gradient;
		lightctx.fillRect(0, 0, Game.width, Game.height);
		//绘制光线底色
		lightctx.fillStyle = glassColor;
		lightctx.fillRect(0, 0, Game.width, Game.height);
		//绘制星星
		lightctx.fillStyle = "white";
		for (var i = 0; i < 100; i++) {
			var r = rndc(6) / 3;
			lightctx.fillRect(rndf(Game.width), rndf(Game.height), r, r);
		}
		//绘制可见光线
		this.resetLights = function() {
			lightctx.fillStyle = "rgba(255,255,255,0.2)"
			for (var i = 0; i < 1; i++) {
				lightctx.beginPath();
				var start = -Math.PI * (10 + rndf(160)) / 180;
				var end = -Math.PI * (5 + rndf(5)) / 180 + start;
				lightctx.arc(0.5 * Game.width, Game.height, 1.5 * Game.height, start, end, true);
				lightctx.lineTo(0.5 * Game.width, 1.2 * Game.height);
				lightctx.closePath();
				lightctx.fill();
			}
		}
		this.resetLights();
		lightctx.restore();
	}
	this.drawLights();
	this.drawBackImg = function(src) {
		var scale = src.height / Game.height;
		backCanvas = document.createElement("canvas");
		backCanvas.width = Game.width;
		backCanvas.height = Game.height;
		var backCtx = backCanvas.getContext("2d");
		backCtx.drawImage(src, Math.max(0, (src.width - Game.width * scale) / 2), 0, Math.min(src.width, Game.width * scale), src.height, 0, 0, Game.width, Game.height);
	}
	this.draw = function(dt, ctx) {
		ctx.clearRect(0,0,Game.width,Game.height)
		if (PC) {
			ctx.save();
			if (typeof(backCanvas) != "undefined") {
				ctx.drawImage(backCanvas, 0, 0);
			}
			ctx.globalAlpha = 0.6;
			ctx.drawImage(lightCanvas, 0, 0);

			ctx.restore();
			ctx.save()
			Tween.play.call(this);
			drawEmail(ctx, "17");
			drawLogo(ctx, "25b");
			ctx.restore();
		}
	}
}
var panelGroup = function() {
	//同样定义三个层：0底层、1普通层、2顶层
	this.panels = [
		[],
		[],
		[]
	];
	//层内计数
	var lastIndex = [-1, -1, -1];
	//叠加子层
	var over = 1;
	var normal = 0;
	var below = -1;
	var length = this.panels.length - 1;
	var self = this;
	var GLASS_COLORS = [
		[38, 174, 206],
		[205, 105, 90],
		[195, 165, 98],
		[56, 157, 80]
	];
	var random = GLASS_COLORS[rndf(4)];
	//var bgd = createGlass(Game.width, Game.height, random[0], random[1], random[2], 0.6, true);
	var bgd2 = createGlass(Game.width, Game.height, random[0], random[1], random[2], 0.8, true);
	this.setPanel = function(panel, subGroup, group, bool) {
		if (bool) {
			this.panels[group].push([panel, subGroup]);
			if (panel.addAni) {
				panel.addAni();
			}
			lastIndex[group] ++;
		} else {
			for (var i = 0, len = this.panels[group].length; i <= len; i++) {
				if (this.panels[group][i][0] == panel) {
					window.requestFrame(function() {
						self.panels[group].splice(i, 1);
						lastIndex[group] --;
						Tween.clear.call(panel);
					})
					return;
				}
			}
		}
	}
	this.step = function(dt) {
		//倒序查找
		if (Game.touch.touched) {
			for (var j = length; j >= 0; j--) {
				for (var i = lastIndex[j]; i >= 0; i--) {
					//只对非below的查找
					if (this.panels[j][i][1] >= normal) {
						var buttonFound = this.panels[j][i][0].checkInput();
						//console.log(buttonFound)
						//如果找到了，或者是over的，就跳出两层循环
						if (this.panels[j][i][1] >= over || buttonFound) {
							j = -1;
							break;
						}
					}
				}
			}
			Game.touch.touched = false;
			Game.touch.X = null;
			Game.touch.Y = null;
		}
	}
	this.draw = function(dt, ctx) {
		for (var j = 0; j <= length; j++) {
			//先绘制底层的
			for (var i = 0; i <= lastIndex[j]; i++) {
				if (this.panels[j][i][1] == below) {
					this.panels[j][i][0].drawUI(ctx);
				}
			}
			//再绘制上层的
			for (var i = 0; i <= lastIndex[j]; i++) {
				//普通层
				if (this.panels[j][i][1] == normal) {
					this.panels[j][i][0].drawUI(ctx);
				}
				//覆盖层加覆盖背景
				else if (this.panels[j][i][1] == over) {
					ctx.save();
					if (j == 2) {
						ctx.drawImage(bgd2, 0, 0);
						//console.log("2")
					} else {
						//ctx.drawImage(bgd, 0, 0);
					}
					//ctx.fillStyle = baseColor1_alpha;
					//ctx.fillRect(0, 0, Game.width, Game.height);
					ctx.restore();
					this.panels[j][i][0].drawUI(ctx);
				}
			}
		}
	}
}
var Button = function(x, y, w, h, type, value, font, fillStyle) {
	this.buttonCanvas = document.createElement("canvas");
	this.locked = false;
	this.targeted = false;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.type = type;
	this.value = value;
	this.buttonCanvas.width = this.w;
	this.buttonCanvas.height = 3 * this.h;
	this.ctx = this.buttonCanvas.getContext("2d");
	if (font) {
		this.ctx.font = font;
	} else {
		this.ctx.font = base_font["25"];
	}
	if (fillStyle) {
		this.fillStyle = fillStyle;
	}
	this.initialButton();
}
Button.prototype.initialButton = function() {
	var TYPES = ["image", "text"];
	this.ctx.clearRect(0, 0, this.w, 3 * this.h);
	var buttonEdge = 10 * Game.scale;
	var roundEdge=15* Game.scale;
	if (this.type == TYPES[0]) {
		this.ctx.drawImage(this.value, buttonEdge, buttonEdge);
	} else if (this.type == TYPES[1]) {
		this.ctx.save();
		var gra = this.ctx.createRadialGradient(this.w / 2, this.h / 2, 0, this.w / 2, this.h / 2, this.h / 2 - 10);
		//按钮为灰白色，边缘略微发亮
//		this.ctx.shadowOffsetX = 0.5 * Game.scale;
//		this.ctx.shadowOffsetY = 0.5 * Game.scale;
//		this.ctx.shadowColor = baseButtonShadowBlueblur
		gra.addColorStop(0, baseButtonColorMilkWhite);
		gra.addColorStop(1, baseButtonLightMilkWhite);
		this.ctx.fillStyle = gra;
		//画普通形态，灰色阴影和暗蓝字体
		this.ctx.roundRect(buttonEdge, buttonEdge, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, roundEdge).fill();

		//画targeted形态，蓝色荧光和字体
		this.ctx.shadowColor = baseAlerterGreen;
		this.ctx.roundRect(buttonEdge, buttonEdge + this.h, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, roundEdge).fill();

		//画locked形态，橘色荧光和字体
		this.ctx.shadowColor = baseButtonShadowBlueblur;
		this.ctx.roundRect(buttonEdge, buttonEdge + 2 * this.h, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, roundEdge).fill();
		this.ctx.restore();

		this.ctx.save();
		this.ctx.textAlign = "center";
		var fontGra = this.ctx.createLinearGradient(0, 0, this.w, 0);
		//按钮为灰白色，边缘略微发亮
		fontGra.addColorStop(0.1, baseColor1);
		fontGra.addColorStop(0.9, baseAlerterGreen);
		//fontGra.addColorStop(1, baseColor1);
		this.ctx.fillStyle = fontGra;
		if (this.fillStyle) { //特殊处理了，如果自带fillstyle就把按钮第一种状态设成这个
			this.ctx.fillStyle = this.fillStyle;
		}
		//this.ctx.fillStyle = "rgb(79,109,161)";
		this.ctx.fillText(this.value, 0.5 * this.w, (0.6 + 0) * this.h);

		this.ctx.fillStyle = baseAlerterGreenMore;
		//this.ctx.fillStyle = "rgba(71,255,123,1)";
		this.ctx.fillText(this.value, 0.5 * this.w, (0.6 + 1) * this.h);

		this.ctx.fillStyle = baseButtonShadowBlueblur;
		//this.ctx.fillStyle = "rgba(252,182,12,1)";
		this.ctx.fillText(this.value, 0.5 * this.w, (0.6 + 2) * this.h);
		this.ctx.restore();
	}
}

Button.prototype.drawButton = function(ctx) {
	if (this.targeted) {
		ctx.drawImage(this.buttonCanvas, 0, this.buttonCanvas.height / 3, this.buttonCanvas.width, this.buttonCanvas.height / 3, this.x, this.y, this.buttonCanvas.width, this.buttonCanvas.height / 3);
	} else if (this.locked) {
		ctx.drawImage(this.buttonCanvas, 0, 2 * this.buttonCanvas.height / 3, this.buttonCanvas.width, this.buttonCanvas.height / 3, this.x, this.y, this.buttonCanvas.width, this.buttonCanvas.height / 3);
	} else {
		ctx.drawImage(this.buttonCanvas, 0, 0, this.buttonCanvas.width, this.buttonCanvas.height / 3, this.x, this.y, this.buttonCanvas.width, this.buttonCanvas.height / 3);
	}
}
var menuBoard = function() {
	var buttonLine = 65;
	var buttonWidth= 65;
	var menus = [new Button(0.5 * Game.width -0.5*buttonWidth, 0.7 * Game.height, buttonWidth, buttonLine, "text", CN ? "Ο" : "Ο"), new Button(0.5 * Game.width - 0.5*buttonWidth, 0.5 * Game.height, buttonWidth, buttonLine, "text", CN ? "Δ" : "Δ")];
	this.checkInput = function(dt) {
		for (var i = 0, len = menus.length; i < len; i++) {
			if (Game.touch.X >= menus[i].x && Game.touch.X <= menus[i].x + menus[i].w && Game.touch.Y >= menus[i].y && Game.touch.Y <= menus[i].y + menus[i].h) {
				if (i == 0) {
					if (typeof(publishboard) == "undefined") {
						publishboard = new publishBoard();
					}
					mainPanel.setPanel(publishboard, 1, 2, true);
					mainPanel.setPanel(menuboard, 1, 1, false);

				} else if (i == 1) {
					if (typeof(authorboard) == "undefined") {
						authorboard = new authorBoard();
					}
					mainPanel.setPanel(authorboard, 1, 2, true);
					mainPanel.setPanel(menuboard, 1, 1, false);
				}
				return true;
			}
		}
		return false;
	}
	this.drawUI = function(ctx) {
		ctx.save();
		var len = menus.length;
		Tween.play.call(this);
		for (var i = 0; i < len; i++) {
			menus[i].drawButton(ctx);
		}
		ctx.strokeStyle = baseColor2More;
		ctx.beginPath();
		ctx.lineWidth = 0.5;
		ctx.globalAlpha = 0.3;
		ctx.moveTo(0.3 * Game.width, 0.4 * Game.height+5);
		ctx.lineTo(0.7 * Game.width, 0.4 * Game.height+5);
		ctx.stroke();
		ctx.restore();
	}
	this.addAni = function() {
		Tween.create.call(this, "alpha", 1, true, function() {}, 0.1, 1, 1);
	}
}
var authorBoard = function() {
	var helps = CN ? "电梯下坠是什么感觉？请体验最真实刺激，又富于挑战和技巧的电梯事故模拟游戏。\n◆真实刺激◆\n周围频频摇晃，狭小的空间里你却无处躲藏。 重金属墙面剧烈的碰撞，突然脚下一轻，你整个人失去了重量。 慌乱中你摸索到一个电梯键，却因为制动力量过大，反而电梯绳断裂……在巨大惯性力量的冲击下，你以远超百米赛跑的速度砸在了地板上！\n一句著名的谚语“天亮了”，描述的就是这种绝处逢生的感觉。 当面临压力时，你是否也有这种感觉呢？\n◆极限挑战◆\n故事总有另一面——天亮了胜者为王！ 在你保命的同时，也可以挑战时间之王！速度之王！反应之王！回旋之王！事故之王！生存之王！ 从九阶籍籍无名，到高阶世界冠军，在“人梯共振”的感官刺激中走向高潮，赢取辉煌奖励！\n◆围观作者◆\nwww.9squaregame.com\nweibo.com/9squaregame \n微信订阅号：9square\n" : "Your know the desperate feeling of lift fall? This is the most REAL and EXCITING lift accident simulation game,full of CHALLENGES and TACTICS.\n◆REAL && MOST EXCITING◆\nShaking frequently all around,but you have nowhere to hide in this narrow space. Heavy metal strucks the iron wall hardly and unstoppablely,suddenly a loose under feet hits you,and you can't even feel gravity or breath! \nIn a immediate hurry,you find a button and request it to brake,unfortunatelly it's too close,and the huge force causes the lift rope to break! Huge inertia brings you to the ground with a speed of far more than 100 meter racing!\n◆EXTREMES && GREAT CHALLENGE◆\nOf course,there's another side of this Resonating Coin. While you try to survive from these accidents,you can also push your limits and challenge for the Crown of BEST TIME,BEST SPEED,BEST REACTION,BEAT TAI CHI,MOST ACCIDENTS,BEST SURVIVAL,which leads you from the Ninth Grade Nameless to the First Grade GODLIKE! \nAfter you master the skills and tactics of how to resonate with lift,you will feel great honor and happiness,which brings you to the heaven of climax,and awards you crowns!\n◆FEELINGS && ORDINARY'S LOVE◆\nDawn,or daybreak,symbolize this feeling of survive from desperation and abyss.\nWe make this game,to remember the ordinary people's feeling when facing great pressure.We love you and encourage you to survive!\nAnd especially to my Chinese friends.\n◆KNOW MORE && ABOUT AUTHOR◆\nwww.9squaregame.com\ntwitter: @springmid\n"
	var height = Game.ctx.wrapText(helps, 0.1 * Game.width, 0, 0.8 * Game.width, 20 * Game.scale, "", true);
	this.checkInput = function(dt) {
		mainPanel.setPanel(authorboard, 1, 2, false);
		mainPanel.setPanel(menuboard, 1, 1, true);
		return true;
	}
	this.drawUI = function(ctx) {
		ctx.save();
		Tween.play.call(this);

		ctx.font = base_font["12"];
		ctx.textAlign = "left";
		ctx.wrapText(helps, 0.1 * Game.width, - height+Game.height, 0.8 * Game.width, 20 * Game.scale, "", false);
		closeTips.draw(ctx);
		ctx.restore();
	}
	this.addAni = function() {
		Tween.create.call(this, "translate", 1, true, function() {}, "linear", 0, height, 0, 0, (height/20)*(Game.width/320));
	}
}
var publishBoard = function() {
	var publish = CN ? "游戏已经可以申请APPSTORE BETA测试，请发送邮件至springmid@icloud.com获取邀请" : "now we accept beta test request in APPSTORE,please send email to springmid@icloud.com to get invitation"
	this.checkInput = function(dt) {
		mainPanel.setPanel(publishboard, 1, 2, false);
		mainPanel.setPanel(menuboard, 1, 1, true);
		return true;
	}
	this.drawUI = function(ctx) {
		ctx.save();
		Tween.play.call(this);

		ctx.font = base_font["12"];
		ctx.textAlign = "center";
		ctx.wrapText(publish, 0.5 * Game.width, 0.4 * Game.height, 0.8 * Game.width, 20 * Game.scale, "", false);
		closeTips.draw(ctx);
		ctx.restore();
	}
	this.addAni = function() {
		Tween.create.call(this, "alpha", 1, true, function() {}, 0.3, 1, 0.5);
	}
}