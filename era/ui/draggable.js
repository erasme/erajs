Ui.Pressable.extend('Ui.Draggable', 
{
	/**
	 * Fires when object start to be dragged
	 * @name Ui.Draggable#dragstart
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 */
	/**
	 * Fires when object stop to be dragged
	 * @name Ui.Draggable#dragend
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 * @param {string} dropEffect Give the operation done: [none|copy|link|move]
	 */

	draggableIcon: undefined,
	allowedMode: 'all',
	draggableData: undefined,
	dragDelta: undefined,
	dataTransfer: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('dragstart', 'dragend');
		this.connect(this, 'ptrdown', this.onDraggablePointerDown);
	},

	/**
	 * Set the data that we drag & drop
	 */
	setDraggableData: function(data) {
		this.draggableData = data;
	},

	/**
	 * Set the allowed operation. Possible values are:
	 * [copy|copyLink|copyMove|link|linkMove|move|all]
	 */
	setAllowedMode: function(allowedMode) {
		this.allowedMode = allowedMode;
	},

	/**
	 * Provide an Ui.Image that will be used when
	 * dragging the element
	 * Supported by: Firefox, Chrome and Safari on Windows
	 */
	setDraggableIcon: function(icon) {
		this.draggableIcon = icon;
	},

	getDragDelta: function() {
		return this.dragDelta;
	},

	/**#@+
	 * @private
	 */

	onDraggablePointerDown: function(event) {
		if(this.lock || this.getIsDisabled() || (this.draggableData === undefined))
			return;

		this.dataTransfer = new Ui.DragDataTransfer({
			type: 'pointer', draggable: this,
			x: event.clientX, y: event.clientY, delayed: true, pointer: event.pointer
		});
		this.dragDelta = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.connect(this.dataTransfer, 'start', this.onDragStart);
		this.connect(this.dataTransfer, 'end', this.onDragEnd);
	},

	onDragStart: function(dataTransfer) {
		dataTransfer.effectAllowed = this.allowedMode;
		dataTransfer.setData(this.draggableData);
		this.fireEvent('dragstart', this, dataTransfer);
	},

	onDragEnd: function(dataTransfer) {
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, dataTransfer.dropEffect);
	}
});

