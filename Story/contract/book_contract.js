"use strict";

var BookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.author = obj.author;
        this.type = obj.type;
        this.content = obj.content;
        this.description = obj.description;
	} else {
	    this.author = "";
        this.title = "";
        this.content = "";
	    this.type = "";
        this.description = "";
	}
};

BookItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FavorItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.inds = obj.inds;

	} else {
	    this.inds = [];
	}
};

FavorItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var BookContract = function () {
   LocalContractStorage.defineProperty(this, "index");
   LocalContractStorage.defineMapProperty(this, "bookMap", {
        parse: function (text) {
            return new BookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "favorMap", {
        parse: function (text) {
            return new FavorItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BookContract.prototype = {
    init: function () {
        this.index = 0;
    },

    save: function (title, type, description, content ) {

        title = title.trim();
        type = type.trim();
        description = description.trim();
        content = content.trim();

        if (title === "" || type === "" || content === "" || description === ""){
            throw new Error("empty!!!");
        }
        if (title.length > 64 || type.length > 64){
            throw new Error("exceed limit length")
        }

        var index = this.index;
        var from = Blockchain.transaction.from;

        var bookItem =  new BookItem();
        bookItem.author = from;
        bookItem.title = title;
        bookItem.type = type;
        bookItem.description = description;
        bookItem.content = content;

        this.bookMap.put(index, bookItem);

        this.index += 1;

    },


    len: function(){
        return this.index;
    },

    get: function (ind) {
        ind = parseInt(ind);
        var bookItem = this.bookMap.get(ind);
        return bookItem
    },

    getlist: function(offset, limit){
        limit = parseInt(limit);
        offset = parseInt(offset);

        if(offset>this.index){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.index){
          number = this.index;
        }
        var result = [];
        for(var i=offset;i<number;i++){
            var bookItem = this.bookMap.get(i);
            result.push(bookItem)
        }
        return result;
    },

    addFavors: function (ind) {
        ind = parseInt(ind);
        var from = Blockchain.transaction.from;
        var favorItem = this.favorMap.get(from);
        //如果存在
        if (favorItem){
            var inds = favorItem.inds;
            var exist = inds.indexOf(ind);
            if (exist == -1){
                inds.push(ind);
            } else {
                inds.splice(exist,1);
            }
            favorItem.inds = inds;
            this.favorMap.put(from, favorItem);
            return inds;
        }else {
        //如果不存在
            var indss =[];
            indss.push(ind);
            favorItem = new FavorItem();
            favorItem.inds = indss;
            this.favorMap.put(from, favorItem);
            return indss;
        }
    },

    getFavors: function (author) {
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }

        var favorItem = this.favorMap.get(author);
        var inds = favorItem.inds;
        var l = inds.length;
        var result = [];
        for(var i=0;i<l;i++){
            var bookItem = this.bookMap.get(inds[i]);
            result.push(bookItem)
        }
        return result;
    },

    getFavorsIndex: function (author) {
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }

        var favorItem = this.favorMap.get(author);
        var inds = favorItem.inds;

        return inds;
    },


    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};


module.exports = BookContract;