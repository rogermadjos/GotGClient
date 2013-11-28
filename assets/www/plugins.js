$.ajaxSetup({
	cache: true
});

$.expr[':'].contentIs = function(el, idx, meta) {
    return $(el).text() === meta[3];
};

$.fn.pressEnter = function(fn) {  

    return this.each(function() {  
        $(this).bind('enterPress', fn);
        $(this).keyup(function(e){
            if(e.keyCode == 13)
            {
              $(this).trigger("enterPress");
            }
        })
    });  
};

$.fn.restrict = function( chars ) {
    return this.off('keydown').keydown(function(e) {
        var found = false;
        for(var i=0;i<chars.length;i++) {
            found = found || chars[i]+"" == String.fromCharCode(e.which);
        }
        if(found) {
        	e.preventDefault();
        }
    });
};