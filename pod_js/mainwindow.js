namespace pod {
    class MainWindow extends gn.ui.window.Window {
        constructor() {
            super("mainWindow");

            this._tileContainer = null;
        }

        onActivated() {
            gn.app.App.instance().header.show();
            this.reset();
        }

        reset() {
            fetch('./php/user/getContent.php', {
                method: 'POST',
                body: JSON.stringify({
                    userid: gn.app.App.instance().userId,
                    token: gn.app.App.instance().token,
                })
                }
            ).then(response => response.json())
            .then(data => {
                console.log(data)
                if(data.status === -1){
                    console.log('Invalid token');
                    gn.app.App.instance().setCookie('podfolioUserid', '', -1);
                    gn.app.App.instance().setCookie('podfolioToken', '', -1);
                    window.location.href = './index.html';
                }
                if(this._tileContainer){
                    this._tileContainer.dispose();
                }
                this._tileContainer = new pod.TileContainer();
                this.add(this._tileContainer);

                let allItems = [ ...data.folders, ...data.notes, ...data.files ];
                allItems.forEach(el => {
                    el.display = el.name;
                    if(!gn.lang.Var.isNull(el.mimetype)){
                        el.type = gn.model.Model.Type.item;
                    }else {
                        el.type = gn.model.Model.Type.group;
                    }
                });
                this._tileContainer.model.key = "storeid";
                this._tileContainer.model.setDataFromFlat(allItems, "parent")
            })
        }
    }

}