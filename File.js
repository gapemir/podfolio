class TileContainer extends gn.ui.tile.TileContainer{
    constructor(parent) {
        super(parent)
        this._element.className = 'fileList';
        this._element.id = 'fileList';
        this.model = new gn.model.TreeModel();
        this._model.dataIdentifier = "storeId";
        this._model.parentIdentifier = "parent";
        this.tileClass = File1;
        this.subItemContClass = Folder1;

        this._firstItem = new gn.ui.basic.Widget("div", "fileTile");
        let head = new gn.ui.basic.Widget("div", "fileHead");
        head.add(new gn.ui.basic.Label("Actions"));
        this._firstItem.add(head);

        let cont = new gn.ui.container.Column("fileCont fileTileFirst");
        cont.add(new gn.ui.basic.Label("Upload a file"))
        this._firstItem.fileInput = document.createElement("input");
        this._firstItem.fileInput.type = "file";
        cont.addNativeElement(this._firstItem.fileInput);
        cont.add(new gn.ui.basic.Label("Rename file (optional):"))

        this._firstItem.nameOfFile = new gn.ui.input.Line("", "file whitout extension");
        cont.add(this._firstItem.nameOfFile);

        let but1 = new gn.ui.input.Button("", "Upload");
        but1.addEventListener("click", this._uploadFile, this);
        cont.add(but1);

        //cont.element.appendChild(document.createElement("br"));

        this._firstItem.nameOfFolder = new gn.ui.input.Line("", "name of new folder");
        cont.add(this._firstItem.nameOfFolder);

        let but2 = new gn.ui.input.Button("", "New folder");
        but2.addEventListener("click", this._createNewFolder, this);
        cont.add(but2, but1);

        this._firstItem.add(cont);
        this.add(this._firstItem);

        this._breadcrumb = new gn.ui.control.Breadcrumb();
        this._breadcrumb.model = this._model;
        this._breadcrumb.addEventListener("back", function(){
            if(!gn.lang.Var.isNull(this._currentGroup)){
                this.openGroup(this._model.getParent(this._currentGroup));
            }
        }, this);
        this._header.add(this._breadcrumb);
    }

    genFakeTileItems(){
        for (let i = 0; i < this._fakeTiles.length; i++) {
            this.remove(this._fakeTiles[i]);
        };
        this._fakeTiles = [];
        var perLine
        if(this._idElementMap.size == 0){
            perLine = 4;
        }else{
            perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
        }
        var n = this._groups.get(this._currentGroup).length + 1 % perLine; // +1 is static el
        if(n == 0){
            n = perLine;
        }else{
            n = perLine - (n % perLine);
        }
        for(let i = 0; i < n; i++){
            let item = new this._fakeTileClass(this);
            this._fakeTiles.push(item);
            this.add(this._fakeTiles.at(-1));
        }
    }

    _uploadFile(){
        //event.preventDefault();
        const fileInput = this._firstItem.fileInput.files[0];
        if(fileInput == undefined)
            return;
        const fileName = this._firstItem.nameOfFile.value || fileInput.name.replace(/\.[^/.]+$/, "");
        const userid = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1];
        const token = document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1];
    
        let formData = new FormData();
        formData.append('file', fileInput);
        formData.append('userid', userid);
        formData.append('fileName', fileName);
        formData.append('token', token);
        formData.append('parent', this._currentGroup);
    
        fetch('./php/file/upload.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
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
                token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
                userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1],
                name: folderName,
                parent : this._currentGroup
            })
        }).then(response => response.json())
        .then(response=>{console.log(response);})
    }
}
class File1 extends gn.ui.tile.TileItem{
    constructor(data, parent) {
        super(data, parent)

        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);

        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            Application.instance().downloadFile("./data/" + userid + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
        }, this);
        this._head.add(download);
        let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
        share.tooltip = "Share";
        share.addEventListener("click", function(){
            let link = /.*\//.exec(window.location)[0];
            //navigator.clipboard.writeText(link + "download.html?user="+userid+"&file="+file.fileid+"&name="+encodeURIComponent(file.name));
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+file.fileid+"?key="+file.fileKey)
            let name = encodeURI(this._data.name).replaceAll("%20", "+");
            if(name.includes("%")){
                name = this._data.storeId;
            }
            Application.instance().writeToClipboard(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey);
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

        if(this._data.public){
            let pub = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            pub.setStyle("color", "green");
            this._head.add(pub);
        }
        if(this._data.advertize){
            let adv = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            adv.setStyle("color", "green");
            this._head.add(adv);
        }

        let headTextDiv = new gn.ui.basic.Widget("div");
        headTextDiv.setStyle("textIndent", "16px");
        this._head.add(headTextDiv)
        let headText = new gn.ui.basic.Label(this._data.name, "", this);
        headTextDiv.add(headText);
        let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
        gear.addEventListener("click", this.toggleMenu, this);
        gear.tooltip = "Settings";
        this._head.add(gear);
    
        this._cont = new gn.ui.basic.Widget("div", "fileCont");
        this.add(this._cont);

        let contentItem = null;
        if(this._data.mimetype.includes("image")){
            let src = "./data/" + userid + "/" + this._data.fileid + "?key=" + this._data.fileKey;
            contentItem = new gn.ui.basic.Image(src, "fileImage");
        }
        else if(this._data.mimetype.includes("pdf")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-pdf", ["fa-regular"] );
        }
        else if(this._data.mimetype.includes("text")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-lines", ["fa-regular"] );
        }
        this._cont.add(contentItem);
    
        headText.addEventListener("click", function(){
            window.location.href = "./data/" + userid + "/" + this._data.storeId + "?key=" + this._data.fileKey;
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
        };*/
        contentItem.setStyle("cursor", "pointer"); 
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
            if(await Application.instance().changeFileMeta(this._data.storeId, ["public", inp1.value])){
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
            if(await Application.instance().changeFileMeta(this._data.storeId, ["advertize", inp2.value])){
                this._data.advertize = inp2.value;
            }else{
                console.error("Error changing meta data")
            }
        }, this);
        div2.add(inp2);
        div2.add(new gn.ui.basic.Label("Advertize"));
        this._menu.add(div2);
        let div3 = new gn.ui.container.Row();
        let del = new gn.ui.input.Button("fileMenuButton", "Delete");
        del.addEventListener("click", async function(){
            if(await Application.instance().deleteFile(this._data.storeId)){
                this._parent.model.removeData(this._data.storeId)
            }
        }, this);
        div3.add(del);
        this._menu.add(div3);
        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
}
class Folder1 extends gn.ui.tile.TileSubItemContainer{
    constructor(data, parent) {
        super(data, parent)
        
        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);
        //folders are not yed downloadable, we need to construct a zip file
        /*let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            Application.instance().downloadFile("./data/" + userid + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
        }, this);
        this._head.add(download);*/
        let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
        share.tooltip = "Share";
        share.addEventListener("click", function(){
            let link = /.*\//.exec(window.location)[0];
            //navigator.clipboard.writeText(link + "download.html?user="+userid+"&file="+file.fileid+"&name="+encodeURIComponent(file.name));
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+file.fileid+"?key="+file.fileKey)
            let name = encodeURI(this._data.name).replaceAll("%20", "+");
            if(name.includes("%")){
                name = this._data.storeId;
            }
            Application.instance().writeText(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

        if(this._data.public){
            let pub = new gn.ui.basic.Icon(14, "fa-users", ["fa-solid"]);
            pub.setStyle("color", "green");
            this._head.add(pub);
        }
        if(this._data.advertize){
            let adv = new gn.ui.basic.Icon(14, "fa-ad", ["fa-solid"]);
            adv.setStyle("color", "green");
            this._head.add(adv);
        }

        let headTextDiv = new gn.ui.basic.Widget("div");
        headTextDiv.setStyle("textIndent", "16px");
        this._head.add(headTextDiv)
        let headText = new gn.ui.basic.Label(this._data.name, "", this);
        headTextDiv.add(headText);
        let gear = new gn.ui.basic.Icon(14, "fa-cog", ["fa-solid"]);
        gear.addEventListener("click", this.toggleMenu, this);
        gear.tooltip = "Settings";
        this._head.add(gear);
    
        this._cont = new gn.ui.basic.Widget("div", "fileCont");
        this.add(this._cont);

        let contentItem = new gn.ui.basic.Icon(70, "fa-folder", ["fa-regular"] )
        this._cont.add(contentItem);
    
        headText.addEventListener("click", function(){
            //window.location.href = "./data/" + userid + "/" + this._storeid + "?key=" + this._data.fileKey;
            //throw new TypeError("not yet implemented")
            this.sendDataEvent("openGroup", this._data.storeId);
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
        };*/
        contentItem.setStyle("cursor", "pointer"); 
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
            let ret = await Application.instance().changeFolderMeta(this._data.storeId, ["public", inp1.value]);
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
            let ret = await Application.instance().changeFolderMeta(this._data.storeId, ["advertize", inp2.value]);
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
        let del = new gn.ui.input.Button("fileMenuButton", "Delete");
        del.addEventListener("click", async function(){
            let res = await Application.instance().deleteFolder(this._data.storeId)
            if(res){
                this._parent.model.removeData(this._data.storeId)
            }else{
                console.error("Error deleting folder")
            }
        }, this);
        div3.add(del);
        this._menu.add(div3);
        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
}
