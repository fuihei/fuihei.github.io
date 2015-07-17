//PC不为真则是移动设备
PC = (function() {
	var userAgentInfo = navigator.userAgent;
	//弹窗浏览器和设备信息
	//alert(userAgentInfo)
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) >= 0) {
			flag = false;
			break;
		}
	}
	return flag;
})();
var Game = new function() {
	//游戏原始尺寸
	var fullFill = true;
	var ORIGINAL_WIDTH = PC ? 640 : 320;
	var ORIGINAL_HEIGHT = 480;
	base_font = {
		10: 10 + "px bangers",
		12: 12 + "px bangers", //小
		14: 14 + "px bangers", //中
		15: 15 + "px bangers",
		17: 17 + "px bangers", //大
		"12b": "bold " + 12 + "px bangers",
		"14b": "bold " + 14 * +"px bangers",
		"15b": "bold " + 15 + "px bangers", //按键专用
		"17b": "bold " + 17 + "px bangers", //成就标题专用
		"20b": "bold " + 20 + "px bangers", //皇冠符号专用
		"22b": "bold " + 22 + "px bangers", //游戏标题专用
		"25b": "bold " + 25 + "px bangers",
	}
	this.initial = function(callNext) {
		this.innerWidth = window.innerWidth;
		this.innerHeight = window.innerHeight;

		if (!PC && this.innerHeight < this.innerWidth) {
			alert(CN ? "本游戏竖屏体验最佳" : "this game displays in portrait best");
			var screenMax = Math.max(window.screen.width, window.screen.height);
			var screenMin = Math.min(window.screen.width, window.screen.height);
			this.innerHeight = this.innerWidth * (0.9 * screenMax / screenMin);
		}
		this.width = ORIGINAL_WIDTH;
		this.height = fullFill ? Math.floor(ORIGINAL_WIDTH * this.innerHeight / this.innerWidth) : ORIGINAL_HEIGHT;
		this.scale = 1;

		this.fullRate = fullFill ? this.innerWidth / this.width : 1;

		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = this.width * this.fullRate;
		this.canvas.height = this.height * this.fullRate;
		this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
		if (!this.ctx) {
			alert(text.h5_unsupported);
		}
		this.ctx.scale(this.fullRate, this.fullRate);
		//初始化三个游戏图层，场景层0，UI层1，动画层2，绘制顺序依次往上
		this.layers = [
			[],
			[],
			[]
		];
		//定义添加和删除图层方法
		this.addLayer = function(layer, sub) {
			Game.layers[sub].push(layer);
		}
		this.delLayer = function(layer, sub) {
			window.requestFrame(function() {
				Game.layers[sub].splice(Game.layers[sub].indexOf(layer), 1);
			})
		}
		this.setInput = function() {
			this.touch = {
				pageX: null,
				pageY: null,
				touched: false,
				X: null,
				Y: null
			};
			var singleTouch;
			if (!PC) {
				window.addEventListener("touchstart", function(e) {
					e.preventDefault();
					if (!Game.touch.touched) { //这里要加上判定，上一次touch未处理完时不接收新的touch，否则有的时候会连按两次
						singleTouch = e.touches[0];
						Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
						Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

						Game.touch.touched = true;
						Game.touch.X = Game.touch.pageX / Game.fullRate;
						Game.touch.Y = Game.touch.pageY / Game.fullRate;
						Game.touch.pageX = null;
						Game.touch.pageY = null;
					}
				}, false)
			} else {
				window.addEventListener("mousedown", function(e) {
					e.preventDefault();
					singleTouch = e;
					if (!Game.touch.touched) {
						Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
						Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

						Game.touch.touched = true;
						Game.touch.X = Game.touch.pageX;
						Game.touch.Y = Game.touch.pageY;
						Game.touch.pageX = null;
						Game.touch.pageY = null;
					}
				}, false)
			}

		}
		this.setInput();
		mainPanel = new panelGroup();
		this.addLayer(mainPanel, 1);

		var loopLastTime = 0;
		loopInterval = 0;
		//定义游戏渲染循环
		this.loop = function(time) {
				loopInterval = Math.round(time - loopLastTime);
				loopIntervalAvg = typeof(loopIntervalAvg) != "undefined" ? (loopIntervalAvg + loopInterval) / 2 : loopInterval;
				for (var i = 0, len = Game.layers.length; i < len; i++) {
					for (var j = 0, innerLen = Game.layers[i].length; j < innerLen; j++) {
						//调用每个图层的step和draw方法
						if (Game.layers[i][j]) {
							Game.layers[i][j].step(loopInterval);
							Game.layers[i][j].draw(loopInterval, Game.ctx);
						}
					}
				}
				//保存当次时间供下次使用
				loopLastTime = time;
				window.requestFrame(Game.loop);
			}
			//启动游戏渲染循环
		window.requestFrame(Game.loop);
		callNext();
	}
	list = window.localStorage;
	var playedTimes = !list.played ? 0 : (parseInt(list.played));
	list.played = playedTimes + 1;

	baseAlerterGrey = "rgba(142,142,147,1)"; //苹果推荐灰色
	baseAlerterGreen = "rgb(76,217,100)"; //苹果推荐绿色
	baseAlerterGreenMore = "rgba(76,237,100,1)"; //增加了20点绿色用于文字非按钮
	baseAlerterRed = "rgba(255,59,48,1)"; //苹果推荐红色

	baseColor1 = "rgb(58,194,226)"; //twitter蓝色，用于背景天顶和按钮
	baseColor2 = "rgb(153,190,237)"; //天空中部灰蓝色
	baseColor2More = "rgb(153,220,237)"; //增加了40点绿色用于文字非按钮
	baseShineColor = "rgb(245,135,110)"; //天空底部橘红色
	centerSunColor = "rgb(255,251,255)"; //太阳亮白
	innerSunColor = "rgb(245,245,128)"; //太阳亮黄
	outerSunColor = "rgb(245,225,128)"; //太阳浅黄

	baseButtonColorMilkWhite = "rgb(222,221,219)"; //苹果键盘米白
	baseButtonLightMilkWhite = "rgb(242,245,238)"; //苹果键盘米白亮
	baseButtonShadowGrey = "rgb(81,77,91)"; //阴影
	baseButtonShadowBlueblur = "rgb(0,210,255)";
}
var callLoadStage = function() {
	backscene = new BackScene();
	Game.addLayer(backscene, 0);

	Loader.load(callGameStage);
	Game.addLayer(Loader, 0);
}
var callGameStage = function() {
	Game.delLayer(Loader, 0);
	menuboard = new menuBoard();
	mainPanel.setPanel(menuboard, 1, 1, true);
}