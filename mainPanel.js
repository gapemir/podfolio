//import { File, Folder} from './File.js';

let FILES = new Map();
let FOLDERS = new Map();
let CURRENT_FILE = null; // used for menu
const userid = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')) ? document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1] : 
(window.location.search.includes("user=")? new URL(window.location.href).searchParams.get("user"):null) // this is ugly as we would need to delete the object but we can let garbage man take care of it
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

function toggleMenu(here){
    getComputedStyle(here.children[1]).display
    if(getComputedStyle(here.children[1]).display == "flex"){
        here.children[1].style.display = 'none';
        let menu = document.getElementById('fileMenu');
        if(menu.parentElement.className == 'fileTile' && getComputedStyle(menu).display == 'flex'){
            menu.style.display = 'none';
            menu.parentElement.children[1].style.display = 'flex';
        }
        menu.parentNode.removeChild(menu);
        here.appendChild(menu);
        document.getElementById("publicCheck").checked = FILES.get(here.id)?.public || FOLDERS.get(here.id)?.public;
        document.getElementById("advertizeCheck").checked = FILES.get(here.id)?.advertize || FOLDERS.get(here.id)?.advertize;
        menu.style.display = 'flex';
        CURRENT_FILE = here.id;
    } else {
        here.children[1].style.display = 'flex';
        let menu = document.getElementById('fileMenu');
        menu.style.display = 'none';
        CURRENT_FILE = null;
    }
}
function makeIcon(icon){
    let i = document.createElement('i');
    i.className = icon;
    return i;
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
        data.folders.forEach(folder => {
            storeFolder(folder);
            makeFileTile(folder);
        })
        data.files.forEach(file => {
            storeFile(file);
            if(file.parent == null){
                makeFileTile(file);
            }else{
                FOLDERS.get(file.parent).children.push(file.fileid);
            }
        });
    
        generateFakeTiles();
    })
    generateFakeTiles();
}

function storeFile(file){
    FILES.set(file.fileid, file);
}
function storeFolder(folder){
    folder.children = [];
    FOLDERS.set(folder.folderid, folder);
}

function makeFileTile(file){
    let fileElement = document.createElement('div');
    fileElement.className = 'fileTile';
    fileElement.id = file.fileid || file.folderid;

    //head
    let head = document.createElement('div');
    head.className = 'fileHead';
    fileElement.appendChild(head)
    let headTextDiv = document.createElement('div');
    //headTextDiv.style.textIndent = '16px';
    let headText = document.createElement('span');
    headText.innerHTML = file.name;
    headTextDiv.appendChild(headText);
    head.appendChild(headTextDiv);

    if(file.fileid){
        let download = makeIcon("fa-solid fa-download");
        download.onclick = function(){
            downloadFile("./data/" + userid + "/" + file.fileid, file.name);
        }
        head.insertBefore(download, headTextDiv);
        let share = makeIcon("fa-solid fa-share");
        share.onclick = function(){
            let link = /.*\//.exec(window.location)[0];
            //navigator.clipboard.writeText(link + "download.html?user="+userid+"&file="+file.fileid+"&name="+encodeURIComponent(file.name));
            //navigator.clipboard.writeText(link + "data/"+userid+"/"+file.fileid+"?key="+file.fileKey)
            let name = encodeURI(file.name).replaceAll("%20", "+");
            if(name.includes("%")){
                name = file.fileid;
            }
            navigator.clipboard.writeText(link + "data/"+userid+"/"+name+"?key="+file.fileKey)
        }
        head.insertBefore(share, headTextDiv);
    }

    if(file.public){
        let public = makeIcon('fa-solid fa-users');
        public.style.color = "green";
        head.appendChild(public);
    }
    if(file.advertize){
        let public = makeIcon('fa-solid fa-ad');
        public.style.color = "green";
        head.appendChild(public);
    }

    if(!window.location.href.includes("publicPanel")){
        let gear = makeIcon('fa-solid fa-cog');
        gear.onclick = toggleMenu.bind(null, fileElement);
        head.appendChild(gear);
    }
    

    let cont = document.createElement('div');
    cont.className = 'fileCont';
    fileElement.appendChild(cont);
    let contentItem = null;
    if(file.folderid){
        contentItem = makeIcon('fas fa-folder');
        cont.appendChild(contentItem);
    }else{
        if(file.mimetype.includes('image')){
            contentItem = document.createElement('img');
            contentItem.className = 'fileImage';
            contentItem.src = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
            cont.appendChild(contentItem);
        }
        else if(file.mimetype.includes('pdf')){
            contentItem = makeIcon('fa-regular fa-file-pdf');
            cont.appendChild(contentItem);
        }
        else if(file.mimetype.includes("text")){
            contentItem = makeIcon('fa-regular fa-file-lines');
            cont.appendChild(contentItem);
        }
    }
    
    if(file.folderid){
        headText.onclick = function(){
            alert("open folder");
        }
        contentItem.onclick = function(){
            alert("open folder");
        };
    }else{
        headText.onclick = function(){
            window.location.href = "./data/" + userid + "/" + file.fileid + "?key=" + file.fileKey;
        };
    }
    contentItem.style.cursor = 'pointer';
    document.getElementById('fileList').appendChild(fileElement);
}
function downloadFile(href, name = "download") {
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
rebuild();