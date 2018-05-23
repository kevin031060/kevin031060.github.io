$("#m2").hide()
var game = new Game()
game.init()
game.addSuccessFn(success)
game.addFailedFn(failed)

var mask = document.querySelector('.mask')
var mask_rank = document.querySelector('.mark_rank')
var restartButton = document.querySelector('.restart')
var score = document.querySelector('.score')

//重新开始按钮
restartButton.addEventListener('click', restart)
//提交成绩按钮
$("#submit").click(function () {
  submit();
});
//展示排行榜按钮
$("#rank").click(function () {
    $("#ranklist").html("<span class=\"rankfont span1\">排名</span> <span class=\"rankfont span2\">用户</span> <span class=\"rankfont span1\">分数</span><br>");
    showrank();
});

$("#close").click(function () {
    $("#m1").show()
    $("#m2").hide()

});
// 游戏重新开始，执行函数
function restart() {
  mask.style.display = 'none'
  game.restart()
}
// 游戏失败执行函数
function failed() {
  score.innerText = game.score
  mask.style.display = 'flex'
}
// 游戏成功，更新分数
function success(score) {
  var scoreCurrent = document.querySelector('.score-current')
  scoreCurrent.innerText = score
}

"use strict";
var dappAddress = "n1geDcYTCfE3aiayeggzhM3DPrE7gvH1Ru7";
var nebulas = require("nebulas"),  Account = nebulas.Account, neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var serialNumber

function submit() {
        var to = dappAddress;
        var value = "0";
        var callFunction = "save"
        var callArgs = "[\"" + game.score + "\"]"

        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: function (resp) {
                    console.log(resp);
                    if(typeof resp == 'string'){
                        console.log("reject! cancel")
                        alert("已取消上传")
                    }else {
                        alert("Success")
                        // 延迟5秒执行
                    intervalQuery = setInterval(function () {
                        queryResultInfo();
                    }, 5000);
                    }

                }

        });
        var intervalQuery;
        // 根据交易流水号查询执行结果数据
        function queryResultInfo() {
            nebPay.queryPayInfo(serialNumber)
                .then(function (resp) {
                    var respObject = JSON.parse(resp)
                    if(respObject.code === 0){
                        alert('提交信息成功!');
                        clearInterval(intervalQuery);
                    }
                })
                .catch(function (err) {
                   console.log(err);
                })
        }

}

function showrank() {



        var from = Account.NewAccount().getAddressString();
        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getlist";
        var callArgs = "[\"" + "0" + "\",\"" + "100000" + "\"]"; //in the form of ["args"]
        console.log(callArgs)

        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
                var result = resp.result;
                // alert(JSON.stringify(result))
                if(result) {
                    var ranks = JSON.parse(result);
                    console.log(ranks)
                    var sorted = sort(ranks, 10);

                    for (var k=0;k<sorted.length;k++) {
                        var item = ranks[sorted[k]];
                        form_html(item, k);
                    }
                    // for (var i=0;i<ranks.length;i++) {
                    //     console.log(ranks[i])
                    //     form_html(ranks[i]);
                    // }

                    $("#m1").hide()
                    $("#m2").show()
                    mask_rank.style.display = 'flex'
                }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}

function form_html(item, k) {
    console.log(item.author+"_______"+item.score)
    var username = item.author;
    var score = item.score;
    var rank = k+1;
    var r1="<span class=\"rankfont span1\">";
    var r2="</span><span class=\"rankfont span2\">";
    var r3="</span><span class=\"rankfont span1\">";
    var r4="</span><br>";

    $("#ranklist").html( $("#ranklist").html() + r1 + rank + r2 + username.substring(0,15)+"..." + r3 + score + r4);

}

function sort(ranks, num) {
    var result = [];
    var max = 999999999; // 存放每一次拍完序后的，该过程中产生的最大的元素。
    var max_index=-1;
    var temp_index = -1;
    if (num>ranks.length) {
        num=ranks.length;
    }

    console.log("How many:"+ranks.length)
    for(var i=0; i<num; i++) {
           var temp = -1;
           for( var k=0; k<ranks.length; k++) {
               var now =  parseInt(ranks[k].score);
                 // 和上次循环产生的最大值进行比较
               if (now<max || (now==max && k!=max_index)){
                   console.log(k+" rankscore:"+ranks[k].score+" temp:"+temp)
                   if(now >= temp) {
                      temp = now;
                      temp_index = k;
                    }
               }
          }
          result[i] = temp_index;
          max_index = temp_index;
          max = temp;
        console.log("max index in this iteration:"+temp_index+" max value:"+temp)
    }
    console.log(result);
    return result;
}