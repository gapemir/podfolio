namespace pod {
    class Header extends gn.ui.Header {
        constructor() {
            super({left: true, center: true, right: true});
            this.setStyle( "text-wrap", "nowrap" )
            this.sticky = true;
            this.left.add(new gn.ui.basic.Label(this.tr("PODFOLIO")));
            this.center.add(new gn.ui.basic.Label(this.tr("YOUR_PERSONAL_PASTEBIN")));
            let user = new gn.ui.basic.Icon(30, "fa-user", ["fa-solid"])
            user.addEventListener("click", function () {
                if( gn.lang.Var.isNull(this._popup) ){
                    this._popup = new gn.ui.control.Menu(user);
                    this._popup.setStyle("padding", "5px");
                    this._popup.addItem(new gn.ui.control.MenuItem("logout", new gn.ui.basic.Label(this.tr("LOGOUT")), new gn.ui.basic.Icon(20, "fa-right-from-bracket", ["fa-solid"]), function () {
                        gn.app.App.instance().logout();
                    }));
                    this._popup.addItem(new gn.ui.control.MenuItem("public_page", new gn.ui.basic.Label(this.tr("MY_PUBLIC_PAGE")), new gn.ui.basic.Icon(20, "fa-user", ["fa-solid"]), async function () {
                        // window.location.href = "./public.html?user=" + gn.app.App.instance().userId;
                        console.log(await gn.io.Clipboard.readText());
                        alert("soon :)")
                    }));
                }
                this._popup.show(); 
            }, this);
            this.right.add(user);
            
        }
    }
}