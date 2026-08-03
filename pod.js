"use strict";

var pod = {};

pod.Folder = class pod_Folder extends gn.ui.tile.TileSubItemContainer {
    constructor(data) {
        super(data)
        this.layoutManager = new gn.ui.layout.Column();
        this._head = new gn.ui.basic.Widget(new gn.ui.layout.Row(), "div", "fileHead");
        this.add(this._head);
        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = this.tr("DOWNLOAD");
        download.addEventListener("click", async function() {
            await this._downloadZip(this._data.storeid, this._data.name + ".zip");
        }, this);
        this._head.add(download);
        let headTextDiv = new gn.ui.basic.Widget(null, "div");
        this._head.add(headTextDiv)
        this._headText = new gn.ui.basic.Label(this._data.name, "", this);
        this._headText.setStyle("cursor", "pointer");
        headTextDiv.add(this._headText);
        this._cont = new gn.ui.basic.Widget(null, "div", "fileCont");
        this.add(this._cont);
        let contentItem = new gn.ui.basic.Icon(70, "fa-folder", ["fa-regular"])
        this._cont.add(contentItem);
        this._headText.addEventListener("click", function() {
            this.sendEvent("openGroup", this._data.storeid);
        }, this);
        contentItem.setStyle("cursor", "pointer");
        if (gn.app.App.instance().state == pod.App.appState.LOGGEDIN) {
            this._publicIcon = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            this._publicIcon.setStyle("color", "green");
            this._publicIcon.tooltip = "Public";
            this._head.add(this._publicIcon);
            if (!this._data.public) {
                this._publicIcon.addClass("gn-exclude");
            }
            this._advertiseIcon = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            this._advertiseIcon.setStyle("color", "green");
            this._advertiseIcon.tooltip = "Advertise";
            this._head.add(this._advertiseIcon);
            if (!this._data.advertise) {
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
        switch (key) {
            case "public":
                if (this._data.public) {
                    this._publicIcon.removeClass("gn-exclude");
                } else {
                    this._publicIcon.addClass("gn-exclude");
                }
                break;
            case "advertise":
                if (this._data.advertise) {
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
        let data = await gn.app.App.requestA("./php/folder/createZip.php", {
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            storeid: storeid
        });
        const blob = new Blob([data], {
            type: 'application/zip'
        });
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
        if (!this._menu) {
            this._buildMenu();
        }
        if (this._menuIsShown) {
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
            if (ret) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "public",
                    value: inp1.value
                })
            } else {
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp1);
        this._menu.add(new gn.ui.basic.Label(this.tr("PUBLIC")));
        let inp2 = new gn.ui.input.Switch(this._data.advertise);
        inp2.addEventListener("change", async function() {
            let ret = await this._changeFolderMeta(this._data.storeid, ["advertise", inp2.value]);
            if (ret) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "advertise",
                    value: inp2.value
                });
            } else {
                console.error("Error changing meta data");
            }
        }, this);
        this._menu.add(inp2);
        this._menu.add(new gn.ui.basic.Label(this.tr("ADVERTISE")));
        let del = new gn.ui.control.Button(this.tr("DELETE"), "fileMenuButton");
        del.addEventListener("click", async function() {
            let dlg = gn.ui.popup.Popup.ConfirmationPopup(this.tr("DELETE_FOLDER"), this.tr("ARE_YOU_SURE_DELETE_FOLDER"));
            dlg.addEventListener("yes", async function() {
                let res = await this._deleteFolder(this._data.storeid);
                if (res) {
                    this.sendEvent("removeData", this._data.storeid);
                } else {
                    console.error("Error deleting folder");
                }
            }, this);
            dlg.show();
        }, this);
        del.setStyle("grid-column", "1 / span 2");
        this._menu.add(del);
        this.add(this._menu);
    }
    async _changeFolderMeta(storeid, data) {
        let res_data = await gn.app.App.requestJ('./php/folder/changeMeta.php', {
            storeid: storeid,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            data: data
        });
        return res_data.status == 1;
    }
    async _deleteFolder(storeid) {
        let data = await gn.app.App.requestJ('./php/folder/delete.php', {
            storeid: storeid,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
        });
        return data.status == 1;
    }
    async _renameFolder(e) {
        let dlg = gn.ui.popup.Popup.InformationPopup(this.tr("RENAME_FOLDER"), new gn.ui.input.Line("", this.tr("NEW_NAME")));
        dlg.callback = function() {
            return this._body._children[0].value;
        }
        dlg.addEventListener("ok", async function(e) {
            let data = await gn.app.App.requestJ("./php/folder/rename.php", {
                storeid: this._data.storeid,
                newname: e.data,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
            });
            if (data.status == 1) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "name",
                    value: e.data
                });
            }
        }, this);
        dlg.show();
    }
}
pod.MainWindow = class pod_MainWindow extends gn.ui.window.Window {
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
            }).then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.status === -1) {
                    console.log('Invalid token');
                    gn.app.App.instance().setCookie('podfolioUserid', '', -1);
                    gn.app.App.instance().setCookie('podfolioToken', '', -1);
                    window.location.href = './index.html';
                }
                if (this._tileContainer) {
                    this._tileContainer.dispose();
                }
                this._tileContainer = new pod.TileContainer();
                this.add(this._tileContainer);
                let allItems = [...data.folders, ...data.notes, ...data.files];
                allItems.forEach(el => {
                    el.display = el.name;
                    if (!gn.lang.Var.isNull(el.mimetype)) {
                        el.type = gn.model.Model.Type.item;
                    } else {
                        el.type = gn.model.Model.Type.group;
                    }
                });
                this._tileContainer.model.key = "storeid";
                this._tileContainer.model.setDataFromFlat(allItems, "parent")
            })
    }
}
pod.TileContainer = class pod_TileContainer extends gn.ui.tile.TileContainer {
    constructor() {
        super({
            filter: true
        })
        this.addClass('fileList');
        this.model = new gn.model.FilterSortTreeModel(new gn.model.TreeModel());
        this.tileClass = pod.File;
        this.subItemContClass = pod.Folder;
        this.breadcrumb = new gn.ui.control.Breadcrumb();
        this.breadcrumb.model = this._model;
        this.breadcrumb.topLevelName = this.tr("HOME");
        this._header.add(this.breadcrumb);
        this._addFirst();
    }
    genFakeTileItems() {
        for (let i = 0; i < this._fakeTiles.length; i++) {
            this.remove(this._fakeTiles[i]);
        };
        this._fakeTiles = [];
        var perLine
        if (this._idElementMap.size == 0) {
            perLine = 4;
        } else {
            perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
        }
        var n = this._groups.get(this._currentGroup).length + 1 % perLine;
        if (n == 0) {
            n = perLine;
        } else {
            n = (n % perLine);
            if (n != 0) {
                n = perLine - n;
            }
        }
        for (let i = 0; i < n; i++) {
            let item = new this._fakeTileClass(this);
            this._fakeTiles.push(item);
            this.add(this._fakeTiles.at(-1));
        }
    }
    _addFirst() {
        if (!this._firstItem) {
            this._firstItem = new gn.ui.basic.Widget(new gn.ui.layout.Column(), "div", "fileTile");
            let head = new gn.ui.basic.Widget(new gn.ui.layout.Row(), "div", "fileHead");
            head.add(new gn.ui.basic.Label(this.tr("ACTIONS")));
            this._firstItem.add(head);
            let cont = new gn.ui.container.Column("fileCont fileTileFirst");
            cont.add(new gn.ui.basic.Label(this.tr("UPLOAD_A_FILE")))
            this._firstItem.fileInput = new gn.ui.input.File();
            cont.add(this._firstItem.fileInput);
            cont.add(new gn.ui.basic.Label(this.tr("RENAME_FILE_OPTIONAL")))
            this._firstItem.nameOfFile = new gn.ui.input.Line("", this.tr("FILE_WITHOUT_EXTENSION"));
            cont.add(this._firstItem.nameOfFile);
            let but1 = new gn.ui.control.Button(this.tr("UPLOAD"));
            but1.addEventListener("click", this._uploadFile, this);
            cont.add(but1);
            this._firstItem.nameOfFolder = new gn.ui.input.Line("", this.tr("NAME_OF_NEW_FOLDER"));
            cont.add(this._firstItem.nameOfFolder);
            let but2 = new gn.ui.control.Button(this.tr("NEW_FOLDER"));
            but2.addEventListener("click", this._createNewFolder, this);
            cont.add(but2, but1);
            let butNewNote = new gn.ui.control.Button(this.tr("NEW_NOTE"));
            butNewNote.addEventListener("click", this._createNewNote, this);
            cont.add(butNewNote);
            this._firstItem.add(cont);
        }
        this.add(this._firstItem);
    }
    _itemCreated(item) {
        super._itemCreated(item);
        item.addEventListener("changeData", function(event) {
            this.model.changeData(event.data.index, event.data.key, event.data.value);
        }, this);
        item.addEventListener("removeData", function(event) {
            this.model.removeData(event.data);
        }, this);
    }
    _groupCreated(group) {
        super._groupCreated(group);
        group.addEventListener("changeData", function(event) {
            this.model.changeData(event.data.index, event.data.key, event.data.value);
        }, this);
        group.addEventListener("removeData", function(event) {
            this.model.removeData(event.data);
        }, this);
    }
    _uploadFile() {
        const files = this._firstItem.fileInput.value;
        if (files === undefined || files.length == 0)
            return;
        if (this._uploadHelper) {
            this._uploadHelper.dispose();
        }
        this._uploadHelper = new gn.helper.FormDataFileUpload();
        this._uploadHelper.addEventListener("send", this._uploadFileCB, this);
        this._uploadHelper.addField('userid', gn.app.App.instance().userId);
        this._uploadHelper.addField('token', gn.app.App.instance().token);
        this._uploadHelper.addField('parent', this._currentGroup);
        this._uploadHelper.addFile(files[0], this._firstItem.nameOfFile.value || files[0].name.replace(/\.[^/.]+$/, ""));
        gn.app.App.instance().header.progress.end = this._uploadHelper.allChunks;
    }
    async _uploadFileCB(e) {
        fetch('./php/file/upload.php', {
                method: 'POST',
                body: e.data
            }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status === 1) {
                    if (!this._uploadHelper.done) {
                        gn.app.App.instance().header.progress.value = this._uploadHelper.currentIdx;
                        this._uploadHelper.sendChunk();
                    }
                    if (data.file) {
                        gn.app.App.instance().header.progress.value = 0;
                        gn.app.App.instance().header.progress.end = 100;
                        data.file.storeid = data.file.storeid;
                        data.file.type = gn.model.Model.Type.item;
                        this.model.insertRow(data.file, this.model.rowCount(), data.file.parent);
                        gn.ui.popup.Popup.InformationPopup(this.tr("FILE_SUCCESSFULLY_UPLOADED")).show();
                    }
                } else {
                    alert('File upload failed');
                }
            });
    }
    async _createNewFolder() {
        let folderName = this._firstItem.nameOfFolder.value;
        if (folderName == "") {
            alert("Folder name cannot be empty");
            return;
        }
        let resp = await gn.app.App.requestJ("./php/folder/create.php", {
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            name: folderName,
            parent: this._currentGroup
        });
        if (resp.status == 1) {
            resp.folder.storeid = resp.folder.storeid;
            resp.folder.type = gn.model.Model.Type.group;
            this.model.insertRow(resp.folder);
        } else {
            alert("Error creating folder: " + resp.message);
        }
    }
    async _createNewNote() {
        let resp = await gn.app.App.requestJ("./php/note/create.php", {
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            parent: this._currentGroup
        });
        if (resp.status == 1) {
            resp.note.storeid = resp.note.storeid;
            resp.note.type = gn.model.Model.Type.item;
            this.model.insertRow(resp.note);
        } else {
            alert("Error creating note: " + resp.message);
        }
    }
}
pod.Header = class pod_Header extends gn.ui.Header {
    constructor() {
        super({
            left: true,
            center: true,
            right: true
        });
        this.setStyle("text-wrap", "nowrap")
        this.sticky = true;
        this.left.add(new gn.ui.basic.Label(this.tr("PODFOLIO")));
        this.center.add(new gn.ui.basic.Label(this.tr("YOUR_PERSONAL_PASTEBIN")));
        let user = new gn.ui.basic.Icon(30, "fa-user", ["fa-solid"])
        user.addEventListener("click", function() {
            if (gn.lang.Var.isNull(this._popup)) {
                this._popup = new gn.ui.control.Menu(user);
                this._popup.setStyle("padding", "5px");
                this._popup.addItem(new gn.ui.control.MenuItem("logout", new gn.ui.basic.Label(this.tr("LOGOUT")), new gn.ui.basic.Icon(20, "fa-right-from-bracket", ["fa-solid"]), function() {
                    gn.app.App.instance().logout();
                }));
                this._popup.addItem(new gn.ui.control.MenuItem("public_page", new gn.ui.basic.Label(this.tr("MY_PUBLIC_PAGE")), new gn.ui.basic.Icon(20, "fa-user", ["fa-solid"]), async function() {
                    console.log(await gn.io.Clipboard.readText());
                    alert("soon :)")
                }));
            }
            this._popup.show();
        }, this);
        this.right.add(user);
    }
}
pod.File = class pod_File extends gn.ui.tile.TileItem {
    constructor(data) {
        super(data)
        this.layoutManager = new gn.ui.layout.Column();
        this._head = new gn.ui.container.Row("fileHead");
        this.add(this._head);
        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = this.tr("DOWNLOAD");
        download.addEventListener("click", function() {
            Application.instance().downloadFile("./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey, this._data.name);
        }, this);
        this._head.add(download);
        let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
        share.tooltip = this.tr("SHARE");
        share.addEventListener("click", function() {
            let link = /.*\//.exec(window.location)[0];
            let name = encodeURI(this._data.name).replaceAll("%20", "+");
            if (name.includes("%")) {
                name = this._data.storeid;
            }
            gn.io.Clipboard.writeText(link + "data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey);
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
        const mimeIconMap = [{
            keys: ["image/"],
            icon: "fa-file-image"
        }, {
            keys: ["pdf"],
            icon: "fa-file-pdf"
        }, {
            keys: ["text/"],
            icon: "fa-file-lines"
        }, {
            keys: ["wordprocessingml", "msword", "ms-word", "opendocument.text", "odt"],
            icon: "fa-file-word"
        }, {
            keys: ["spreadsheetml", "excel", "opendocument.spreadsheet", "ods"],
            icon: "fa-file-excel"
        }, {
            keys: ["presentationml", "powerpoint", "opendocument.presentation", "odp"],
            icon: "fa-file-powerpoint"
        }, {
            keys: ["application/zip", "compressed"],
            icon: "fa-file-zipper"
        }, {
            keys: ["audio/"],
            icon: "fa-file-audio"
        }, {
            keys: ["video/"],
            icon: "fa-file-video"
        }];
        if (mimetype.includes("image/")) {
            let src = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
            this._contentItem = new gn.ui.basic.Image(src, "fileImage");
        } else if (mimetype.includes("gn-note/")) {
            this._contentItem = new gn.ui.input.MultiLine();
            this._contentItem.addClass("gn-note");
            this._contentItem.value = this._data.content;
            this._contentItem.addEventListener("input", function(e) {
                this.sendEvent("noteChanged", {
                    content: this._contentItem.value,
                    storeid: this._data.storeid
                });
            }, this);
        } else {
            const match = mimeIconMap.find(item => item.keys.some(key => mimetype.includes(key)));
            const iconName = match ? match.icon : "fa-file";
            this._contentItem = new gn.ui.basic.Icon(70, iconName, ["fa-regular"]);
        }
        this._cont.add(this._contentItem);
        this._headText.addEventListener("click", function() {
            window.location.href = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
        }.bind(this));
        this._contentItem.setStyle("cursor", "pointer");
        if (gn.app.App.instance().state == pod.App.appState.LOGGEDIN) {
            this._publicIcon = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            this._publicIcon.setStyle("color", "green");
            this._publicIcon.tooltip = "Public";
            this._head.add(this._publicIcon);
            if (!this._data.public) {
                this._publicIcon.addClass("gn-exclude");
            }
            this._advertiseIcon = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            this._advertiseIcon.setStyle("color", "green");
            this._advertiseIcon.tooltip = "Advertise";
            this._head.add(this._advertiseIcon);
            if (!this._data.advertise) {
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
            if (this._data.mimetype.includes("gn-note/")) {
                this.addEventListener("noteChanged", this._noteChanged, this);
            }
        }
    }
    updateItem(data, key) {
        super.updateItem(data, key);
        switch (key) {
            case "public":
                if (this._data.public) {
                    this._publicIcon.removeClass("gn-exclude");
                } else {
                    this._publicIcon.addClass("gn-exclude");
                }
                break;
            case "advertise":
                if (this._data.advertise) {
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
        if (!this._menu) {
            this._buildMenu();
        }
        if (this._menuIsShown) {
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
        this._menu = new gn.ui.container.Grid("fileMenu", 10, "50px 1fr", "rep");
        gn.ui.container.Grid
        this._menu.setStyle("width", "fit-content");
        this._menu.setStyle("align-content", "center");
        this._menu.setStyle("align-items", "center");
        let inp1 = new gn.ui.input.Switch(this._data.public);
        inp1.addEventListener("change", async function() {
            if (await this._changeContentMeta(this._data.storeid, ["public", inp1.value])) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "public",
                    value: inp1.value
                })
            } else {
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp1);
        this._menu.add(new gn.ui.basic.Label(this.tr("PUBLIC")));
        let inp2 = new gn.ui.input.Switch(this._data.advertise);
        inp2.addEventListener("change", async function() {
            if (await this._changeContentMeta(this._data.storeid, ["advertise", inp2.value])) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "advertise",
                    value: inp2.value
                })
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
        dlg.addEventListener("yes", async function() {
            let data = await gn.app.App.requestJ("./php/" + this._contentType() + "/delete.php", {
                storeid: this._data.storeid,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId
            });
            if (data.status == 1) {
                this.sendEvent("removeData", this._data.storeid);
            }
        }, this);
        dlg.show();
    }
    async _noteChanged(e) {
        if (!this._changeTimer) {
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
        dlg.callback = function() {
            return this._body._children[0].value;
        }
        dlg.addEventListener("ok", async function(e) {
            let data = await gn.app.App.requestJ("./php/" + this._contentType() + "/rename.php", {
                storeid: this._data.storeid,
                newname: e.data,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId
            });
            if (data.status == 1) {
                this.sendEvent("changeData", {
                    index: this._data.storeid,
                    key: "name",
                    value: data.name || e.data
                })
            }
        }, this);
        dlg.show();
    }
}
pod.LoginWindow = class pod_LoginWindow extends gn.ui.window.Window {
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
        this._lregisterB = new gn.ui.control.Button("REGISTER", "small", () => {
            this._stack.next();
        }, this);
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
        this._rloginB = new gn.ui.control.Button("LOGIN", "small", () => {
            this._stack.next();
        }, this);
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
        if (gn.lang.String.isEmpty(body.username) || gn.lang.String.isEmpty(body.password)) {
            console.log("data must not be empty");
            return;
        }
        let resp = await gn.app.App.requestJ("./php/user/login.php", body);
        if (resp.status == 1) {
            document.cookie = `podfolioUserid=${resp.userid}; path=/`;
            document.cookie = `podfolioToken=${resp.token}; path=/`;
            gn.app.App.instance().state = pod.App.appState.LOGGEDIN;
            gn.app.App.instance().root.activate("mainWindow");
        } else if (resp.status == -2) {
            console.log("Username or password wrong");
        }
    }
    async _register() {
        let body = {
            username: this._rusername.value,
            email: this._remail.value,
            password: this._rpassword.value,
        }
        if (gn.lang.String.isEmpty(body.username) || gn.lang.String.isEmpty(body.email) || gn.lang.String.isEmpty(body.password)) {
            console.log("data must not be empty");
            return;
        }
        let resp = await gn.app.App.requestJ("./php/user/register.php", body);
        if (resp.status == 1) {
            document.cookie = `podfolioUserid=${resp.userid}; path=/`;
            document.cookie = `podfolioToken=${resp.token}; path=/`;
            gn.app.App.instance().root.activate("mainWindow");
        } else if (resp.status == -4) {
            alert("username already exists");
        }
    }
}
pod.App = class pod_App extends gn.app.App {
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
        if (gn.lang.Var.isNull(userId)) {
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
pod.App.appState = gn.lang.Enum({
    UNDEFINED: 0,
    LOGGEDIN: 1,
    PUBLIC: 2,
});
