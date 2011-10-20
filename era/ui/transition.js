Core.Object.extend('Ui.Transition', 
/**@lends Ui.Transition#*/
{
	/**
	 * @constructs
	 * @class
	 * @extends Core.Object
     */
	constructor: function(config){
	},

	run: function(current, next, progress) {
		throw('transition classes MUST override run method');
	}
}, /**@lends Ui.Transition#*/ 
{
}, 
/**@lends Ui.Transition*/
{
	transitions: {},

	register: function(transitionName, classType) {
		this.transitions[transitionName] = classType;
	},

	parse: function(transition) {
		return new this.transitions[transition]();
	}
});

