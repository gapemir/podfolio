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

            let loginPage = new gn.ui.container.Column("login-page");
            let loginForm = new gn.ui.container.Column("login-form", 5);
            this._lusername = new gn.ui.input.Line("", "USERNAME_OR_EMAIL");
            loginForm.add(this._lusername);
            this._lpassword = new gn.ui.input.Password("", "PASSWORD");
            loginForm.add(this._lpassword);
            this._lloginB = new gn.ui.control.Button("LOGIN", "", this._login, this);
            loginForm.add(this._lloginB);
            this._lregisterB = new gn.ui.control.Button("REGISTER", "small", () => { this._stack.next(); }, this);
            loginForm.add(this._lregisterB);
            loginPage.add(loginForm);
            this._stack.add(loginPage);

            let regPage = new gn.ui.container.Column();
            let regForm = new gn.ui.container.Column("login-form", 5);
            this._rusername = new gn.ui.input.Line("", "USERNAME");
            regForm.add(this._rusername);
            this._remail = new gn.ui.input.Line("", "EMAIL");
            regForm.add(this._remail);
            this._rpassword = new gn.ui.input.Password("", "PASSWORD");
            regForm.add(this._rpassword);
            this._rregisterB = new gn.ui.control.Button("REGISTER", "", this._register, this);
            regForm.add(this._rregisterB);
            this._rloginB = new gn.ui.control.Button("LOGIN", "small", () => { this._stack.next(); }, this);
            regForm.add(this._rloginB);
            regPage.add(regForm);
            this._stack.add(regPage);

        }
        onActivated() {
            gn.app.App.instance().header.exclude();
        }

        async _login() {
            let body = {
                username: this._lusername.value,
                password: this._lpassword.value,
            }
            if(gn.lang.String.isEmpty(body.username) || gn.lang.String.isEmpty(body.password)) {
                console.log("data must not be empty");
                return;
            }
            let resp = await gn.app.App.requestJ("./php/user/login.php", body);
            if(resp.status == 1) { // alles gut
                document.cookie = `podfolioUserid=${resp.userid}; path=/`;
                document.cookie = `podfolioToken=${resp.token}; path=/`;
                gn.app.App.instance().state = pod.App.appState.LOGGEDIN;
                gn.app.App.instance().root.activate("mainWindow");
            } else if(resp.status == -2) {
                console.log("Username or password wrong");
            }
        }

        async _register() {
            let body = {
                username: this._rusername.value,
                email: this._remail.value,
                password: this._rpassword.value,
            }
            if(gn.lang.String.isEmpty(body.username) || gn.lang.String.isEmpty(body.email) || gn.lang.String.isEmpty(body.password)) {
                console.log("data must not be empty");
                return;
            }
            let resp = await gn.app.App.requestJ("./php/user/register.php", body);
            if(resp.status == 1) { // alles gut
                document.cookie = `podfolioUserid=${resp.userid}; path=/`;
                document.cookie = `podfolioToken=${resp.token}; path=/`;
                gn.app.App.instance().root.activate("mainWindow");
            } else if(resp.status == -4) {
                alert("username already exists");
            }
        }
    }
}