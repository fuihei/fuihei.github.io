//定义背景星空
var BackScene = function() {
	this.step = function(dt) {
		if (typeof(rainEngine) != "undefined" && rainEngine.drops.length < 35 - loopIntervalAvg / 1.5) {
			rainEngine.addDrop([
				[rndc(3), rndc(2), rndc(5)]
			]);
		}
	}
	var GLASS_COLORS = [baseColor1.RGBtoRGBA(0.4), baseShineColor.RGBtoRGBA(0.4), outerSunColor.RGBtoRGBA(0.4), baseAlerterGreen.RGBtoRGBA(0.4)];
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
		if (PC) {
			ctx.save();
			if (typeof(backCanvas) != "undefined") {
				ctx.drawImage(backCanvas, 0, 0);
			}
			ctx.globalAlpha = 0.85;
			ctx.drawImage(lightCanvas, 0, 0);

			ctx.restore();
			drawEmail(ctx,"17");
			drawLogo(ctx,"25b");
		}
	}
}
var panelGroup = function() {
	this.panels = [
		[],
		[],
		[]
	];
	var lastIndex = [-1, -1, -1];
	var over = 1;
	var normal = 0;
	var below = -1;
	var length = this.panels.length - 1;
	var self = this;
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
						//Tween.clear.call(panel);
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
						//ctx.drawImage(bgd2, 0, 0);
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
		this.ctx.font = base_font["17b"];
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
	if (this.type == TYPES[0]) {
		this.ctx.drawImage(this.value, buttonEdge, buttonEdge);
	} else if (this.type == TYPES[1]) {
		this.ctx.save();
		var gra = this.ctx.createRadialGradient(this.w / 2, this.h / 2, 0, this.w / 2, this.h / 2, this.h / 2 - 10);
		//按钮为灰白色，边缘略微发亮
		this.ctx.shadowOffsetX = 1 * Game.scale;
		this.ctx.shadowOffsetY = 1 * Game.scale;
		this.ctx.shadowColor=baseButtonShadowBlueblur
		gra.addColorStop(0, baseButtonColorMilkWhite);
		gra.addColorStop(1, baseButtonLightMilkWhite);
		this.ctx.fillStyle = gra;
		//画普通形态，灰色阴影和暗蓝字体
		this.ctx.roundRect(buttonEdge, buttonEdge, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, 0.5 * buttonEdge).fill();

		//画targeted形态，蓝色荧光和字体
		this.ctx.shadowColor = baseAlerterGreen;
		this.ctx.roundRect(buttonEdge, buttonEdge + this.h, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, 0.5 * buttonEdge).fill();

		//画locked形态，橘色荧光和字体
		this.ctx.shadowColor = baseButtonShadowBlueblur;
		this.ctx.roundRect(buttonEdge, buttonEdge + 2 * this.h, this.w - 2 * buttonEdge, this.h - 2 * buttonEdge, 0.5 * buttonEdge).fill();
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
	var buttonLine = 60 ;
	var menus = [new Button(0.5 * Game.width-buttonLine, 0.5 * Game.height, 2*buttonLine, buttonLine, "text", CN ? "阅读" : "READ"), new Button(0.5 * Game.width-buttonLine, 0.7 * Game.height, 2*buttonLine, buttonLine, "text", CN ? "获取" : "G E T")];
	this.checkInput = function(dt) {
		for (var i = 0, len = menus.length; i < len; i++) {
			if (Game.touch.X >= menus[i].x && Game.touch.X <= menus[i].x + menus[i].w && Game.touch.Y >= menus[i].y && Game.touch.Y <= menus[i].y + menus[i].h) {
				if (i == 0) {
					//查看分数

				} else if (i == 1) {
					//查看更多
				} 
				return true;
			}
		}
		return false;
	}
	this.drawUI = function(ctx) {
		ctx.save();
		var len = menus.length;
		//Tween.play.call(this);
		for (var i = 0; i < len; i++) {
			menus[i].drawButton(ctx);
		}
		ctx.restore();
	}
	this.addAni = function() {
		//Tween.create.call(this, "alpha", 1, true, function() {}, 0.3, 1, 0.5);
	}
}