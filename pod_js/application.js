namespace pod {
    class App extends gn.app.App {
        constructor() {
            super();
            this._state = pod.App.appState.UNDEFINED;
        }
        main() {
            super.main();
            gn.locale.LocaleManager.instance().locale = "en"
            this.header = new pod.Header();
        }
        get userId() {
            let userId = gn.io.Cookie.get().podfolioUserid;
            if( gn.lang.Var.isNull(userId) ){
                userId = new URL(window.location.href).searchParams.get("user");
            }
            return userId; 
        }
        get token() {
            let token = gn.io.Cookie.get().podfolioToken;
            return token 
        }
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
        }
        downloadFile(href, name = "download") {
            const link = document.createElement('a');
            link.href = href;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        logout() {
            gn.io.Cookie.del("podfolioToken");
            gn.io.Cookie.del("podfolioUserid");
            window.location.reload();
        }
        getLocalePath() {
            let paths = super.getLocalePath();
            paths.push("./translations/");
            return paths;
        }
    }
    App.appState = gn.lang.Enum({
        UNDEFINED: 0,
        LOGGEDIN: 1,
        PUBLIC: 2,
    });
}