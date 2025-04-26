
let ITEMS = new Map();
let CURRENT_FILE = null; // used for menu
const userid = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')) ? document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1] : 
(window.location.search.includes("user=")? new URL(window.location.href).searchParams.get("user"):null) // this is ugly as we would need to delete the object but we can let garbage man take care of it
let ROOT = null; // used for root of app
//let CURRENT_FOLDER = null;

function rebuild(){
    let token = null;
    if(document.cookie.split(';').find(cookie => cookie.includes('podfolioToken'))){
        token = document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1];
    }
    if(window.location.pathname.includes("publicPanel")){
        token = "public";
    }
    fetch('./php/user/getContent.php', {
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
        
    })

}


rebuild()
