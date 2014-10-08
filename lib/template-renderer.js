/*
 * Code taken from StackOverflow answer by the user koorchik : http://stackoverflow.com/a/10136935
 * and modified a bit for Opentaba and Handlebars (without Underscore)
 */

function render(tmpl_name, tmpl_data) {
    // keep a cache of downloaded and compiled templates
    if ( !render.tmpl_cache ) { 
        render.tmpl_cache = {};
    }

    // if requested template has not been loaded yet, load it
    if ( ! render.tmpl_cache[tmpl_name] ) {
        var tmpl_dir = '/templates';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

        // download it synchronously
        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: false,
            success: function(data) {
                tmpl_string = data;
            }
        });

        // and compile
        render.tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
    }
    
    // run the compiled template with the given data
    return render.tmpl_cache[tmpl_name](tmpl_data);
}
