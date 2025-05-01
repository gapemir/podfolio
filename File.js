class TileContainer extends gn.ui.tile.TileContainer{
    constructor(parent) {
        super(parent)
        this._element.className = 'fileList';
        this._element.id = 'fileList';
        this.model = new gn.model.TreeModel();
        this._model.dataIdentifier = "storeId";
        this._model.parentIdentifier = "parent";
        this.tileClass = File;
        this.subItemContClass = Folder;
        
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
            n = (n % perLine);
            if(n != 0){
                n = perLine - n;
            }
        }
        for(let i = 0; i < n; i++){
            let item = new this._fakeTileClass(this);
            this._fakeTiles.push(item);
            this.add(this._fakeTiles.at(-1));
        }
    }
}
class File extends gn.ui.tile.TileItem{
    constructor(data, parent) {
        super(data, parent)

        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);

        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            Application.instance().downloadFile("./data/" + gn.app.App.instance().userId + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
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
            Application.instance().writeToClipboard(link + "data/"+ gn.app.App.instance().userId +"/"+name+"?key="+this._data.fileKey);
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

        let headTextDiv = new gn.ui.basic.Widget("div");
        headTextDiv.setStyle("textIndent", "16px");
        this._head.add(headTextDiv)
        let headText = new gn.ui.basic.Label(this._data.name, "", this);
        headTextDiv.add(headText);
    
        this._cont = new gn.ui.basic.Widget("div", "fileCont");
        this.add(this._cont);

        let contentItem = null;
        if(this._data.mimetype.includes("image")){
            let src = "./data/" + gn.app.App.instance().userId + "/" + this._data.fileid + "?key=" + this._data.fileKey;
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
            window.location.href = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeId + "?key=" + this._data.fileKey;
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
        };*/
        contentItem.setStyle("cursor", "pointer"); 
    }
}
class Folder extends gn.ui.tile.TileSubItemContainer{
    constructor(data, parent) {
        super(data, parent)
        
        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);
        //folders are not yed downloadable, we need to construct a zip file
        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", async function(){
            let ret = await this._createZip(this._data.storeId, this._data.fileKey);
            if(ret.status == -1){
                console.log("Error creating zip file")
                return;
            }
            //Application.instance().downloadFile("./data/" + gn.app.App.instance().userId + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
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
            Application.instance().writeText(link + "data/"+ gn.app.App.instance().userId +"/"+name+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

        let headTextDiv = new gn.ui.basic.Widget("div");
        headTextDiv.setStyle("textIndent", "16px");
        this._head.add(headTextDiv)
        let headText = new gn.ui.basic.Label(this._data.name, "", this);
        headTextDiv.add(headText);
    
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
}
