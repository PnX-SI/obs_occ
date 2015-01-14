/*
 * Ext.ux.grid.PageSizer
 *
 * Dynamically sets the PageSize config of a PagingToolbar
 * adapted for 3.0.0 Marcin Krzyzanowski
 */

Ext.namespace("Ext.ux.grid");

Ext.ux.grid.PageSizer = function(config) {
    Ext.apply(this, config);
};



Ext.extend(Ext.ux.grid.PageSizer, Ext.util.Observable, {
/**
	 * @cfg {String} beforeText
	 * Text to display before the comboBox
	 */
	beforeText: 'Affichage',

	/**
	 * @cfg {String} afterText
	 * Text to display after the comboBox
	 */
	afterText: 'lignes',

	/**
	 * @cfg {Mixed} addBefore
	 * Toolbar item(s) to add before the PageSizer
	 */
	addBefore: '-',

	/**
	 * @cfg {Mixed} addAfter
	 * Toolbar item(s) to be added after the PageSizer
	 */
	addAfter: null,

	/**
	 * @cfg {Bool} dynamic
	 * True for dynamic variations, false for static ones
	 */
	dynamic: false,

	/**
	 * @cfg {Array} variations
	 * Variations used for determining pageSize options
	 */
	variations: [10, 20, 50, 100, 200, 500, 1000, 5000, 10000],

	/**
	 * @cfg {Object} comboCfg
	 * Combo config object that overrides the defaults
	 */
	comboCfg: undefined,

	/**
	 * @cfg {int} position
	 * The starting position inside the toolbar
	 */
	position: 11,

	init: function(pagingToolbar) {
		this.pagingToolbar = pagingToolbar;
		this.pagingToolbar.pageSizeCombo = this;
		this.pagingToolbar.setPageSize = this.setPageSize.createDelegate(this);
		this.pagingToolbar.getPageSize = function() {
			return this.pageSize;
		}
		this.pagingToolbar.on('render', this.onRender, this);
	},

	//private
	addSize:function(value) {
		if (value>0) {
			this.sizes.push([value]);
		}
	},

	//private
	updateStore: function() {                
		if (this.dynamic) {
			var middleValue = this.pagingToolbar.pageSize, start;
			middleValue = (middleValue > 0) ? middleValue : 1;
			this.sizes = [];
			var v = this.variations;
			for (var i = 0, len = v.length; i < len; i++) {
				this.addSize(middleValue - v[v.length - 1 - i]);
			}
			this.addToStore(middleValue);
			for (var i = 0, len = v.length; i < len; i++) {
				this.addSize(middleValue + v[i]);
			}
		} else {
			if (!this.staticSizes) {
				this.sizes = [];
				var v = this.variations;
				var middleValue = 0;
				for (var i = 0, len = v.length; i < len; i++) {
					this.addSize(middleValue + v[i]);
				}
				this.staticSizes = this.sizes.slice(0);
			} else {
				this.sizes = this.staticSizes.slice(0);
			}
		}
		this.combo.store.loadData(this.sizes);
		this.combo.collapse();
		this.combo.setValue(this.pagingToolbar.pageSize);
	},

	setPageSize:function(value, forced) {            
		var pt = this.pagingToolbar;
		this.combo.collapse();
		value = parseInt(value) || parseInt(this.combo.getValue());
		value = (value>0)?value:1;
		if (value == pt.pageSize) {
			return;
		} else {
			this.pagingToolbar.pageSize = value;
			if (forced) {
                            this.pagingToolbar.doLoad(Math.floor(this.pagingToolbar.cursor/this.pagingToolbar.pageSize) * this.pagingToolbar.pageSize)
                        }
		}
		this.updateStore();
	},

	//private
	onRender: function() {
		this.combo = Ext.ComponentMgr.create(Ext.applyIf(this.comboCfg||{}, {
			store:new Ext.data.SimpleStore({
				fields:['pageSize'],
				data:[]
			})
			,displayField  : 'pageSize'
			,valueField    : 'pageSize'
			,mode          : 'local'
			,selectOnFocus : false
			,enableKeyEvents: true
			,width         : 60
			,xtype         : 'combo'
                        ,autoSelect    : false
		}));
		this.combo.on('select', this.setPageSize, this);
		this.combo.on('keyup', function(cmb,e) {
				if (e.getKey() == Ext.EventObject.ENTER)
				this.setPageSize(cmb.getRawValue(), true);
		}, this);

		this.updateStore();

		if (this.addBefore) {
			this.pagingToolbar.insert(this.position, this.addBefore);
			this.position++;
		}
		if (this.beforeText) {
			this.pagingToolbar.insert(this.position, this.beforeText);
			this.position++;
		}
		this.pagingToolbar.insert(this.position, this.combo);
		this.position++;

		if (this.afterText) {
			this.pagingToolbar.insert(this.position, this.afterText);
			this.position++;
		}
		if (this.addAfter) {
			this.pagingToolbar.insert(this.position, this.addAfter);
		}
	}
})