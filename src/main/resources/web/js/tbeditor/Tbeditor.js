/**
 *
 * Base naming rule:
 * The stuff start with "_" means private , end with "_" means protect ,
 * others mean public.
 *
 * All the member field should be private.
 *
 * Life cycle: (It's very important to know when we bind the event)
 * A widget will do this by order :
 * 1. $init
 * 2. set attributes (setters)
 * 3. rendering mold (@see mold/tbeditor.js )
 * 4. call bind_ to bind the event to dom .
 *
 * this.deskop will be assigned after super bind_ is called,
 * so we use it to determine whether we need to update view
 * manually in setter or not.
 * If this.desktop exist , means it's after mold rendering.
 *
 */
tbeditor.Tbeditor = zk.$extends(zul.Widget, {
	_value: '', //default value for text attribute
	_height: '',
	_cnt: '',
	_config: {},
	_beginChangeValue: 0,
	
	$init: function () {
		this.$supers('$init', arguments);
		
	},
	/**
	 * Don't use array/object as a member field, it's a restriction for ZK object,
	 * it will work like a static , share with all the same Widget class instance.
	 *
	 * if you really need this , assign it in bind_ method to prevent any trouble.
	 *
	 * TODO:check array or object , must be one of them ...I forgot. -_- by Tony
	 */
	
	$define: {
		/**
		 * The member in $define means that it has its own setter/getter.
		 * (It's a coding sugar.)
		 *
		 * If you don't get this ,
		 * you could see the comment below for another way to do this.
		 *
		 * It's more clear.
		 *
		 */
		value: function() { //this function will be called after setText() .
		
			if (this.desktop) {
				//updated UI here.
				if (this._cnt) {
					jq(this._cnt).trumbowyg('html', this._value);
				}
			}
		},
		width: function (v) {
			if (!v || !this.$n()) return;
			this._setSize(v, 'width');
		},
		height: function (v) {
			if (!v || !this.$n()) return;			
			this._setSize(v, 'height');
		}
	},
	_setSize: function (value, prop) {
		value = this._getValue(value);
		if (!value) return;
		
		if (prop == 'height') {
			jq(this.$n('cnt')).css({minHeight: value});
		} else {
			jq(this.$n()).width(value);
		}
	},
	_getValue: function (value) {
		if (!value) return null;
		if (value.endsWith('%'))
			return zk.ie ? jq.px0(jq(this.$n()).width()) : value;
			
		return jq.px0(zk.parseInt(value));
	},
	/**
	 * If you don't like the way in $define ,
	 * you could do the setter/getter by yourself here.
	 *
	 * Like the example below, they are the same as we mentioned in $define section.
	 */
	
	getConfig: function() { return this._config; },
	setConfig: function (val) {
		this._config = val;
		if(this.desktop){
		//update the UI here.
		}
	},
	
	bind_: function () {
		/**
		 * For widget lifecycle , the super bind_ should be called
		 * as FIRST STATEMENT in the function.
		 * DONT'T forget to call supers in bind_ , or you will get error.
		 */
		this.$supers(tbeditor.Tbeditor,'bind_', arguments);
		
		this._cnt = this.$n('cnt');
		var wgt = this;
		jq(this._cnt).trumbowyg(this._config)
					.on('tbwfocus', function(evt) { wgt.proxy(wgt.doFocus_)(jq.Event.zk(evt, wgt)); })
					.on('tbwblur', wgt.proxy(wgt._onBlur))
					.on('tbwchange', wgt.proxy(wgt._onChange))
					.on('tbwpaste', function() { wgt._onPaste(wgt); })
					.on('tbwclose', function() { wgt._onClose(wgt); });
		if (this._height)
			jq(this.$n('cnt')).css({minHeight: this._height});
	
		//A example for domListen_ , REMEMBER to do domUnlisten in unbind_.
		//this.domListen_(this.$n("cave"), "onClick", "_doItemsClick");
	},
	/*
		A example for domListen_ listener.
	*/
	/*
	_doItemsClick: function (evt) {
		alert("item click event fired");
	},
	*/
	unbind_: function () {
	
		// A example for domUnlisten_ , should be paired with bind_
		// this.domUnlisten_(this.$n("cave"), "onClick", "_doItemsClick");
		jq(this._cnt).trumbowyg('destroy');
		
		/*
		* For widget lifecycle , the super unbind_ should be called
		* as LAST STATEMENT in the function.
		*/
		this.$supers(tbeditor.Tbeditor,'unbind_', arguments);
	},
	_onBlur: function(evt) {
		//we take it as onChange
		this._value = jq(this._cnt).trumbowyg('html');//evt.target.innerHTML;
		this.fire('onChange', {value: this._value});
	},
	_onChange: function(evt) {
		//actually, it's onChanging
		var formerText = this._value;
		var laterText = /*jq(this._cnt).trumbowyg('html');*/evt.target.innerHTML;
		if (formerText != laterText) {
			this._value = laterText;
			this.fire('onChanging', {value: this._value});
		}
	},
	_onPaste: function(wgt) {
		console.log('paste');
	},
	_onClose: function(wgt) {
		console.log('close');
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 
	doClick_: function (evt) {
		this.$super('doClick_', evt, true);//the super doClick_ should be called
		this.fire('onFoo', {foo: 'myData'});
	},*/
	
	getZclass: function () {
		return this._zclass != null ? this._zclass: "z-tbeditor";
	}
});