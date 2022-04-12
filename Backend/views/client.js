var type;
var started = 0;

function Player(x, y, w, h, point)
{
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.point = point;
}

function Ball(x, y, xv, yv, xr, yr)
{
	this.x = x;
	this.y = y;
	this.xv = xv;
	this.yv = yv;
	this.xr = xr;
	this.yr = yr;
}

function Match(playerOne, playerTwo, ball)
{
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.ball = ball;
}

function setup()
{
	socket = io.connect('http://localhost:8080');

	createCanvas(800, 400);

	socket.emit('askConnectionNumber');
	socket.on('sendConnectionNb', (data) =>
	{
		if (data == "1")		//Master
		{
			type = "master";

			var playerOne = new Player(15, 150, 15, 100, 0);
			var playerTwo = new Player(770, 150, 15, 100, 0);
			var ball = new Ball(400, 200, (Math.random() + 1) * 5, (Math.random() + 1) * 5, 20, 20);	//revoir le vecteur de base de la ball
			var match = new Match(playerOne, playerTwo, ball);

			background(0);
			textSize(50);
			fill(color(255, 255, 255));
			text('Waiting for other player...', 120, 200);

			socket.on('askUpdateMatch', () => socket.emit('sendUpdateMatch', match));

			socket.on('updateMatch', (data) =>
			{
				clear();
				background(0);
				printer(data);
			});

			socket.on('slaveToMasterKeyPressed', data =>
			{
				if (data == UP_ARROW && match.playerTwo.y >= 0)
				{
					if (match.playerTwo.y != 0)
						match.playerTwo.y -= 5;
				}
				else if (match.playerTwo.y < 400 - 100)
					match.playerTwo.y += 5;
				socket.emit('sendUpdateMatch', match);	//instant pos refresh, but can be laggy
			});

			socket.on('masterToMasterKeyPressed', data =>
			{
				if (data == UP_ARROW && match.playerOne.y >= 0)
				{
					if (match.playerOne.y != 0)
						match.playerOne.y -= 5;
				}
				else if (match.playerOne.y < 400 - 100)
					match.playerOne.y += 5;
				socket.emit('sendUpdateMatch', match);	//instant pos refresh, but can be laggy
			});

			socket.on('launchMatch', () =>
			{
				started = 1;
				socket.emit('sendUpdateMatch', match);
				socket.on('serverTick', () =>
				{
					gameEngine(match);
					socket.emit('sendUpdateMatch', match);
				});
			});

		}
		else if (data == "2")	//Slave
		{
			type = "slave";

			socket.emit('readyToStart');
			started = 1;

			socket.on('updateMatch', (data) =>
			{
				clear();
				background(0);
				printer(data);
			});

		}
		else					//Spect
		{
			type = "spect";

			socket.emit('askForUpdate');
			socket.on('updateMatch', (data) =>
			{
				clear();
				background(0);
				printer(data);
			});
		}

	});

	socket.on('playerDisconnect', () =>
	{
		clear();
		background(0);
		textSize(50);
		fill(color(255, 255, 255));
		text('Waiting for other player...', 120, 200);
		//reset everything for the master
		//maybe send an event to serv to ask for a 'job'
		//ball is crazy when restarting lol
	});
}

function printer(data)
{
	rect(data.playerOne.x, data.playerOne.y, data.playerOne.w, data.playerOne.h);
	rect(data.playerTwo.x, data.playerTwo.y, data.playerTwo.w, data.playerTwo.h);
	ellipse(data.ball.x, data.ball.y, data.ball.xr, data.ball.yr);

	//ajouter une ligne verticale ?

	textSize(50);
	fill(color(255, 255, 255));
	text(data.playerOne.point, 325, 50);
	text(data.playerTwo.point, 425, 50);

}

function draw()
{
	movePlayer();
}

function movePlayer()
{
	//pour avoir plus de bandwidth, on peut modifer ca par juste un on/off de keypress (a voir)

	if (keyIsDown(DOWN_ARROW) && type == "master" && started == 1)
		socket.emit('masterKeyPressed', DOWN_ARROW);

	if (keyIsDown(UP_ARROW) && type == "master" && started == 1)
		socket.emit('masterKeyPressed', UP_ARROW);

	if (keyIsDown(DOWN_ARROW) && type == "slave" && started == 1)
		socket.emit('slaveKeyPressed', DOWN_ARROW);

	if (keyIsDown(UP_ARROW) && type == "slave" && started == 1)
		socket.emit('slaveKeyPressed', UP_ARROW);
}

function gameEngine(match)
{
	if(match.ball.x + match.ball.xv > 785 - match.ball.xr || match.ball.x + match.ball.xv < match.ball.xr + 15)
	{
		if (match.ball.x + match.ball.xv > 785 - match.ball.xr)
		{
			if (match.ball.y >= match.playerTwo.y && match.ball.y <= match.playerTwo.y + match.playerTwo.h)
				match.ball.xv = -match.ball.xv;
			else
			{
				match.playerOne.point++;
				delete match.ball;
				match.ball = new Ball(400, 200, (Math.random() + 1) * 10, (Math.random() + 1) * 5, 20, 20);
			}
		}
		else if (match.ball.x + match.ball.xv < match.ball.xr + 15)
		{
			if (match.ball.y >= match.playerOne.y && match.ball.y <= match.playerOne.y + match.playerOne.h)
				match.ball.xv = -match.ball.xv;
			else
			{
				match.playerTwo.point++;
				delete match.ball;
				match.ball = new Ball(400, 200, (Math.random() + 1) * 10, (Math.random() + 1) * 5, 20, 20);
			}
		}
	}
	if(match.ball.y + match.ball.yv > 400 - match.ball.yr || match.ball.y + match.ball.yv < match.ball.yr)
	{
		match.ball.yv = - match.ball.yv;
	}

	match.ball.x += match.ball.xv;
	match.ball.y += match.ball.yv;
}