var sw=20,
	sh=20,
	tr=30,
	td=30;
var snake = null;


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
			y:0
		},
		right:{
			x:1,
			y:0
		},
		up:{
			x:0,
			y:-1
		},
		down:{
			x:0,
			y:1
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
	//  this.strategies.eat();
	// 下个点什么都不是 走
	 this.strategies.move.call(this);
	
};

Snake.prototype.strategies ={
	move:function(){
		//创建一个新的身体 在旧蛇头位置
		var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;

		this.head.remove();//把旧蛇头删除
		newBody.create();
		//创建一个新蛇头(蛇头走向下一个要走的点)
		var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
		newBody.create();
	},
	eat:function(){
		console.log("eat")
	},
	die:function(){
		console.log('die')
	},
}
snake = new Snake();
snake.init();
snake.getNextPos();