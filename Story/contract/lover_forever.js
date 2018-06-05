"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name1 = obj.name1;
		this.name2 = obj.name2;
        this.word = obj.word;
		this.author = obj.author;
	} else {
		this.name1 = "";
		this.name2 = "";
        this.word = "";
		this.author = "";

	    // this.key = "";
	    // this.author = "";
	    // this.value = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "name1c", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

};

SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (name1, name2, word) {

        name1 = name1.trim();
        name2 = name2.trim();
        word = word.trim();

        if (name1 === "" || name2 === "" || word === ""){
            throw new Error("empty name / word");
        }
        if (name1.length > 64 || name2.length > 64 || word.length > 64 ){
            throw new Error("name / word exceed limit length")
        }

        var from = Blockchain.transaction.from;

        //情侣合并名字的查询和存储
        var allname = name1 + name2;
        var dictItem = this.repo.get(allname);
        if (dictItem){
            throw new Error("value has been occupied");
        }
        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.name1 = name1;
        dictItem.name2 = name2;
        dictItem.word = word;
        this.repo.put(allname, dictItem);

        //情侣单人名字的查询和存储
        var dictItem_1 = this.name1c.get(name1);

        if (dictItem_1){
            var i = 1;
            var name_key = name1 + i.toString();
            var dictItem_key = this.name1c.get(name_key);
            //如果name1存在了，那么检查name1+1存在不，如果不存在，那么存name1+1，如果仍然存在，继续检查+2
            while (dictItem_key){
                i = i + 1;
                name_key = name1 + i.toString();
                dictItem_key = this.name1c.get(name_key);
            }
            dictItem_key = new DictItem();
            dictItem_key.author = from;
            dictItem_key.name1 = name1;
            dictItem_key.name2 = name2;
            dictItem_key.word = word;
            this.name1c.put(name_key, dictItem_key);
        }else {
            dictItem_1 = new DictItem();
            dictItem_1.author = from;
            dictItem_1.name1 = name1;
            dictItem_1.name2 = name2;
            dictItem_1.word = word;
            this.name1c.put(name1, dictItem_1);
        }

        //情侣单人名字的查询和存储
        var dictItem_2 = this.name1c.get(name2);

        if (dictItem_2){
            var j = 1;
            var name_key_2 = name2 + j.toString();
            var dictItem_key_2 = this.name1c.get(name_key_2);
            while (dictItem_key_2){
                j = j + 1;
                name_key_2 = name2 + j.toString();
                dictItem_key_2 = this.name1c.get(name_key_2);
            }
            dictItem_key_2 = new DictItem();
            dictItem_key_2.author = from;
            dictItem_key_2.name1 = name1;
            dictItem_key_2.name2 = name2;
            dictItem_key_2.word = word;
            this.name1c.put(name_key_2, dictItem_key_2);
        }else {
            dictItem_2 = new DictItem();
            dictItem_2.author = from;
            dictItem_2.name1 = name1;
            dictItem_2.name2 = name2;
            dictItem_2.word = word;
            this.name1c.put(name2, dictItem_2);
        }

    },
    // save是把输入的数据打包成json，然后转换成string，存到区块链中
    // 查询区块链，返回的是string，通过这个函数，返回Json数据，在html中使用
    getall: function (name1, name2) {
        name1 = name1.trim();
        name2 = name2.trim();
        if ( name1 === "" || name2 === "") {
            throw new Error("empty name")
        }
        var allname = name1 + name2;
        return this.repo.get(allname);
    },

    getname1: function (name1, num) {
        name1 = name1.trim();
        if ( name1 === "" ) {
            throw new Error("empty name")
        }
        return this.name1c.get(name1+num);

    }
};
module.exports = SuperDictionary;