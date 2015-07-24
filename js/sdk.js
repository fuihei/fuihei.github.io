var drawLogo = function(ctx, size) {
	ctx.save();
	ctx.shadowOffsetX = 2 * Game.scale;
	ctx.shadowOffsetY = 2 * Game.scale;
	ctx.shadowColor = baseAlerterGrey;
	ctx.font = base_font[size];
	var gra = ctx.createLinearGradient(0, 0, Game.width, 0);
	gra.addColorStop(0, baseColor1);
	gra.addColorStop(1, baseAlerterGreen);
	ctx.fillStyle = gra;
	ctx.fillText(CN ? "天亮了之人梯共振" : "Dawn:Resonate with Lift", 0.5 * Game.width, (PC ? 0.15 : 0.1) * Game.height);
	ctx.restore();
	ctx.save();
	ctx.globalAlpha = 0.5;
	var h = 0.4 * Game.height + 5;
	ctx.drawImage(Loader.imgs[1], (Game.width - h) / 2 + 2, 0, h, h);
	ctx.restore();
}
var drawEmail = function(ctx, size) {
	ctx.save();
	ctx.shadowOffsetX = 2 * Game.scale;
	ctx.shadowOffsetY = 2 * Game.scale;
	ctx.shadowColor = baseAlerterGrey;
	ctx.fillStyle = baseButtonLightMilkWhite;
	ctx.textAlign = "center";
	ctx.font = base_font["10"];
	ctx.fillText(CN ? "支持邮箱：springmid@icloud.com" : "EMAIL: springmid@icloud.com", 0.5 * Game.width, 0.9 * Game.height);
	ctx.font = base_font["10"];
	ctx.fillText(CN ? "weibo.com/9squaregame 微信订阅号：9square" : "twitter: @springmid_", 0.5 * Game.width, 0.95 * Game.height)
	ctx.restore();
}
var closeTips = {
	draw: function(ctx) {
		ctx.save();
		ctx.textAlign = "center";
		ctx.font = base_font["12"];
		ctx.fillStyle = baseColor2More;
		ctx.fillText(CN ? "任意点击返回" : "Tap anywhere to return", 0.5 * Game.width, 0.9 * Game.height);
		ctx.restore();
	}
}
var Tween = {
	//这里加参数，后面的arg裁减个数也要改
	create: function(func, loop, canPlus, callback) {
		//现在除了可以指定循环次数，还可以同类型顺序叠加，不然用callback叠加中间会断帧
		//异类型也是可以叠加的
		this.canRun = true;
		this.runTimes = 0;
		this.runMaxTimes = loop;
		this.callback = this.callback ? (canPlus ? this.callback : callback) : callback;
		this.nowFrame = 0;
		this.frameTypes = this.frameTypes ? (canPlus ? this.frameTypes : []) : [];
		this.plusAllFrame = this.plusAllFrame ? (canPlus ? this.plusAllFrame : 0) : 0;
		this.frameEvents = !this.frameEvents ? {
			translate: [],
			rotate: [],
			scale: [],
			globalAlpha: [],
			imgData: []
		} : (canPlus ? this.frameEvents : {
			translate: [],
			rotate: [],
			scale: [],
			globalAlpha: [],
			imgData: []
		});
		var args = Array.prototype.slice.call(arguments, 4);
		Tween[func].apply(this, args);
	},
	play: function() {
		if (this.canRun) {
			if (this.nowFrame < this.plusAllFrame) {
				this.frameEvents.translate.length != 0 && Game.ctx.translate(this.frameEvents.translate[2 * this.nowFrame], this.frameEvents.translate[2 * this.nowFrame + 1]);
				if (this.frameEvents.rotate.length != 0) {
					Game.ctx.translate(this.frameEvents.rotate[this.nowFrame][1], this.frameEvents.rotate[this.nowFrame][2]);
					Game.ctx.rotate(this.frameEvents.rotate[this.nowFrame][0]);
					Game.ctx.translate(-1 * this.frameEvents.rotate[this.nowFrame][1], -1 * this.frameEvents.rotate[this.nowFrame][2]);
				}
				if (this.frameEvents.scale.length != 0) {
					//这里也可以用另一种方法：先translate sx，再缩放dx，再translate -sx，即等同于一次translate：（1-dx）*sx
					//Game.ctx.translate(this.frameEvents.scale[3 * this.nowFrame + 1], this.frameEvents.scale[3 * this.nowFrame + 2]);					
					//Game.ctx.scale(this.frameEvents.scale[3 * this.nowFrame], this.frameEvents.scale[3 * this.nowFrame]);
					Game.ctx.translate(this.frameEvents.scale[0], this.frameEvents.scale[1]);
					Game.ctx.scale(this.frameEvents.scale[this.nowFrame + 2], this.frameEvents.scale[this.nowFrame + 2]);
					Game.ctx.translate(-1 * this.frameEvents.scale[0], -1 * this.frameEvents.scale[1]);
				}
				this.frameEvents.globalAlpha.length != 0 && (Game.ctx.globalAlpha = this.frameEvents.globalAlpha[this.nowFrame]);
				this.nowFrame++;
			} else {
				this.runTimes++;
				if (this.runTimes < this.runMaxTimes) {
					this.nowFrame = 0;
				} else {
					this.canRun = false;
					this.nowFrame = null;
					this.allFrame = null;
					this.frameTypes = null;
					this.plusAllFrame = null;
					this.frameEvents = undefined;
					this.callback.call(this);
					//this.callback = null;
				}
			}
		}
	},
	clear: function() {
		this.runTimes = this.runMaxTimes;
		this.canRun = false;
		this.nowFrame = null;
		this.allFrame = null;
		this.frameTypes = null;
		this.plusAllFrame = null;
		this.frameEvents = undefined;
		this.callback = null;
	},
	translate: function(type, sx, sy, ex, ey, duration) {
		//注意这里的sx ex都是指偏移，需要加上对象自身的draw坐标才是最终动画坐标
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		for (var i = 0; i < this.allFrame; i++) {
			this.frameEvents.translate.push(Tween[type](i, sx, ex - sx, this.allFrame));
			this.frameEvents.translate.push(Tween[type](i, sy, ey - sy, this.allFrame));
		}
		Tween.addFrameByType.call(this, 4);
		//console.log(this.allFrame)
	},
	scale: function(type, sx, sy, begining, ending, duration) {
		//注意这里的sx sy是指缩放中心点
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		this.frameEvents.scale.push(sx, sy);
		for (var i = 0; i < this.allFrame; i++) {
			var nowScale = Tween[type](i, begining, ending - begining, this.allFrame)
			this.frameEvents.scale.push(nowScale);
			//this.frameEvents.scale.push((1 - nowScale) * sx, (1 - nowScale) * sy);
		}
		//console.log(this.frameEvents.scale)
		Tween.addFrameByType.call(this, 1);
	},
	alpha: function(st, et, duration) {
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		for (var i = 0; i < this.allFrame; i++) {
			this.frameEvents.globalAlpha.push(st + i * (et - st) / this.allFrame);
		}
		Tween.addFrameByType.call(this, 3);
	},
	shake: function(sx, sy, ex, ey, arcPerSecond, duration) {
		//注意这里的sx ex是指震动中心点的路径
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		var single = {
			arc: Math.round(arcPerSecond * loopIntervalAvg) / 1000,
			rx: (ex - sx) / this.allFrame,
			ry: (ey - sy) / this.allFrame
		}
		var frames = {
			//求半侧震动内帧数，结果向下取整，即到终点后多震动1帧
			half: Math.floor(this.allFrame / 2),
			isHalfFrameInt: this.allFrame % 2 == 0 ? true : false
		}

		//求单程（1/4）震动内帧数，结果向上取整，即在最高点和下一程重叠1帧
		frames.quarterFrame = Math.ceil(frames.half / 2);
		frames.isQuarterFrameInt = frames.half % 2 == 0 ? true : false;
		//对前1/4推入i个弧度
		for (var i = 0; i < frames.quarterFrame; i++) {
			this.frameEvents.rotate.push([single.arc * (i + 1), single.rx * (i + 1) + sx, single.ry * (i + 1) + sy]);
		}
		//镜像到1/4-1/2内
		for (var i = frames.quarterFrame, j = 1; i < frames.half; i++) {
			this.frameEvents.rotate.push([frames.isQuarterFrameInt ? this.frameEvents.rotate[i - j][0] : this.frameEvents.rotate[i - j - 1][0], single.rx * (i + 1) + sx, single.ry * (i + 1) + sy]);
			//			this.frameEvents.rotate.push();
			//			j += 2;
		}
		//镜像负数到1/2-1内
		for (var i = frames.half; i < 2 * frames.half; i++) {
			this.frameEvents.rotate.push([-this.frameEvents.rotate[i - frames.half][0], single.rx * (i + 1) + sx, single.ry * (i + 1) + sy]);
			//this.frameEvents.rotate.push();
		}
		//如果有，则追加1个尾帧
		if (!frames.isHalfFrameInt) {
			this.frameEvents.rotate.push([this.frameEvents.rotate[0], ex, ey]);
			//this.frameEvents.rotate.push();
		}
		//console.log(this.frameEvents.rotate)
		Tween.addFrameByType.call(this, 2);
	},
	linear: function(t, b, c, d) {
		//无缓动
		return c * t / d + b;
	},
	back: function(t, b, c, d) {
		//超过范围的三次方缓动
		var s = 1.7;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	addFrameByType: function(type) {
		this.frameTypes.push(type);
		var last = this.frameTypes.length - 1;
		//同类型，或者只有一个动画时，帧数增加；异类型，帧数不用改变，需要自己控制好和之前的动画帧数关系(通常应小于等于)
		//用否定符号判断是否存在比较坑爹，如果这个数等于0，也会判断会false
		if (!this.frameTypes[last - 1] || this.frameTypes[last] == this.frameTypes[last - 1]) {
			this.plusAllFrame += this.allFrame;
		}
	}
}
CN = (function() {
	var userLang = navigator.language;
	if (userLang.indexOf("zh") >= 0) return true;
	else return false;
})();
window.requestFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		// if all else fails, use setTimeout
		function(callback) {
			return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
		};
})();
//取0-(n-1)随机数（向下）
function rndf(n) {
	return Math.floor(Math.random() * n);
}

