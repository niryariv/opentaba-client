var status_tooltips = { 
    'פרסום בעיתונות לתוקף' : 'התכנית כבר אושרה, והודעה על כך מפורסמת בעיתונות לפי החוק',
    'פרסום תוקף ברשומות' : 'התכנית כבר אושרה, והודעה על כך מפורסמת ברשומות הרשמיות לפי החוק',
    'אושר בועדת תאום לשיכונים ציבוריים' : 'אישור חלוקה מחדש של חלקות ובעלויות בשיכונים ציבוריים קיימים',
    'הוכרז שיכון ציבורי' : 'הסדרת חלקות ובעלויות של משתכני דיור ציבורי מסטטוס זמני לבעלות קבועה',
    'פרסום ההפקדה' : 'פרסום הפקדת התוכנית',
    'הוגשה למקומית' : 'התוכנית הוגשה לוועדה המקומית, אך עדיין לא פורסמה',
    'סעיפים 77 ו-78 לחוק תכנון ובניה' : 'פרסום הודעה על הכנת תכנית',
    'דיון בהתנגדויות' : 'הוועדה דנה בהתנגדויות שהוגשו',
    'הומלצה לאישור בועדה' : 'התכנית הומלצה לאישור לאחר דיון בהתנגדויות',
    'פרסום בעיתונות להפקדה' : 'התוכנית הופקדה בועדת התכנון, ופורסמה ידיעה בעיתון לפי חוק',
    'התוכנית נדחתה' : 'התוכנית נדחתה ע&quot;י הוועדה',
    'פרסום ביטול תוקף' : 'התוכנית בוטלה',
    'דיון מתן תוקף בועדת תכנון' : 'התוכנית נדונה בוועדה, כנראה לאחר שמיעת ההתנגדויות',
    'אושר לתוקף/ לא פורסם' : 'התוכנית כנראה אושרה, אך אישור עדיין לא פורסם',
    'בתהליך ביטול' : 'התכנית בתהליך ביטול',
    'תכנית גנוזה' : 'התכנית נגנזה',
    'תוקף ברשומות- באישור שר הפנים' : 'פרסום התוקף יבוצע בכפוף לאישור שר הפנים',
    'תכנית בהקפאה /התלייה' : 'התכנית הוקפאה בוועדה, בד&quot;כ בשל התנגשות עם תכנית אחרת',
    'הוגשה למחוזית' : 'התוכנית הוגשה לוועדה המחוזית',
    'פרסום ביטול הפקדה' : 'הפקדת התכנית בוטלה',
    //'סקרים' : '?',
    'טרום הפקדה' : 'שלב תכנוני לפני הפקדה',
    'בדיקת אפשרויות' : 'שלב תכנוני לפני הפקדה'
};

Handlebars.registerHelper('statusWithTooltipAndBG', function(status, day, month, year, options) {
    var tooltip = '';
    if (status in status_tooltips)
        tooltip = status_tooltips[status];
    
    if (['פרסום ההפקדה', 'פרסום בעיתונות להפקדה'].indexOf(status) > -1) {
        var date1 = new Date(month+'/'+day+'/'+year);
        var date2 = new Date(); // now
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var daysLeft = Math.max(60 - Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);
        
        if (daysLeft > 0) {
            // color - if we have more than 30 days should be yellow, otherwise red
            var bg;
            if (daysLeft > 30)
                bg = '#f0ad4e'; // taken from bootstrap's progress-bar-warning
            else
                bg = '#d9534f'; // progress-bar-danger
            
            if (tooltip.length > 0)
                tooltip += '&NewLine;';
            tooltip += 'נותרו ' + daysLeft + ' ימים להגיש התנגדות';
            
            return new Handlebars.SafeString('<p class="status"><span class="status" style="background-color: ' + bg + 
                ';" rel="tooltip" data-container="#info" title="' + tooltip + '">' + status + '</span></p>');
        }
    }
    
    return new Handlebars.SafeString('<p class="status" rel="tooltip" data-container="#info" title="' + tooltip + '">' + status + "</p>");
});
