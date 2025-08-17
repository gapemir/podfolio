class TileContainer extends gn.ui.tile.TileContainer{
    constructor() {
        super()
        this.addClass('fileList');
        this._element.id = 'fileList';
        this.model = new gn.model.FilterSortTreeModel( new gn.model.TreeModel() );
        this.tileClass = File;
        this.subItemContClass = Folder;
        
        this.breadcrumb = new gn.ui.control.Breadcrumb();
        this.breadcrumb.model = this._model;
        this.breadcrumb.topLevelName = "Content";
        /*
        this._breadcrumb.addEventListener("back", function(){
            if(!gn.lang.Var.isNull(this._currentGroup)){
                this.openGroup(this._model.parent(this._currentGroup));
            }
        }, this);*/
        this._header.add(this.breadcrumb);
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
    constructor(data) {
        super(data)

        this.layoutManager = new gn.ui.layout.Column();

        this._head = new gn.ui.container.Row("fileHead");
        this.add(this._head);

        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            Application.instance().downloadFile("./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey, this._data.name);
        }, this);
        this._head.add(download);
        let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
        share.tooltip = "Share";
        share.addEventListener("click", function(){
            let link = /.*\//.exec(window.location)[0];
            let name = encodeURI(this._data.name).replaceAll("%20", "+");
            if(name.includes("%")){
                name = this._data.storeid;
            }
            Application.instance().writeToClipboard(link + "data/"+ gn.app.App.instance().userId +"/"+this._data.storeid+"?key="+this._data.fileKey);
        }, this);
        this._head.add(share);

        let headTextDiv = new gn.ui.basic.Widget(null, "div");
        this._head.add(headTextDiv)
        this._headText = new gn.ui.basic.Label(this._data.name, "", this);
        this._headText.setStyle("cursor", "pointer");
        headTextDiv.add(this._headText);
    
        this._cont = new gn.ui.basic.Widget(null, "div", "fileCont");
        this.add(this._cont);

        let contentItem = null;
        let mimetype = this._data.mimetype;
        if(mimetype.includes("image/")){
            let src = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
            contentItem = new gn.ui.basic.Image(src, "fileImage");
        }
        else if(mimetype.includes("pdf")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-pdf", ["fa-regular"] );
        }
        else if(mimetype.includes("text/")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-lines", ["fa-regular"] );
        }
        else if (mimetype.includes("gn-note/")){
            contentItem = new gn.ui.input.MultiLine();
            contentItem.addClass( "gn-note" );
            contentItem.value = this._data.content;
            contentItem.addEventListener( "input", function( e ){
                this.sendEvent( "noteChanged", { content: e.data, storeid: this._data.storeid} );
            }, this );  
        }
        else if(mimetype.includes("wordprocessingml") || mimetype.includes("msword") || mimetype.includes("ms-word")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-word", ["fa-regular"] );
        }
        else if(mimetype.includes("spreadsheetml") || mimetype.includes("excel")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-excel", ["fa-regular"] );
        }
        else if(mimetype.includes("presentationml") || mimetype.includes("powerpoint")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-powerpoint", ["fa-regular"] );
        }
        else if(mimetype.includes("application/zip")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-zipper", ["fa-regular"] );
        }
        else if(mimetype.includes("audio/")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-audio", ["fa-regular"] );
        }
        else if(mimetype.includes("video/")){
            contentItem = new gn.ui.basic.Icon(70, "fa-file-video", ["fa-regular"] );
        }
        else {
            contentItem = new gn.ui.basic.Icon(70, "fa-file", ["fa-regular"] );
        }
        this._cont.add(contentItem);

        this._headText.addEventListener("click", function(){
            window.location.href = "./data/" + gn.app.App.instance().userId + "/" + this._data.storeid + "?key=" + this._data.fileKey;
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.storeid + "?key=" + file.fileKey;
        };*/
        contentItem.setStyle("cursor", "pointer"); 
    }
    updateItem(data, key){
        super.updateItem(data, key);
        switch(key){
            case "name": 
                this._headText.text = this._data.name;
                break;
        }
    }
}
class Folder extends gn.ui.tile.TileSubItemContainer{
    constructor(data) {
        super(data)

        this.layoutManager = new gn.ui.layout.Column();
        
        this._head = new gn.ui.basic.Widget(new gn.ui.layout.Row(), "div", "fileHead");
        this.add(this._head);
        //folders are not yed downloadable, we need to construct a zip file
        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", async function(){
            await this._downloadZip(this._data.storeid, this._data.name + ".zip");
        }, this);
        this._head.add(download);
        let share = new gn.ui.basic.Icon(14, "fa-share", ["fa-solid"]);
        share.tooltip = "Share";
        share.addEventListener("click", function(){
            let link = /.*\//.exec(window.location)[0];
            //navigator.clipboard.writeText(link + "download.html?user="+userid+"&file="+file.storeid+"&name="+encodeURIComponent(file.name));
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+file.storeid+"?key="+file.fileKey)
            let name = encodeURI(this._data.name).replaceAll("%20", "+");
            if(name.includes("%")){
                name = this._data.storeid;
            }
            Application.instance().writeToClipboard(link + "data/"+ gn.app.App.instance().userId +"/"+this._data.storeid+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

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
            //window.location.href = "./data/" + userid + "/" + this._storeid + "?key=" + this._data.fileKey;
            //throw new TypeError("not yet implemented")
            this.sendEvent("openGroup", this._data.storeid);
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.storeid + "?key=" + file.fileKey;
        };*/
        contentItem.setStyle("cursor", "pointer"); 
    }
    updateItem(data, key){
        super.updateItem(data, key);
        switch(key){
            case "name": 
                this._headText.text = this._data.name;
                break;
        }
    }
    async _downloadZip(storeid, filename = "folder.zip"){
        let data = await gn.app.App.instance().phpRequestA("./php/folder/createZip.php", {
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
}
