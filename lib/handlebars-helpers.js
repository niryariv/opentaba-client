Handlebars.registerHelper('statusWithTooltip', function(status, options) {
    var tooltip;
    switch (status) {
        case 'פרסום בעיתונות לתוקף':
            tooltip = 'התכנית כבר אושרה, והודעה על כך מפורסמת בעיתונות לפי החוק';
            break;
        case 'פרסום תוקף ברשומות':
            tooltip = 'התכנית כבר אושרה, והודעה על כך מפורסמת ברשומות הרשמיות לפי החוק';
            break;
        case 'אושר בועדת תאום לשיכונים ציבוריים':
            tooltip = 'אישור חלוקה מחדש של חלקות ובעלויות בשיכונים ציבוריים קיימים';
            break;
        case 'הוכרז שיכון ציבורי':
            tooltip = 'הסדרת חלקות ובעלויות של משתכני דיור ציבורי מסטטוס זמני לבעלות קבועה';
            break;
        case 'פרסום ההפקדה':
            tooltip = 'פרסום הפקדת התוכנית';
            break;
        case 'הוגשה למקומית':
            tooltip = 'התוכנית הוגשה לוועדה המקומית, אך עדיין לא פורסמה';
            break;
        case 'סעיפים 77 ו-78 לחוק תכנון ובניה':
            tooltip = 'פרסום הודעה על הכנת תכנית';
            break;
        case 'דיון בהתנגדויות':
            tooltip = 'הוועדה דנה בהתנגדויות שהוגשו';
            break;
        case 'הומלצה לאישור בועדה':
            tooltip = 'התכנית הומלצה לאישור לאחר דיון בהתנגדויות';
            break;
        case 'פרסום בעיתונות להפקדה':
            tooltip = 'התוכנית הופקדה בועדת התכנון, ופורסמה ידיעה בעיתון לפי חוק';
            break;
        case 'התוכנית נדחתה':
            tooltip = 'התוכנית נדחתה ע&quot;י הוועדה';
            break;
        case 'פרסום ביטול תוקף':
            tooltip = 'התוכנית בוטלה';
            break;
        case 'דיון מתן תוקף בועדת תכנון':
            tooltip = 'התוכנית נדונה בוועדה, כנראה לאחר שמיעת ההתנגדויות';
            break;
        case 'אושר לתוקף/ לא פורסם':
            tooltip = 'התוכנית כנראה אושרה, אך אישור עדיין לא פורסם';
            break;
        case 'בתהליך ביטול':
            tooltip = 'התכנית בתהליך ביטול';
            break;
        case 'תכנית גנוזה':
            tooltip = 'התכנית נגנזה';
            break;
        case 'תוקף ברשומות- באישור שר הפנים':
            tooltip = 'פרסום התוקף יבוצע בכפוף לאישור שר הפנים';
            break;
        case 'תכנית בהקפאה /התלייה':
            tooltip = 'התכנית הוקפאה בוועדה, בד&quot;כ בשל התנגשות עם תכנית אחרת';
            break;
        case 'הוגשה למחוזית':
            tooltip = 'התוכנית הוגשה לוועדה המחוזית';
            break;
        case 'פרסום ביטול הפקדה':
            tooltip = 'הפקדת התכנית בוטלה';
            break;
        case 'סקרים':
            //tooltip = '?';
            break;
        case 'טרום הפקדה':
            tooltip = 'שלב תכנוני לפני הפקדה';
            break;
        case 'בדיקת אפשרויות':
            tooltip = 'שלב תכנוני לפני הפקדה';
            break;
    }
    
    if (tooltip)
        return new Handlebars.SafeString('<p rel="tooltip" title="' + tooltip + '">' + status + "</p>");
    else
        return new Handlebars.SafeString(status);
});
