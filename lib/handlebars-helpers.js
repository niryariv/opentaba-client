Handlebars.registerHelper('ifContains', function(str, val, options) {
    if (str.indexOf(val) !== -1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('progressbar', function(day, month, year, options) {
    var date1 = new Date(month+'/'+day+'/'+year);
    var date2 = new Date(); // now
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var daysLeft = Math.max(60 - Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);
    
    // if no days are left don't show a progress bar
    if (daysLeft == 0)
        return '';
    
    // color - if we have more than 30 days should be yellow (=warning), otherwise red
    var progressClass;
    if (daysLeft > 30)
        progressClass = 'warning';
    else
        progressClass = 'danger';
    
    var daysPercent = Math.floor(daysLeft / 60 * 100);
    
    return new Handlebars.SafeString('<div class="progress right"> \
            <div class="progress-bar progress-bar-' + progressClass + '" role="progressbar" aria-valuenow="' + daysPercent + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + daysPercent + '%" /> \
            <span> \
                נותרו ' + daysLeft + ' ימים להגיש התנגדות \
            </span> \
        </div>');
});
