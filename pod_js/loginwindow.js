namespace pod {
    class LoginWindow extends gn.ui.window.Window {
        constructor() {
            super("login", new gn.ui.layout.Column());

            let upperDiv = new gn.ui.container.Row();
            upperDiv.height = "10%"
            upperDiv.add(new gn.ui.basic.Label("PODFOLIO"));
            upperDiv.setStyle("font-size", "xx-large");
            this.add(upperDiv);

            this._stack = new gn.ui.container.Stack();
            this.add(this._stack);

            let wrap1 = new gn.ui.container.Column("login-page");
            this._stack.add(wrap1);

            this._loginForm = new gn.ui.form.Form(null, 5);
            wrap1.add(this._loginForm);
            this._loginForm.addClass("login-form");
            
            this._loginForm.addElement("username", new gn.ui.input.Line("", "USERNAME_OR_EMAIL"), this.tr("USERNAME_OR_EMAIL"), false, true);
            this._loginForm.addElement("password", new gn.ui.input.Password("", "PASSWORD"), this.tr("PASSWORD"), false, true);

            this._loginForm.addElement("login", new gn.ui.control.Button("LOGIN"));
            this._loginForm.addElement("register", new gn.ui.control.Button("REGISTER", "small"));

            this._loginForm.elementAddEventListener("login", "click", this._login, this);
            this._loginForm.elementAddEventListener("register", "click", () => { this._stack.next(); }, this);

            let wrap2 = new gn.ui.container.Column("login-page");
            this._stack.add(wrap2);

            this._registerForm = new gn.ui.form.Form(null, 5);
            wrap2.add(this._registerForm);
            this._registerForm.addClass("login-form");
            
            this._registerForm.addElement("username", new gn.ui.input.Line("", "USERNAME"), this.tr("USERNAME"), false, true);
            this._registerForm.addElement("email", new gn.ui.input.Line("", "EMAIL"), this.tr("EMAIL"), false, true);
            this._registerForm.addElement("password", new gn.ui.input.Password("", "PASSWORD"), this.tr("PASSWORD"), false, true);

            this._registerForm.addElement("register", new gn.ui.control.Button("REGISTER"));
            this._registerForm.addElement("login", new gn.ui.control.Button("LOGIN", "small"));

            this._registerForm.elementAddEventListener("register", "click", this._register, this);
            this._registerForm.elementAddEventListener("login", "click", () => { this._stack.next(); }, this);            
        }

        onActivated() {
            gn.app.App.instance().header.exclude();
        }

        async _login() {
            let ok = this._loginForm.checkRules();
            if(!ok) {
                return;
            }
            let data = this._loginForm.data();
            let body = {
                username: data.username,
                password: data.password,
            }
            let resp = await gn.io.Request.post("./php/user/login.php", body);
            if(resp.status == 1) { // alles gut
                gn.io.Cookie.set("podfolioUserid", resp.userid);
                gn.io.Cookie.set("podfolioToken", resp.token);
                gn.app.App.instance().state = pod.App.appState.LOGGEDIN;
                gn.app.App.instance().root.activate("mainWindow");
            } else if(resp.status == -2) {
                console.log("Username or password wrong");
            }
        }

        async _register() {
            let ok = this._registerForm.checkRules();
            if(ok == false){
                return;
            }
            let data = this._registerForm.data();
            let body = {
                username: data.username,
                email: data.email,
                password: data.password,
            }
            let resp = await gn.io.Request.post("./php/user/register.php", body);
            if(resp.status == 1) { // alles gut
                gn.io.Cookie.set("podfolioUserid", resp.userid);
                gn.io.Cookie.set("podfolioToken", resp.token);
                gn.app.App.instance().root.activate("mainWindow");
            } else if(resp.status == -4) {
                let popup = gn.ui.popup.Dialog.InformationDialog("ERROR", "USERNAME ALREADY EXISTS");
                popup.show();
                console.log("test");
            }
            else {
                alert("an error acoured")
            }
        }
    }
}