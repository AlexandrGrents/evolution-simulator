import Ball from './ball.js'
import Corpse from './corpse.js'

class Animal extends Ball
{
	static foodType = new Set();
	static maleColor = '#03fce3';
	static femaleColor = '#f500b4';
	static pregnantColor = '#d080ff';
	constructor(options)
	{
		super(options);
		if (options.gender)
		{
			this.gender = options.gender;	
		}
		else
		{
			this.gender = Math.random()>0.5 ? 'male' : 'female';	
		}

		this.viewRange = options.viewRange ? options.viewRange : 1;
		
		this.probably = 0.02;
		this.age = 0;
		this.isPregnant = false;
		this.pregnantCounter = null;

		this.countForPregnant = options.countForPregnant ? options.countForPregnant : 50;
		this.countForAfterPregant = options.countForAfterPregant ? options.countForAfterPregant : 200;

		this.afterPregnantCounter = (this.gender === 'female') ? this.countForAfterPregant : Math.floor(this.countForAfterPregant/ 2);
		this.target = null;
	}

	setTarget(pos)
	{
		if (this.target === null) this.target = pos;
		if (Math.abs(this.target.x - this.x)<5 && Math.abs(this.target.y - this.y) < 5) this.target = null;
		else this.changeDiractionFor(this.target)
	}


	get isHungry()
	{
		return this.power < this.powerForSatiety * 1.2;
	}

	get isWantReproduction()
	{
		return !this.app.animalLimit && this.power > 2 * this.powerForReproduction && !this.isPregnant && this.afterPregnantCounter === null;
	}

	move()
	{
		this.age++;
		if (this.power <=0 || Math.random()<(0.001*this.age/(10*this.power))) return this.dead();
		this.power -=this.powerForMove;
		if (Math.random() < this.probably) this.defineRandomDiraction();
		if (this.isPregnant) this.reproduction();
		if (this.afterPregnantCounter === 0) 
		{
			this.afterPregnantCounter = null;
		}
		else if (this.afterPregnantCounter > 0)
		{
			this.afterPregnantCounter--;
		}
		this.find();
		super.move();
	}

	get viewSectorNumbers ()
	{
		let sectorNumbers = this.app.getHashedSectorNumbers(this.sector, this.viewRange);
		if (sectorNumbers !== undefined) return sectorNumber;


		sectorNumbers = new Set([this.sector]);
		let x = Math.floor(this.sector % this.app.perX);
		let y = Math.floor(this.sector / this.app.perX);
		let sector_x, sector_y;
		for (let i = this.viewRange; i>=-this.viewRange; i--)
		{
			sector_x = x + i;
			if (sector_x <0 || sector_x >= this.app.perY) continue;
			for (let j = this.viewRange - Math.abs(i); j >= Math.abs(i) - this.viewRange; j--)
			{
				sector_y = y + j;
				if (sector_y <0 || sector_y >= this.app.perX) continue;
				sectorNumbers.add(sector_x + sector_y * this.app.perX);
			}
		}
		this.app.setHashedSectorNumbers(this.sector, this.viewRange, sectorNumbers);
		return sectorNumbers;
	}

	find()
	{
		if (this.isHungry) this.findFood();
		if (this.isWantReproduction) this.findForReproduction();
	}

	findForReproduction()
	{
		let partners = new Set();
		for (let sectorNumber of this.viewSectorNumbers)
		{
			for (let animal of this.app.sectors[sectorNumber])
			{
				if (this.type === animal.type && this.gender !== animal.gender && animal.isWantReproduction)
				{
					partners.add(animal);
				}
			}
		}
		let nearestPartner, minDist = null, dist;
		for (let partner of partners)
		{
			dist = this.calcDistFor(partner);
			if (minDist === null || minDist > dist)
			{
				minDist = dist;
				nearestPartner = partner;
			}
		}
		if (minDist!==null)
		{
			if (minDist < 2*this.r)
			{
				this.reproduction();
				nearestPartner.reproduction();
			}
			else
			{
				this.changeDiractionFor(nearestPartner);
			}
			
		} 
	}

