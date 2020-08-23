let colors = ['#0095DD', '#30fc30', '#c2c92e', '#fc8de8', '#ab0000', '#00a39e'];

class Ball
{
	constructor(options)
	{
		this.app = options.app;

		this.x = options.pos.x;
		this.y = options.pos.y;
		this.r = options.r;

		this.canMove = !!options.speed;

		if (this.canMove)
		{
			this.speed = this.canMove ? options.speed : 0;
			this.defineRandomDiraction()
		}

		this.color = (options.color) ? options.color : colors[2];
		

		this.sector = this.defineSector();
		console.log(this.app.sectors);
		this.app.sectors.get(this.sector).add(this);
	}
	defineRandomDiraction()
	{
		let x = Math.random()*this.app.w;
		let y = Math.random()*this.app.h;
		console.log('for', {x, y})
		this.changeDiractionFor({x,y});
	}
	changeDiractionFor(pos)
	{
		let Dx = pos.x - this.x ;
		let Dy = pos.y - this.y;

		let d = Math.sqrt(Dx**2 + Dy**2);

		this.dx = Dx * this.speed / d;
		this.dy = Dy * this.speed / d;
	}

	calcDistFor(pos)
	{
		return Math.sqrt((pos.x - this.x)**2 + (pos.y - this.y)**2);
	}

	reverseDiraction()
	{
		if (this.x < this.r || this.x > (this.app.w - this.r)) this.dx *=-1;
		if (this.y < this.r || this.y > (this.app.h - this.r)) this.dy *=-1;
	}

	move()
	{
		if (!this.canMove) return;

		this.x += this.dx;
		this.y += this.dy;
		
		this.reverseDiraction();

		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;

		if (this.x > this.app.w) this.x = this.app.w;
		if (this.y > this.app.h) this.y = this.app.h;

		let sector = this.defineSector();
		this.app.changeSector(sector, this);
		this.sector = sector;
	}
	
	defineSector()
	{
		return Math.floor(this.app.perX*this.x/this.app.w) + this.app.perX * Math.floor(this.app.perY*this.y/this.app.h);
	}
	draw()
	{
		this.app.ctx.beginPath();
	    this.app.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
	    this.app.ctx.fillStyle = this.color;
	    this.app.ctx.fill();
	    this.app.ctx.closePath();
	}
	delete()
	{
		this.app.sectors.get(sector).delete(this);
		this.app.balls.delete(this);
	}
}

export default Ball