function rndf_pn(n) {
	var positive = Math.random() >= 0.5 ? true : false;
	if (positive) {
		return Math.floor(Math.random() * n);
	} else {
		return -1 * Math.floor(Math.random() * n);
	}
}

//取1-n随机数（向上）
function rndc(n) {
	return Math.ceil(Math.random() * n);
};

function rd(n) {
	return Math.round(n);
}
CanvasRenderingContext2D.prototype.wrapText = function(text, x, y, maxWidth, lineHeight, colors, bool) {
	//拆分成多段
	var originY = y;
	var lines = text.split("\n");
	//遍历每段
	for (var i = 0; i < lines.length; i++) {
		if (colors) {
			this.fillStyle = colors[i];
		}
		//英文按空格拆分单行，中文全部拆分
		var words = lines[i].split(CN ? '' : ' ');
		//当前行置空
		var line = '';
		//遍历每行，直到宽度大于测试宽度才填充，并开始新的一句
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + (CN ? '' : ' ');
			var metrics = this.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				if (!bool) {
					this.fillText(line, x, y);
				}
				line = words[n] + (CN ? '' : ' ');
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		if (!bool) {
			this.fillText(line, x, y);
		}
		y += lineHeight;
	}
	//console.log("end_y:" + y + ";start_y:" + originY)
	if (bool) return y - originY;
}
var createGlass = function(w, h, r, g, b, a, bool) {
	glassCanvas = document.createElement("canvas");
	glassCanvas.width = w;
	glassCanvas.height = h;
	var glassCtx = glassCanvas.getContext("2d");
	var alignWidth = bool;
	var tempWidth = alignWidth ? h : w;
	var tempHeight = alignWidth ? w : h;
	var textureWidthAvg = 5 * Game.scale;
	var textureWidthFloat = 2 * Game.scale;
	var textureWidthSum = 0;
	var textureColorAvg1 = r;
	var textureColorAvg2 = g;
	var textureColorAvg3 = b;
	var textureColorFloat = 3;
	var alpha = a;
	for (var i = 0; i < tempWidth; i++) {
		var textureWidth = textureWidthAvg + rndf_pn(textureWidthFloat);
		var textureColor1 = textureColorAvg1 + rndf_pn(textureColorFloat);
		var textureColor2 = textureColorAvg2 + rndf_pn(textureColorFloat);
		var textureColor3 = textureColorAvg3 + rndf_pn(textureColorFloat);
		glassCtx.fillStyle = "rgba(" + textureColor1 + "," + textureColor2 + "," + textureColor3 + "," + alpha + ")";
		textureWidthSum += textureWidth;
		if (textureWidthSum >= tempWidth) {
			textureWidth -= (textureWidthSum - tempWidth);
			textureWidthSum -= (textureWidthSum - tempWidth);
			i = tempWidth;
		}
		if (alignWidth) {
			//这里起始点因为先加sum判断，所以要减回去
			glassCtx.fillRect(0, textureWidthSum - textureWidth, tempHeight, textureWidth);
		} else {
			glassCtx.fillRect(textureWidthSum - textureWidth, 0, textureWidth, tempHeight);
		}
	}
	return glassCanvas;
}
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
	//	if (w & lt; 2 * r) r = w / 2;
	//	if (h & lt; 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x + r, y);
	this.arcTo(x + w, y, x + w, y + h, r);
	this.arcTo(x + w, y + h, x, y + h, r);
	this.arcTo(x, y + h, x, y, r);
	this.arcTo(x, y, x + w, y, r);
	// this.arcTo(x+r, y);
	this.closePath();
	return this;
}
String.prototype.RGBtoRGBA = function(alpha) {
	var colorArray = this.split("");
	var alphaArray = "," + alpha.toString();
	colorArray.splice(3, 0, "a");
	colorArray.splice(-1, 0, alphaArray);
	return colorArray.join("");
}
var text = {
	h5_unsupported: CN ? "感谢你的喜爱\n请选择新版支持html5的浏览器，或搜索同名APP进行游戏！" : "Thank you for choosing our game\nplease choose a latest-version broswer that supports html5,or search our APP to play!",
}
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;