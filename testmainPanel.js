let ROOT = null; // used for root tile container
let App = gn.app.App.startup(Application); 


function rebuild(){
    fetch('./php/user/getContent.php', {
        method: 'POST',
        body: JSON.stringify({
            userid: gn.app.App.instance().userId,
            token: gn.app.App.instance().token,
        })
        }
    ).then(response => response.json())
    .then(data => {
        console.log(data)
        if(data.status === -1){
            console.log('Invalid token');
            gn.app.App.instance().setCookie('podfolioUserid', '', -1);
            gn.app.App.instance().setCookie('podfolioToken', '', -1);
            window.location.href = './index.html';
        }
        if(gn.app.App.instance().token){
            ROOT = new PTileContainer(null);
        }else{
            ROOT = new TileContainer(null);
        }
        document.getElementById('fileList').appendChild(ROOT._element);

        let allItems = [ ...data.folders, ...data.notes, ...data.files ];
        allItems.forEach(el => {
            if(el.mimetype){
                el.type = gn.model.Model.Type.item;
            }else {
                el.type = gn.model.Model.Type.group;
            }
        });
        ROOT.model.setData(allItems)
    })
}
rebuild()
