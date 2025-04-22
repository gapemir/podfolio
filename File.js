/*
class StoreObject extends gn.core.Object{
    constructor(id) {
        super();
        this._storeid = id;
        this._element = null;
        this._menu; //singelton
    }
    store(location) {
        if(location instanceof Map)
            location.set(this._storeid, this);
        else if(location instanceof Array)
            location.push(this);
        else
            throw new Error('Invalid location');
        this._location = location;
    }
    dispose(){
        if(this._element){
            this._element.remove();
        }
        if(this._menu){
            this._menu.remove();
        }
        this._element = null;
        this._menu = null;
        if(this._location instanceof Map){
            this._location.delete(this._storeid);
        }else if(this._location instanceof Array){
            let index = this._location.indexOf(this);
            if(index > -1){
                this._location.splice(index, 1);
            }
        }
        delete this
    }
    build(){
        throw new Error('Method "build" must be implemented in subclass');
    }
    _makeIcon(icon){
        let i = document.createElement('i');
        i.className = icon;
        return i;
    }
    toggleMenu(){
        if(!this._menu){
            this._buildMenu();
        }
        if(this._menuIsShown){
            this._menu.style.display = 'none';
            this._cont.style.display = "flex";
            this._menuIsShown = false;
        }else{
            this._menu.style.display = 'flex';
            this._cont.style.display = "none";
            this._menuIsShown = true;
        }
    }
    _buildMenu(){
        this._menuIsShown = false;
        this._menu = document.createElement("div");
        this._menu.className = "fileMenu fileCont";

        let div1 = document.createElement("div");
        let inp1 = document.createElement("input");
        inp1.type = "checkbox"
        inp1.checked = this._data.public;
        div1.appendChild(inp1);
        inp1.addEventListener("click", function(){
            this._changeMeta("public", inp1.checked);
        }.bind(this));
        let txt1 = document.createElement("span");
        txt1.innerHTML = "Public";
        div1.appendChild(txt1);
        this._menu.appendChild(div1);
        let div2 = document.createElement("div");
        let inp2 = document.createElement("input");
        inp2.type = "checkbox"
        inp2.checked = this._data.advertize;
        div2.appendChild(inp2);
        inp2.addEventListener("click", function(){
            this._changeMeta("public", inp2.checked);
        }.bind(this));
        let txt2 = document.createElement("span");
        txt2.innerHTML = "Advertize";
        div2.appendChild(txt2);
        this._menu.appendChild(div2);
        let div3 = document.createElement("div");
        let del = document.createElement("button");
        del.innerHTML = "Delete";
        del.onclick = this._deleteFile.bind(this);
        div3.appendChild(del);
        this._menu.appendChild(div3);

        this._menu.style.display = "none";
        this._element.appendChild(this._menu);
    }
    display(parent){
        parent.appendChild(this._element);
    }
    _changeMeta(type, value){
        let data = null;
        if(type == 'public'){
            data = [ 'public', value ];
        } else if(e.meta == 'advertize'){
            data = [ 'advertize', value ];
        }
        if(!data) return;
        fetch('./php/file/changeMeta.php', {
            method: 'POST',
            body: JSON.stringify({
                //fileid: CURRENT_FILE, // leave, it works for folders also
                fileid: this._storeid,
                token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
                userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1],
                data: data
            })
        }).then(response => response.json())
        .then(response=>{console.log(response);})
    }
    _deleteFile(){
        fetch('./php/file/deleteFile.php', {
            method: 'POST',
            body: JSON.stringify({
                fileid: this._storeid,
                token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
                userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1]
            })
        }).then(response => response.json())
        .then(data=>{
            console.log(data);
            if(data.status == 1){
                alert('File deleted successfully');
                this.dispose();
                this.sendEvent("updateTiles");
            } else {
                alert('Failed to delete file');
            }
        })
    }
}
class File extends StoreObject{
    constructor(data) {
        super(data.fileid)
        this._data = data;
    }
    build(){
        if(this._element){
            return;
        }
        this._element = document.createElement('div');
        this._element.className = 'fileTile';
        this._element._storeid = this._storeid;
    
        //head
        let head = document.createElement('div');
        head.className = 'fileHead';
        this._element.appendChild(head)
        let headTextDiv = document.createElement('div');
        headTextDiv.style.textIndent = '16px';
        let headText = document.createElement('span');
        headText.innerHTML = this._data.name;
        headTextDiv.appendChild(headText);
        head.appendChild(headTextDiv);
        let gear = this._makeIcon('fa-solid fa-cog');
        gear.onclick = this.toggleMenu.bind(this);
        head.appendChild(gear);
    
        this._cont = document.createElement('div');
        this._cont.className = 'fileCont';
        this._element.appendChild(this._cont);
        let contentItem = null;
        if(this._data.mimetype.includes('image')){
            contentItem = document.createElement('img');
            contentItem.className = 'fileImage';
            contentItem.src = "./data/" + userid + "/" + this._data.fileid + "?key=" + this._data.fileKey;
            this._cont.appendChild(contentItem);
        }
        else if(this._data.mimetype.includes('pdf')){
            contentItem = this._makeIcon('fa-regular fa-file-pdf');
            this._cont.appendChild(contentItem);
        }
    
        headText.addEventListener("click", function(){
            window.location.href = "./data/" + userid + "/" + this._storeid + "?key=" + this._data.fileKey;
        }.bind(this));
        /*contentItem.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
        };*/
        /*contentItem.style.cursor = 'pointer';    
    }
}
class Folder extends StoreObject{
    constructor(data) {
        super(data.folderid)
        this._data = data;
    }
    build(){
        this._element = document.createElement('div');
        this._element.className = 'fileTile';
        this._element._storeid = this._storeid;
    
        //head
        let head = document.createElement('div');
        head.className = 'fileHead';
        this._element.appendChild(head)
        let headTextDiv = document.createElement('div');
        headTextDiv.style.textIndent = '16px';
        let headText = document.createElement('span');
        headText.innerHTML = this._data.name;
        headTextDiv.appendChild(headText);
        head.appendChild(headTextDiv);
        let gear = this._makeIcon('fa-solid fa-cog');
        gear.onclick = this.toggleMenu.bind(this);
        head.appendChild(gear);
    
        this._cont = document.createElement('div');
        this._cont.className = 'fileCont';
        this._element.appendChild(this._cont);
        let contentItem = null;
        contentItem = this._makeIcon('fas fa-folder');
        this._cont.appendChild(contentItem);

    
        headText.onclick = function(){
            alert('open folder');
        };
        contentItem.onclick = function(){
            alert('open folder');
        };
        contentItem.style.cursor = 'pointer';    
    }
}*/


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
        let cont =  new gn.ui.basic.Widget("div", "fileCont fileTileFirst");
        cont.add(new gn.ui.basic.Label("Upload a file"))
        this._firstItem.fileInput = document.createElement("input");
        this._firstItem.fileInput.type = "file";
        cont.element.appendChild(this._firstItem.fileInput);
        cont.add(new gn.ui.basic.Label("Rename file (optional):"))
        this._firstItem.nameOfFile = document.createElement("input");
        this._firstItem.nameOfFile.type = "text";
        this._firstItem.nameOfFile.id = "fileName";
        this._firstItem.nameOfFile.placeholder = "whitout file extension";
        cont.element.appendChild(this._firstItem.nameOfFile);
        let but1 = document.createElement("button");
        but1.innerText = "Upload";
        but1.onclick = this._uploadFile.bind(this);
        cont.element.appendChild(but1);
        this._firstItem.add(cont);
        cont.element.appendChild(document.createElement("br"));

        this._firstItem.nameOfFolder = document.createElement("input");
        this._firstItem.nameOfFolder.type = "text";
        this._firstItem.nameOfFolder.placeholder = "name of new folder";
        this._firstItem.nameOfFolder.id = "folderNameInput";
        cont.element.appendChild(this._firstItem.nameOfFolder);
        let but2 = document.createElement("button");
        but2.innerText = "New folder";
        but2.onclick = this._createNewFolder.bind(this);
        cont.element.appendChild(but2);

        this.add(this._firstItem);
    }

    genFakeTileItems(){
        for (let i = 0; i < this._fakeTiles.length; i++) {
            this.remove(this._fakeTiles[i]);
        };
        this._fakeTiles = [];
        var perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
        var n = this._groups.get(this._currentGroup).length + 1 % perLine; // +1 is static el
        if(n == 0){
            n = perLine;
        }else{
            n = n % perLine;
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
            console.log(data);
            if(data.status === 1){
                /*storeFile(data.file);
                makeFileTile(data.file);
                generateFakeTiles();*/
                /*let fl = new File(data.file);
                fl.store(ITEMS);
                fl.build();
                fl.addEventListener("updateTiles", generateFakeTiles);
                if(data.file.parent == null){
                    fl.display(document.getElementById('fileList'));
                }*/
                //generateFakeTiles();
            } else {
                alert('File upload failed');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('File upload failed');
        });
    }

    _createNewFolder(){
        let folderName = this._firstItem.nameOfFolder.value;
        if(folderName == ""){
            alert("Folder name cannot be empty");
            return;
        }
        fetch('./php/file/createFolder.php', {
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
        //this._element._storeid = this._storeid;
    
        //head
        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);

        let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            downloadFile("./data/" + userid + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
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
            navigator.clipboard.writeText(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey)
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
            window.location.href = "./data/" + userid + "/" + this._storeid + "?key=" + this._data.fileKey;
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
        this._menu = new gn.ui.basic.Widget("div", "fileMenu fileCont");
        
        let div1 = new gn.ui.basic.Widget("div");
        let inp1 = document.createElement("input");
        inp1.type = "checkbox"
        inp1.checked = this._data.public;
        div1.element.appendChild(inp1);
        //todo redo the event listener without bind and with context
        inp1.addEventListener("click", function(){
            //this._changeMeta("public", inp1.checked);
            throw new TypeError("not yet imlemented");
        }.bind(this));
        div1.add(new gn.ui.basic.Label("Public"));
        this._menu.add(div1);

        let div2 = new gn.ui.basic.Widget("div");
        let inp2 = document.createElement("input");
        inp2.type = "checkbox"
        inp2.checked = this._data.advertize;
        div2.element.appendChild(inp2);
        //todo redo the event listener
        inp2.addEventListener("click", function(){
            //this._changeMeta("public", inp2.checked);
            throw new TypeError("not yet imlemented");
        }.bind(this));
        div2.add(new gn.ui.basic.Label("Advertize"));
        this._menu.add(div2);

        let div3 = new gn.ui.basic.Widget("div");
        let del = document.createElement("button");
        del.innerHTML = "Delete";
        //todo deleting a folder deletes all files in it
        //del.onclick = this._deleteFile.bind(this);
        div3.element.appendChild(del);
        this._menu.add(div3);

        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
}
class Folder1 extends gn.ui.tile.TileSubItemContainer{
    constructor(data, parent) {
        super(data, parent)
        //this._element._storeid = this._storeid;
    
        //head
        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);
        //folders are not yed downloadable, we need to construct a zip file
        /*let download = new gn.ui.basic.Icon(14, "fa-download", ["fa-solid"]);
        download.tooltip = "Download";
        download.addEventListener("click", function(){
            downloadFile("./data/" + userid + "/" + this._data.storeId + "?key=" + this._data.fileKey, this._data.name);
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
            throw new TypeError("not yet implemented")
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+name+"?key="+this._data.fileKey)
        }, this);
        this._head.add(share);

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
        this._menu = new gn.ui.basic.Widget("div", "fileMenu fileCont");
        
        let div1 = new gn.ui.basic.Widget("div");
        let inp1 = document.createElement("input");
        inp1.type = "checkbox"
        inp1.checked = this._data.public;
        div1.element.appendChild(inp1);
        //todo redo the event listener without bind and with context
        inp1.addEventListener("click", function(){
            //this._changeMeta("public", inp1.checked);
            throw new TypeError("not yet imlemented");
        }.bind(this));
        div1.add(new gn.ui.basic.Label("Public"));
        this._menu.add(div1);

        let div2 = new gn.ui.basic.Widget("div");
        let inp2 = document.createElement("input");
        inp2.type = "checkbox"
        inp2.checked = this._data.advertize;
        div2.element.appendChild(inp2);
        //todo redo the event listener
        inp2.addEventListener("click", function(){
            //this._changeMeta("public", inp2.checked);
            throw new TypeError("not yet imlemented");
        }.bind(this));
        div2.add(new gn.ui.basic.Label("Advertize"));
        this._menu.add(div2);

        let div3 = new gn.ui.basic.Widget("div");
        let del = document.createElement("button");
        del.innerHTML = "Delete";
        //del.onclick = this._deleteFile.bind(this);
        div3.element.appendChild(del);
        this._menu.add(div3);

        this._menu.setStyle("display", "none");
        this.add(this._menu);
    }
}
