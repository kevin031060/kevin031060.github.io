"use strict";

var JumpItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.score = obj.score;
		this.author = obj.author;
	} else {
	    this.author = "";
	    this.score = 0;
	}
};

JumpItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var JumpContract = function () {
   LocalContractStorage.defineProperty(this, "index");
   LocalContractStorage.defineMapProperty(this, "indexMap");
   LocalContractStorage.defineMapProperty(this, "scoreMap", {
        parse: function (text) {
            return new JumpItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

};

JumpContract.prototype = {
    init: function () {
        this.index = 0;
    },

    save: function (score) {

        score = score.trim();
        if (score === ""){
            score = 0;
        }

        var index = this.index;
        var from = Blockchain.transaction.from;
        //检查该地址是否提交过
        var jumpItem = this.scoreMap.get(from);
        if (jumpItem){
            console.log("You have a score before"+jumpItem.score);
            if (score>jumpItem.score){
                jumpItem.score = score;
            }
            this.scoreMap.put(from, jumpItem)
        }else {
            jumpItem =  new JumpItem();
            jumpItem.author = from;
            jumpItem.score = score;
            this.indexMap.put(index, from)
            this.scoreMap.put(from, jumpItem)
            this.index += 1;
        }
    },


    len: function(){
      return this.index;
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
            var key = this.indexMap.get(i);
            var jumpItem = this.scoreMap.get(key);
            result.push(jumpItem)
        }
        return result;
    }
};


module.exports = JumpContract;