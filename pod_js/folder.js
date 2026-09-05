namespace pod {
    class Folder extends gn.ui.tile.TileSubItemContainer {
        constructor(data) {
            super(data)

            this.layoutManager = new gn.ui.layout.Column();
            
            this._head = new gn.ui.basic.Widget(new gn.ui.layout.Row(), "div", "fileHead");
            this.add(this._head);
            let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
            download.tooltip = this.tr("DOWNLOAD");
            download.addEventListener("click", async function(){
                await this._downloadZip(this._data.storeid, this._data.name + ".zip");
            }, this);
            this._head.add(download);
            //TODO share folder
            // let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
            // share.tooltip = "Share";
            // share.addEventListener("click", function(){
            //     let link = /.*\//.exec(window.location)[0];
            //     let name = encodeURI(this._data.name).replaceAll("%20", "+");
            //     if(name.includes("%")){
            //         name = this._data.storeid;
            //     }
            //     Application.instance().writeToClipboard(link + "data/"+ gn.app.App.instance().userId +"/"+this._data.storeid+"?key="+this._data.fileKey)
            // }, this);
            // this._head.add(share);

            let headTextDiv = new gn.ui.basic.Widget(null, "div");
            this._head.add(headTextDiv)
            this._headText = new gn.ui.basic.Label(this._data.name, "", this);
            this._headText.setStyle("cursor", "pointer");
            headTextDiv.add(this._headText);
        
            this._cont = new gn.ui.basic.Widget(null, "div", "fileCont");
            this.add(this._cont);

            let contentItem = new gn.ui.basic.Icon(70, "fa-folder", ["fa-regular"] )
            this._cont.add(contentItem);
        
            this._headText.addEventListener("click", function(){
                this.sendEvent("openGroup", this._data.storeid);
            }, this);
            contentItem.setStyle("cursor", "pointer");


            if(gn.app.App.instance().state == pod.App.appState.LOGGEDIN) {
                this._publicIcon = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
                this._publicIcon.setStyle("color", "green");
                this._publicIcon.tooltip = "Public";
                this._head.add(this._publicIcon);
                if(!this._data.public){
                    this._publicIcon.addClass("gn-exclude");
                }

                this._advertiseIcon = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
                this._advertiseIcon.setStyle("color", "green");
                this._advertiseIcon.tooltip = "Advertise";
                this._head.add(this._advertiseIcon);
                if(!this._data.advertise){
                    this._advertiseIcon.addClass("gn-exclude");
                }

                let rename = new gn.ui.basic.Icon(14, "fa-pen-to-square", ["fa-solid"]);
                rename.addEventListener("click", this._renameFolder, this);
                rename.tooltip = "Rename";
                this._head.add(rename);

                let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
                gear.addEventListener("click", this.toggleMenu, this);
                gear.tooltip = "Settings";
                this._head.add(gear);
            }
        }
        updateItem(data, key) {
            super.updateItem(data, key);
            switch(key) {
                case "public":
                    if(this._data.public) {
                        this._publicIcon.removeClass("gn-exclude");
                    } else {
                        this._publicIcon.addClass("gn-exclude");
                    }
                    break;
                case "advertise":
                    if(this._data.advertise) {
                        this._advertiseIcon.removeClass("gn-exclude");
                    } else {
                        this._advertiseIcon.addClass("gn-exclude");
                    }
                    break;
                case "name": 
                    this._headText.text = this._data.name;
                    break;
            }
        }
        async _downloadZip(storeid, filename = "folder.zip") {
            let data = await gn.io.Request.post("./php/folder/createZip.php", {
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                storeid: storeid
            });
            const blob = new Blob([data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return true;
        }
        toggleMenu() {
            if(!this._menu){
                this._buildMenu();
            }
            if(this._menuIsShown) {
                this._menu.exclude();
                this._cont.show();
                this._menuIsShown = false;
            } else {
                this._menu.show();
                this._cont.exclude();
                this._menuIsShown = true;
            }
        }
        _buildMenu() {
            this._menuIsShown = false;
            this._menu = new gn.ui.container.Grid("fileMenu", 10, "50px 1fr", "repeat(3, 35px)");
            this._menu.setStyle("width", "fit-content");
            this._menu.setStyle("align-content", "center");
            this._menu.setStyle("align-items", "center");

            let inp1 = new gn.ui.input.Switch(this._data.public);
            inp1.addEventListener("change", async function() {
                let ret = await this._changeFolderMeta(this._data.storeid, ["public", inp1.value]);
                if(ret) {
                    this.sendEvent("changeData", {index: this._data.storeid, key: "public", value: inp1.value})
                } else {
                    console.error("Error changing meta data")
                }
            }, this);
            this._menu.add(inp1);
            this._menu.add(new gn.ui.basic.Label(this.tr("PUBLIC")));

            let inp2 = new gn.ui.input.Switch(this._data.advertise);
            inp2.addEventListener("change", async function() {
                let ret = await this._changeFolderMeta(this._data.storeid, ["advertise", inp2.value]);
                if(ret) {
                    this.sendEvent("changeData", {index: this._data.storeid, key: "advertise", value: inp2.value});
                } else {
                    console.error("Error changing meta data");
                }
            }, this);
            this._menu.add(inp2);
            this._menu.add(new gn.ui.basic.Label(this.tr("ADVERTISE")));

            let del = new gn.ui.control.Button(this.tr("DELETE"), "fileMenuButton");
            del.addEventListener("click", async function() {
                let dlg = gn.ui.popup.Dialog.ConfirmationDialog(this.tr("DELETE_FOLDER"), this.tr("ARE_YOU_SURE_DELETE_FOLDER"));
                let ret = await dlg.exec();
                if(ret == gn.ui.popup.Dialog.DialogCode.Accepted) {
                    let res = await this._deleteFolder(this._data.storeid);
                    if(res) {
                        this.sendEvent("removeData", this._data.storeid);
                    } else {
                        console.error("Error deleting folder");
                    }
                }
            }, this);
            del.setStyle("grid-column", "1 / span 2");
            this._menu.add(del);

            this.add(this._menu);
        }
        async _changeFolderMeta(storeid, data) {
            let res_data = await gn.io.Request.post('./php/folder/changeMeta.php', {
                storeid: storeid,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                data: data
            });
            return res_data.status == 1;
        }
        async _deleteFolder(storeid) {
            let data = await gn.io.Request.post('./php/folder/delete.php', {
                storeid: storeid,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
            });
            return data.status == 1;
        }
        async _renameFolder(e) {
            let dlg = gn.ui.popup.Dialog.InformationDialog(this.tr("RENAME_FOLDER"), new gn.ui.input.Line("", this.tr("NEW_NAME")));
            let ret = await dlg.exec();
            if(ret == gn.ui.popup.Dialog.DialogCode.Accepted) {
                let data = await gn.io.Request.post("./php/folder/rename.php", {
                    storeid: this._data.storeid,
                    newname: dlg.content.value,
                    token: gn.app.App.instance().token,
                    userid: gn.app.App.instance().userId,
                });
                if(data.status == 1) {
                    this.sendEvent("changeData", {index: this._data.storeid, key: "name", value: dlg.content.value});
                }
            }
        }
    }
}