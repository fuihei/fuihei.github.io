var Loader = new function() {
	//定义资源全局数量和加载数量
	var IMGS = 2,
		ALL = IMGS;
	res_loaded = 0;
	//定义load方法
	this.load = function(callNext) {
		//首先加载图片，初始化一个图片数组
		this.imgs = [];
		//逐个创建图片对象
		for (i = 0; i < IMGS; i++) {
			this.imgs[i] = new Image();
		};
		//逐个给图片传入id
		this.imgs[0].id = (PC ? "p" : "m") + rndf(4)+ ".jpg";
		this.imgs[1].id="title.png"
		//逐个给图片传入地址
		for (i = 0; i < IMGS; i++) {
			this.imgs[i].src = "img/" + this.imgs[i].id;
			this.imgs[i].onload = function() {
				res_loaded++;
			}
		}
			this.imgs[0].onload = function() {
				res_loaded++;
				if (PC) {
					backscene.drawBackImg(this);
				} else {
					rainCanvas = document.createElement("canvas");
					rainCanvas.width = Game.width;
					rainCanvas.height = Game.height;
					rainCtx = rainCanvas.getContext("2d");
					rainCtx.drawImage(Loader.imgs[0], (Loader.imgs[0].width - Game.width / Game.scale) / 2, 0, Game.width / Game.scale, Game.height / Game.scale, 0, 0, Game.width, Game.height);

					rainEngine = new RainyDay({
						image: rainCanvas,
						canvas: Game.canvas,
					});
					rainEngine.rain([
						[rndc(3), rndc(2), 5 + rndc(5)]
					]);
					Game.addLayer(rainEngine, 0);
				};
			}		
		//loader每次循环检查什么放在这里
		this.step = function(dt) {
			if (res_loaded == ALL)
				callNext();
		};
	};
	//如果有延迟加载，放在这个方法
	this.delayLoad = function() {};
	//loader每次渲染什么放在这里
	this.draw = function(dt, ctx) {
		//准备添加居中白色文字
		//		ctx.save()
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.font = base_font["17"];
		//添加加载进度和FPS
		ctx.fillText(CN ? ("准备进入：" + res_loaded + " / " + ALL) : ("entering:" + res_loaded + " / " + ALL), Game.width / 2, Game.height / 2);
		//ctx.fillText("FPS：" + Game.fps, Game.width - 100, Game.height - 40);
		//		ctx.restore();
	};
};