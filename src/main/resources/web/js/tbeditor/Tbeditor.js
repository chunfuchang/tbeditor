tbeditor.Tbeditor = zk.$extends(zul.Widget, {
	_value: '',
	_jqCnt: '',
	_config: {},
	
	$init: function () {
		this.$supers('$init', arguments);
	},
	
	$define: {
		value: function() {
			if (this.desktop) {
				if (this._jqCnt) {
					this._jqCnt.trumbowyg('html', this._value);
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
	getConfig: function() { return this._config; },
	setConfig: function (val) {
		this._config = val;
		if(this.desktop){
		//update the UI here.
		}
	},
	
	bind_: function () {
		this.$supers(tbeditor.Tbeditor,'bind_', arguments);
		
		this._jqCnt = jq(this.$n('cnt'));
		var wgt = this;
		this._jqCnt.trumbowyg(this._config)
					.on('tbwfocus', function(evt) { wgt.proxy(wgt.doFocus_)(jq.Event.zk(evt, wgt)); })
					.on('tbwblur', wgt.proxy(wgt._onBlur))
					.on('tbwchange', wgt.proxy(wgt._onChange))
					.on('tbwpaste', function() { wgt._onPaste(wgt); })
					.on('tbwclose', function() { wgt._onClose(wgt); });
		
		zWatch.listen({
			onSize : this
		});
	},
	unbind_: function () {
		this._jqCnt.trumbowyg('destroy');
		
		zWatch.unlisten({
			onSize : this
		});

		this.$supers(tbeditor.Tbeditor,'unbind_', arguments);
	},
	
	_setSize: function (value, prop) {
		value = this._getValue(value);
		if (!value) return;
		
		if (prop == 'height') {
			//set editor's height as parent div
			var contentHeight = this._calcEditorHeight(value.endsWith('%') ? 
					jq(this.$n()).outerHeight() : value);
			this._jqCnt.css({minHeight: contentHeight});
			this._jqCnt.parent().css({minHeight: contentHeight});
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
	setFlexSize_: function(sz, ignoreMargins) {
		this.$supers('setFlexSize_', arguments);
		//hflex isn't handled here
		if (sz.height) {
			var contentHeight = this._calcEditorHeight(sz.height);
			this._jqCnt.css({minHeight: contentHeight});
			this._jqCnt.parent().css({minHeight: contentHeight});
		}
	},
	_calcEditorHeight: function(height) {
		var tbBox = jq(this.$n()).children().eq(0);
		return zk.parseInt(height) - zk.parseInt(tbBox.css('marginTop'))
					- zk.parseInt(tbBox.css('marginBottom'))
					- 2 * zk.parseInt(tbBox.css('border'))
					- jq(this.$n()).find('ul').outerHeight(); //buttons' height
	},
	onSize: function() {
		this.$supers('onSize', arguments);
		if (!this.getVflex()) {
			this._setSize(this.getHeight(), 'height');
		}
		if (!this.getHflex()) {
			this._setSize(this.getWidth(), 'width');
		}
	},
	_onBlur: function(evt) {
		//we take it as onChange
		this._value = this._jqCnt.trumbowyg('html');//same with evt.target.innerHTML;
		this.fire('onChange', {value: this._value});
	},
	_onChange: function(evt) {
		//actually, it's onChanging
		var formerText = this._value;
		var laterText = this._jqCnt.trumbowyg('html');//same with evt.target.innerHTML;
		if (formerText != laterText) {
			this._value = laterText;
			this.fire('onChanging', {value: this._value});
		}
	},
	_onPaste: function(wgt) {
		//do nothing
	},
	_onClose: function(wgt) {
		//do nothing
	},
	getZclass: function () {
		return this._zclass != null ? this._zclass: "z-tbeditor";
	}
});