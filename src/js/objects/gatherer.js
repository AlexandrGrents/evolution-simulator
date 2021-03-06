import Animal from './animal.js'

class Gatherer extends Animal
{
	static foodType = new Set(['tree']);
	constructor(options)
	{
		// super({app: options.app, pos: options.pos, r: 20, speed: 5, color: '#0095DD'});
		super(Object.assign(options, {r: 20, speed: 5, color: '#0095DD', viewRange: 5}));
		this.power = 100;
		this.type = 'gatherer';
		this.powerForMove = 1;
	}
	get powerForReproduction()
	{
		let power = (this.gender === 'male')  ? 100 : 200;
		return power;
	}
	get powerForSatiety()
	{
		let power = (this.gender === 'male')  ? 500 : 800;
		return power;
	}
}

export default Gatherer