class Application extends gn.app.App{
    constructor() {
        super();
    }
    main(){
        super.main();
        gn.locale.LocaleManager.instance().locale = "en"
        this.header = new Header();
    }
    get userId() {
        let userId = gn.util.Cookie.get().podfolioUserid;
        if( gn.lang.Var.isNull(userId) ){
            userId = new URL(window.location.href).searchParams.get("user");
        }
        return userId; 
    }
    get token() {
        let token = gn.util.Cookie.get().podfolioToken;
        return token 
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
        //if debugger is opened and this throws error its expected behavior
    }
    logout() {
        gn.util.Cookie.del("podfolioToken");
        gn.util.Cookie.del("podfolioUserid");
        window.location.reload();
    }
}
class Header extends gn.ui.Header{
    constructor() {
        super({left: true, center: true, right: true});
        this.setStyle( "text-wrap", "nowrap" )
        this.sticky = true;
        this.left.add(new gn.ui.basic.Label(this.tr("PODFOLIO")));
        this.center.add(new gn.ui.basic.Label(this.tr("YOUR_PERSONAL_PASTEBIN")));
        let user = new gn.ui.basic.Icon(30, "fa-user", ["fa-solid"])
        user.addEventListener("click", function () {
            if( gn.lang.Var.isNull(this._popup) ){
                this._popup = new gn.ui.popup.Menu(user);
                this._popup.addItem(new gn.ui.popup.MenuItem(new gn.ui.basic.Label(this.tr("LOGOUT")), new gn.ui.basic.Icon(20, "fa-right-from-bracket", ["fa-solid"]), function () {
                    Application.instance().logout();
                }));
                this._popup.addItem(new gn.ui.popup.MenuItem(new gn.ui.basic.Label(this.tr("MY_PUBLIC_PAGE")), new gn.ui.basic.Icon(20, "fa-user", ["fa-solid"]), function () {
                    window.location.href = "./public.html?user=" + Application.instance().userId;
                }));
            }
            this._popup.show(); 
        }, this);
        this.right.add(user);
        
    }
}