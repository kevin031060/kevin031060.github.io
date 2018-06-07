"use strict";

var WedItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);

		this.author = obj.author;

        this.time = obj.time;
        this.boy = obj.boy;
        this.girl = obj.girl;
        this.boy_des = obj.boy_des;
        this.girl_des = obj.girl_des;
        this.ceremony = obj.ceremony;
        this.c_re = obj.c_re;
        this.hotel = obj.hotel;
        this.h_re = obj.h_re;
        this.brid = obj.brid;
        this.groom = obj.groom;



	} else {
	    this.author = "";

        this.time = "";
        this.boy = "";
        this.girl = "";
        this.boy_des = "";
        this.girl_des = "";
        this.ceremony = "";
        this.c_re = "";
        this.hotel = "";
        this.h_re = "";
        this.brid = "";
        this.groom = "";
	}
};

WedItem.prototype = {
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



var GuestItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.author = obj.author;
        this.name = obj.name;
        this.email = obj.email;

	} else {
	    this.author = "";
        this.name = "";
        this.email = "";
	}
};

GuestItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};





var WedContract = function () {
    LocalContractStorage.defineMapProperty(this, "wed", {
        parse: function (text) {
            return new WedItem(text);
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

    LocalContractStorage.defineMapProperty(this, "guest", {
        parse: function (text) {
            return new GuestItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};



WedContract.prototype = {
    init: function () {
        // todo
    },

    save: function (time, boy, girl, boy_des, girl_des, ceremony, c_re, hotel, h_re, brid, groom) {

        time = time.trim();
        boy = boy.trim();
        girl = girl.trim();
        boy_des = boy_des.trim();
        girl_des = girl_des.trim();
        ceremony = ceremony.trim();
        c_re = c_re.trim();
        hotel = hotel.trim();
        h_re = h_re.trim();
        brid = brid.trim();
        groom = groom.trim();

        if (time === "" || boy === "" || girl === ""){
            throw new Error("empty");
        }
        if (time.length > 64 || boy.length > 64){
            throw new Error("exceed limit length")
        }

        var from = Blockchain.transaction.from;

        var wedItem = this.wed.get(from);
        if (wedItem){
            throw new Error("value has been occupied");
        }

        wedItem = new WedItem();
        wedItem.author = from;
        wedItem.time = time;
        wedItem.boy = boy;
        wedItem.girl = girl;
        wedItem.boy_des = boy_des;
        wedItem.girl_des = girl_des;
        wedItem.ceremony = ceremony;
        wedItem.c_re = c_re;
        wedItem.hotel = hotel;
        wedItem.h_re = h_re;
        wedItem.brid = brid;
        wedItem.groom = groom;

        this.wed.put(from, wedItem);
    },

    get: function (author) {
        author = author.trim();
        if ( author === "" ) {
            throw new Error("empty key")
        }
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }
        return this.wed.get(author);
    },


    addInvite: function (author, name, email) {
        //wed address / key
        author = author.trim();
        name = name.trim();
        email = email.trim();
        //my address
        var from = Blockchain.transaction.from;

        var favorItem = this.favorMap.get(author);

        //if exist
        if (favorItem){
            var inds = favorItem.inds;
            var exist = inds.indexOf(from);
            if (exist == -1){
                inds.push(from);
                this.addGuset(from,name,email)
            } else {
                inds.splice(exist,1);
            }
            favorItem.inds = inds;
            this.favorMap.put(author, favorItem);
            return inds;

        }else {
        //if no invite
            var indss =[];
            indss.push(from);
            favorItem = new FavorItem();
            favorItem.inds = indss;
            this.favorMap.put(author, favorItem);
            this.addGuset(from,name,email)
            return indss;
        }
    },

    getInvite: function (author) {
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

    addGuset: function (author, name, email) {
        author = author.trim();
        name = name.trim();
        email = email.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }
        var guestItem = this.guest.get(author);
        if (guestItem){
            guestItem.author = author;
            guestItem.name = name;
            guestItem.email = email;
            this.guest.put(author, guestItem);
        }else{
            guestItem = new GuestItem();
            guestItem.author = author;
            guestItem.name = name;
            guestItem.email = email;
            this.guest.put(author, guestItem);
        }

    },

    getGuest:function (author) {
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }
        return this.guest.get(author);
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }

};
module.exports = WedContract;