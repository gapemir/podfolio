class PTileContainer extends TileContainer{
    constructor(parent) {
        super(parent)
        this.tileClass = PFile;
        this.subItemContClass = PFolder;
        
        this._firstItem = new gn.ui.basic.Widget("div", "fileTile");
        let head = new gn.ui.basic.Widget("div", "fileHead");
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

        let but1 = new gn.ui.control.Button("", "Upload");
        but1.addEventListener("click", this._uploadFile, this);
        cont.add(but1);

        //cont.element.appendChild(document.createElement("br"));

        this._firstItem.nameOfFolder = new gn.ui.input.Line("", "name of new folder");
        cont.add(this._firstItem.nameOfFolder);

        let but2 = new gn.ui.control.Button("", "New folder");
        but2.addEventListener("click", this._createNewFolder, this);
        cont.add(but2, but1);

        this._firstItem.add(cont);
        this.add(this._firstItem);
    }

    _uploadFile(){
        //event.preventDefault();
        const file = this._firstItem.fileInput.value;
        if(file == undefined)
            return;
        let formData = new FormData();
        formData.append('file', file);
        formData.append('userid', gn.app.App.instance().userId);
        formData.append('fileName', this._firstItem.nameOfFile.value || file.name.replace(/\.[^/.]+$/, ""));
        formData.append('token', gn.app.App.instance().token);
        formData.append('parent', this._currentGroup);
    
        fetch('./php/file/upload.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.status === 1){
                data.file.storeId = data.file.fileid;
                data.file.type = gn.model.Type.item;
                this.model.addData(data.file);
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
        .then(response=>{console.log(response);})
    }
}
class PFile extends File{
    constructor(data, parent) {
        super(data, parent)

        if(this._data.public){
            let pub = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            pub.setStyle("color", "green");
            pub.tooltip = "Public";
            this._head.add(pub);
        }
        if(this._data.advertize){
            let adv = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            adv.setStyle("color", "green");
            adv.tooltip = "Advertize";
            this._head.add(adv);
        }

        let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
        gear.addEventListener("click", this.toggleMenu, this);
        gear.tooltip = "Settings";
        this._head.add(gear);
    }

    toggleMenu(){
        if(!this._menu){
            this._buildMenu();
        }
        if(this._menuIsShown){
            this._menu.setStyle("display", "none");
            this._cont.setStyle("display", "flex");
            this._menuIsShown = false;
        }else{
            this._menu.setStyle("display", "flex");
            this._cont.setStyle("display", "none");
            this._menuIsShown = true;
        }
    }
    _buildMenu(){
        this._menuIsShown = false;
        this._menu = new gn.ui.container.Column("fileMenu fileCont");
        let div1 = new gn.ui.container.Row();
        let inp1 = new gn.ui.input.CheckBox("fileMenuCheckBox", this._data.public);
        inp1.addEventListener("click", async function(){
            if(await this._changeFileMeta(this._data.storeId, ["public", inp1.value])){
                this._data.public = inp1.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        div1.add(inp1);
        div1.add(new gn.ui.basic.Label("Public"));
        this._menu.add(div1);
        let div2 = new gn.ui.container.Row();
        let inp2 = new gn.ui.input.CheckBox("fileMenuCheckBox", this._data.advertize);
        inp2.addEventListener("click", async function(){
            if(await this._changeFileMeta(this._data.storeId, ["advertize", inp2.value])){
                this._data.advertize = inp2.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        div2.add(inp2);
        div2.add(new gn.ui.basic.Label("Advertize"));
        this._menu.add(div2);
        let div3 = new gn.ui.container.Row();
        let del = new gn.ui.control.Button("fileMenuButton", "Delete");
        del.addEventListener("click", async function(){
            let dlg = gn.ui.popup.Popup.ConfirmationPopup(new gn.ui.basic.Label("Delete file"), new gn.ui.basic.Label("Are you sure you want to delete this file?"));
            dlg.addEventListener("yes", async function(){
                if(await this._deleteFile(this._data.storeId)){
                    this._parent.model.removeData(this._data.storeId)
                }
            }, this);
            dlg.show();
        }, this);
        div3.add(del);
        this._menu.add(div3);
        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
    async _changeFileMeta(fileId, data) {
        let res_data = await gn.app.App.instance().phpRequestJ('./php/file/changeMeta.php', {
            fileid: fileId,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            data: data
        });
        return res_data.status == 1;
    }
    async _deleteFile(fileId) {
        let data = await gn.app.App.instance().phpRequestJ('./php/file/delete.php', {
            fileid: fileId,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId
        });
        return data.status == 1;
    }
    async renameFile(fileId, name) {
        throw new Error("Not implemented yet");
    }
}
class PFolder extends Folder{
    constructor(data, parent) {
        super(data, parent)

        if(this._data.public){
            let pub = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            pub.setStyle("color", "green");
            pub.tooltip = "Public";
            this._head.add(pub);
        }
        if(this._data.advertize){
            let adv = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            adv.setStyle("color", "green");
            adv.tooltip = "Advertize";
            this._head.add(adv);
        }

        let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
        gear.addEventListener("click", this.toggleMenu, this);
        gear.tooltip = "Settings";
        this._head.add(gear);
    }
    toggleMenu(){
        if(!this._menu){
            this._buildMenu();
        }
        if(this._menuIsShown){
            this._menu.setStyle("display", "none");
            this._cont.setStyle("display", "flex");
            this._menuIsShown = false;
        }else{
            this._menu.setStyle("display", "flex");
            this._cont.setStyle("display", "none");
            this._menuIsShown = true;
        }
    }
    _buildMenu(){
        this._menuIsShown = false;
        this._menu = new gn.ui.container.Column("fileMenu fileCont");
        let div1 = new gn.ui.container.Row();
        let inp1 = new gn.ui.input.CheckBox("fileMenuCheckBox", this._data.public);
        inp1.addEventListener("click", async function(){
            let ret = await this._changeFolderMeta(this._data.storeId, ["public", inp1.value]);
            if(ret){
                this._data.public = inp1.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        div1.add(inp1);
        div1.add(new gn.ui.basic.Label("Public"));
        this._menu.add(div1);
        let div2 = new gn.ui.container.Row();
        let inp2 = new gn.ui.input.CheckBox("fileMenuCheckBox", this._data.advertize);
        inp2.addEventListener("click", async function(){
            let ret = await this._changeFolderMeta(this._data.storeId, ["advertize", inp2.value]);
            if(ret){
                this._data.public = inp1.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        div2.add(inp2);
        div2.add(new gn.ui.basic.Label("Advertize"));
        this._menu.add(div2);
        let div3 = new gn.ui.container.Row();
        let del = new gn.ui.control.Button("fileMenuButton", "Delete");
        del.addEventListener("click", async function(){
            let dlg = gn.ui.popup.Popup.ConfirmationPopup(new gn.ui.basic.Label("Delete folder"), new gn.ui.basic.Label("Are you sure you want to delete this folder?"));
            dlg.addEventListener("yes", async function(){
                let res = await this._deleteFolder(this._data.storeId)
                if(res){
                    this._parent.model.removeData(this._data.storeId)
                }else{
                    console.error("Error deleting folder")
                }
            }, this);
        }, this);
        div3.add(del);
        this._menu.add(div3);
        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
    async _changeFolderMeta(folderId, data) {
        let res_data = await gn.app.App.instance().phpRequestJ('./php/folder/changeMeta.php', {
            folderid: folderId,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId,
            data: data
        });
        return res_data.status == 1;
    }
    async _deleteFolder(folderId) {
        let data = await gn.app.App.instance().phpRequestJ('./php/folder/delete.php', {
            folderid: folderId,
            token: gn.app.App.instance().token,
            userid: gn.app.App.instance().userId
        });
        return data.status == 1;
    }
    async renameFolder(folderId, name) {
        throw new Error("Not implemented yet");
    }
}
