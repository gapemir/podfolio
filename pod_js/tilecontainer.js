namespace pod {
    class TileContainer extends gn.ui.tile.TileContainer {
        constructor() {
            super( { filter: true } )
            this.addClass('fileList');
            this.model = new gn.model.FilterSortTreeModel( new gn.model.TreeModel() );
            this.tileClass = pod.File;
            this.subItemContClass = pod.Folder;
            this.breadcrumb.topLevelName = this.tr("HOME");

            this._addFirst();
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
        _addFirst() {
            if(!this._firstItem) {
                this._firstItem = new gn.ui.basic.Widget(new gn.ui.layout.Column(), "div", "fileTile");
                let head = new gn.ui.basic.Widget(new gn.ui.layout.Row(),"div", "fileHead");
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
        _itemCreated(item){
            super._itemCreated(item);
            item.addEventListener("changeData", function(event) {
                this.model.changeData(event.data.index, event.data.key, event.data.value);
            }, this);
            item.addEventListener("removeData", function(event) {
                this.model.removeData(event.data);
            }, this);
        }
        _groupCreated(group){
            super._groupCreated(group);
            group.addEventListener("changeData", function(event) {
                this.model.changeData(event.data.index, event.data.key, event.data.value);
            }, this);
            group.addEventListener("removeData", function(event) {
                this.model.removeData(event.data);
            }, this);
        }
        _uploadFile(){
            const files = this._firstItem.fileInput.value;
            if(files === undefined || files.length == 0)
                return;

            if( this._uploadHelper ){
                this._uploadHelper.dispose();
            }
            this._uploadHelper = new gn.helper.FormDataFileUpload();
            this._uploadHelper.addEventListener( "send", this._uploadFileCB, this );

            this._uploadHelper.addField('userid', gn.app.App.instance().userId);
            this._uploadHelper.addField('token', gn.app.App.instance().token);
            this._uploadHelper.addField('parent', this._currentGroup);
            this._uploadHelper.addFile( files[0], this._firstItem.nameOfFile.value || files[0].name.replace(/\.[^/.]+$/, "") );
            gn.app.App.instance().header.progress.end = this._uploadHelper.allChunks;
        }
        async _uploadFileCB( e ) {
            fetch('./php/file/upload.php', {
                method: 'POST',
                body: e.data
            }).then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.status === 1){
                    if(!this._uploadHelper.done) {
                        gn.app.App.instance().header.progress.value = this._uploadHelper.currentIdx;
                        this._uploadHelper.sendChunk();
                    }
                    if(data.file) {
                        gn.app.App.instance().header.progress.value = 0;
                        gn.app.App.instance().header.progress.end = 100;
                        data.file.storeid = data.file.storeid;
                        data.file.type = gn.model.Model.Type.item;
                        this.model.insertRow(data.file, this.model.rowCount(), data.file.parent );
                        gn.ui.popup.Popup.InformationPopup(this.tr("FILE_SUCCESSFULLY_UPLOADED")).show();
                    }
                } else {
                    alert('File upload failed');
                }
            });
        }
        async _createNewFolder(){
            let folderName = this._firstItem.nameOfFolder.value;
            if(folderName == ""){
                alert("Folder name cannot be empty");
                return;
            }
            let resp = await await gn.io.Request.post("./php/folder/create.php", {
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                name: folderName,
                parent : this._currentGroup
            });
            if(resp.status == 1){
                resp.folder.storeid = resp.folder.storeid;
                resp.folder.type = gn.model.Model.Type.group;
                this.model.insertRow(resp.folder);
            } else {
                alert("Error creating folder: " + resp.message);
            }
        }
        async _createNewNote() {
            let resp = await await gn.io.Request.post("./php/note/create.php", {
                token: gn.app.App.instance().token,
                userid: gn.app.App.instance().userId,
                parent : this._currentGroup
            });
            if(resp.status == 1){
                resp.note.storeid = resp.note.storeid;
                resp.note.type = gn.model.Model.Type.item;
                this.model.insertRow(resp.note);
            } else {
                alert("Error creating note: " + resp.message);
            }

        }
    }
}