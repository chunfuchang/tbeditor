/**
* Here's the mold file , a mold means a HTML struct that the widget really presented.
* yep, we build html in Javascript , that make it more clear and powerful.
*/
function (out) {

	out.push('<div', this.domAttrs_(), '><div id=', this.uuid, '-cnt>');
	out.push(this._value);
	out.push('</div></div>');

}