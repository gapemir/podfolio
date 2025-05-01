class Application extends gn.app.App{
    constructor() {
        super();
    }
    get userId() {
        let userId = gn.util.Cookie.get().podfolioUserid; //ither its logged in user
        if( gn.lang.Var.isNull(userId) ){
            userId = new URL(window.location.href).searchParams.get("user") //its user that shared its public page
        }
        return userId; //or its null witch means we go to first page aka advertize
    }
    get token() {
        let token = gn.util.Cookie.get().podfolioToken; //either its logged in user
        return token //or its null witch means we go to either public listings or first page
    }
    downloadFile(href, name = "download") {
        const link = document.createElement('a');
        link.href = href;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    writeToClipboard(text) {
        navigator.clipboard.writeText(text);
    }
}