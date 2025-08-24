class PTileContainer extends TileContainer{
    constructor() {
        super()
        this.tileClass = PFile;
        this.subItemContClass = PFolder;
        
        this._firstItem = new gn.ui.basic.Widget(new gn.ui.layout.Column(), "div", "fileTile");
        let head = new gn.ui.basic.Widget(new gn.ui.layout.Row(),"div", "fileHead");
        head.add(new gn.ui.basic.Label("Actions"));
        this._firstItem.add(head);

        let cont = new gn.ui.container.Column("fileCont fileTileFirst");
        cont.add(new gn.ui.basic.Label("Upload a file"))
        this._firstItem.fileInput = new gn.ui.input.File();
        cont.add(this._firstItem.fileInput);
        /*this._firstItem.fileInput = document.createElement("input");
        this._firstItem.fileInput.type = "file";
        cont.addNativeElement(this._firstItem.fileInput);*/
        cont.add(new gn.ui.basic.Label("Rename file (optional):"))

        this._firstItem.nameOfFile = new gn.ui.input.Line("", "file whitout extension");
        cont.add(this._firstItem.nameOfFile);

        let but1 = new gn.ui.control.Button("Upload");
        but1.addEventListener("click", this._uploadFile, this);
        cont.add(but1);

        //cont.element.appendChild(document.createElement("br"));

        this._firstItem.nameOfFolder = new gn.ui.input.Line("", "name of new folder");
        cont.add(this._firstItem.nameOfFolder);

        let but2 = new gn.ui.control.Button("New folder");
        but2.addEventListener("click", this._createNewFolder, this);
        cont.add(but2, but1);

        let butNewNote = new gn.ui.control.Button("New note");
        butNewNote.addEventListener("click", this._createNewNote, this);
        cont.add(butNewNote);

        this._firstItem.add(cont);
        this.add(this._firstItem);
    }

    _uploadFile(){
        const file = this._firstItem.fileInput.value;
        if(file == undefined)
            return;

        if( this._uploadHelper ){
            this._uploadHelper.dispose();
        }
        this._uploadHelper = new gn.helper.FormDataFileUpload();
        this._uploadHelper.addEventListener( "send", this._uploadFileCB, this );

        this._uploadHelper.addField('userid', gn.app.App.instance().userId);
        this._uploadHelper.addField('token', gn.app.App.instance().token);
        this._uploadHelper.addField('parent', this._currentGroup);
        this._uploadHelper.addFile( file, this._firstItem.nameOfFile.value || file.name.replace(/\.[^/.]+$/, "") );
    }
    _uploadFileCB( e ) {
        fetch('./php/file/upload.php', {
            method: 'POST',
            body: e.data
        }).then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.status === 1){
                if( !this._uploadHelper.done ) {
                    this._uploadHelper.sendChunk();
                }
                if( data.file ) {
                    data.file.storeid = data.file.storeid;
                    data.file.type = gn.model.Model.Type.item;
                    this.model.insertRow(data.file, this.model.rowCount(), data.file.parent );
                }
            } else {
                alert('File upload failed');
            }
        })/*.catch(error => {
            console.error('Error:', error);
            alert('File upload failed');
        });*/
    }
    _createNewFolder(){
        let folderName = this._firstItem.nameOfFolder.value;
        if(folderName == ""){
            alert("Folder name cannot be empty");
            return;
        }
        fetch('./php/folder/create.php', {
            method: 'POST',
            body: JSON.stringify({
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                name: folderName,
                parent : this._currentGroup
            })
        }).then(response => response.json())
        .then(response=>{
            if(response.status == 1){
                response.folder.storeid = response.folder.storeid;
                response.folder.type = gn.model.Model.Type.group;
                this.model.insertRow(response.folder);
            }else{
                alert("Error creating folder: " + response.message);
            }
        })
    }
    _createNewNote(){
        fetch('./php/note/create.php', {
            method: 'POST',
            body: JSON.stringify({
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                parent : this._currentGroup
            })
        }).then(response => response.json())
        .then(response=>{
            console.log(response)
            if(response.status == 1){
                response.note.storeid = response.note.storeid;
                response.note.type = gn.model.Model.Type.item;
                this.model.insertRow(response.note);
            }else{
                alert("Error creating note: " + response.message);
            }
        })
    }
}
class PFile extends File{
    constructor(data) {
        super(data)

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
    updateItem(data, key){
        super.updateItem(data, key);
        switch(key){
            case "public":
                if(this._data.public){
                    this._publicIcon.removeClass("gn-exclude");
                }
                else{
                    this._publicIcon.addClass("gn-exclude");
                }
                break;
            case "advertise":
                if(this._data.advertise){
                    this._advertiseIcon.removeClass("gn-exclude");
                }
                else{
                    this._advertiseIcon.addClass("gn-exclude");
                }
                break;
        }
    }

    toggleMenu(){
        if(!this._menu){
            this._buildMenu();
        }
        if(this._menuIsShown){
            this._menu.exclude();
            this._cont.show();
            this._menuIsShown = false;
        }else{
            this._menu.show();
            this._cont.exclude();
            this._menuIsShown = true;
        }
    }
    _buildMenu(){
        this._menuIsShown = false;
        this._menu = new gn.ui.container.Grid("fileMenu");
        this._menu.layoutManager.templateColumns = "50px 1fr";
        this._menu.layoutManager.templateRows = "repeat(3, 35px)";
        this._menu.layoutManager.gap = "10px";
        this._menu.setStyle("width", "fit-content");
        this._menu.setStyle("align-content", "center");
        this._menu.setStyle("align-items", "center");

        let inp1 = new gn.ui.control.Switch(this._data.public);
        inp1.addEventListener("change", async function(){
            if(await this._changeContentMeta(this._data.storeid, ["public", inp1.value])){
                this.layoutParent.model.changeData( this._data.storeid, "public", inp1.value );
                //this._data.public = inp1.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp1);
        this._menu.add(new gn.ui.basic.Label("Public"));

        let inp2 = new gn.ui.control.Switch(this._data.advertise);
        inp2.addEventListener("change", async function(){
            if(await this._changeContentMeta(this._data.storeid, ["advertise", inp2.value])){
                this.layoutParent.model.changeData( this._data.storeid, "advertise", inp2.value );
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp2);
        this._menu.add(new gn.ui.basic.Label("Advertise"));

        let del = new gn.ui.control.Button("Delete", "fileMenuButton");
        del.addEventListener("click", this._deleteFile, this);
        del.setStyle("grid-column", "1 / span 2");
        this._menu.add(del);

        this.add(this._menu);
    }
    _contentType(){
        return this._data.mimetype.includes("gn-note/") ? "note" : "file";
    }
    async _changeContentMeta(storeid, data) { 
        let res_data = null;
        res_data = await gn.app.App.instance().phpRequestJ('./php/' + this._contentType() + '/changeMeta.php', {
            storeid: storeid,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            data: data
        });
        return res_data.status == 1;
    }
    async _deleteFile(e) {
        let dlg = gn.ui.popup.Popup.ConfirmationPopup(new gn.ui.basic.Label(this.tr("DELETE")), new gn.ui.basic.Label("Are you sure you want to delete this file?"));
            dlg.addEventListener("yes", async function(){
                let data = await gn.app.App.instance().phpRequestJ("./php/" + this._contentType() + "/delete.php", {
                    storeid: this._data.storeid,
                    token: gn.app.App.instance().token,
                    userid: gn.app.App.instance().userId
                });
                if(data.status == 1){
                    this.layoutParent.model.removeData(this._data.storeid)
                }    
            }, this);
        dlg.show();
    }
    async _noteChanged(e){
        if(!this._changeTimer){
            this._changeTimer = new gn.event.Timer(1000);
            this._changeTimer.singleShot = true;
            this._changeTimer.addEventListener("timeout", this._saveNoteChanged, this);
        }
        this._changeTimer.restart();
        this._data.content = e.data.content;
    }
    async _saveNoteChanged(){
        let data = await gn.app.App.instance().phpRequestJ('./php/note/change.php', {
            storeid: this._data.storeid,
            content: this._data.content,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId
        });
        return data.status == 1;
    }
    async _rename(e) {
        let dlg = gn.ui.popup.Popup.InformationPopup(new gn.ui.basic.Label(this.tr("RENAME")),new gn.ui.input.Line("", this.tr("NEW NAME")));
        dlg.callback = function(){
            return this._body._children[0].value;
        }
        dlg.addEventListener("ok", async function(e){
            let data = await gn.app.App.instance().phpRequestJ("./php/"+this._contentType()+"/rename.php", {
                storeid: this._data.storeid,
                newname: e.data,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId
                });
            if(data.status == 1){
                this.layoutParent.model.changeData( this._data.storeid, "name", data.name || e.data );
            }
        }, this);
        dlg.show();
    }
}
class PFolder extends Folder{
    constructor(data) {
        super(data)
        
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
    updateItem(data, key){
        super.updateItem(data, key);
        switch(key){
            case "public":
                if(this._data.public){
                    this._publicIcon.removeClass("gn-exclude");
                }
                else{
                    this._publicIcon.addClass("gn-exclude");
                }
                break;
            case "advertise":
                if(this._data.advertise){
                    this._advertiseIcon.removeClass("gn-exclude");
                }
                else{
                    this._advertiseIcon.addClass("gn-exclude");
                }
                break;
        }
    }
    toggleMenu(){
        if(!this._menu){
            this._buildMenu();
        }
        if(this._menuIsShown){
            this._menu.exclude();
            this._cont.show();
            this._menuIsShown = false;
        }else{
            this._menu.show();
            this._cont.exclude();
            this._menuIsShown = true;
        }
    }
    _buildMenu(){
        this._menuIsShown = false;
        this._menu = new gn.ui.container.Grid("fileMenu");
        this._menu.layoutManager.templateColumns = "50px 1fr";
        this._menu.layoutManager.templateRows = "repeat(3, 35px)";
        this._menu.layoutManager.gap = "10px";
        this._menu.setStyle("width", "fit-content");
        this._menu.setStyle("align-content", "center");
        this._menu.setStyle("align-items", "center");

        let inp1 = new gn.ui.control.Switch(this._data.public);
        inp1.addEventListener("change", async function(){
            let ret = await this._changeFolderMeta(this._data.storeid, ["public", inp1.value]);
            if(ret){
                this.layoutParent.model.changeData( this._data.storeid, "public", inp1.value );
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp1);
        this._menu.add(new gn.ui.basic.Label("Public"));

        let inp2 = new gn.ui.control.Switch(this._data.advertise);
        inp2.addEventListener("change", async function(){
            let ret = await this._changeFolderMeta(this._data.storeid, ["advertise", inp2.value]);
            if(ret){
                this.layoutParent.model.changeData( this._data.storeid, "advertise", inp2.value );
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        this._menu.add(inp2);
        this._menu.add(new gn.ui.basic.Label("Advertise"));

        let del = new gn.ui.control.Button("Delete", "fileMenuButton");
        del.addEventListener("click", async function(){
            let dlg = gn.ui.popup.Popup.ConfirmationPopup(new gn.ui.basic.Label("Delete folder"), new gn.ui.basic.Label("Are you sure you want to delete this folder?"));
            dlg.addEventListener("yes", async function(){
                let res = await this._deleteFolder(this._data.storeid)
                if(res){
                    this.layoutParent.model.removeData(this._data.storeid)
                }else{
                    console.error("Error deleting folder")
                }
            }, this);
            dlg.show();
        }, this);
        del.setStyle("grid-column", "1 / span 2");
        this._menu.add(del);

        this.add(this._menu);
    }
    async _changeFolderMeta(storeid, data) {
        let res_data = await gn.app.App.instance().phpRequestJ('./php/folder/changeMeta.php', {
            storeid: storeid,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            data: data
        });
        return res_data.status == 1;
    }
    async _deleteFolder(storeid) {
        let data = await gn.app.App.instance().phpRequestJ('./php/folder/delete.php', {
            storeid: storeid,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId
        });
        return data.status == 1;
    }
    async _renameFolder(e) {
        let dlg = gn.ui.popup.Popup.InformationPopup(new gn.ui.basic.Label(this.tr("RENAME_FOLDER")),new gn.ui.input.Line("", this.tr("NEW_NAME")));
        dlg.callback = function(){
            return this._body._children[0].value;
        }
        dlg.addEventListener("ok", async function(e){
            let data = await gn.app.App.instance().phpRequestJ("./php/folder/rename.php", {
                storeid: this._data.storeid,
                newname: e.data,
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId
                });
            if(data.status == 1){
                this.layoutParent.model.changeData( this._data.storeid, "name", e.data );
            }
        }, this);
        dlg.show();
    }
}