	findFood()
	{
		let foods = new Set();
		let haveAnimalAround = false;
		for (let sectorNumber of this.viewSectorNumbers)
		{
			
			for (let ball of this.app.sectors[sectorNumber])
			{
				if (this.__proto__.constructor.foodType.has(ball.type))
				{
					if (Math.abs(this.x - ball.x) <5 && Math.abs(this.y - ball.y) < 5) this.eat(ball);
					else foods.add(ball);
				}
				else if (!haveAnimalAround && this.type === ball.type && this !==ball)
				{
					haveAnimalAround = true;
				}
			}
			
		}
		if (haveAnimalAround && foods.size != 0)
		{
			foods = [...foods];
			let randomNumber = Math.floor(Math.random()*foods.length);
			let randomFood = foods[randomNumber];
			if (randomFood === undefined) randomFood = foods[0];
			if (!randomFood.x || !randomFood.y) return;
			this.setTarget(randomFood);
		}
		else
		{
			let nearestFood, minDist = null, dist;
			for (let food of foods)
			{
				dist = this.calcDistFor(food)
				if (minDist === null || minDist > dist) { minDist = dist; nearestFood = food; }
			}
			if (minDist !== null) this.setTarget(nearestFood);
		}
		
	}
	reproduction()
	{
		if (this.gender === 'male')
		{
			this.power -= this.powerForReproduction;
		}
		else
		{
			if (this.isPregnant && this.pregnantCounter <= 0)
			{
				let gender = Math.random()>0.5 ? 'male' : 'female';
				this.power -= this.powerForReproduction;
				let pos = (this.x > 30 && this.y > 30) ? {x: this.x - 20, y:this.y - 20} : this;
				if (this.x > 30 && this.y > 30)
				
				this.app.addElems(this.type, 1, [pos], gender);
				if (Math.random() > 0.2) this.app.addClicker(pos);
				this.isPregnant = false;
				this.pregnantCounter = null;
				this.afterPregnantCounter = this.countForAfterPregant;
			}
			else if (this.isPregnant)
			{
				this.pregnantCounter--;
			}
			else
			{
				this.pregnantCounter = this.countForPregnant;
				this.isPregnant = true;
			}
		}	
		

	}
	eat(food)
	{
		this.power = food.sustenance ? this.power + food.sustenance : this.power + 150 + Math.floor(food.power);
		food.delete();
		this.target = null;
	}
	dead()
	{
		this.app.register(new Corpse(this));
		this.delete();
	}

	draw()
	{
		let color;
		if (this.gender ==='male')
		{
			color = Animal.maleColor;
		}
		else if (this.isPregnant)
		{
			color = Animal.pregnantColor;
		}
		else
		{
			color = Animal.femaleColor;
		}
		super.draw();
		this.app.ctx.beginPath();
		this.app.ctx.arc(this.x, this.y+12, 7, 0, Math.PI*2);
		this.app.ctx.fillStyle = color;
	    this.app.ctx.fill();
	    this.app.ctx.closePath();

	    if (this.isPregnant)
	    {
	    	this.app.ctx.beginPath();
	    	this.app.ctx.fillStyle = '#000000';
	    	this.app.ctx.fillText(this.pregnantCounter, this.x - 6, this.y + 15);
	    	this.app.ctx.closePath();
	    }

	    if (this.afterPregnantCounter !== null)
	    {
	    	this.app.ctx.beginPath();
	    	this.app.ctx.fillStyle = '#000000';
	    	this.app.ctx.fillText(this.afterPregnantCounter, this.x - 6, this.y + 15);
	    	this.app.ctx.closePath();
	    }


	    this.app.ctx.beginPath();
	    this.app.ctx.fillStyle = '#000000';
	    if (this.app.showViewRanges)
	    {
	    	if (this.app.debug) console.log('view range', this.x, this.y + this.viewRange * this.app.perY)
	    	this.app.ctx.moveTo(this.x + this.viewRange * this.app.perX, this.y)
	    	this.app.ctx.lineTo(this.x, this.y + this.viewRange * this.app.perY)
	    	this.app.ctx.lineTo(this.x - this.viewRange * this.app.perX, this.y)
	    	this.app.ctx.lineTo(this.x, this.y - this.viewRange * this.app.perY)
	    	this.app.ctx.lineTo(this.x + this.viewRange * this.app.perX, this.y)
	    	this.app.ctx.stroke()
	    	
	    }
	    this.app.ctx.closePath();

	    
	    this.app.ctx.beginPath();
	    this.app.ctx.arc(this.x-5, this.y-12, 4, 0, Math.PI*2);
	    this.app.ctx.fillStyle = (this.isWantReproduction) ? '#24ff48' : '#ff7d90';
	    this.app.ctx.fill();    
	    this.app.ctx.closePath();

	    this.app.ctx.beginPath();
	    this.app.ctx.arc(this.x+5, this.y-12, 4, 0, Math.PI*2);
	    this.app.ctx.fillStyle = (this.isHungry) ? '#24ff48' : '#ff7d90';
	    this.app.ctx.fill();    
	    this.app.ctx.closePath();
	}
}

export default Animal
