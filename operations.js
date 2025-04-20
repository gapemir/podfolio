document.getElementById('publicCheck').addEventListener('click', changeMeta.bind(document.getElementById('publicCheck')) );
document.getElementById('advertizeCheck').addEventListener('click', changeMeta.bind(document.getElementById('advertizeCheck')) );
document.getElementById('deleteButton').addEventListener('click', deleteFile.bind(document.getElementById('deleteButton')) );
document.getElementById('headerUserUser').addEventListener('click', toggleUserMenu);
document.getElementById('logoutButton').addEventListener('click', logout);
document.getElementById('userSettings').addEventListener('click', () => {alert("TODO")});
document.getElementById('newFolderButton').addEventListener('click', createNewFolder);



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
            storeFile(data.file);
            makeFileTile(data.file);
            generateFakeTiles();
        } else {
            alert('File upload failed');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('File upload failed');
    });
});

function deleteFile(){
    var tile = this
    fetch('./php/file/deleteFile.php', {
        method: 'POST',
        body: JSON.stringify({
            fileid: CURRENT_FILE,
            token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
            userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1]
        })
    }).then(response => response.json())
    .then(data=>{
        console.log(data);
        if(data.status == 1){
            alert('File deleted successfully');
            document.getElementById('fileList').removeChild(document.getElementById(CURRENT_FILE));
            CURRENT_FILE = null;
            generateFakeTiles();
        } else {
            alert('Failed to delete file');
        }
    })
}
function changeMeta(){
    let data = null;
    if(this.id == 'publicCheck'){
        data = [ 'public', this.checked ];
    } else if(this.id == 'advertizeCheck'){
        data = [ 'advertize', this.checked ];
    }
    if(!data) return;
    fetch('./php/file/changeMeta.php', {
        method: 'POST',
        body: JSON.stringify({
            fileid: CURRENT_FILE, // leave, it works for folders also
            token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
            userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1],
            data: data
        })
    }).then(response => response.json())
    .then(response=>{console.log(response);})
}

function toggleUserMenu(e){
    let el = document.getElementById("userPopup");
    if(el.style.display == "none") {
        el.style.display = "block";
        document.onclick = toggleUserMenu;
    } else {
        el.style.display = "none";
        document.onclick = null;
    }
    e.stopPropagation()
}
function logout(){
    document.cookie = 'podfolioUserid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'podfolioToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    window.location.href = './index.html';
}
function createNewFolder(){
    let folderName = document.getElementById("folderNameInput").value;
    if(folderName == ""){
        alert("Folder name cannot be empty");
        return;
    }
    fetch('./php/file/createFolder.php', {
        method: 'POST',
        body: JSON.stringify({
            token: document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1],
            userid: document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1],
            name: folderName
        })
    }).then(response => response.json())
    .then(response=>{console.log(response);})
}