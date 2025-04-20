
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
        contentItem.style.cursor = 'pointer';    
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
}

class File1 extends gn.ui.tile.TileItem{
    constructor(data, parent) {
        super(data, parent)

        //this._element._storeid = this._storeid;
    
        //head
        this._head = new gn.ui.basic.Widget("div", "fileHead");
        this.add(this._head);

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
        if(this._data.mimetype.includes('image')){
            let src = "./data/" + userid + "/" + this._data.fileid + "?key=" + this._data.fileKey;
            contentItem = new gn.ui.basic.Image(src, "fileImage");
        }
        else if(this._data.mimetype.includes('pdf')){
            contentItem = new gn.ui.basic.icon(14, "fa-file-pdf", ["fa-regular"] );
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
        /*if(!this._menu){
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
        }*/
    }
    _buildMenu(){
        /*this._menuIsShown = false;
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
        this._element.appendChild(this._menu);*/
    }
}