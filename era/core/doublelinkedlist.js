
Core.Object.extend('Core.DoubleLinkedList', {
	root: undefined,
	length: 0,

	constructor: function(config) {
	},

	getLength: function() {
		return this.length;
	},

	getFirstNode: function() {
		if(this.root === undefined)
			return undefined;
		else
			return this.root;
	},

	getLastNode: function() {
		if(this.root === undefined)
			return undefined;
		else
			return this.root.previous;
	},

	appendNode: function(node) {
		if(this.root === undefined) {
			node.previous = node;
			node.next = node;
			this.root = node;
		}
		else {
    		node.previous = this.root.previous;
    		node.next = this.root;
		    this.root.previous.next = node;
    		this.root.previous = node;
		}
		this.length++;
		return node;
	},

	prependNode: function(node) {
		if(this.root === undefined) {
    		node.previous = node;
    		node.next = node;
    		this.root = node;
  		}
		else {
    		node.previous = this.root.previous;
    		node.next = this.root;
    		this.root.previous.next = node;
    		this.root.previous = node;
    		this.root = node;
  		}
		this.length++;
		return node;
	},

	removeNode: function(node) {
		if(this.root === node) {
			if(node.next === node)
				this.root = undefined;
			else {
				node.next.previous = node.previous;
				node.previous.next = node.next;
				this.root = node.next;
			}
		}
		else {
			node.next.previous = node.previous;
			node.previous.next = node.next;
		}
		node.next = undefined;
		node.previous = undefined;
		this.length--;
	},

	findNode: function(data) {
		if(this.root === undefined)
			return undefined;
		var current = this.root;
		while(current.next !== this.root) {
			if(current.data === data)
				return current;
			current = current.next;
		}
		return undefined;
	},

	getFirst: function() {
		var firstNode = this.getFirstNode();
		if(firstNode === undefined)
			return undefined;
		else
			return firstNode.data;
	},

	getLast: function() {
		var lastNode = this.getLastNode();
		if(lastNode === undefined)
			return undefined;
		else
			return lastNode.data;
	},

	append: function(data) {
		return this.appendNode({ data: data });
	},

	prepend: function(data) {
		return this.prependNode({ data: data });
	},

	remove: function(data) {
		var node = this.findNode(data);
		if(node !== undefined)
			this.removeNode(node);
	},

	clear: function() {
		this.root = undefined;
	}
}, {}, {
	moveNext: function(node) {
		if(node !== undefined)
			return node.next;
		else
			return undefined;
	},

	isLast: function(node) {
		if(node === undefined)
			return true;
		else
			return node.next === this.root;
	}
});
