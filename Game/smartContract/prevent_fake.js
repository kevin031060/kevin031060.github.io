"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
        this.name = obj.name;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
        this.name = "";
	    this.author = "";
	    this.value = "";
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
};

SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (key, name, value) {

        key = key.trim();
        name = name.trim();
        value = value.trim();
        if (key === "" || value === "" || name === ""){
            throw new Error("empty product number / name / description");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(from + key);
        if (dictItem){
            throw new Error("This product has been registered");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.name = name;
        dictItem.value = value;

        this.repo.put(from + key, dictItem);
        return from+key;
    },
    // save是把输入的数据打包成json，然后转换成string，存到区块链中
    // 查询区块链，返回的是string，通过这个函数，返回Json数据，在html中使用
    get: function (unique_id) {
        unique_id = unique_id.trim();
        if ( unique_id === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(unique_id);
    }
};
module.exports = SuperDictionary;