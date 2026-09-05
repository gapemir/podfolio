namespace pod {
    class Header extends gn.ui.Header {
        constructor() {
            super({left: true, center: true, right: true});
            this.setStyle( "text-wrap", "nowrap" )
            this.sticky = true;
            this.left.add(new gn.ui.basic.Label(this.tr("PODFOLIO")));
            this.center.add(new gn.ui.basic.Label(this.tr("YOUR_PERSONAL_PASTEBIN")));
            let notif = new gn.ui.basic.Icon(30, "fa-message", ["fa-solid"]);
            this.right.add(notif);
            this.right.layoutManager.gap = 10;
            let user = new gn.ui.basic.Icon(30, "fa-user", ["fa-solid"])
            user.addEventListener("click", function () {
                if( gn.lang.Var.isNull(this._popup) ){
                    this._popup = new gn.ui.control.Menu(user, true);
                    this._logoutAction = new gn.core.Action("logout", this.tr("LOGOUT"));
                    this._logoutAction.icon = new gn.ui.basic.Icon(15, "fa-right-from-bracket", ["fa-solid"])
                    this._logoutAction.addEventListener( "triggered", function(){
                        gn.app.App.instance().logout();
                    }, this );

                    this._publicAction = new gn.core.Action("public_page", this.tr("MY_PUBLIC_PAGE"));
                    this._publicAction.icon = new gn.ui.basic.Icon(15, "fa-user", ["fa-solid"]);
                    this._publicAction.addEventListener( "triggered", function(){
                        alert("soon");
                    }, this );
                    this._popup.actions = [ this._logoutAction, this._publicAction ];
                }
                this._popup.show(); 
            }, this);
            this.right.add(user);
            
        }
    }
}