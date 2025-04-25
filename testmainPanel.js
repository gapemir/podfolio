//import { File, Folder} from './File.js';

/*let FILES = new Map();
let FOLDERS = new Map();*/
let ITEMS = new Map();
let CURRENT_FILE = null; // used for menu
const userid = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')) ? document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1] : 
(window.location.search.includes("user=")? new URL(window.location.href).searchParams.get("user"):null) // this is ugly as we would need to delete the object but we can let garbage man take care of it
let ROOT = null; // used for root of app
//let CURRENT_FOLDER = null;

function generateFakeTiles(){
    let fileList = document.getElementById('fileList');
    let fakes = document.getElementsByClassName('fakeTile');
    for (let i = 0; i < fakes.length; i++) {
        fileList.removeChild(fakes[i]);
        i--;
    };
    var perLine = Math.floor(fileList.clientWidth / parseInt(getComputedStyle(fileList.children[0]).flexBasis));
    var n = fileList.children.length % perLine;
    if(n)
        n = perLine - n;
    for(let i = 0; i < n; i++){
        let fake = document.createElement('div');
        fake.className = 'fileTile fakeTile';
        document.getElementById('fileList').appendChild(fake);
    }
}
function rebuild(){
    let token = null;
    if(document.cookie.split(';').find(cookie => cookie.includes('podfolioToken'))){
        token = document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1];
    }
    if(window.location.pathname.includes("publicPanel")){
        token = "public";
    }
    fetch('./php/file/getUserFiles.php', {
        method: 'POST',
        body: JSON.stringify({
            userid: userid,
            token: token
        })
        }
    ).then(response => response.json())
    .then(data => {
        console.log(data)
        if(data.status === -1){
            console.log('Invalid token');
            document.cookie = 'podfolioUserid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            document.cookie = 'podfolioToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            window.location.href = './index.html';
        }
        ROOT = new TileContainer(null);
        document.getElementById('fileList').appendChild(ROOT._element);


        let allItems = [ ...data.folders, ...data.files ];
        allItems.forEach(el => {
            if(el.fileid){
                el.type = gn.model.Type.item;
                el.storeId = el.fileid;
            }else{
                el.type = gn.model.Type.group;
                el.storeId = el.folderid;
            }
        });
        
        ROOT.model.setData(allItems)
        

        /*data.folders.forEach(folder => {
            fld = new Folder(folder);
            fld.store(ITEMS);
            fld.build();
            fld.addEventListener("updateTiles", generateFakeTiles);
            if(folder.parent == null){
                fld.display(document.getElementById('fileList'));
            }
        })
        data.files.forEach(file => {
            fl = new File(file);
            fl.store(ITEMS);
            fl.build();
            fl.addEventListener("updateTiles", generateFakeTiles);
            if(file.parent == null){
                fl.display(document.getElementById('fileList'));
            }
        });*/
        //generateFakeTiles();
    })
    //generateFakeTiles();
}

function downloadFile(href, name = "download") {
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
rebuild()

/*
document.getElementById('uploadButton').addEventListener('click', function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput').files[0];
    if(fileInput == undefined)
        return;
    const fileName = document.getElementById('fileName').value || fileInput.name.replace(/\.[^/.]+$/, "");
    const userid = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1];
    const token = document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1];

    let formData = new FormData();
    formData.append('file', fileInput);
    formData.append('userid', userid);
    formData.append('fileName', fileName);
    formData.append('token', token);

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
            }
            generateFakeTiles();
        } else {
            alert('File upload failed');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('File upload failed');
    });
});*/