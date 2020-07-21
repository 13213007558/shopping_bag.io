var sw=20,
	sh=20,
	tr=30,
	td=30;
var snake = null,//蛇的实例
	food = null;//食物的实例
	game = null;//游戏的实例

function Square(x,y,classname){
	this.x = x*sw;
	this.y = y*sh;
	this.class = classname;

	this.viewContent = document.createElement('div');
	this.viewContent.className = this.class;
	this.parent = document.getElementById('snakeWrap');
}
Square.prototype.create = function(){
	this.viewContent.style.position='absolute';
	this.viewContent.style.width=sw+'px';
	this.viewContent.style.height=sh+'px';
	this.viewContent.style.left=this.x+'px';
	this.viewContent.style.top=this.y+'px';

	this.parent.appendChild(this.viewContent);
};
Square.prototype.remove=function(){
	this.parent.removeChild(this.viewContent);
};

function Snake(){
	this.head = null;
	this.tail = null;
	this.pos =[];

	this.directionNum={//存储蛇走的方向
		left:{
			x:-1,
			y:0,
			rotate:180  //蛇头在不同方向应该进行旋转
		},
		right:{
			x:1,
			y:0,
			rotate:0
		},
		up:{
			x:0,
			y:-1,
			rotate:-90
		},
		down:{
			x:0,
			y:1,
			rotate:90
		}
	}
}
Snake.prototype.init=function(){
	var snakeHead = new Square(2,0,'snakeHead');
	snakeHead.create();
	this.head = snakeHead;
	this.pos.push([2,0]);

	var snakeBody1= new Square(1,0,'snakeBody');
	snakeBody1.create();
	this.pos.push([1,0]);

	var snakeBody2= new Square(0,0,'snakeBody');
	snakeBody2.create();
	this.tail = snakeBody2; //把蛇尾的信息存起来
	this.pos.push([0,0]);
	snakeHead.last = null;
	snakeHead.next = snakeBody1;

	snakeBody1.last = snakeHead;
	snakeBody1.next = snakeBody2;

	snakeBody2.last = snakeBody1;
	snakeBody2.next = null;

	this.direction = this.directionNum.right;
};
//用来获取蛇头下一个位置的元素
Snake.prototype.getNextPos = function(){
	var nextPos = [ //蛇头要走的下一点的坐标
		this.head.x/sw + this.direction.x,
		this.head.y/sh + this.direction.y
	]

	// 下个点是自己,代表撞到自己游戏结束
	var selfCollied = false;
	this.pos.forEach(function(value){
		if(value[0] == nextPos[0]&&value[1] == nextPos[1]){
				//如果数组中的两个数据都相等，说明下个点在蛇身上能找到
			selfCollied = true;
		}
	});
		if (selfCollied) {
			console.log('撞到自己了');

			this.strategies.die.call(this);

			return;
		}
	// 下个点是围墙 游戏结束
		if (nextPos[0]<0 || nextPos[1] <0 || nextPos[0] > td-1 || nextPos[1] > tr-1) {
			console.log('撞墙了');
			this.strategies.die.call(this);
			return;
		}
	// 下个点是食物，吃
	if(food&&food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
		//如果下个点是食物，吃
		console.log('撞到食物啦！');
		this.strategies.eat.call(this);
	}
	// 下个点什么都不是 走
	 this.strategies.move.call(this);
	 return;
	
};

Snake.prototype.strategies ={
	move:function(format){  //这个参数决定要不删除蛇尾
		//创建一个新的身体 在旧蛇头位置
		var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		//更新链表关系
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;
		this.head.remove();
		newBody.create();
		//创建一个新蛇头(蛇头走向下一个要走的点 next.pos)
		var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
		//更新链表关系
		
		newHead.next = newBody;
		newHead.last = null;
		newBody.last = newHead;
		newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
		newHead.create();
		//蛇身上的坐标也要更新
		this.pos.splice(0,0,[this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y])
		this.head = newHead;//还要把this.head的信息更新下


		if(!format){//如果format为false，杀删除最后一位
			this.tail.remove();
			this.tail = this.tail.last;

			this.pos.pop();
		}
	},
	eat:function(){
		this.strategies.move.call(this,true);
		createFood();
		game.score++;
	},
	die:function(){
		console.log('die')
		game.over();
	}
}
snake = new Snake();



function createFood(){
	//食物的坐标
	var x = null;
	var y = null;

	var include = true; //循环跳出的条件, true表示食物在蛇身上，false表示继续循环
	while(include){
		x = Math.round(Math.random()*(td-1));//随机出现食物
		y = Math.round(Math.random()*(tr-1));


		snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){
				include = false;
			}
		});
	}

//生成食物
	food = new Square(x,y,'food');
	food.pos=[x,y];//存储生成食物的坐标，与蛇头下一个点对比

	var foodDom=document.querySelector('.food');
	if (foodDom) {
		foodDom.style.left = x*sw+'px';
		foodDom.style.top = y*sh+'px';
	}else{
		food.create();
		}
}


//创建游戏逻辑
function Game(){
	this.timer = null;
	this.score = 0;
}
Game.prototype.init= function(){
	snake.init();
	// snake.getNextPos();
	createFood();

	document.onkeydown = function(ev){
		if(ev.which == 37 && snake.direction != snake.directionNum.right){//按左键时候不能往右走时候
			snake.direction = snake.directionNum.left;
		}else if(ev.which == 38 && snake.direction != snake.directionNum.down){
			snake.direction = snake.directionNum.up;
		}else if(ev.which == 39 && snake.direction != snake.directionNum.left){
			snake.direction = snake.directionNum.right;
		}else if(ev.which == 40 && snake.direction != snake.directionNum.up){
			snake.direction = snake.directionNum.down;
		}
	}
	this.start();
}
Game.prototype.start = function(){  //开启定时器，开始游戏
	this.timer = setInterval(function(){
		snake.getNextPos();	
	},200);
}
Game.prototype.pause=function(){
	clearInterval(this.timer);
}
Game.prototype.over=function(){
	clearInterval(this.timer);
	alert('你的得分为:'+this.score);

	//游戏回到最初界面
	var snakeWrap = document.getElementById('snakeWrap');
	snakeWrap.innerHTML='';

	snake = new Snake();
	game = new Game;
	var startBtnWrap = document.querySelector('.startBtn');
	startBtnWrap.style.display='block';
}
//开启游戏


game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
	startBtn.parentNode.style.display = 'none';
	game.init();
};
//暂停

var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
	snakeWrap.onclick=function(){
		game.pause();
		pauseBtn.parentNode.style.display='block';

	}
	pauseBtn.onclick= function(){
		game.start();
		pauseBtn.parentNode.style.display='none';

	}