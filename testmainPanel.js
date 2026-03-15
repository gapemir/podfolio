let ROOT = null; // used for root tile container
let App = gn.app.App.startup( Application ); 


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
            ROOT = new PTileContainer();
        }else{
            ROOT = new TileContainer();
        }
        ROOT.height = "initial";
        var scroll = new gn.ui.container.Scroll(ROOT);
        scroll.setStyle("width", "100%");
        scroll.setStyle("height", "calc(100% - 60px)");
        document.getElementById('fileList').appendChild(scroll._element);
        // ROOT.setStyle("width", "100%");
        // ROOT.setStyle("height", "calc(100% - 60px)");

        let allItems = [ ...data.folders, ...data.notes, ...data.files ];
        allItems.forEach(el => {
            el.display = el.name;
            if(!gn.lang.Var.isNull(el.mimetype)){
                el.type = gn.model.Model.Type.item;
            }else {
                el.type = gn.model.Model.Type.group;
            }
        });
        ROOT.model.key = "storeid";
        ROOT.model.setDataFromFlat(allItems, "parent")
        //document.getElementById( "fileList" ).children[0].style.width = "400px"
    })
}
rebuild()

