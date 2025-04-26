class Application extends gn.application.Application{
    constructor() {
        super();
        this._userId = null;
        this._token = null;
    }
    static instance() {
        if (this._instance == null) {
            this._instance = new Application();
        }
        return this._instance;
    }
    get userId() {
        if(this._userId == null) {
            this._userId = document.cookie.split(';').find(cookie => cookie.includes('podfolioUserid')).split('=')[1];
        }
        return this._userId;
    }
    get token() {
        if(this._token == null) {
            this._token = document.cookie.split(';').find(cookie => cookie.includes('podfolioToken')).split('=')[1];
        }
        return this._token;
    }
    downloadFile(href, name = "download") {
        const link = document.createElement('a');
        link.href = href;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    writeToClipboard(text) {
        navigator.clipboard.writeText(text);
    }
    async deleteFile(fileId) {
        let data = await this._phpRequest('./php/file/delete.php', {
            fileid: fileId,
            token: this.token,
            userid: this.userId
        });
        return data.status == 1;
    }
    async deleteFolder(folderId) {
        throw new Error("Not implemented yet");
    }
    async renameFile(fileId, name) {
        throw new Error("Not implemented yet");
    }
    async renameFolder(folderId, name) {
        throw new Error("Not implemented yet");
    }
    async changeMeta(fileId, data) {
        let res_data = await this._phpRequest('./php/file/changeMeta.php', {
            fileid: fileId,
            token: this.token,
            userid: this.userId,
            data: data
        });
        return res_data.status == 1;
    }


}