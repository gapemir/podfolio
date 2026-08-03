namespace pod {
    class File extends gn.ui.tile.TileItem {
        constructor(data) {
            super(data)

            this.layoutManager = new gn.ui.layout.Column();

            this._head = new gn.ui.container.Row("fileHead");
            this.add(this._head);

            let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
            download.tooltip = this.tr("DOWNLOAD");
            download.addEventListener("click", function(){
                Application.instance().downloadFile("./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey, this._data.name);
            }, this);
            this._head.add(download);
            let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
            share.tooltip = this.tr("SHARE");
            share.addEventListener("click", function(){
                let link = /.*\//.exec(window.location)[0];
                let name = encodeURI(this._data.name).replaceAll("%20", "+");
                if(name.includes("%")){
                    name = this._data.storeid;
                }
                gn.io.Clipboard.writeText(link + "data/"+ gn.app.App.instance().userId +"/"+this._data.storeid+"?key="+this._data.fileKey);
            }, this);
            this._head.add(share);

            let headTextDiv = new gn.ui.basic.Widget(null, "div");
            this._head.add(headTextDiv)
            this._headText = new gn.ui.basic.Label(this._data.name, "", this);
            this._headText.setStyle("cursor", "pointer");
            headTextDiv.add(this._headText);
        
            this._cont = new gn.ui.basic.Widget(null, "div", "fileCont");
            this.add(this._cont);

            this._contentItem = null;
            let mimetype = this._data.mimetype;
            const mimeIconMap = [
                { keys: ["image/"], icon: "fa-file-image" },
                { keys: ["pdf"], icon: "fa-file-pdf" },
                { keys: ["text/"], icon: "fa-file-lines" },
                { keys: ["wordprocessingml", "msword", "ms-word", "opendocument.text", "odt"], icon: "fa-file-word" },
                { keys: ["spreadsheetml", "excel", "opendocument.spreadsheet", "ods"], icon: "fa-file-excel" },
                { keys: ["presentationml", "powerpoint", "opendocument.presentation", "odp"], icon: "fa-file-powerpoint" },
                { keys: ["application/zip", "compressed"], icon: "fa-file-zipper" },
                { keys: ["audio/"], icon: "fa-file-audio" },
                { keys: ["video/"], icon: "fa-file-video" }
            ];

            if (mimetype.includes("image/")) {
                let src = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
                this._contentItem = new gn.ui.basic.Image(src, "fileImage");
            } 
            else if (mimetype.includes("gn-note/")) {
                this._contentItem = new gn.ui.input.MultiLine();
                this._contentItem.addClass("gn-note");
                this._contentItem.value = this._data.content;
                this._contentItem.addEventListener("input", function(e) {
                    this.sendEvent("noteChanged", { content: this._contentItem.value, storeid: this._data.storeid });
                }, this);  
            } 
            else {
                const match = mimeIconMap.find(item => item.keys.some(key => mimetype.includes(key)));
                
                // Use the matched icon, or default to a generic file icon
                const iconName = match ? match.icon : "fa-file";
                this._contentItem = new gn.ui.basic.Icon(70, iconName, ["fa-regular"]);
            }
            this._cont.add(this._contentItem);

            this._headText.addEventListener("click", function(){
                window.location.href = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
            }.bind(this));
            /*this._contentItem.onclick = function(){
                window.location.href = "./data/" + userid + "/" + file.storeid + "?key=" + file.fileKey;
            };*/
            this._contentItem.setStyle("cursor", "pointer"); 

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
                rename.addEventListener("click", this._rename, this);
                rename.tooltip = "Rename";
                this._head.add(rename);

                let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
                gear.addEventListener("click", this.toggleMenu, this);
                gear.tooltip = "Settings";
                this._head.add(gear);

                if( this._data.mimetype.includes("gn-note/") ){
                    this.addEventListener( "noteChanged", this._noteChanged, this );
                }
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
        toggleMenu() {
            if(!this._menu) {
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
            this._menu = new gn.ui.container.Grid("fileMenu", 10, "50px 1fr", "rep");gn.ui.container.Grid
            this._menu.setStyle("width", "fit-content");
            this._menu.setStyle("align-content", "center");
            this._menu.setStyle("align-items", "center");

            let inp1 = new gn.ui.input.Switch(this._data.public);
            inp1.addEventListener("change", async function() {
                if(await this._changeContentMeta(this._data.storeid, ["public", inp1.value])) {
                    this.sendEvent("changeData", {index: this._data.storeid, key: "public", value: inp1.value})
                } else {
                    console.error("Error changing meta data")
                }
            }, this);
            this._menu.add(inp1);
            this._menu.add(new gn.ui.basic.Label(this.tr("PUBLIC")));

            let inp2 = new gn.ui.input.Switch(this._data.advertise);
            inp2.addEventListener("change", async function(){
                if(await this._changeContentMeta(this._data.storeid, ["advertise", inp2.value])) {
                    this.sendEvent("changeData", {index: this._data.storeid, key: "advertise", value: inp2.value})
                } else {
                    console.error("Error changing meta data")
                }
            }, this);
            this._menu.add(inp2);
            inp2.tooltip = "NOT IMPLEMENTED YET";
            
            let tex2 = new gn.ui.basic.Label(this.tr("ADVERTISE"));
            tex2.tooltip = "NOT IMPLEMENTED YET";
            this._menu.add(tex2);

            let del = new gn.ui.control.Button(this.tr("DELETE"), "fileMenuButton", this._deleteFile, this);
            del.setStyle("grid-column", "1 / span 2");
            this._menu.add(del);

            this.add(this._menu);
        }
        _contentType() {
            return this._data.mimetype.includes("gn-note/") ? "note" : "file";
        }
        async _changeContentMeta(storeid, data) { 
            let res_data = null;
            res_data = await gn.app.App.requestJ('./php/' + this._contentType() + '/changeMeta.php', {
                storeid: storeid,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                data: data
            });
            return res_data.status == 1;
        }
        async _deleteFile(e) {
            let dlg = gn.ui.popup.Popup.ConfirmationPopup(this.tr("DELETE"), this.tr("YOU_SURE_YOU_WANT_TO_DELETE_THIS_FILE"));
                dlg.addEventListener("yes", async function(){
                    let data = await gn.app.App.requestJ("./php/" + this._contentType() + "/delete.php", {
                        storeid: this._data.storeid,
                        token: gn.app.App.instance().token,
                        userid: gn.app.App.instance().userId
                    });
                    if(data.status == 1) {
                        this.sendEvent("removeData", this._data.storeid);
                    }    
                }, this);
            dlg.show();
        }
        async _noteChanged(e) {
            if(!this._changeTimer) {
                this._changeTimer = new gn.event.Timer(1000);
                this._changeTimer.singleShot = true;
                this._changeTimer.addEventListener("timeout", this._saveNoteChanged, this);
            }
            this._changeTimer.restart();
            this._data.content = e.data.content;
        }
        async _saveNoteChanged() {
            let data = await gn.app.App.requestJ('./php/note/change.php', {
                storeid: this._data.storeid,
                content: this._data.content,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId
            });
            return data.status == 1;
        }
        async _rename(e) {
            let dlg = gn.ui.popup.Popup.InformationPopup(this.tr("RENAME"), new gn.ui.input.Line("", this.tr("NEW NAME")));
            dlg.callback = function(){
                return this._body._children[0].value;
            }
            dlg.addEventListener("ok", async function(e){
                let data = await gn.app.App.requestJ("./php/"+this._contentType()+"/rename.php", {
                    storeid: this._data.storeid,
                    newname: e.data,
                    token: gn.app.App.instance().token,
                    userid: gn.app.App.instance().userId
                    });
                if(data.status == 1){
                    this.sendEvent("changeData", {index: this._data.storeid, key: "name", value: data.name || e.data})
                }
            }, this);
            dlg.show();
        }
    }
}