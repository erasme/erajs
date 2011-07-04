/**
 * @fileOverview The file overview and the following infos will be display in the "File Index" of jsDoc
 * @author A. Livet
 * @version 1.0.1
 */

/**
 * Sample that show how to properly document your code for jsdoc
 */

/**
 * @namespace This is a classical namespace declaration
 */
Sample = {};

/**
 * If you don't explicitly declare your namespace you can use the name tag
 * @name MyNewNameSpace
 * @namespace A namespace implicitly declared by the name tag
 */

/**
 * @constant This is a constant declaration which will be displayed in the _global_ section of the jsdoc
 */
var acceleration = 9.80665;

Core.Object.extend('Sample.MyObject',
/**
 * The lens tag is used to tell jsdoc that we define an object from a JSON like structure. 
 * The # at the end of the name specify that we are working on the prototype section of the object.
 * Note that we can't add anything except the class name in the lends tag line.
 * @lends Sample.MyObject#
 */
{
	/**
	 * Event declaration, we must specify the event name cause there is no function related to them.
	 * Fires on disconnection
	 * @name Sample.MyObject#disconnect
	 * @event
 	 */
	/**
	 * Fires on a connection to something.
	 * @name Sample.MyObject#connect
 	 * @event
 	 * @param {Boolean} autodisconnect
	 */

	/**
	 * By default, class fields are not include in the documentation. If you want to expose a field, you need to surround your comment with jsdoc doclet.
	 * We can define the default field value with the tag default
	 * @default 12
	 */
	myvar: 12,
	
	//This field won't be include in the documentation cause we do not document it with jsdoc doclet.
	myvar2: undefined,

	/**
	 * This one is a documented field but explicitly ignored.
	 * @ignore
	 */
	myvar4: 42,

	/**
	 * This one is a field treated as a function
	 * @function
	 */
	myvar3: Sample.MyObject.myStaticMethod(),

	//This on will be documented with the property tag
	documentedInConsctructor: 24,


	/**
	 * @constructs This tag precises that this function is the constructor
	 * @class Here we can put the description of the class (we can't put it above the extend call cause we won't have the constructor description otherwise, maybe a jsdoc bug).
	 * Create a new class called MyObject in the namespace Sample.
	 * @extends Core.Object 
	 * @property {Number} documentedInConsctructor This is a field documented with the <b>property</b> tag in the constructor, 
	 * it's not very elegant but may be usefull in some cases.
	 * @param {Number} config.myvar This is the description of myvar which is a number 
	 */
	constructor: function(config) {
		console.log('init Sample.MyObject');
		// check if myvar is present in config.
		// in this case, init with its value
		if('myvar' in config)
			// use "this" to access all method and field
			// of the current instance of the class
			this.myvar = config.myvar;

		//Events are documented at the begining of the class
		this.addEvents('connect', 'disconnect');
	},

	/**
	 * @description The Description tag is implicite on the first comment line, but you can use it
	 * Like all tag, a description can be multi line as long as there is no arobase symbol in it.
	 * Multi line description
	 * We can use the <b>link</b> tag which like the <b>see</b> tag but can be used in others tags like this {@link MyNewNameSpace}
	 * Note the you can't use the <b>link</b> tag in the see tag.
	 * @param {String} myarg1 descrption of myarg1 which is a String
	 * @param {MyNewNameSpace} myarg2 descrption of myarg2 which is an Object documented in the framework (a link will be automatically generated)
	 * @param {Number} [myarg3=1.618] Optional parameter with a default value
	 * @throws {OutOfMemeory} If the function can throw an exception you can add it to the description via the <b>throws</b> tag.
	 * @see <a href="http://daniel.erasme.lan:8080/era/samples/button/">The see tag can be use to refere to an hyper text link</a>.
	 * @see MyNewNameSpace or to add a reference to another description
	 * @see Sample.MyObject#deprecatedMethod here it is a reference to an instance member of a class
	 * @see Sample.MyObject.myStaticMethod And here it is a reference to an static member of a class
	 * @example 
	 * //The example tag will generate a code snippet, properlly display
	 * var obj = new Sample.MyObject({myvar : 42});
	 * obj.aMethod("foo", new Ui.Button());
	 */
	aMethod: function(myarg1, myarg2, myarg3) {
	},

	/**
	 * @deprecated This is how we mark deprecated method
	 */
	deprecatedMethod: function() {
	},

	/**
	 * This method has been added in version 2.0 so we can use the <b>since</b> tag to specify this.
	 * @since version 2.0
	 */
	newMethod: function() {
	},
	
	/**
	 * Some times jsdoc complains about function inside function that are not documented
	 * The best way to avois them is to use no-code meta tag (I don't why but the ignore tag doesn't work in that case)
	 */
	jsdocWarningMethod: function(){
		/**#nocode+ Avoid Jsdoc warnings...*/
		var newEvent = {};
		newEvent.preventDefault = function() {};
		/**#nocode-*/		
	},

	/**
	 * We can also use the <b>inner</b> tag to tell jsdoc that a function is intern (and also private) and don't need to be documented. 
	 */
	jsdocOtherWarningMethod: function(obj){
		var newEvent = {};
		/**@inner*/
		newEvent.preventDefault = function() {};
	},

	/**
	 * This is a defacto private method cause it's prefixed by an underscore.
	 */
	_nativeJsDocPrivateMethod: function(){
	},
	
	/** @private This method won't be include in the doc unless we use the option -p at the jsdoc generation.*/
	singlePrivateMethod: function(){
	},

	/**#@+ This is a meta tag it will be apply on all the code above until the meta tag closure
	 * @private All the above function will be mark as private
	 */
	otherPrivateMethod: function(){
	},

	andAnotherOnePrivateMethod: function(){
	},

	/**#@- meta tag closure*/

  	/**
	 * An Example of function treated like a field in the doc. Rare case 
	 * @field
	 * @type String
	 */
  	fullName: function() {
    	return this.myvar + this.myvar2;
 	}
},
/**
 * Function override are also part of the object prototype
 * @lends Sample.MyObject#
 */
{
	/**
	 * @see Core.Object#toString Use the <b>see</b> tag to link to another description.
	 * Don't use the <b>borrows</b> tag to copy description from another class cause it's buggy and experimental
	 */
	toString: function() {
		// when you override a method, you can always called
		// the overrided method with the following syntax:
		var res = Sample.MyObject.base.toString.call(this);
		return("Sample.MyObject ("+res+")");
	}
},
/**
 * And it's how we document the static part (without #)
 * @lends Sample.MyObject
 */
{
	/** 
	 * declare a static field. To access its value
	 * @example Sample.MyObject.myStaticField
	 */
	myStaticField: 32,

	/** 
	 * the static constructor is called only once when the class is
	 * declared. In this constructor, "this" correspond to Sample.MyObject
	 */
	constructor: function() {
	},

	/**
	 * declare a static method. 
	 * @example Sample.MyObject.myStaticMethod();
	 */
	myStaticMethod: function() {
	}

});

/**
 * Here I describe the constructor
 * @class This is a classical class+constructor description
 */
Classic = function () {
};

/**
 * Classical method of a non Core.Object class
 */
Classic.prototype.method = function() {
}
