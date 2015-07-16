var drawLogo=function(ctx,size){
			ctx.save();
		ctx.shadowOffsetX = 2 * Game.scale;
		ctx.shadowOffsetY = 2 * Game.scale;
		ctx.shadowColor = baseAlerterGrey;
		ctx.font = base_font[size];
		var gra = ctx.createLinearGradient(0, 0, Game.width, 0);
		gra.addColorStop(0, baseColor1);
		gra.addColorStop(1, baseAlerterGreen);
		ctx.fillStyle = gra;
		ctx.fillText(CN ? "天亮了之人梯共振" : "Dawn:Resonate with Lift", 0.5 * Game.width,  (PC?0.15:0.1)*Game.height);
		ctx.restore();
		ctx.save();
		ctx.globalAlpha = 0.5;
		var h = 0.4 * Game.height + 5;
		ctx.drawImage(Loader.imgs[1], (Game.width - h) / 2 + 2, 0, h, h);
		ctx.restore();
}
var drawEmail=function(ctx,size){
			ctx.save();
		ctx.fillStyle = baseButtonLightMilkWhite;
		ctx.textAlign = "center";
		ctx.font = base_font[size];
		ctx.fillText(CN ? "支持邮箱：springmid@icloud.com" : "EMAIL: springmid@icloud.com", 0.5 * Game.width, 0.95 * Game.height);
		ctx.restore();
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
	var lines = text.split("\n");
	//如果false 则以下面为基准，否则以上面为基准
	if (lines.length >= 3 && bool) {
		y -= (lines.length - 3) * lineHeight;
	}
	//遍历每段
	for (var i = 0; i < lines.length; i++) {
		if (colors) {
			this.fillStyle = colors[i];
		}		
		//英文按空格拆分单行，中文全部拆分
		var words = lines[i].split(CN?'':' ');
		//当前行置空
		var line = '';
		//遍历每行，直到宽度大于测试宽度才填充，并开始新的一句
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n]+(CN?'':' ');
			var metrics = this.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				this.fillText(line, x, y);
				line = words[n]+(CN?'':' ');
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		this.fillText(line, x, y);
		y += lineHeight;
	}
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
var text={
	h5_unsupported:	CN ? "感谢你的喜爱\n请选择新版支持html5的浏览器，或搜索同名APP进行游戏！" : "Thank you for choosing our game\nplease choose a latest-version broswer that supports html5,or search our APP to play!",
}
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;