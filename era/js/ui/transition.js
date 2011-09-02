
Core.Object.extend('Ui.Transition', 
/**@lends Ui.Transition#*/
{
	run: function(current, next, progress) {
		throw('transition classes MUST override run method');
	}
}, /**@lends Ui.Transition#*/ {
}, 
/**@lends Ui.Transition*/
{
	transitions: {},

	register: function(transitionName, classType) {
		this.transitions[transitionName] = classType;
	},

	create: function(transition) {
		if(transition == undefined)
			return undefined;
		if(typeof(transition) == 'string')
			return new this.transitions[transition]();
		else if(typeof(transition) == 'object') {
			if(Ui.Transition.hasInstance(transition))
				return transition;
			else if(transition.type != undefined) {
				var type = transition.type;
				transition.type = undefined;
				return new this.transitions[type](transition);
			}
		}
		throw('invalid transition ('+transition+')');
	}
});

